"""Portfolio API — Flask application factory.

Serves the workbench, the rendered resume at /live, and a small JSON API
over content/. One file in content/ is one section of the site.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, render_template

from .routes import api, pages

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


def create_app(config: dict | None = None) -> Flask:
    app = Flask(
        __name__,
        template_folder=BASE_DIR / "frontend" / "templates",
        static_folder=BASE_DIR / "frontend" / "static",
    )
    app.config.update(
        SECRET_KEY=os.getenv("SECRET_KEY", "dev-only-change-me"),
        CONTENT_DIR=BASE_DIR / os.getenv("CONTENT_DIR", "content"),
        SITE_NAME=os.getenv("SITE_NAME", "Portfolio"),
        JSON_SORT_KEYS=False,
    )
    if config:
        app.config.update(config)

    app.register_blueprint(pages)
    app.register_blueprint(api, url_prefix="/api")

    @app.errorhandler(404)
    def not_found(_):
        return render_template("index.html"), 404

    return app


if __name__ == "__main__":
    create_app().run(
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5500")),
        debug=os.getenv("FLASK_ENV") == "development",
    )
