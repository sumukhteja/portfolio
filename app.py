"""Flask backend for the VS Code portfolio.

The workbench at / is a VS Code-styled shell. Everything it shows comes out of
content/ over the JSON API below, so editing a markdown file is the whole
publishing workflow.

Two things make it feel like the real editor:
  * an integrated terminal, backed by /api/exec — an allowlist of read-only
    commands over content/. No shell is ever spawned.
  * Live Server, which serves the same content as a plain resume page at /live.
"""

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import markdown
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, send_from_directory

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
CONTENT_DIR = (BASE_DIR / os.getenv("CONTENT_DIR", "content")).resolve()
MESSAGES_FILE = BASE_DIR / os.getenv("MESSAGES_FILE", "data/messages.jsonl")

SITE_NAME = os.getenv("SITE_NAME", "Portfolio")
SITE_TITLE = os.getenv("SITE_TITLE", "")
WORKSPACE = os.getenv("WORKSPACE_NAME", "portfolio")
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "5500"))

LANGS = {
    ".md": "markdown", ".json": "json", ".ts": "ts", ".js": "js",
    ".py": "python", ".html": "html", ".css": "css", ".txt": "text",
    ".env": "env",
}
SAFE_PATH = re.compile(r"^(?!.*\.\.)[A-Za-z0-9._/-]+$")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-only-change-me")
app.config["JSON_SORT_KEYS"] = False


# ---------------------------------------------------------------------------
# content/ — the workspace the editor shows
# ---------------------------------------------------------------------------

def manifest() -> dict:
    """content/manifest.json is the explorer tree: folders, then loose files."""
    path = CONTENT_DIR / "manifest.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        app.logger.warning("manifest.json unreadable (%s); falling back to disk", exc)
        names = sorted(p.name for p in CONTENT_DIR.iterdir() if p.is_file())
        return {"tree": [{"folder": "", "files": names}], "open": None}


def tree_paths() -> list[str]:
    return [
        f"{group.get('folder', '')}/{name}".lstrip("/")
        for group in manifest().get("tree", [])
        for name in group.get("files", [])
    ]


def lang_of(path: Path) -> str:
    if path.name.startswith(".env"):
        return "env"
    return LANGS.get(path.suffix, "text")


def read_file(rel: str) -> dict | None:
    """One file from content/, or None if it is missing or escapes the root."""
    if not rel or not SAFE_PATH.match(rel):
        return None
    path = (CONTENT_DIR / rel).resolve()
    if not path.is_file() or CONTENT_DIR not in path.parents:
        return None
    text = path.read_text(encoding="utf-8")
    return {
        "path": rel,
        "name": path.name,
        "folder": rel.rsplit("/", 1)[0] if "/" in rel else "",
        "lang": lang_of(path),
        "lines": text.count("\n") + 1,
        "bytes": len(text.encode("utf-8")),
        "content": text,
    }


def all_files() -> list[dict]:
    return [f for f in (read_file(p) for p in tree_paths()) if f]


def load_json(rel: str, fallback):
    file = read_file(rel)
    if file is None:
        return fallback
    try:
        return json.loads(file["content"])
    except json.JSONDecodeError as exc:
        app.logger.warning("%s is not valid JSON: %s", rel, exc)
        return fallback


# ---------------------------------------------------------------------------
# workbench + API
# ---------------------------------------------------------------------------

def shell_context() -> dict:
    return {
        "site_name": SITE_NAME,
        "site_title": SITE_TITLE,
        "workspace": WORKSPACE,
        "host": HOST,
        "port": PORT,
        "year": datetime.now(timezone.utc).year,
    }


@app.get("/")
def index():
    return render_template("index.html", **shell_context())


@app.get("/api/content")
def api_content():
    """Every file in tree order — one request boots the workbench."""
    files = all_files()
    meta = manifest()
    return jsonify({
        "files": files,
        "open": meta.get("open"),
        "tree": meta.get("tree", []),
        "count": len(files),
        "workspace": WORKSPACE,
    })


@app.get("/api/content/<path:rel>")
def api_content_one(rel: str):
    file = read_file(rel)
    if file is None:
        return jsonify({"error": "not found", "path": rel}), 404
    return jsonify(file)


@app.get("/api/profile")
def api_profile():
    return jsonify(load_json("contact.json", {}))


