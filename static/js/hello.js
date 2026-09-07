/* For whoever opens DevTools. */
(() => {
  const brand = 'background:#0078d4;color:#fff;padding:3px 9px;border-radius:3px;font-weight:600';
  const body = 'color:#9d9d9d;font-size:12px;line-height:1.6';
  const key = 'color:#ce9178';

  console.log('%c Sumukh Teja Vanamala ', brand);
  console.log(
    '%cYou opened DevTools first. Good instinct — that is roughly how I debug too.\n' +
    'This is a static site: no framework, no build step beyond copying files.\n' +
    'The workbench, the terminal and the résumé all read the same content/ folder.',
    body
  );
  console.log('%cTry the terminal below: %chelp%c, %ccasestudies%c, %ccurl /api/health',
    body, key, body, key, body, key);
  console.log('%cSource: https://github.com/sumukhteja/portfolio', body);
})();
