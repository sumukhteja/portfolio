const byName = (value) => escapeHtml(String(value || ''));
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function inlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function markdownToHtml(markdownText) {
  const lines = String(markdownText || '').replace(/\r/g, '').split('\n');
  let html = '';
  let buffer = [];
  let openList = '';

  const flushBuffer = () => {
    if (!buffer.length) return;
    html += `<p>${inlineMarkdown(buffer.join(' ').trim())}</p>`;
    buffer = [];
  };

  const closeList = () => {
    if (!openList) return;
    html += `</${openList}>`;
    openList = '';
  };

  for (const rawLine of lines) {
    const line = rawLine.trimRight();

    if (!line.trim()) {
      flushBuffer();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushBuffer();
      closeList();
      const level = Math.min(6, heading[1].length);
      html += `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;
      continue;
    }

    if (/^(?:[-*+] )/.test(line.trim())) {
      if (openList !== 'ul') {
        flushBuffer();
        closeList();
        html += '<ul>';
        openList = 'ul';
      }
      const text = line.replace(/^[\s-+*]+\s*/, '');
      html += `<li>${inlineMarkdown(text)}</li>`;
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushBuffer();
      closeList();
      html += `<blockquote>${inlineMarkdown(quote[1])}</blockquote>`;
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      if (openList !== 'ol') {
        flushBuffer();
        closeList();
        html += '<ol>';
        openList = 'ol';
      }
      html += `<li>${inlineMarkdown(ordered[1])}</li>`;
      continue;
    }

    if (/^([*_-])\1\1+$/.test(line.trim())) {
      flushBuffer();
      closeList();
      html += '<hr>';
      continue;
    }

    if (openList) {
      buffer = [buffer.join(' '), line].filter(Boolean);
      closeList();
      continue;
    }

    buffer.push(line);
  }

  flushBuffer();
  closeList();
  return html || '<p class="muted">No content yet.</p>';
}

function prettyDate(value) {
  if (!value || value === 'present') return 'Present';
  const parts = String(value).split('-');
  if (parts.length === 2) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    return `${months[month - 1] || value} ${year}`;
  }
  return value;
}

function formatRange(role) {
  const start = prettyDate(role.start);
  const end = role.end ? prettyDate(role.end) : 'Present';
  const range = role.end ? `${start} – ${end}` : `${start} – Present`;
  if (role.duration) return `${range} · ${role.duration}`;
  return range;
}

function parseProjects(source) {
  const start = source.indexOf('[');
  const end = source.lastIndexOf(']');
  if (start === -1 || end === -1) return [];

  const body = source.slice(start, end + 1);
  const blocks = [...body.matchAll(/\{([\s\S]*?)\n\s*\}/g)];
  const out = [];

  for (const match of blocks) {
    const block = match[1];
    const pick = (key) => {
      const rgx = new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`);
      const found = block.match(rgx);
      return found ? found[1].replace(/\\'/g, "'") : '';
    };

    const item = {
      name: pick('name'),
      meta: pick('meta'),
      when: pick('when'),
    };
    if (!item.name) continue;

    const blurbMatch = block.match(/blurb:\s*([\s\S]*?),\n\s*stack:/);
    if (blurbMatch) {
      const chunks = [...blurbMatch[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
      item.blurb = chunks.join('');
    }

    const stackMatch = block.match(/stack:\s*\[(.*?)\]/s);
    if (stackMatch) {
      item.stack = [...stackMatch[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
    }

    out.push(item);
  }

  return out;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function renderLinks(profile) {
  const items = [];
  if (profile.github) items.push(`<a href="${profile.github}" target="_blank" rel="noopener">GitHub</a>`);
  if (profile.linkedin) items.push(`<a href="${profile.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`);
  if (profile.portfolio) items.push(`<a href="${profile.portfolio}" target="_blank" rel="noopener">Website</a>`);
  if (profile.email) items.push(`<a href="mailto:${byName(profile.email)}">Email</a>`);
  return items.join('');
}

function renderExperience(list = []) {
  const nodes = list.map((role) => {
    const when = formatRange(role);
    const highlights = Array.isArray(role.highlights) && role.highlights.length
      ? `<ul>${role.highlights.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`
      : '';
    return `<article class="entry">
      <div class="entry-head">
        <h3>${byName(role.role || 'Role')}</h3>
        <span class="when">${byName(when)}</span>
      </div>
      <p class="org">${[role.company, role.type, role.location].filter(Boolean).join(' · ')}</p>
      ${role.summary ? `<p class="lead">${byName(role.summary)}</p>` : ''}
      ${highlights}
    </article>`;
  });
  setHtml('experience', nodes.length ? nodes.join('') : '<p class="muted">No experience available yet.</p>');
}

function renderProjects(items = []) {
  const nodes = items.map((item) => `<article class="entry">
    <div class="entry-head">
      <h3>${byName(item.name)}</h3>
      <span class="when">${byName(item.when)}</span>
    </div>
    ${item.meta ? `<p class="org">${byName(item.meta)}</p>` : ''}
    ${item.blurb ? `<p>${inlineMarkdown(item.blurb)}</p>` : ''}
    ${item.stack && item.stack.length
      ? `<div class="chips">${item.stack.map((s) => `<span>${byName(s)}</span>`).join('')}</div>`
      : ''}
  </article>`).join('');
  setHtml('projects', nodes.length ? nodes : '<p class="muted">No projects yet.</p>');
}

function renderSkills(skills = {}) {
  const rows = Object.entries(skills).map(([category, values]) => {
    if (!Array.isArray(values) || !values.length) return '';
    return `<div class="skill-row">
      <h4>${byName(category.replace(/_/g, ' '))}</h4>
      <div class="chips">${values.map((s) => `<span>${byName(s)}</span>`).join('')}</div>
    </div>`;
  }).filter(Boolean);
  setHtml('skills', rows.length ? rows.join('') : '<p class="muted">No skills listed yet.</p>');
}

function setForm(profile) {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const email = profile.email || '';

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());
    const subject = encodeURIComponent(`Portfolio contact from ${String(formData.name || '').trim()}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message || ''}`
    );

    if (!email) {
      status.textContent = 'No email target found for this profile.';
      status.className = 'form-status err';
      return;
    }

    status.textContent = 'Opening your mail app…';
    status.className = 'form-status';
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });
}

async function fetchText(file) {
  const res = await fetch(file);
  if (!res.ok) {
    throw new Error(`${file} failed (${res.status})`);
  }
  return res.text();
}

async function fetchJson(file) {
  const res = await fetch(file);
  if (!res.ok) {
    throw new Error(`${file} failed (${res.status})`);
  }
  return res.json();
}

async function init() {
  try {
    const [profile, about, experience, education, volunteering, skills, projectsSource] = await Promise.all([
      fetchJson('content/contact.json'),
      fetchText('content/about.md'),
      fetchJson('content/experience.json'),
      fetchText('content/education.md'),
      fetchText('content/volunteering.md'),
      fetchJson('content/skills.json'),
      fetchText('content/projects.ts'),
    ]);

    setText('name', profile.name || 'Portfolio');
    setText('title', profile.title || '');
    setText('meta', [profile.location, profile.languages].filter(Boolean).join(' · '));
    setText('availability', profile.availability || '');
    setText('footer-email', profile.email || '');
    setText('year', String(new Date().getFullYear()));
    document.title = `${profile.name || 'Portfolio'} — Portfolio`;
    setHtml('links', renderLinks(profile) ? `${renderLinks(profile)}` : '');

    setHtml('about', markdownToHtml(about));
    setHtml('education', markdownToHtml(education));
    setHtml('volunteering', markdownToHtml(volunteering));

    renderExperience(Array.isArray(experience) ? experience : []);
    renderSkills(skills || {});
    renderProjects(parseProjects(projectsSource || ''));
    setForm(profile);
  } catch (error) {
    const msg = `Could not load portfolio data. ${error.message}`;
    setHtml('about', `<p class="form-status err">${msg}</p>`);
  }
}

init();
