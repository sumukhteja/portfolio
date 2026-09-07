(() => {
  const realFetch = window.fetch.bind(window);
  const manifest = { tree: [], open: null, files: [] };
  let contact = null;
  let readyPromise = null;

  const LANG = {
    '.md': 'markdown',
    '.json': 'json',
    '.ts': 'ts',
    '.js': 'js',
    '.py': 'python',
    '.html': 'html',
    '.css': 'css',
    '.env': 'env',
  };
  const SAFE = /^[A-Za-z0-9._/\-]+$/;
  const FILE_RE = /^\/api\/[A-Za-z0-9._/\-]*$/;

  function esc(s) {
    return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  const line = (text, cls = '', href = null) => ({ text, cls, href });

  function requestPath(url) {
    if (typeof url === 'string') return new URL(url, window.location.href).pathname;
    if (!url) return '';
    if (typeof url === 'object' && url.url) return new URL(url.url, window.location.href).pathname;
    return String(url.pathname || '');
  }

  function parseManifest(data) {
    const tree = Array.isArray(data?.tree) ? data.tree : [];
    const items = [];
    for (const group of tree) {
      const folder = String(group.folder || '').replace(/\/+$/, '');
      for (const name of group.files || []) {
        if (!SAFE.test(`${folder}/${name}`)) continue;
        items.push({ folder, name, path: folder ? `${folder}/${name}` : name });
      }
    }
    manifest.tree = tree;
    manifest.open = data?.open || (items[0] ? items[0].path : null);
    return items;
  }

  async function fetchText(path) {
    const res = await realFetch(path);
    if (!res.ok) throw new Error(`${path} (${res.status})`);
    return res.text();
  }

  async function loadContact() {
    try {
      const raw = await fetchText('/content/contact.json');
      contact = JSON.parse(raw);
    } catch (_err) {
      contact = {};
    }
    return contact;
  }

  async function loadContentFile(entry) {
    const rel = `/content/${entry.path}`;
    const content = await fetchText(rel);
    const ext = entry.name.includes('.') ? entry.name.slice(entry.name.lastIndexOf('.')) : '';
    return {
      path: entry.path,
      name: entry.name,
      folder: entry.folder,
      lang: LANG[ext] || 'text',
      lines: content.split('\n').length,
      bytes: new Blob([content]).size,
      content,
    };
  }

  async function buildFiles() {
    try {
      const rawManifest = await fetchText('/content/manifest.json');
      const parsed = JSON.parse(rawManifest);
      const entries = parseManifest(parsed);
      const files = [];
      for (const entry of entries) {
        try {
          files.push(await loadContentFile(entry));
        } catch (_err) {
          files.push({
            ...entry,
            lang: LANG[entry.name.slice(entry.name.lastIndexOf('.'))] || 'text',
            lines: 0,
            bytes: 0,
            content: `# ${entry.path}\n# file content not available in build output`,
          });
        }
      }
      manifest.files = files;
    } catch (_err) {
      manifest.tree = [];
      manifest.open = null;
      manifest.files = [];
    }
  }

  function resolveFile(target) {
    if (!target) return null;
    const needle = target.trim();
    if (manifest.files.length === 0) return null;

    const exact = manifest.files.find((f) => f.path === needle || f.name === needle);
    if (exact) return exact;
    const basename = needle.includes('/') ? needle.split('/').pop() : needle;
    const matches = manifest.files.filter((f) => f.name === basename);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return manifest.files.find((f) => f.path.endsWith(`/${basename}`));
    return null;
  }

  function cmdText(fileContent = [], needle) {
    const q = String(needle || '').toLowerCase();
    if (!q) return [line('grep: missing search pattern', 'err')];

    const out = [];
    for (const file of fileContent) {
      const matches = file.content
        .split('\n')
        .map((text, index) => ({ text, n: index + 1 }))
        .filter((row) => row.text.toLowerCase().includes(q));
      for (const hit of matches) {
        out.push(line(`${file.path}:${hit.n}:${esc(hit.text.trim())}`));
      }
    }
    return out.length ? out : [line(`grep: no matches for '${needle}'`, 'muted')];
  }

  function contactPanel(profile) {
    const rows = [];
    for (const [key, value] of Object.entries(profile || {})) {
      if (!value) continue;
      rows.push(line(`${key}: ${value}`));
    }
    return rows.length ? rows : [line('No contact details found.')];
  }

  function safeJson(raw) {
    try {
      return JSON.parse(raw);
    } catch (_err) {
      return null;
    }
  }

  function describeSkills(lines) {
    const parsed = safeJson(lines);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return [line('skills: skills.json not readable', 'err')];
    }
    const out = [];
    const entries = Object.entries(parsed);
    if (!entries.length) return [line('skills: no data found', 'muted')];
    for (const [key, value] of entries) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
      if (Array.isArray(value)) out.push(line(`${label}: ${value.join(', ')}`));
      else if (value) out.push(line(`${label}: ${value}`));
    }
    return out.length ? out : [line('skills: no values found', 'muted')];
  }

  function describeExperience(lines) {
    const parsed = safeJson(lines);
    if (!Array.isArray(parsed)) return [line('experience: experience.json not readable', 'err')];
    if (!parsed.length) return [line('experience: no roles found', 'muted')];

    const out = [];
    for (const role of parsed) {
      if (!role || typeof role !== 'object') continue;
      const title = `${role.role || 'Role'} @ ${role.company || 'Company'}`;
      const period = `${role.start || '---'} - ${role.end || 'present'}`;
      out.push(line(`- ${title} (${period})`, 'hd'));
      if (role.location) out.push(line(`  Location: ${role.location}`, 'muted'));
      if (role.focus) out.push(line(`  Focus: ${role.focus}`, 'muted'));
      if (Array.isArray(role.highlights)) {
        role.highlights.slice(0, 3).forEach((item) => out.push(line(`  • ${item}`)));
      }
    }
    return out;
  }

  function describeProjects(lines) {
    const rows = lines
      .replace(/\r/g, '')
      .split('\n')
      .map((r) => r.trimEnd())
      .filter((r) => r && !r.startsWith('//'));
    if (!rows.length) return [line('projects: no content found', 'muted')];
    return [line('projects', 'hd'), ...rows.slice(0, 40).map((r) => line(r))];
  }

  function runStaticCommand(cmd) {
    const [raw, ...args] = String(cmd).trim().split(/\s+/);
    const name = (raw || '').toLowerCase();
    if (!name) return [];

    if (name === 'help') {
      return [
        line('Available commands', 'hd'),
        line('  help            show this help'),
        line('  ls              list files in workspace'),
        line('  cat <file>      print file content'),
        line('  open <file>     open a file in the editor'),
        line('  code <file>     same as open'),
        line('  whoami          summary of portfolio owner'),
        line('  grep <text>     search in all files'),
        line('  experience      list recent roles from experience.json'),
        line('  projects        list projects list from projects.ts'),
        line('  skills          list groups from skills.json'),
        line('  contact         show contact details'),
        line('  clear           clear terminal'),
        line('  casestudies     open case-studies.md'),
        line('  curl <path>     hit the local API, e.g. curl /api/health'),
        line('  golive          open the résumé in a new tab'),
      ];
    }

    if (name === 'ls' || name === 'dir') {
      if (!manifest.files.length) return [line('No files loaded yet.', 'muted')];
      return manifest.files.map((file) => line(
        `${(file.folder ? `${file.folder}/` : '').padEnd(20)} ${String(file.name).padEnd(18)} ${String(file.lines).padStart(4)} lines`
      ));
    }

    if (name === 'cat' || name === 'less' || name === 'more') {
      const target = resolveFile(args[0]);
      if (!target) return [line(`cat: ${args[0]}: No such file`, 'err')];
      return target.content.replace(/\n$/, '').split('\n').map((row) => line(row));
    }

    if (name === 'casestudies' || name === 'cases') {
      const target = resolveFile('case-studies.md');
      if (!target) return [line('casestudies: case-studies.md missing', 'err')];
      if (window.Terminal?.hooks?.openFile) window.Terminal.hooks.openFile(target.path);
      return [line('Opened case-studies.md in editor.', 'ok')];
    }

    if (name === 'open' || name === 'code') {
      const target = resolveFile(args[0]);
      if (!target) return [line(`open: ${args[0]}: No such file`, 'err')];
      if (window.Terminal?.hooks?.openFile) window.Terminal.hooks.openFile(target.path);
      return [line(`Opened ${target.path} in editor.`)];
    }

    if (name === 'grep' || name === 'find') {
      return cmdText(manifest.files, args.join(' '));
    }

    if (name === 'whoami') {
      return [
        line(contact?.name || 'Portfolio Owner', 'hd'),
        line(`${contact?.title || 'Portfolio'} · ${contact?.location || 'Location unavailable'}`, 'muted'),
        line('Type golive to open the full résumé.', 'muted'),
      ];
    }

    if (name === 'projects') {
      const file = resolveFile('projects.ts');
      if (!file) return [line('projects: projects.ts missing', 'err')];
      return describeProjects(file.content);
    }

    if (name === 'skills') {
      const file = resolveFile('skills.json');
      if (!file) return [line('skills: skills.json missing', 'err')];
      return [line('skills', 'hd'), ...describeSkills(file.content)];
    }

    if (name === 'experience') {
      const file = resolveFile('experience.json');
      if (!file) return [line('experience: experience.json missing', 'err')];
      return [line('experience', 'hd'), ...describeExperience(file.content)];
    }

    if (name === 'contact') {
      return [line('contact', 'hd'), ...contactPanel(contact)];
    }

    if (name === 'curl') {
      const target = args[0] ? String(args[0]).trim() : '';
      if (!target || !FILE_RE.test(target)) return [line('curl: try `curl /api/health`', 'err')];
      if (target === '/api/health') {
        const health = {
          status: 'ok',
          site: contact?.name || 'Portfolio',
          files: manifest.files.length,
          time: new Date().toISOString(),
        };
        return [line(`HTTP 200 · application/json`), line(JSON.stringify(health))];
      }
      return [line(`HTTP 404 · ${target} not implemented`, 'err')];
    }

    if (name === 'golive' || name === 'resume' || name === 'live') {
      return [line(`Opening ${window.CONFIG?.liveUrl || '/'} …`, 'ok')];
    }

    if (name === 'clear' || name === 'cls') return [];
    if (name === 'date') return [line(new Date().toString())];
    if (name === 'pwd') return [line('~/vscode-portfolio')];
    if (name === 'echo') return [line(args.join(' '))];

    return [line(`command not found: ${name}`, 'err'), line('Type help to see available commands.', 'muted')];
  }

  async function handleStaticExec(req) {
    const body = await req.json().catch(() => ({ cmd: '' }));
    const cmd = String(body.cmd || '').trim();
    return jsonResponse({ lines: runStaticCommand(cmd), cmd: cmd.split(' ')[0] });
  }

  function jsonResponse(payload, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('content-type', 'application/json');
    return new Response(JSON.stringify(payload), { status: init.status || 200, headers });
  }

  async function jsonFromFetch(path, options = {}) {
    await readyPromise;
    if (path === '/api/content') {
      return jsonResponse({ files: manifest.files, tree: manifest.tree, open: manifest.open, count: manifest.files.length });
    }

    if (path.startsWith('/api/content/')) {
      const rel = path.replace('/api/content/', '');
      const found = resolveFile(rel);
      if (!found) return jsonResponse({ error: 'not found', path: rel }, { status: 404 });
      return jsonResponse(found);
    }

    if (path === '/api/profile' || path === '/api/contact') {
      return jsonResponse(contact || {});
    }

    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        site: contact?.name || 'Portfolio',
        files: manifest.files.length,
        time: new Date().toISOString(),
      });
    }

    if (path === '/api/exec' && options?.method === 'POST') {
      return handleStaticExec(options);
    }

    if (path === '/api/contact' && options?.method === 'POST') {
      return jsonResponse({ ok: true, note: 'static mode only' });
    }

    return realFetch(path, options);
  }

  window.fetch = async (url, options = {}) => {
    const path = requestPath(url);
    if (typeof path === 'string' && path.startsWith('/api/')) {
      return jsonFromFetch(path, options);
    }
    return realFetch(url, options);
  };

  readyPromise = (async () => {
    await buildFiles();
    await loadContact();
    window.__VS_STATIC_READY__ = true;
    return true;
  })();
  window.__VS_STATIC_INIT__ = readyPromise;
})();
