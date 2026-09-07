/* The integrated terminal.

   Commands run server side at POST /api/exec, which returns styled lines.
   A handful stay in the browser (clear, open, golive, resume) because they
   drive the workbench rather than reading content. */
window.Terminal = (() => {
  const out = () => document.getElementById('term-out');
  const view = () => document.getElementById('term');
  const input = () => document.getElementById('term-input');

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const history = [];
  let skipping = false;                 // set when someone would rather not wait
  let hIndex = 0;
  let busy = false;

  const hooks = { openFile: () => {}, goLive: () => {}, isLive: () => false };

  /* ---------- printing ---------- */

  function write(text = '', cls = '', href = null) {
    const el = document.createElement('span');
    el.className = 'l ' + cls;
    el.innerHTML = href
      ? `${esc(text)}`.replace(/(\S+)$/, `<a href="${esc(href)}" target="_blank" rel="noopener">$1</a>`)
      : esc(text) || '&nbsp;';
    out().appendChild(el);
    scroll();
    return el;
  }

  function writeHTML(html, cls = '') {
    const el = document.createElement('span');
    el.className = 'l ' + cls;
    el.innerHTML = html;
    out().appendChild(el);
    scroll();
    return el;
  }

  const PROMPT =
    '<span class="p-user">visitor</span><span class="p-at">@</span>' +
    '<span class="p-host">portfolio</span><span class="p-sep">:</span>' +
    '<span class="p-cwd">~</span><span class="p-arrow"> $</span> ';

  function writeEcho(cmd) {
    writeHTML(`${PROMPT}<span class="echo">${esc(cmd)}</span>`);
  }

  const reducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Type text into a fresh line, one character at a time. */
  async function typeLine(text, cls = '', speed = 24) {
    const el = document.createElement('span');
    el.className = 'l ' + cls;
    out().appendChild(el);
    if (reducedMotion() || skipping) { el.textContent = text; scroll(); return el; }
    for (const ch of text) {
      if (skipping) { el.textContent = text; break; }
      el.textContent += ch;
      scroll();
      await wait(speed);
    }
    scroll();
    return el;
  }

  /** Type a command after the prompt, the way a person would enter it. */
  async function typeCommand(cmd, speed = 52) {
    const el = writeHTML(`${PROMPT}<span class="echo"></span>`);
    const target = el.querySelector('.echo');
    if (reducedMotion()) { target.textContent = cmd; return; }
    for (const ch of cmd) {
      target.textContent += ch;
      scroll();
      await wait(speed);
    }
  }

  const scroll = () => { view().scrollTop = view().scrollHeight; };
  const clear = () => { out().innerHTML = ''; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- boot banner ---------- */

  const isPhone = () => window.matchMedia('(max-width: 760px)').matches;

  async function greet(profile = {}) {
    return isPhone() ? greetPhone(profile) : greetDesktop();
  }

  /* On a phone there is no editor behind this, so it opens by saying hello
     rather than by pretending a command was run. */
  async function greetPhone(profile) {
    const pause = (ms) => wait(reducedMotion() || skipping ? 0 : ms);
    const full = profile.name || 'Sumukh Teja Vanamala';
    const short = full.split(/\s+/).slice(0, 2).join(' ');

    await pause(220);
    await typeLine(`Hi, I'm ${short}.`, 'hd', 42);
    write();
    await pause(260);

    await typeLine([profile.title || 'Backend Engineer',
                    profile.location || 'Hyderabad, India'].join(' — '), 'muted', 12);
    await typeLine('Open to work, looking for my next role.', 'ok', 13);
    write();
    await pause(240);

    await typeLine('Explore from below  ↓', 'hd', 30);
    write();
    skipping = false;
  }

  async function greetDesktop() {
    const port = window.CONFIG.devPort || 8000;
    const origin = `http://127.0.0.1:${port}`;

    writeEcho(`python -m http.server ${port}`);
    await wait(180);
    write(`Serving HTTP on 127.0.0.1 port ${port} (${origin}/) ...`, 'muted');
    await wait(110);
    write(` * workspace: ~/${window.CONFIG.workspace}`, 'muted');
    await wait(90);
    write(' * mounted content/ — 9 files, watching for changes', 'muted');
    await wait(150);
    write(' ✔ resume rendered from content/ in 120 ms', 'ok');
    write();
    await wait(120);

    writeHTML(
      `<span class="hd">The résumé is live</span> at ` +
      `<a href="${window.CONFIG.liveUrl}" data-live>${origin}/resume</a>`
    );
    write();
    writeHTML(
      `Type <span class="kv">teja</span> to open the résumé, or ` +
      `<span class="kv">help</span> for everything else.`,
      'muted'
    );
    write();
  }

  /* ---------- command dispatch ---------- */

  async function run(raw) {
    const cmd = raw.trim();
    writeEcho(cmd);
    if (!cmd) return;

    history.push(cmd);
    hIndex = history.length;

    const [name, ...args] = cmd.split(/\s+/);
    const verb = name.toLowerCase();

    if (verb === 'clear' || verb === 'cls') { clear(); return; }

    // `teja` is the one people are told about; the rest still work.
    if (['teja', 'resume', 'cv', 'golive', 'live'].includes(verb)) {
      write('Opening the résumé…', 'ok');
      writeHTML(`<a href="${window.CONFIG.liveUrl}" data-live>${window.CONFIG.liveUrl}</a>`);
      write();
      hooks.goLive();
      return;
    }

    if (verb === 'open' || verb === 'code') {
      if (!args.length) { write('open: which file? Try `ls`.', 'err'); return; }
      const ok = hooks.openFile(args[0]);
      write(ok ? `Opened ${args[0]} in the editor.` : `open: ${args[0]}: No such file`, ok ? 'ok' : 'err');
      return;
    }

    busy = true;
    try {
      const res = await fetch('/api/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd }),
      });
      const data = await res.json();
      for (const l of data.lines || []) write(l.text, l.cls || '', l.href);
      if ((data.lines || []).length) write();
    } catch (err) {
      write('Could not reach the server: ' + err.message, 'err');
    } finally {
      busy = false;
    }
  }

  /* ---------- input ---------- */

  function attach() {
    const box = input();

    view().addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'A') return;
      // On a phone the chips are the interface, and focusing the input throws
      // the on-screen keyboard up over half the output. Only focus on a
      // deliberate tap on the prompt line itself.
      if (window.matchMedia('(max-width: 760px)').matches &&
          !e.target.closest('.term-line')) return;
      setTimeout(() => focus(), 0);
    });
    view().addEventListener('focus', () => view().classList.remove('away'));
    box.addEventListener('blur', () => view().classList.add('away'));
    box.addEventListener('focus', () => view().classList.remove('away'));

    // Terminal links stay inside the app where they point at our own routes.
    out().addEventListener('click', (e) => {
      const a = e.target.closest('a[data-live]');
      if (!a) return;
      e.preventDefault();
      hooks.goLive();
    });

    box.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (busy) return;
        const cmd = box.textContent;
        box.textContent = '';
        await run(cmd);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!history.length) return;
        hIndex = Math.max(0, hIndex - 1);
        box.textContent = history[hIndex] || '';
        caretToEnd();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        hIndex = Math.min(history.length, hIndex + 1);
        box.textContent = history[hIndex] || '';
        caretToEnd();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const partial = box.textContent.trim();
        const match = COMPLETIONS.find((c) => c.startsWith(partial) && partial);
        if (match) { box.textContent = match; caretToEnd(); }
        return;
      }
      if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); clear(); }
      if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        writeEcho(box.textContent + '^C');
        box.textContent = '';
      }
    });

    // Paste as plain text — the input is contenteditable.
    box.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, text.replace(/\n/g, ' '));
    });
  }

  const COMPLETIONS = [
    'help', 'ls', 'cat about.md', 'cat experience.json', 'open projects.ts',
    'whoami', 'experience', 'projects', 'skills', 'contact', 'golive',
    'grep aws', 'curl /api/health', 'clear',
  ];

  function caretToEnd() {
    const box = input();
    const range = document.createRange();
    range.selectNodeContents(box);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function focus() { input().focus(); caretToEnd(); }

  const skipIntro = () => { skipping = true; };

  return { attach, greet, run, write, writeHTML, clear, focus, skipIntro, hooks };
})();
