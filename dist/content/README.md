# portfolio

My resume, served as the editor I actually write it in.

The workbench at `/` is a VS Code shell — explorer, tabs, editor, integrated
terminal, Live Server. Every file you can open in it is a real file in
`content/`, served over a small JSON API. Nothing is hardcoded in the markup.

## Run it

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env
python app.py            # http://127.0.0.1:5500
```

## Structure

```
backend/     Flask app factory, routes, content layer
frontend/    the workbench — one HTML shell, one stylesheet, one script
*.md *.json  the resume itself, one file per section
.env         local config (gitignored)
```

## The terminal

Hit the terminal panel and type `help`. It runs against the same content the
editor shows — `ls`, `cat about.md`, `grep aws`, `curl /api/health`, `golive`.

## Live Server

`golive` (or the status bar button) serves the same content as a plain resume
page at `/live`. That page is the one to send to a recruiter.
