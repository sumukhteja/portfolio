# sumukhteja.com — VS Code portfolio

A portfolio that looks like VS Code. Plain static site: no framework, no bundler,
no dependencies. Open `index.html` in a browser (works over `file://` too), or:

```sh
npm run dev     # serves on http://localhost:5173
```

> The previous React/Vite version of this site is preserved on the
> **`old-react-site`** branch.

## Layout

```
index.html      workbench shell (activity bar, sidebar, tabs, status bar)
styles.css      Dark+ theme
app.js          explorer, tabs, editor rendering, syntax highlighting, search, quick open
content/        one file = one thing
  _registry.js  collects the content files
  about.md.js
  experience.json.js
  projects.ts.js
  skills.json.js
  education.md.js
  contact.json.js
resume.tex      resume source, kept from the previous version
```

## Editing content

Each file in `content/` calls `PORTFOLIO.file({...})` once. Edit the `content`
template string — that text is exactly what shows in the editor pane.

```js
PORTFOLIO.file({
  name: 'awards.md',   // shown in the explorer and tab
  folder: 'src',       // breadcrumb path
  lang: 'markdown',    // 'markdown' | 'json' | 'ts'
  open: true,          // optional: open this tab on load
  content: `# Awards ...`
});
```

To add a file: drop it in `content/`, then add a `<script>` tag for it in
`index.html` (script order = explorer order).

## Keys

- `Ctrl`/`⌘` + `P` — quick open
- `Ctrl`/`⌘` + `W` — close tab
- Click a line to move the cursor (status bar updates)

## Deploying

The repo root is already the deployable site — point any static host at it
(GitHub Pages: Settings → Pages → deploy from `main` / root).

If your host is configured with a build step from the old Vite setup,
`npm run build` copies the site into `dist/` so a `dist` publish directory
keeps working unchanged.
