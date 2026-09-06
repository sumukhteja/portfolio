# VS Code portfolio

A portfolio site that looks like VS Code. Static — no build step, no dependencies.
Open `index.html` in a browser (works over `file://` too).

## Layout

```
index.html      the workbench shell (activity bar, sidebar, tabs, status bar)
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
`index.html` (order there = order in the explorer).

## Keys

- `Ctrl`/`⌘` + `P` — quick open
- `Ctrl`/`⌘` + `W` — close tab
- Click a line to move the cursor (status bar updates)

## Deploying

Any static host. GitHub Pages: push the folder, enable Pages on the branch root.
