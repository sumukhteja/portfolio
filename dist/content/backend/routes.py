"""Blueprints: the workbench pages and the JSON API behind them."""

from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, render_template, request

from .models import ContentStore, Message

pages = Blueprint("pages", __name__)
api = Blueprint("api", __name__)


def store() -> ContentStore:
    return ContentStore(current_app.config["CONTENT_DIR"])


@pages.get("/")
def index():
    """The VS Code-styled workbench shell."""
    return render_template("index.html", site_name=current_app.config["SITE_NAME"])


@pages.get("/live")
@pages.get("/resume")
def resume():
    """The same content, rendered as an ordinary resume page."""
    return render_template("resume.html", **store().resume_context())


@api.get("/content")
def content():
    """Every file, in manifest order — one request boots the workbench."""
    files = store().all()
    return jsonify({"files": files, "count": len(files)})


@api.get("/content/<path:path>")
def content_one(path: str):
    file = store().read(path)
    if file is None:
        return jsonify({"error": "not found", "path": path}), 404
    return jsonify(file)


@api.post("/contact")
def contact():
    """Validate an inbound message and append it to the log."""
    message = Message.from_payload(request.get_json(silent=True) or {})
    if message.errors:
        return jsonify({"ok": False, "errors": message.errors}), 400
    message.save()
    return jsonify({"ok": True, "received": message.at}), 201


@api.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "sections": len(store().all()),
        "time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    })
