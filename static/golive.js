/* Go Live — types the launch command into the terminal, then opens the
   server-rendered site (/live) in a new tab. */
(() => {
  const btn = document.querySelector('#btn-live');
  if (!btn) return;

  const LIVE_URL = new URL('/live', location.href).href;
  const BOOT = [
    ['$ flask --app app run --host 127.0.0.1 --port 5500', 'cmd'],
    [' * Serving Flask app "app"', 'dim'],
    [' * Rendering content/ &rarr; templates/site.html', 'dim'],
    [` * Live at <span class="ok">${LIVE_URL}</span>`, ''],
  ];
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  let live = false, busy = false;

  const term = () => window.PORTFOLIO && window.PORTFOLIO.term;

  function setLive() {
    live = true;
    btn.classList.add('on');
    btn.innerHTML =
      '<svg class="mini" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/>' +
      '<path d="M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11"/></svg> Port : 5500';
  }

  btn.addEventListener('click', async () => {
    if (busy) return;
    const t = term();

    // Already running: just open another tab, no theatre.
    if (live || !t) { window.open(LIVE_URL, '_blank', 'noopener'); return; }

    busy = true;
    t.show();
    for (const [line, cls] of BOOT) {
      t.log(line, cls);
      await wait(130);
    }

    const tab = window.open(LIVE_URL, '_blank', 'noopener');
    if (tab) {
      t.log('&rarr; opened in a new tab', 'dim');
    } else {
      t.log(`&rarr; popup blocked &mdash; <a href="${LIVE_URL}" target="_blank" rel="noopener">open ${LIVE_URL}</a>`, '');
    }
    setLive();
    busy = false;
  });
})();
