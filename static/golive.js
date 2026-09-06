/* Status bar buttons. The terminal output is a mock — scripted lines, no
   shell — but the routes it opens are real Flask routes. */
(() => {
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const term = () => window.PORTFOLIO && window.PORTFOLIO.term;
  const liveBtn = document.querySelector('#btn-live');
  const resumeBtn = document.querySelector('#btn-resume');

  const LIVE_URL = new URL('/live', location.href).href;
  const RESUME_URL = new URL('/resume', location.href).href;

  async function type(lines) {
    const t = term();
    if (!t) return;
    t.show();
    for (const [text, cls] of lines) {
      t.log(text, cls);
      await wait(120);
    }
  }

  function openTab(url, label) {
    const tab = window.open(url, '_blank', 'noopener');
    const t = term();
    if (!t) return;
    if (tab) t.log(`&rarr; ${label} opened in a new tab`, 'dim');
    else t.log(`&rarr; popup blocked &mdash; <a href="${url}" target="_blank" rel="noopener">open ${url}</a>`, '');
  }

  /* --- Go Live --- */
  let live = false, busy = false;
  liveBtn.addEventListener('click', async () => {
    if (busy) return;
    if (live) { openTab(LIVE_URL, 'site'); return; }
    busy = true;
    await type([
      ['$ flask --app app run --port 5500', 'cmd'],
      [' * Serving Flask app "app"', 'dim'],
      [' * Rendering content/ &rarr; templates/site.html', 'dim'],
      [` * Live at <span class="ok">${LIVE_URL}</span>`, ''],
    ]);
    openTab(LIVE_URL, 'site');
    live = true;
    liveBtn.classList.add('on');
    liveBtn.innerHTML =
      '<svg class="mini" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/>' +
      '<path d="M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11"/></svg> Port : 5500';
    busy = false;
  });

  /* --- Resume --- */
  resumeBtn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    await type([
      ['$ open static/resume.pdf', 'cmd'],
      [' * resume.pdf &middot; 55 KB', 'dim'],
    ]);
    openTab(RESUME_URL, 'resume.pdf');
    busy = false;
  });
})();
