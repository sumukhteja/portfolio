/* The résumé page.

   Renders from the same files the workbench opens in its editor — content/ is
   the single source, this just lays it out as a document. */
(() => {
  /* Fit-to-one-page mode.

     The résumé page shows a condensed cut: the summary lead without the
     "What I do" bullets (they restate Experience), and the top few highlights
     per role. Nothing is lost — content/ still holds the full text, and the
     editor at / shows all of it. Set this to false for the complete version. */
  const ONE_PAGE = true;
  const MAX_HIGHLIGHTS = 3;

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- a small markdown subset ---------- */

  const inline = (text) => esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');

  function markdown(src) {
    const out = [];
    let list = null, para = [];

    const flushPara = () => {
      if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; }
    };
    const flushList = () => {
      if (list) { out.push(`<${list.tag}>${list.items.join('')}</${list.tag}>`); list = null; }
    };
    const flush = () => { flushPara(); flushList(); };

    for (const raw of String(src || '').replace(/\r/g, '').split('\n')) {
      const row = raw.trimEnd();

      if (!row.trim()) { flush(); continue; }

      const heading = row.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        flush();
        const level = Math.min(heading[1].length + 1, 6);   // # is the page title
        out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
        continue;
      }

      if (/^(-{3,}|\*{3,})$/.test(row.trim())) { flush(); out.push('<hr>'); continue; }

      if (row.startsWith('> ')) {
        flush();
        out.push(`<blockquote><p>${inline(row.slice(2))}</p></blockquote>`);
        continue;
      }

      const bullet = row.match(/^\s*[-*+]\s+(.*)$/);
      const numbered = row.match(/^\s*\d+\.\s+(.*)$/);
      if (bullet || numbered) {
        flushPara();
        const tag = bullet ? 'ul' : 'ol';
        if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
        list.items.push(`<li>${inline((bullet || numbered)[1])}</li>`);
        continue;
      }

      flushList();
      para.push(row.trim());
    }
    flush();
    return out.join('\n');
  }

  /* ---------- content helpers ---------- */

  const dropTitle = (md) => md.replace(/^#\s+.*\n?/, '');

  /** Split a markdown file on its `---` rules. */
  const chapters = (md) => dropTitle(md)
    .split(/^-{3,}$/m)
    .map((chunk) => chunk.replace(/^\n+|\n+$/g, ''))
    .filter(Boolean);

  /** Drop a leading `#`/`##` heading — the section already carries that title. */
  const stripHeading = (md) => md.replace(/^\s*#{1,2}\s+.*\n?/, '');

  /** Everything before the first `## `, plus each `## ` section by name. */
  function sections(md) {
    const body = dropTitle(md).trim();
    const [lead, ...rest] = body.split(/^## /m);
    const map = { lead: lead.trim() };
    for (const chunk of rest) {
      const [title, ...lines] = chunk.split('\n');
      map[title.trim().toLowerCase()] = lines.join('\n').trim();
    }
    return map;
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function prettyDate(value) {
    if (!value || value === 'present') return 'Present';
    const [year, month] = String(value).split('-');
    return month ? `${MONTHS[+month - 1]} ${year}` : value;
  }

  const dateRange = (role) => {
    const from = prettyDate(role.start), to = prettyDate(role.end);
    return from === to ? from : `${from} – ${to}`;
  };

  /** Pull the objects out of projects.ts without running it. */
  function parseProjects(source) {
    const body = source.slice(source.indexOf('['), source.lastIndexOf(']') + 1);
    const quoted = (s) => [...s.matchAll(/'((?:[^'\\]|\\.)*)'/g)]
      .map((m) => m[1].replace(/\\'/g, "'"));
    return [...body.matchAll(/\{([\s\S]*?)\n {2}\}/g)].map(([, block]) => {
      const field = (key) => {
        const m = block.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
        return m ? m[1].replace(/\\'/g, "'") : '';
      };
      const blurb = block.match(/blurb:\s*([\s\S]*?),\n\s*stack:/);
      const stack = block.match(/stack:\s*\[([\s\S]*?)\]/);
      return {
        name: field('name'),
        when: field('when'),
        blurb: blurb ? quoted(blurb[1]).join('') : '',
        stack: stack ? quoted(stack[1]) : [],
      };
    }).filter((p) => p.name);
  }

  const SKILL_LABELS = {
    languages: 'Languages',
    aws: 'AWS',
    ai_ml: 'AI / ML',
    backend_and_practices: 'Backend & Practices',
    tools: 'Tools',
  };

  /* ---------- rendering ---------- */

  const section = (title, html) => html
    ? `<section><h2>${esc(title)}</h2>${html}</section>` : '';

  function masthead(p) {
    const link = (url, text) => `<span><a href="${esc(url)}" rel="noopener">${esc(text)}</a></span>`;
    const strip = (url) => String(url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const contact = [
      p.location && `<span>${esc(p.location)}</span>`,
      p.phone && `<span><a href="tel:${esc(String(p.phone).replace(/[^+\d]/g, ''))}">${esc(p.phone)}</a></span>`,
      p.email && `<span><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></span>`,
    ].filter(Boolean).join('');
    const links = [
      p.portfolio && link(p.portfolio, strip(p.portfolio)),
      p.github && link(p.github, strip(p.github)),
      p.linkedin && link(p.linkedin, strip(p.linkedin)),
    ].filter(Boolean).join('');

    return `<header class="masthead">
        <h1>${esc(p.name || '')}</h1>
        ${p.title ? `<p class="role">${esc(p.title)}</p>` : ''}
        ${contact ? `<p class="meta">${contact}</p>` : ''}
        ${links ? `<p class="meta links">${links}</p>` : ''}
      </header>`;
  }

  function experienceHTML(roles) {
    return roles.map((role) => `
      <article class="entry">
        <div class="entry-head">
          <h3>${esc(role.role)} <span class="at">·</span> <span class="org">${esc(role.company)}</span></h3>
          <span class="when">${esc(dateRange(role))}</span>
        </div>
        <p class="sub">${esc(role.location || '')}${
          role.focus ? `<span class="dot">·</span>${esc(role.focus)}` : ''}</p>
        <ul>${(ONE_PAGE ? (role.highlights || []).slice(0, MAX_HIGHLIGHTS) : (role.highlights || []))
          .map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      </article>`).join('');
  }

  function projectsHTML(projects) {
    return projects.map((p) => `
      <article class="entry">
        <div class="entry-head">
          <h3>${esc(p.name)}</h3>
          <span class="when">${esc(p.when)}</span>
        </div>
        <p class="body">${esc(p.blurb)}</p>
        ${p.stack.length ? `<p class="stack">${esc(p.stack.join(' · '))}</p>` : ''}
      </article>`).join('');
  }

  function skillsHTML(skills) {
    const rows = Object.entries(skills).map(([key, items]) => {
      const label = SKILL_LABELS[key]
        || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return `<dt>${esc(label)}</dt><dd>${esc(items.join(' · '))}</dd>`;
    }).join('');
    return rows ? `<dl class="skills">${rows}</dl>` : '';
  }

  const caseStudiesHTML = (md) => chapters(md)
    .map((body) => `<article class="entry case">${markdown(body)}</article>`)
    .join('');

  /* ---------- boot ---------- */

  const text = async (path) => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} — HTTP ${res.status}`);
    return res.text();
  };
  const json = async (path) => JSON.parse(await text(path));

  async function build() {
    const [profile, about, cases, experience, projectSrc, skills, education] =
      await Promise.all([
        json('content/contact.json'),
        text('content/about.md'),
        text('content/case-studies.md').catch(() => ''),
        json('content/experience.json'),
        text('content/projects.ts'),
        json('content/skills.json'),
        text('content/education.md'),
      ]);

    const about_ = sections(about);
    const [schooling, certificates] = chapters(education);

    document.title = `${profile.name} — Résumé`;

    const colophon = `<footer class="colophon">${esc(profile.name)} · updated ${
      new Date().getFullYear()} · <a href="/">served from the editor</a></footer>`;

    // Page one is the résumé proper. The case studies run long, so they get
    // their own page rather than pushing the CV onto a second, ragged one.
    const cv = [
      masthead(profile),
      section('Summary', `<div class="prose">${markdown(about_.lead)}${
        ONE_PAGE ? '' : markdown(about_['what i do'] || '')}</div>`),
      section('Experience', experienceHTML(experience)),
      section('Projects', projectsHTML(parseProjects(projectSrc))),
      section('Skills', skillsHTML(skills)),
      section('Education', `<div class="prose">${markdown(schooling || '')}</div>`),
      section('Certifications', certificates
        ? `<div class="prose">${markdown(stripHeading(certificates))}</div>` : ''),
    ].join('\n');

    const studies = cases
      ? `<article class="sheet">${section('Case studies', caseStudiesHTML(cases))}${colophon}</article>`
      : '';

    document.getElementById('sheet').innerHTML =
      `<article class="sheet">${cv}${studies ? '' : colophon}</article>${studies}`;
  }

  build().catch((err) => {
    document.getElementById('loading').innerHTML =
      `Could not load the résumé content. <br><small>${esc(err.message)}</small>`;
  });
})();
