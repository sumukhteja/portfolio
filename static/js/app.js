/* The workbench: explorer, tabs, editor, side views, quick open, Live Server.
   Content arrives from /api/content — this file only knows how to show it. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = Highlight.esc;

  const state = {
    files: [],
    byPath: {},
    tree: [],
    tabs: [],
    active: null,
    line: 1,
    live: false,
  };

  /* ── file glyphs ─────────────────────────────────────────────────────── */

  const GLYPH = {
    md: ['MD', 'md'], json: ['{ }', 'json'], ts: ['TS', 'ts'], js: ['JS', 'js'],
    py: ['PY', 'py'], html: ['<>', 'html'], css: ['CSS', 'css'], txt: ['TXT', 'txt'],
    env: ['ENV', 'env'],
  };
  const LANG_LABEL = {
    markdown: 'Markdown', json: 'JSON', ts: 'TypeScript', js: 'JavaScript',
    python: 'Python', html: 'HTML', css: 'CSS', env: 'Properties', text: 'Plain Text',
  };

  function icon(name) {
    const ext = name.startsWith('.env') ? 'env' : name.split('.').pop();
    const [txt, cls] = GLYPH[ext] || ['·', 'txt'];
    return `<span class="fi ${cls}">${txt}</span>`;
  }

  /* Folder glyphs: an open folder, tinted per folder the way icon themes do. */
  const FOLDER_TINT = { frontend: 'front', backend: 'back' };

  function folderIcon(name, open = true) {
    const body = open
      ? '<path d="M1.5 12.5V3.2A.7.7 0 0 1 2.2 2.5h3.4l1.6 1.8h4.6a.7.7 0 0 1 .7.7v1.5"/>' +
        '<path d="M1.5 12.5l1.9-5.3a.7.7 0 0 1 .66-.47h10.2a.5.5 0 0 1 .47.66l-1.6 4.6a.7.7 0 0 1-.66.5z"/>'
      : '<path d="M1.5 12.8V3.2a.7.7 0 0 1 .7-.7h3.4l1.6 1.8h6.1a.7.7 0 0 1 .7.7v7.8a.7.7 0 0 1-.7.7H2.2a.7.7 0 0 1-.7-.7z"/>';
    return `<span class="fo ${FOLDER_TINT[name] || ''}"><svg viewBox="0 0 16 16">${body}</svg></span>`;
  }

  /* ── explorer ────────────────────────────────────────────────────────── */

  function renderTree() {
    const rows = [];
    for (const group of state.tree) {
      const folder = group.folder || '';
      if (folder) {
        rows.push(
          `<li class="folder depth-1 open" data-folder="${folder}">` +
          `<span class="chev"></span>${folderIcon(folder)}${folder}</li>`
        );
      }
      for (const name of group.files || []) {
        const path = folder ? `${folder}/${name}` : name;
        if (!state.byPath[path]) continue;
        rows.push(
          `<li class="file depth-${folder ? 2 : 1}" data-path="${path}">` +
          `${icon(name)}${name}</li>`
        );
      }
    }
    $('#tree').innerHTML = rows.join('');
    $$('#tree [data-path]').forEach((li) =>
      li.addEventListener('click', () => openFile(li.dataset.path)));
    $$('#tree [data-folder]').forEach((li) => li.addEventListener('click', () => {
      const open = li.classList.toggle('open');
      li.querySelector('.fo').outerHTML = folderIcon(li.dataset.folder, open);
      for (const row of $$(`#tree [data-path^="${li.dataset.folder}/"]`)) {
        row.classList.toggle('hidden', !open);
      }
    }));
  }

  /* ── tabs + editor ───────────────────────────────────────────────────── */

  function openFile(path, line) {
    const file = state.byPath[path];
    if (!file) return false;
    if (!state.tabs.includes(path)) state.tabs.push(path);
    state.active = path;
    state.line = line || 1;
    paint();
    return true;
  }

  function closeTab(path) {
    const i = state.tabs.indexOf(path);
    if (i < 0) return;
    state.tabs.splice(i, 1);
    if (state.active === path) state.active = state.tabs[i] || state.tabs[i - 1] || null;
    state.line = 1;
    paint();
  }

  function paint() {
    $('#tabs').innerHTML = state.tabs.map((p) => {
      const f = state.byPath[p];
      return `<div class="tab${p === state.active ? ' active' : ''}" data-tab="${p}" role="tab">
                ${icon(f.name)}<span>${f.name}</span>
                <span class="x" data-close="${p}" title="Close">✕</span>
              </div>`;
    }).join('');
    $$('#tabs [data-tab]').forEach((t) =>
      t.addEventListener('click', () => openFile(t.dataset.tab)));
    $$('#tabs [data-close]').forEach((b) =>
      b.addEventListener('click', (e) => { e.stopPropagation(); closeTab(b.dataset.close); }));

    $$('#tree [data-path]').forEach((li) =>
      li.classList.toggle('active', li.dataset.path === state.active));

    const file = state.byPath[state.active];
    if (!file) {
      $('#code').innerHTML = '';
      $('#gutter').innerHTML = '';
      $('#breadcrumbs').innerHTML = '<span class="sep">No file open — pick one from the explorer</span>';
      $('#st-lang').textContent = 'Plain Text';
      return;
    }

    const lines = file.content.replace(/\n$/, '').split('\n');

    $('#breadcrumbs').innerHTML =
      `<span>${window.CONFIG.workspace}</span><span class="sep">›</span>` +
      (file.folder ? `<span>${file.folder}</span><span class="sep">›</span>` : '') +
      `${icon(file.name)}<span>${file.name}</span>`;

    $('#gutter').innerHTML = lines
      .map((_, i) => `<span class="${i + 1 === state.line ? 'cur' : ''}">${i + 1}</span>`).join('');

    $('#code').innerHTML = lines
      .map((l, i) => `<span class="line${i + 1 === state.line ? ' cur' : ''}" data-line="${i + 1}">` +
                     `${Highlight.line(l, file.lang) || ' '}</span>`).join('');

    $('#st-lang').textContent = LANG_LABEL[file.lang] || file.lang;
    $('#st-pos').textContent = `Ln ${state.line}, Col 1`;

    const target = $(`#code .line[data-line="${state.line}"]`);
    if (state.line > 1 && target) target.scrollIntoView({ block: 'center' });
    else $('#editor').scrollTop = 0;
  }

  $('#code').addEventListener('click', (e) => {
    const el = e.target.closest('.line');
    if (!el) return;
    state.line = +el.dataset.line;
    $$('#code .line.cur, #gutter span.cur').forEach((n) => n.classList.remove('cur'));
    el.classList.add('cur');
    $('#gutter').children[state.line - 1]?.classList.add('cur');
    $('#st-pos').textContent = `Ln ${state.line}, Col 1`;
  });

  /* ── contact rail (where the minimap would be) ───────────────────────── */

  const CONTACT_ICON = {
    email: 'M2 4.5h12v7H2z|M2 5l6 4 6-4',
    phone: 'M4 2.5h2.5l1 3-1.6 1a8 8 0 0 0 3.6 3.6l1-1.6 3 1V13a1 1 0 0 1-1 1A10.5 10.5 0 0 1 3 3.5a1 1 0 0 1 1-1z',
    location: 'M8 14s5-4.2 5-8A5 5 0 0 0 3 6c0 3.8 5 8 5 8z|M8 8.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z',
    github: 'M6 13.5c-3 1-3-1.7-4.2-2M10.5 15v-2.6c0-.8-.2-1.3-.6-1.7 2.2-.2 4.4-1.1 4.4-4.8a3.7 3.7 0 0 0-1-2.6 3.5 3.5 0 0 0-.1-2.6s-.8-.3-2.7 1a9.2 9.2 0 0 0-4.8 0C3.8.3 3 .6 3 .6a3.5 3.5 0 0 0-.1 2.6 3.7 3.7 0 0 0-1 2.6c0 3.7 2.2 4.5 4.4 4.8-.3.3-.5.7-.6 1.2V15',
    linkedin: 'M3.5 6.5v7M3.5 3.2v.1M7.5 13.5v-7M7.5 9.2a2.7 2.7 0 0 1 5.3 0v4.3',
    portfolio: 'M8 14.5A6.5 6.5 0 1 0 8 1.5a6.5 6.5 0 0 0 0 13z|M1.5 8h13M8 1.5a10 10 0 0 1 0 13a10 10 0 0 1 0-13z',
    languages: 'M2.5 4h7M6 2.5V4M7.5 4S7 9 3 11.5M4.5 7.5S6 10 9 11M9.5 13.5l3-7 3 7M10.6 11.4h3.8',
  };

  function svgFor(key) {
    const d = CONTACT_ICON[key];
    if (!d) return '';
    return `<svg viewBox="0 0 16 16">${d.split('|').map((p) => `<path d="${p}"/>`).join('')}</svg>`;
  }

  const LABEL = {
    email: 'Email', phone: 'Phone', location: 'Location', github: 'GitHub',
    linkedin: 'LinkedIn', portfolio: 'Website', languages: 'Languages',
  };

  function renderContactRail(p) {
    const initials = (p.name || 'You').split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
    const rows = ['email', 'phone', 'location', 'github', 'linkedin', 'portfolio', 'languages']
      .filter((k) => p[k])
      .map((k) => {
        const v = p[k];
        const href = /^https?:/.test(v) ? v
          : k === 'email' ? `mailto:${v}`
          : k === 'phone' ? `tel:${v.replace(/[^+\d]/g, '')}` : null;
        const shown = /^https?:/.test(v) ? v.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : v;
        const body = href
          ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(shown)}</a>`
          : esc(shown);
        return `<li><span class="ci">${svgFor(k)}</span>
                  <span class="cv"><em>${LABEL[k]}</em>${body}</span></li>`;
      }).join('');

    $('#minimap').innerHTML = `
      <div class="rail-head">
        <div class="avatar">${esc(initials)}</div>
        <div>
          <div class="rail-name">${esc(p.name || '')}</div>
          <div class="rail-title">${esc(p.title || '')}</div>
        </div>
      </div>
      <ul class="rail-list">${rows}</ul>
      <a class="rail-cta" href="/live" target="_blank" rel="noopener">
        <svg viewBox="0 0 16 16"><path d="M3 1.5h6L13 5.5v9H3z"/><path d="M9 1.5v4h4"/><path d="M5.5 8.5h5M5.5 11h3.5"/></svg>
        Open the full resume
      </a>
        <p class="rail-foot">Served by static portfolio API shim.</p>`;
  }

  /* ── side views ──────────────────────────────────────────────────────── */

  const VIEW_LABEL = {
    explorer: 'Explorer', search: 'Search', scm: 'Source Control',
    run: 'Run and Debug', ext: 'Extensions', account: 'Contact',
  };

  $$('.act').forEach((btn) => btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    $$('.act').forEach((b) => b.classList.toggle('active', b === btn));
    $$('.view').forEach((v) => v.classList.toggle('hidden', v.id !== 'view-' + view));
    $('#sb-label').textContent = VIEW_LABEL[view];
    if (view === 'search') $('#search-input').focus();
  }));

  /* Section headers fold their own content — the workspace header owns the tree. */
  const FOLD_TARGET = { tree: '#tree' };

  $$('.sb-section').forEach((section) => section.addEventListener('click', () => {
    const open = section.classList.toggle('open');
    const target = FOLD_TARGET[section.dataset.fold];
    if (target) $(target).classList.toggle('hidden', !open);
  }));

  /* search */
  $('#search-input').addEventListener('input', (e) => {
    const q = e.target.value.trim();
    const box = $('#search-results');
    if (q.length < 2) {
      box.innerHTML = '<p class="hint" style="padding:0 12px">Type at least 2 characters.</p>';
      return;
    }
    const needle = q.toLowerCase();
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let html = '', total = 0;

    for (const f of state.files) {
      const hits = f.content.split('\n')
        .map((text, i) => ({ text, n: i + 1 }))
        .filter((h) => h.text.toLowerCase().includes(needle));
      if (!hits.length) continue;
      total += hits.length;
      html += `<div class="res-file">${icon(f.name)}${f.name}<span class="n">${hits.length}</span></div>`;
      html += hits.slice(0, 6).map((h) =>
        `<div class="res-hit" data-path="${f.path}" data-line="${h.n}">` +
        `${esc(h.text.trim()).replace(new RegExp(safe, 'ig'), (m) => `<b>${m}</b>`)}</div>`).join('');
    }
    box.innerHTML = total ? html : '<p class="hint" style="padding:0 12px">No results.</p>';
    $$('#search-results [data-path]').forEach((el) =>
      el.addEventListener('click', () => openFile(el.dataset.path, +el.dataset.line)));
  });

  /* extensions — a wink, not a feature */
  $('#ext-list').innerHTML = [
    ['GL', 'Live Server', 'Launch a local server with live reload.', 'Ritwick Dey'],
    ['PY', 'Python', 'IntelliSense, linting, debugging, refactoring.', 'Microsoft'],
    ['AW', 'AWS Toolkit', 'Build, debug and deploy on AWS.', 'Amazon Web Services'],
    ['GH', 'GitHub Actions', 'Workflow syntax and run status.', 'GitHub'],
  ].map(([badge, name, desc, pub]) => `
    <div class="ext">
      <div class="ext-icon">${badge}</div>
      <div>
        <div class="ext-name">${name}</div>
        <div class="ext-desc">${desc}</div>
        <div class="ext-pub">${pub}</div>
      </div>
    </div>`).join('');

  /* contact side view */
  function renderContactView(p) {
    $('#contact-card').innerHTML = Object.entries(p).map(([k, v]) => {
      const href = /^https?:/.test(v) ? v : k === 'email' ? `mailto:${v}` : null;
      const body = href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(v);
      return `<div class="card-row"><div class="card-key">${LABEL[k] || k}</div>
              <div class="card-val">${body}</div></div>`;
    }).join('');
  }

  /* ── panel ───────────────────────────────────────────────────────────── */

  function setPanelOpen(open) {
    $('#panel').classList.toggle('closed', !open);
    $('.editor-area').classList.toggle('no-panel', !open);
    if (open) Terminal.focus();
  }
  $('#panel-close').addEventListener('click', () => setPanelOpen(false));
  $('#panel-clear').addEventListener('click', () => { Terminal.clear(); Terminal.focus(); });

  (() => {
    const area = $('.editor-area');
    const panel = $('#panel');
    const grip = $('#panel-resize');
    const MIN = 90;
    const DEFAULT = 264;
    // Leave room for tabs, breadcrumbs, status bar and some editor.
    const max = () => Math.max(MIN, window.innerHeight - 200);

    const setHeight = (h) => {
      const clamped = Math.round(Math.min(Math.max(h, MIN), max()));
      area.style.setProperty('--panel-h', clamped + 'px');
      try { localStorage.setItem('panelHeight', clamped); } catch (_) { /* private mode */ }
    };

    try {
      setHeight(+localStorage.getItem('panelHeight') || DEFAULT);
    } catch (_) {
      setHeight(DEFAULT);
    }

    // Pointer capture keeps the drag alive over the editor, the terminal
    // and outside the window — plain mousemove listeners lose it.
    grip.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      grip.setPointerCapture(e.pointerId);
      grip.classList.add('dragging');
      document.body.classList.add('resizing');
    });

    grip.addEventListener('pointermove', (e) => {
      if (!grip.hasPointerCapture(e.pointerId)) return;
      // Panel bottom is the status bar, so height is whatever is below the cursor.
      setHeight(window.innerHeight - e.clientY - 22);
    });

    const end = (e) => {
      if (grip.hasPointerCapture(e.pointerId)) grip.releasePointerCapture(e.pointerId);
      grip.classList.remove('dragging');
      document.body.classList.remove('resizing');
    };
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);

    grip.addEventListener('dblclick', () => setHeight(DEFAULT));
    window.addEventListener('resize', () => setHeight(panel.offsetHeight || DEFAULT));
  })();

  /* ── explorer width ──────────────────────────────────────────────────── */

  (() => {
    const sash = $('#sash');
    const workbench = $('.workbench');
    if (!sash || !workbench) return;

    const MIN = 170;
    const DEFAULT = 262;
    const max = () => Math.max(MIN, Math.min(560, window.innerWidth - 420));

    const setWidth = (px) => {
      const clamped = Math.round(Math.min(Math.max(px, MIN), max()));
      workbench.style.setProperty('--w-sidebar', clamped + 'px');
      try { localStorage.setItem('sidebarWidth', clamped); } catch (_) { /* private mode */ }
    };

    try {
      setWidth(+localStorage.getItem('sidebarWidth') || DEFAULT);
    } catch (_) {
      setWidth(DEFAULT);
    }

    sash.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sash.setPointerCapture(e.pointerId);
      sash.classList.add('dragging');
      document.body.classList.add('col-resizing');
    });

    sash.addEventListener('pointermove', (e) => {
      if (!sash.hasPointerCapture(e.pointerId)) return;
      // The sidebar starts where the activity bar ends.
      setWidth(e.clientX - workbench.getBoundingClientRect().left - 48);
    });

    const end = (e) => {
      if (sash.hasPointerCapture(e.pointerId)) sash.releasePointerCapture(e.pointerId);
      sash.classList.remove('dragging');
      document.body.classList.remove('col-resizing');
    };
    sash.addEventListener('pointerup', end);
    sash.addEventListener('pointercancel', end);
    sash.addEventListener('dblclick', () => setWidth(DEFAULT));

    // Keyboard: the sash is focusable, so arrows should move it.
    sash.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 40 : 10;
      if (e.key === 'ArrowLeft') { e.preventDefault(); setWidth(sidebarWidth() - step); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setWidth(sidebarWidth() + step); }
    });
    const sidebarWidth = () =>
      parseInt(getComputedStyle(workbench).getPropertyValue('--w-sidebar'), 10) || DEFAULT;

    window.addEventListener('resize', () => setWidth(sidebarWidth()));
  })();

  /* ── Live Server ─────────────────────────────────────────────────────── */

  function goLive() {
    const btn = $('#golive');
    dismissCallout();
    if (!state.live) {
      state.live = true;
      btn.classList.remove('pulse');
      btn.classList.add('live');
      $('#golive-label').textContent = `Port : ${window.CONFIG.port}`;
      btn.title = 'Live Server is running — click to reopen the resume';
    }
    window.open(window.CONFIG.liveUrl, '_blank', 'noopener');
  }

  $('#golive').addEventListener('click', goLive);
  $('#run-live').addEventListener('click', goLive);

  function dismissCallout() {
    const c = $('#callout');
    if (!c || c.classList.contains('gone')) return;
    c.classList.add('gone');
    setTimeout(() => c.remove(), 400);
  }

  /* ── quick open ──────────────────────────────────────────────────────── */

  const palette = $('#palette'), pInput = $('#palette-input'), pList = $('#palette-list');
  let pItems = [], pSel = 0;

  function paintPalette() {
    const q = pInput.value.toLowerCase();
    pItems = state.files.filter((f) => f.path.toLowerCase().includes(q));
    pSel = 0;
    pList.innerHTML = pItems.length
      ? pItems.map((f, i) => `<li class="${i ? '' : 'sel'}" data-i="${i}">${icon(f.name)}${f.name}` +
          `<span class="dim">${f.folder || window.CONFIG.workspace}</span></li>`).join('')
      : '<li class="dim" style="padding-left:12px">No matching files</li>';
    $$('#palette-list [data-i]').forEach((li) => li.addEventListener('click', () => {
      openFile(pItems[+li.dataset.i].path);
      hidePalette();
    }));
  }
  const showPalette = () => {
    palette.classList.remove('hidden');
    pInput.value = '';
    paintPalette();
    pInput.focus();
  };
  const hidePalette = () => palette.classList.add('hidden');

  pInput.addEventListener('input', paintPalette);
  palette.addEventListener('click', (e) => { if (e.target === palette) hidePalette(); });

  document.addEventListener('keydown', (e) => {
    const mod = e.metaKey || e.ctrlKey;
    const inTerm = e.target.id === 'term-input';

    if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); showPalette(); return; }
    if (mod && e.key === '`') {
      e.preventDefault();
      setPanelOpen($('#panel').classList.contains('closed'));
      return;
    }
    if (mod && e.key.toLowerCase() === 'w' && state.active && !inTerm) {
      e.preventDefault();
      closeTab(state.active);
      return;
    }
    if (palette.classList.contains('hidden')) return;

    if (e.key === 'Escape') hidePalette();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!pItems.length) return;
      pSel = (pSel + (e.key === 'ArrowDown' ? 1 : -1) + pItems.length) % pItems.length;
      $$('#palette-list li').forEach((li, i) => li.classList.toggle('sel', i === pSel));
    }
    if (e.key === 'Enter' && pItems[pSel]) { openFile(pItems[pSel].path); hidePalette(); }
  });

  /* ── boot splash ─────────────────────────────────────────────────────── */

  function runSplash(steps) {
    const splash = $('#splash'), fill = $('#splash-fill'), log = $('#splash-log');
    if (!splash) return () => {};

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = reduced ? 60 : 380;   // ~3.4s over eight steps
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
      if (++i >= steps.length) setTimeout(finish, reduced ? 100 : 520);
    }, tick);

    splash.addEventListener('click', finish);
    document.addEventListener('keydown', finish);
    return finish;
  }

  function bootError(err) {
    document.getElementById('splash')?.remove();
    $('#breadcrumbs').innerHTML = '<span class="sep">static api unreachable</span>';
    $('#code').innerHTML =
      `<span class="line"><span class="t-com"># The workbench could not reach the API.</span></span>` +
      `<span class="line"><span class="t-com"># ${esc(String(err))}</span></span>` +
      `<span class="line"> </span>` +
      `<span class="line"><span class="t-kw">refresh</span> ./index.html</span>`;
  }

  /* ── boot ────────────────────────────────────────────────────────────── */

  async function boot() {
    const done = runSplash([
      'Starting workspace…',
      'Loading extensions…',
      'Mounting content/ …',
      'GET /api/content',
      'Indexing 9 files',
      'Restoring editor state…',
      `Live Server standing by on port ${window.CONFIG.devPort || 8000}`,
      'Ready.',
    ]);

    let data;
    try {
      const res = await fetch('/api/content');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      done();
      bootError(err);
      return;
    }

    state.files = data.files;
    state.tree = data.tree;
    state.byPath = Object.fromEntries(state.files.map((f) => [f.path, f]));

    renderTree();
    openFile(data.open || state.files[0]?.path);

    let profile = {};
    try { profile = await (await fetch('/api/profile')).json(); } catch (_) { /* rail stays empty */ }
    renderContactRail(profile);
    renderContactView(profile);

    Terminal.hooks.goLive = goLive;
    Terminal.hooks.openFile = (name) => {
      const hit = state.files.find((f) => f.path === name || f.name === name);
      return hit ? openFile(hit.path) : false;
    };
    Terminal.attach();
    Terminal.greet();

    $('#golive').classList.add('pulse');
  }

  boot();
})();
