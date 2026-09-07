/* Stamp asset URLs with the build id.
   Without it, Cloudflare and mobile Safari happily serve last week's app.js
   against this week's HTML, which looks exactly like a broken deploy. */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let version;
try {
  version = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
    .toString().trim();
} catch {
  version = Date.now().toString(36);
}

for (const file of ['dist/index.html', 'dist/resume.html']) {
  const stamped = readFileSync(file, 'utf8')
    .replace(/(\s(?:src|href)=")((?:static\/|\/static\/)[^"?]+\.(?:js|css))"/g,
             `$1$2?v=${version}"`);
  writeFileSync(file, stamped);
}
console.log(`stamped assets with ?v=${version}`);
