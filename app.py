"""Flask backend for the portfolio.

Serves the vanilla HTML/CSS/JS frontend and exposes the content/ directory
over a small JSON API. One file in content/ is one section of the site.
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
CONTENT_DIR = BASE_DIR / os.getenv("CONTENT_DIR", "content")
MESSAGES_FILE = BASE_DIR / os.getenv("MESSAGES_FILE", "data/messages.jsonl")

SITE_NAME = os.getenv("SITE_NAME", "Portfolio")
SITE_TITLE = os.getenv("SITE_TITLE", "")
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "5500"))

LANGS = {".md": "markdown", ".json": "json", ".ts": "ts", ".js": "js", ".py": "python"}
SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]+$")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-only-change-me")
app.config["JSON_SORT_KEYS"] = False


def manifest() -> dict:
    """Read content/manifest.json, falling back to whatever is on disk."""
    path = CONTENT_DIR / "manifest.json"
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            app.logger.warning("manifest.json is invalid (%s); falling back to disk order", exc)
    names = sorted(p.name for p in CONTENT_DIR.iterdir() if p.suffix in LANGS)
    return {"order": names, "open": names[0] if names else None, "folder": "src"}


def read_file(name: str) -> dict | None:
    """Load one content file as {name, lang, folder, content}."""
    if not SAFE_NAME.match(name):
        return None
    path = (CONTENT_DIR / name).resolve()
    if not path.is_file() or CONTENT_DIR.resolve() not in path.parents:
        return None
    text = path.read_text(encoding="utf-8")
    return {
        "name": name,
        "lang": LANGS.get(path.suffix, "text"),
        "folder": manifest().get("folder", "src"),
        "lines": text.count("\n") + 1,
        "bytes": len(text.encode("utf-8")),
        "content": text,
    }


@app.get("/")
def index():
    return render_template(
        "index.html",
        site_name=SITE_NAME,
        site_title=SITE_TITLE,
        port=PORT,
        year=datetime.now(timezone.utc).year,
    )


@app.get("/api/content")
def api_content():
    """Every section, in manifest order — one request boots the workbench."""
    meta = manifest()
    files = [f for f in (read_file(n) for n in meta.get("order", [])) if f]
    return jsonify({"files": files, "open": meta.get("open"), "count": len(files)})


@app.get("/api/content/<name>")
def api_content_one(name: str):
    data = read_file(name)
    if data is None:
        return jsonify({"error": "not found", "name": name}), 404
    return jsonify(data)


@app.get("/api/profile")
def api_profile():
    """contact.json, parsed — the hero block and the Live Server preview use it."""
    data = read_file("contact.json")
    if data is None:
        return jsonify({"error": "contact.json missing"}), 404
    try:
        return jsonify(json.loads(data["content"]))
    except json.JSONDecodeError as exc:
        return jsonify({"error": f"contact.json is not valid JSON: {exc}"}), 500


@app.post("/api/contact")
def api_contact():
    """Accept a message from the site and append it to MESSAGES_FILE."""
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


@app.get("/api/health")
def api_health():
    return jsonify({
        "status": "ok",
        "site": SITE_NAME,
        "port": PORT,
        "sections": len(manifest().get("order", [])),
        "time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    })


# --------------------------------------------------------------------------
# Rendering helpers for the served site (/live)
# --------------------------------------------------------------------------

MD = markdown.Markdown(extensions=["extra", "sane_lists"])


def render_md(name: str, drop_title: bool = False) -> str:
    """Render one markdown section to HTML."""
    data = read_file(name)
    if data is None:
        return ""
    text = data["content"]
    if drop_title:
        text = re.sub(r"^# .*\n", "", text, count=1)
    MD.reset()
    return MD.convert(text)


def load_json(name: str, fallback):
    data = read_file(name)
    if data is None:
        return fallback
    try:
        return json.loads(data["content"])
    except json.JSONDecodeError as exc:
        app.logger.warning("%s is not valid JSON: %s", name, exc)
        return fallback


def parse_projects(name: str = "projects.ts") -> list[dict]:
    """Pull the project objects out of the TypeScript source.

    projects.ts is a real .ts file so it reads like source in the editor;
    this lifts the data out of it without needing a JS runtime.
    """
    data = read_file(name)
    if data is None:
        return []
    src = data["content"]
    body = src[src.find("["):src.rfind("]") + 1] if "[" in src else ""
    out = []
    for block in re.findall(r"\{(.*?)\n  \}", body, re.S):
        item = {}
        for key in ("name", "meta", "when"):
            m = re.search(rf"{key}:\s*'((?:[^'\\]|\\.)*)'", block)
            if m:
                item[key] = m.group(1).replace("\\'", "'")
        blurb = re.search(r"blurb:\s*(.*?),\n\s*stack:", block, re.S)
        if blurb:
            item["blurb"] = "".join(re.findall(r"'((?:[^'\\]|\\.)*)'", blurb.group(1))).replace("\\'", "'")
        stack = re.search(r"stack:\s*\[(.*?)\]", block, re.S)
        if stack:
            item["stack"] = re.findall(r"'((?:[^'\\]|\\.)*)'", stack.group(1))
        if item.get("name"):
            out.append(item)
    return out


MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def pretty_date(value: str) -> str:
    if not value or value == "present":
        return "Present"
    parts = value.split("-")
    if len(parts) == 2:
        return f"{MONTHS[int(parts[1]) - 1]} {parts[0]}"
    return value


@app.get("/live")
def live():
    """The portfolio as a normal website — rendered server side from content/."""
    experience = load_json("experience.json", [])
    for role in experience:
        role["dates"] = pretty_date(role.get("start", ""))
        if role.get("end") and role["end"] != role.get("start"):
            role["dates"] += " – " + pretty_date(role["end"])
        if role.get("duration"):
            role["dates"] += f" · {role['duration']}"

    return render_template(
        "site.html",
        profile=load_json("contact.json", {}),
        about=render_md("about.md", drop_title=True),
        education=render_md("education.md"),
        volunteering=render_md("volunteering.md"),
        experience=experience,
        skills=load_json("skills.json", {}),
        projects=parse_projects(),
        year=datetime.now(timezone.utc).year,
    )


@app.get("/resume")
def resume():
    """The actual resume PDF, opened from the workbench status bar."""
    return send_from_directory(app.static_folder, "resume.pdf",
                               mimetype="application/pdf", as_attachment=False)


@app.get("/robots.txt")
@app.get("/llms.txt")
def passthrough():
    return send_from_directory(app.static_folder, request.path.lstrip("/"))


@app.errorhandler(404)
def not_found(_):
    if request.path.startswith("/api/"):
        return jsonify({"error": "not found", "path": request.path}), 404
    return render_template("index.html", site_name=SITE_NAME, site_title=SITE_TITLE,
                           port=PORT, year=datetime.now(timezone.utc).year), 404


if __name__ == "__main__":
    debug = os.getenv("FLASK_ENV", "development") == "development"
    print(f" * {SITE_NAME} — serving {len(manifest().get('order', []))} sections on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=debug)
