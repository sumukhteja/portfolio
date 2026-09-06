/* The workbench: explorer, tabs, editor, search, quick open.
   Content lives in content/*.js — this file only knows how to display it. */
(() => {
  const $ = (s) => document.querySelector(s);
  const files = PORTFOLIO.files;
  const byName = Object.fromEntries(files.map(f => [f.name, f]));
  const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /* ---------- syntax highlighting ---------- */
  const RULES = {
    markdown: [
      { re: /^\s{0,3}#{1,6} .*$/, cls: 't-h1' },
      { re: /^\s*> .*$/, cls: 't-quote' },
      { re: /^\s*(?:---+|\*\*\*+)\s*$/, cls: 't-rule' },
      { re: /^\s*(?:[-*+]|\d+\.) /, cls: 't-bullet' },
      { re: /`[^`]*`/, cls: 't-code' },
      { re: /\[[^\]]*\]\([^)]*\)/, cls: 't-link' },
      { re: /\*\*[^*]+\*\*/, cls: 't-bold' },
      { re: /\*[^*]+\*/, cls: 't-quote' },
    ],
    json: [
      { re: /"(?:[^"\\]|\\.)*"(?=\s*:)/, cls: 't-key' },
      { re: /"(?:[^"\\]|\\.)*"/, cls: 't-str' },
      { re: /\b(?:true|false|null)\b/, cls: 't-kw' },
      { re: /-?\b\d+(?:\.\d+)?\b/, cls: 't-num' },
    ],
    ts: [
      { re: /\/\/.*$/, cls: 't-com' },
      { re: /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/, cls: 't-str' },
      { re: /\b(?:return|if|else|for|while|await|of|in)\b/, cls: 't-ctl' },
      { re: /\b(?:export|default|const|let|var|interface|type|function|import|from|as|new|class|extends|implements|async)\b/, cls: 't-kw' },
      { re: /\b(?:string|number|boolean|any|void|unknown|never)\b/, cls: 't-type' },
      { re: /\b[A-Z][A-Za-z0-9_]*\b/, cls: 't-type' },
      { re: /\b[A-Za-z_$][\w$]*(?=\s*:)/, cls: 't-key' },
      { re: /\b[a-zA-Z_$][\w$]*(?=\()/, cls: 't-fn' },
      { re: /\b\d+(?:\.\d+)?\b/, cls: 't-num' },
    ],
  };
  const COMPILED = Object.fromEntries(Object.entries(RULES).map(([lang, rules]) => [
    lang, { re: new RegExp(rules.map(r => '(' + r.re.source + ')').join('|'), 'g'), rules }
  ]));

  function highlightLine(line, lang) {
    const c = COMPILED[lang];
    if (!c || !line) return esc(line);
    c.re.lastIndex = 0;
    let out = '', last = 0, m;
    while ((m = c.re.exec(line))) {
      if (m[0] === '') { c.re.lastIndex++; continue; }
      if (m.index > last) out += esc(line.slice(last, m.index));
      const gi = m.slice(1).findIndex(g => g !== undefined);
      out += `<span class="${c.rules[gi].cls}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(line.slice(last));
  }

  /* ---------- explorer ---------- */
  const LANG_LABEL = { markdown: 'Markdown', json: 'JSON', ts: 'TypeScript' };
  const iconFor = (name) => {
    const ext = name.split('.').pop();
    const map = { md: ['MD', 'i-md'], json: ['{}', 'i-json'], ts: ['TS', 'i-ts'], js: ['JS', 'i-js'] };
    const [txt, cls] = map[ext] || ['·', ''];
    return `<span class="ficon ${cls}">${txt}</span>`;
  };

  function renderTree() {
    const tree = $('#file-tree');
    tree.innerHTML =
      `<li class="folder"><span class="chev">▾</span>src</li>` +
      files.map(f => `<li data-file="${f.name}">${iconFor(f.name)}${f.name}</li>`).join('');
    tree.querySelectorAll('[data-file]').forEach(li =>
      li.addEventListener('click', () => open(li.dataset.file)));
  }

  /* ---------- tabs + editor ---------- */
  let openTabs = [];
  let active = null;
  let curLine = 1;

  function open(name, line) {
    if (!byName[name]) return;
    if (!openTabs.includes(name)) openTabs.push(name);
    active = name;
    curLine = line || 1;
    render();
  }

  function close(name) {
    const i = openTabs.indexOf(name);
    if (i < 0) return;
    openTabs.splice(i, 1);
    if (active === name) active = openTabs[Math.min(i, openTabs.length - 1)] || null;
    curLine = 1;
    render();
  }

  function render() {
    $('#tabs').innerHTML = openTabs.map(n =>
      `<div class="tab${n === active ? ' active' : ''}" data-tab="${n}">${iconFor(n)}<span>${n}</span><span class="close" data-close="${n}">✕</span></div>`
    ).join('');
    $('#tabs').querySelectorAll('[data-tab]').forEach(t =>
      t.addEventListener('click', () => open(t.dataset.tab)));
    $('#tabs').querySelectorAll('[data-close]').forEach(b =>
      b.addEventListener('click', (e) => { e.stopPropagation(); close(b.dataset.close); }));

    document.querySelectorAll('#file-tree [data-file]').forEach(li =>
      li.classList.toggle('active', li.dataset.file === active));

    const hasFile = !!active;
    $('#editor').classList.toggle('hidden', !hasFile);
    $('#breadcrumbs').classList.toggle('hidden', !hasFile);
    $('#welcome').classList.toggle('hidden', hasFile);
    if (!hasFile) { $('#st-lang').textContent = 'Plain Text'; return; }

    const f = byName[active];
    const lines = f.content.replace(/\n$/, '').split('\n');
    $('#breadcrumbs').innerHTML =
      `<span>${f.folder}</span><span class="sep">›</span>${iconFor(f.name)}<span>${f.name}</span>`;
    $('#gutter').innerHTML = lines.map((_, i) =>
      `<span class="${i + 1 === curLine ? 'cur' : ''}">${i + 1}</span>`).join('');
    $('#code').innerHTML = lines.map((l, i) =>
      `<span class="line${i + 1 === curLine ? ' cur' : ''}" data-line="${i + 1}">${highlightLine(l, f.lang) || ' '}</span>`).join('');
    $('#st-lang').textContent = LANG_LABEL[f.lang] || f.lang;
    $('#st-pos').textContent = `Ln ${curLine}, Col 1`;
    $('#editor').scrollTop = 0;
    drawMinimap(lines);
  }

  $('#code').addEventListener('click', (e) => {
    const el = e.target.closest('.line');
    if (!el) return;
    curLine = +el.dataset.line;
    document.querySelectorAll('#code .line, #gutter span').forEach(n => n.classList.remove('cur'));
    el.classList.add('cur');
    $('#gutter').children[curLine - 1]?.classList.add('cur');
    $('#st-pos').textContent = `Ln ${curLine}, Col 1`;
  });

  /* ---------- minimap ---------- */
  function drawMinimap(lines) {
    const cv = $('#minimap');
    const h = $('#editor').clientHeight || 600;
    cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, h);
    const step = Math.min(3, h / Math.max(lines.length, 1));
    lines.forEach((l, i) => {
      const indent = l.match(/^\s*/)[0].length;
      const len = l.trim().length;
      if (!len) return;
      ctx.fillStyle = i + 1 === curLine ? '#4a4a4a' : '#3f3f3f';
      ctx.fillRect(4 + indent * 1.4, i * step, Math.min(len * 1.3, 80), Math.max(step - 1, 1));
    });
  }
  window.addEventListener('resize', () => {
    if (active) drawMinimap(byName[active].content.replace(/\n$/, '').split('\n'));
  });

  /* ---------- activity bar views ---------- */
  const LABELS = { explorer: 'Explorer', search: 'Search', scm: 'Source Control', run: 'Run and Debug', account: 'Contact' };
  document.querySelectorAll('.act').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.act').forEach(b => b.classList.toggle('active', b === btn));
    const v = btn.dataset.view;
    document.querySelectorAll('.view').forEach(el => el.classList.toggle('hidden', el.id !== 'view-' + v));
    $('#sidebar-label').textContent = LABELS[v];
    if (v === 'search') $('#search-input').focus();
  }));

  /* ---------- search ---------- */
  $('#search-input').addEventListener('input', (e) => {
    const q = e.target.value.trim();
    const box = $('#search-results');
    if (q.length < 2) { box.innerHTML = '<div class="pad muted small">Type at least 2 characters.</div>'; return; }
    const needle = q.toLowerCase();
    let html = '', total = 0;
    for (const f of files) {
      const hits = f.content.split('\n')
        .map((l, i) => ({ l, n: i + 1 }))
        .filter(x => x.l.toLowerCase().includes(needle));
      if (!hits.length) continue;
      total += hits.length;
      html += `<div class="search-file">${f.name} · ${hits.length}</div>`;
      html += hits.slice(0, 8).map(x => {
        const t = esc(x.l.trim()).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), m => `<b>${m}</b>`);
        return `<div class="search-hit" data-open="${f.name}" data-line="${x.n}">${t}</div>`;
      }).join('');
    }
    box.innerHTML = total ? html : '<div class="pad muted small">No results.</div>';
    box.querySelectorAll('[data-open]').forEach(el =>
      el.addEventListener('click', () => open(el.dataset.open, +el.dataset.line)));
  });

  /* ---------- contact view ---------- */
  (() => {
    const c = byName['contact.json'];
    if (!c) return;
    let data = {};
    try { data = JSON.parse(c.content); } catch (_) {}
    $('#account-links').innerHTML = Object.entries(data).map(([k, v]) => {
      const val = /^https?:\/\//.test(v) ? `<a href="${v}" target="_blank" rel="noopener">${v}</a>`
        : k === 'email' ? `<a href="mailto:${v}">${v}</a>`
        : `<div class="small">${v}</div>`;
      return `<div class="small muted" style="margin-top:8px">${k}</div>${val}`;
    }).join('');
  })();

  /* ---------- quick open (Ctrl/Cmd+P) ---------- */
  const palette = $('#palette'), pInput = $('#palette-input'), pList = $('#palette-list');
  let pSel = 0, pItems = [];

  function paintPalette() {
    const q = pInput.value.toLowerCase();
    pItems = files.filter(f => f.name.toLowerCase().includes(q));
    pSel = 0;
    pList.innerHTML = pItems.length
      ? pItems.map((f, i) => `<li class="${i === 0 ? 'sel' : ''}" data-i="${i}">${iconFor(f.name)}${f.name}<span class="dim">${f.folder}</span></li>`).join('')
      : '<li class="dim">No matching files</li>';
    pList.querySelectorAll('[data-i]').forEach(li =>
      li.addEventListener('click', () => { open(pItems[+li.dataset.i].name); hidePalette(); }));
  }
  const showPalette = () => { palette.classList.remove('hidden'); pInput.value = ''; paintPalette(); pInput.focus(); };
  const hidePalette = () => palette.classList.add('hidden');

  pInput.addEventListener('input', paintPalette);
  palette.addEventListener('click', (e) => { if (e.target === palette) hidePalette(); });

  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); showPalette(); return; }
    if (mod && e.key.toLowerCase() === 'w' && active) { e.preventDefault(); close(active); return; }
    if (palette.classList.contains('hidden')) return;
    if (e.key === 'Escape') hidePalette();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!pItems.length) return;
      pSel = (pSel + (e.key === 'ArrowDown' ? 1 : -1) + pItems.length) % pItems.length;
      pList.querySelectorAll('li').forEach((li, i) => li.classList.toggle('sel', i === pSel));
    }
    if (e.key === 'Enter' && pItems[pSel]) { open(pItems[pSel].name); hidePalette(); }
  });

  /* ---------- splash ---------- */
  function runSplash() {
    const splash = $('#splash'), fill = $('#splash-fill'), log = $('#splash-log');
    if (!splash) return;

    const steps = [
      'Starting workspace\u2026',
      ...files.map(f => 'Loading content/' + f.name + '.js'),
      'Ready.'
    ];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = reduced ? 40 : 150;
    let i = 0, timer;

    const finish = () => {
      clearInterval(timer);
      document.removeEventListener('keydown', finish);
      splash.removeEventListener('click', finish);
      splash.classList.add('done');
      setTimeout(() => splash.remove(), 500);
    };

    timer = setInterval(() => {
      log.textContent = steps[i];
      fill.style.width = Math.round(((i + 1) / steps.length) * 100) + '%';
      if (++i >= steps.length) setTimeout(finish, reduced ? 80 : 320);
    }, tick);

    splash.addEventListener('click', finish);
    document.addEventListener('keydown', finish);
  }

  /* ---------- boot ---------- */
  renderTree();
  const first = files.find(f => f.open) || files[0];
  if (first) open(first.name); else render();
  runSplash();
})();
