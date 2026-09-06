"""The content layer: files on disk in, plain dictionaries out."""

import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

LANGS = {
    ".md": "markdown", ".json": "json", ".ts": "ts",
    ".js": "js", ".py": "python", ".html": "html", ".css": "css",
}
SAFE_PATH = re.compile(r"^(?!.*\.\.)[A-Za-z0-9._/-]+$")
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContentStore:
    """Reads content/ — the only thing that touches the filesystem."""

    def __init__(self, root: Path):
        self.root = Path(root).resolve()

    def manifest(self) -> dict:
        path = self.root / "manifest.json"
        if not path.exists():
            return {"tree": [], "open": None}
        return json.loads(path.read_text(encoding="utf-8"))

    def read(self, rel: str) -> dict | None:
        """One file, or None if it is missing or escapes the content root."""
        if not SAFE_PATH.match(rel):
            return None
        path = (self.root / rel).resolve()
        if not path.is_file() or self.root not in path.parents:
            return None
        text = path.read_text(encoding="utf-8")
        return {
            "path": rel,
            "name": path.name,
            "folder": str(Path(rel).parent) if "/" in rel else "",
            "lang": LANGS.get(path.suffix, "text"),
            "lines": text.count("\n") + 1,
            "bytes": len(text.encode("utf-8")),
            "content": text,
        }

    def all(self) -> list[dict]:
        """Every file the manifest lists, in tree order."""
        paths = [
            f"{group['folder']}/{name}".lstrip("/")
            for group in self.manifest().get("tree", [])
            for name in group.get("files", [])
        ]
        return [f for f in (self.read(p) for p in paths) if f]

    def json(self, rel: str, fallback):
        file = self.read(rel)
        if file is None:
            return fallback
        try:
            return json.loads(file["content"])
        except json.JSONDecodeError:
            return fallback


@dataclass
class Message:
    """A note from the contact form, validated on the way in."""

    name: str
    email: str
    body: str
    at: str = ""
    errors: dict = field(default_factory=dict)

    @classmethod
    def from_payload(cls, payload: dict) -> "Message":
        msg = cls(
            name=str(payload.get("name", "")).strip()[:120],
            email=str(payload.get("email", "")).strip()[:200],
            body=str(payload.get("message", "")).strip()[:4000],
            at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        )
        if not msg.name:
            msg.errors["name"] = "required"
        if not EMAIL.match(msg.email):
            msg.errors["email"] = "must be a valid email address"
        if len(msg.body) < 10:
            msg.errors["message"] = "must be at least 10 characters"
        return msg

    def save(self, path: Path = Path("data/messages.jsonl")) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(self.__dict__, default=str) + "\n")
