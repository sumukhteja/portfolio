/* The workbench: explorer, tabs, editor, terminal, Live Server.
   Content comes from /api/content — this file only knows how to show it. */

const $ = (sel) => document.querySelector(sel);
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

const state = {
  files: [],       // every file from the API
  tabs: [],        // open tab paths, in order
  active: null,    // focused tab
  line: 1,         // cursor line
  live: false,     // is Live Server running
};

/* ---------- boot ---------- */

async function boot() {
  const res = await fetch('/api/content');
  const data = await res.json();
  state.files = data.files;
  renderExplorer();
  openFile(data.open || state.files[0]?.path);
  Terminal.greet();
}

/* ---------- explorer ---------- */

function renderExplorer() {
  const groups = new Map();
  for (const file of state.files) {
    const key = file.folder || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(file);
  }
  $('#file-tree').innerHTML = [...groups]
    .map(([folder, files]) => folderMarkup(folder, files))
    .join('');
}

function folderMarkup(folder, files) {
  const rows = files
    .map((f) => `<li class="row file" data-path="${f.path}">${icon(f.name)}${f.name}</li>`)
    .join('');
  if (!folder) return rows;
  return `<li class="row folder" data-folder="${folder}">
            <span class="chev">▾</span>${folder}
          </li>${rows}`;
}

/* ---------- editor ---------- */

function openFile(path) {
  const file = state.files.find((f) => f.path === path);
  if (!file) return;
  if (!state.tabs.includes(path)) state.tabs.push(path);
  state.active = path;
  state.line = 1;
  paint();
}

function closeTab(path) {
  const i = state.tabs.indexOf(path);
  state.tabs.splice(i, 1);
  if (state.active === path) state.active = state.tabs[i] || state.tabs[i - 1] || null;
  paint();
}

function paint() {
  const file = state.files.find((f) => f.path === state.active);
  if (!file) return;
  const lines = file.content.replace(/\n$/, '').split('\n');
  $('#gutter').innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join('');
  $('#code').innerHTML = lines
    .map((l, i) => `<span class="line" data-line="${i + 1}">${highlight(l, file.lang)}</span>`)
    .join('');
  drawMinimap(lines);
}

boot();
