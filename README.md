# sumukhteja.com — portfolio

A portfolio that looks like VS Code, backed by a small Flask app.
Vanilla HTML/CSS/JS on the front, Python on the back, content on disk.

```sh
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit it
python app.py                 # http://127.0.0.1:5500
```

> The previous React/Vite version of this site is on the **`old-react-site`** branch.

## Layout

```
app.py             Flask: serves the workbench, the JSON API and the rendered site
.env               local config (gitignored) — copy from .env.example
requirements.txt   Flask, python-dotenv, Markdown
content/           one file = one section — the only place to edit content
  manifest.json    order of the files, and which one opens first
  about.md  experience.json  projects.ts  skills.json
  education.md  volunteering.md  contact.json
templates/
  index.html       the VS Code workbench
  site.html        the portfolio as a normal website (/live)
static/
  styles.css       workbench theme
  app.js           explorer, tabs, editor, highlighting, search, quick open, terminal
  golive.js        the Go Live button
  site.css         the served site's styles
data/              messages posted to /api/contact land here (gitignored)
```

## The two views

- **`/`** — the workbench. Your content shown as syntax-highlighted source,
  fetched from the API. Explorer, tabs, search, quick open, minimap, and a
  TERMINAL / API panel that logs real requests.
- **`/live`** — the same content rendered by Flask as an ordinary portfolio site.
  Click **Go Live** in the status bar to open it.

## API

| Method | Path | Returns |
|---|---|---|
| GET | `/api/content` | every section, in manifest order |
| GET | `/api/content/<name>` | one section |
| GET | `/api/profile` | `contact.json`, parsed |
| GET | `/api/health` | status, port, section count |
| POST | `/api/contact` | validates `{name, email, message}`, appends to `MESSAGES_FILE` |

## Editing content

Edit the files in `content/` — nothing else. Markdown, JSON and TypeScript
are all rendered on both views:

- `.md` → headings, lists, bold, links, quotes
- `.json` → parsed into cards and chip rows
- `projects.ts` → the project objects are lifted out of the TypeScript source

To add a section: drop a file in `content/` and add its name to
`content/manifest.json`. It appears in the explorer and on `/live`.

## Keys

- `Ctrl`/`⌘` + `P` — quick open
- `Ctrl`/`⌘` + `W` — close tab
- Click a line to move the cursor

## Deploying

Any host that runs Python. Set the same variables as `.env.example`
(`SECRET_KEY` especially) and serve with a WSGI server:

```sh
pip install gunicorn
gunicorn -w 2 -b 0.0.0.0:8000 app:app
```