@app.get("/api/health")
def api_health():
    return jsonify({
        "status": "ok",
        "site": SITE_NAME,
        "port": PORT,
        "files": len(tree_paths()),
        "time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    })


@app.post("/api/contact")
def api_contact():
    """Validate an inbound message and append it to MESSAGES_FILE."""
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    message = str(payload.get("message", "")).strip()

    errors = {}
    if not name:
        errors["name"] = "required"
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        errors["email"] = "must be a valid email address"
    if len(message) < 10:
        errors["message"] = "must be at least 10 characters"
    if errors:
        return jsonify({"ok": False, "errors": errors}), 400

    MESSAGES_FILE.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "name": name[:120],
        "email": email[:200],
        "message": message[:4000],
        "ip": request.headers.get("X-Forwarded-For", request.remote_addr),
    }
    with MESSAGES_FILE.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return jsonify({"ok": True, "received": entry["at"]}), 201


# ---------------------------------------------------------------------------
# integrated terminal — /api/exec
#
# Every command is a handler in COMMANDS. Nothing reaches a shell: the handlers
# only read content/, so this terminal is exactly as exposed as the API is.
# Output is a list of {text, cls, href} lines the front end paints verbatim.
# ---------------------------------------------------------------------------

def line(text="", cls="", href=None) -> dict:
    out = {"text": text, "cls": cls}
    if href:
        out["href"] = href
    return out


def resolve(name: str) -> str | None:
    """Let 'app.py' mean 'backend/app.py' — basenames are unambiguous here."""
    paths = tree_paths()
    if name in paths:
        return name
    matches = [p for p in paths if p.rsplit("/", 1)[-1] == name]
    return matches[0] if len(matches) == 1 else None


def cmd_help(_args) -> list[dict]:
    rows = [
        ("golive", "start Live Server and open the resume"),
        ("resume", "the full resume, as a page"),
        ("ls", "list the files in this workspace"),
        ("cat <file>", "print a file"),
        ("open <file>", "open a file in the editor"),
        ("whoami", "the short version"),
        ("experience", "roles, most recent first"),
        ("projects", "what I've built"),
        ("skills", "the stack"),
        ("contact", "how to reach me"),
        ("grep <text>", "search every file"),
        ("curl <path>", "hit the JSON API, e.g. curl /api/health"),
        ("clear", "clear the terminal"),
    ]
    return [line("Available commands", "hd")] + [
        line(f"  {name:<15}{desc}", "cmd-row") for name, desc in rows
    ]


def cmd_ls(_args) -> list[dict]:
    out = []
    for group in manifest().get("tree", []):
        folder = group.get("folder", "")
        if folder:
            out.append(line(f"{folder}/", "dir"))
        for name in group.get("files", []):
            file = read_file(f"{folder}/{name}".lstrip("/"))
            if not file:
                continue
            pad = "  " if folder else ""
            out.append(line(
                f"{pad}{file['name']:<22}{file['lines']:>4} lines{file['bytes']:>8} B",
                "file"))
    return out


def cmd_cat(args) -> list[dict]:
    if not args:
        return [line("cat: missing file operand", "err")]
    rel = resolve(args[0])
    file = read_file(rel) if rel else None
    if file is None:
        return [line(f"cat: {args[0]}: No such file", "err")]
    return [line(t) for t in file["content"].rstrip("\n").split("\n")]


def cmd_whoami(_args) -> list[dict]:
    p = load_json("contact.json", {})
    return [
        line(p.get("name", SITE_NAME), "hd"),
        line(f"{p.get('title', SITE_TITLE)} · {p.get('location', '')}", "muted"),
        line(),
        line("4+ years building event-driven serverless backends on AWS,"),
        line("RAG and LLM pipelines, and automation systems."),
        line(),
        line("Type 'golive' to open the full resume.", "muted"),
    ]


def cmd_experience(_args) -> list[dict]:
    out = []
    for role in load_json("experience.json", []):
        out.append(line(f"{role['role']} — {role['company']}", "hd"))
        out.append(line(f"  {pretty_range(role)} · {role.get('location', '')} · "
                        f"{role.get('focus', '')}", "muted"))
        out += [line(f"  - {h}") for h in role.get("highlights", [])]
        out.append(line())
    return out


def cmd_projects(_args) -> list[dict]:
    out = []
    for p in parse_projects():
        out.append(line(p["name"], "hd"))
        out.append(line(f"  {p.get('when', '')} · {' · '.join(p.get('stack', []))}", "muted"))
        out.append(line(f"  {p.get('blurb', '')}"))
        out.append(line())
    return out


def cmd_skills(_args) -> list[dict]:
    out = []
    for group, items in load_json("skills.json", {}).items():
        out.append(line(group.replace("_", " ").title(), "hd"))
        out.append(line("  " + ", ".join(items)))
        out.append(line())
    return out


def cmd_contact(_args) -> list[dict]:
    out = []
    for key, value in load_json("contact.json", {}).items():
        href = value if str(value).startswith("http") else (
            f"mailto:{value}" if key == "email" else None)
        out.append(line(f"  {key:<12}{value}", "kv", href=href))
    return out


def cmd_grep(args) -> list[dict]:
    if not args:
        return [line("grep: missing search pattern", "err")]
    needle = " ".join(args).lower()
    out = []
    for rel in tree_paths():
        file = read_file(rel)
        if not file:
            continue
        for n, text in enumerate(file["content"].split("\n"), 1):
            if needle in text.lower():
                out.append(line(f"{rel}:{n}: {text.strip()[:110]}", "file"))
    return out[:40] or [line(f"grep: no matches for '{needle}'", "muted")]


def cmd_curl(args) -> list[dict]:
    if not args:
        return [line("curl: try 'curl /api/health'", "err")]
    target = args[0].split("://")[-1]
    if target.startswith(("127.0.0.1", "localhost")):
        target = "/" + (target.split("/", 1) + [""])[1]
    if not target.startswith("/"):
        target = "/" + target
    with app.test_client() as client:
        res = client.get(target)
    body = json.dumps(res.get_json(), indent=2, ensure_ascii=False) if res.is_json \
        else res.get_data(as_text=True)
    return [line(f"HTTP {res.status_code} · {res.content_type}", "muted")] + \
           [line(t) for t in body.split("\n")[:50]]


COMMANDS = {
    "help": cmd_help, "?": cmd_help,
    "ls": cmd_ls, "dir": cmd_ls,
    "cat": cmd_cat, "less": cmd_cat, "more": cmd_cat,
    "whoami": cmd_whoami, "about": cmd_whoami,
    "experience": cmd_experience, "exp": cmd_experience,
    "projects": cmd_projects,
    "skills": cmd_skills,
    "contact": cmd_contact,
    "grep": cmd_grep, "find": cmd_grep,
    "curl": cmd_curl,
    "date": lambda _a: [line(datetime.now(timezone.utc)
                             .strftime("%a %d %b %Y %H:%M:%S UTC"))],
    "pwd": lambda _a: [line(f"~/{WORKSPACE}")],
    "echo": lambda a: [line(" ".join(a))],
}

# Handled in the browser, listed here so 'command not found' stays honest.
CLIENT_COMMANDS = {"clear", "golive", "open", "resume", "code"}


@app.post("/api/exec")
def api_exec():
    """Run one terminal command and return the lines it printed."""
    payload = request.get_json(silent=True) or {}
    raw = str(payload.get("cmd", "")).strip()
    if not raw:
        return jsonify({"lines": []})

    name, *args = raw.split()
    handler = COMMANDS.get(name.lower())
    if handler is None:
        if name.lower() in CLIENT_COMMANDS:
            return jsonify({"lines": []})
        return jsonify({"lines": [
            line(f"command not found: {name}", "err"),
            line("Type 'help' to see what this terminal knows.", "muted"),
        ]})
    return jsonify({"lines": handler(args), "cmd": name.lower(), "args": args})


# ---------------------------------------------------------------------------
# Live Server — the same content, served as a plain resume page
# ---------------------------------------------------------------------------

MD = markdown.Markdown(extensions=["extra", "sane_lists"])

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def pretty_date(value: str) -> str:
    if not value or value == "present":
        return "Present"
    parts = value.split("-")
    if len(parts) == 2:
        return f"{MONTHS[int(parts[1]) - 1]} {parts[0]}"
    return value


def pretty_range(role: dict) -> str:
    start, end = pretty_date(role.get("start", "")), pretty_date(role.get("end", ""))
    return start if start == end else f"{start} – {end}"


def render_md(rel: str, drop_title: bool = False) -> str:
    file = read_file(rel)
    if file is None:
        return ""
    text = file["content"]
    if drop_title:
        text = re.sub(r"^# .*\n", "", text, count=1)
    MD.reset()
    return MD.convert(text)


def parse_projects(rel: str = "projects.ts") -> list[dict]:
    """Lift the project objects out of the TypeScript source.

    projects.ts stays a real .ts file so it reads like source in the editor;
    this pulls the data back out without needing a JS runtime.
    """
    file = read_file(rel)
    if file is None:
        return []
    src = file["content"]
    body = src[src.find("["):src.rfind("]") + 1] if "[" in src else ""
    out = []
    for block in re.findall(r"\{(.*?)\n  \}", body, re.S):
        item = {}
        for key in ("name", "when"):
            m = re.search(rf"{key}:\s*'((?:[^'\\]|\\.)*)'", block)
            if m:
                item[key] = m.group(1).replace("\\'", "'")
        blurb = re.search(r"blurb:\s*(.*?),\n\s*stack:", block, re.S)
        if blurb:
            item["blurb"] = "".join(
                re.findall(r"'((?:[^'\\]|\\.)*)'", blurb.group(1))).replace("\\'", "'")
        stack = re.search(r"stack:\s*\[(.*?)\]", block, re.S)
        if stack:
            item["stack"] = re.findall(r"'((?:[^'\\]|\\.)*)'", stack.group(1))
        if item.get("name"):
            out.append(item)
    return out


def split_sections(rel: str) -> list[tuple[str, str]]:
    """Split a markdown file on '---' into (heading, html) pairs."""
    file = read_file(rel)
    if file is None:
        return []
    out = []
    for chunk in file["content"].split("\n---\n"):
        chunk = chunk.strip("\n")
        if not chunk:
            continue
        heading = ""
        m = re.match(r"^# (.*)\n?", chunk)
        if m:
            heading, chunk = m.group(1), chunk[m.end():]
        MD.reset()
        out.append((heading, MD.convert(chunk)))
    return out


SKILL_LABELS = {
    "languages": "Languages",
    "aws": "AWS",
    "ai_ml": "AI / ML",
    "backend_and_practices": "Backend & Practices",
    "tools": "Tools",
}


def skill_groups() -> list[tuple[str, list]]:
    """(label, items) pairs — the keys are snake_case, resumes are not."""
    return [
        (SKILL_LABELS.get(key, key.replace("_", " ").title()), items)
        for key, items in load_json("skills.json", {}).items()
    ]


def about_parts() -> dict[str, str]:
    """Split about.md into its lead paragraph and its '## ' subsections.

    The resume wants the lead and the 'What I do' list; the links and the
    working-style quote are already covered by the masthead and by Experience.
    """
    file = read_file("about.md")
    if file is None:
        return {}
    body = re.sub(r"^# .*\n", "", file["content"], count=1).strip("\n")
    lead, *rest = re.split(r"^## ", body, flags=re.M)
    MD.reset()
    parts = {"lead": MD.convert(lead.strip())}
    for chunk in rest:
        heading, _, text = chunk.partition("\n")
        MD.reset()
        parts[heading.strip().lower()] = MD.convert(text.strip())
    return parts


def resume_context() -> dict:
    experience = load_json("experience.json", [])
    for role in experience:
        role["dates"] = pretty_range(role)
    about = about_parts()
    return {
        "profile": load_json("contact.json", {}),
        "summary": about.get("lead", ""),
        "strengths": about.get("what i do", ""),
        "sections": split_sections("education.md"),
        "experience": experience,
        "skills": skill_groups(),
        "projects": parse_projects(),
        "year": datetime.now(timezone.utc).year,
    }


@app.get("/live")
@app.get("/resume")
def resume_page():
    """The resume as an ordinary web page — what Live Server opens."""
    return render_template("resume.html", **resume_context())


@app.get("/robots.txt")
def robots():
    return send_from_directory(app.static_folder, "robots.txt")


@app.errorhandler(404)
def not_found(_):
    if request.path.startswith("/api/"):
        return jsonify({"error": "not found", "path": request.path}), 404
    return render_template("index.html", **shell_context()), 404


if __name__ == "__main__":
    print(f" * {SITE_NAME} — workbench http://{HOST}:{PORT}/  ·  "
          f"resume http://{HOST}:{PORT}/live")
    app.run(host=HOST, port=PORT,
            debug=os.getenv("FLASK_ENV", "development") == "development")
