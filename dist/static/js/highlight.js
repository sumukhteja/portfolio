/* Regex syntax highlighting — one pass per line, first rule wins.
   Small on purpose: it only has to be convincing for the files in content/. */
window.Highlight = (() => {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const RULES = {
    markdown: [
      [/^\s{0,3}#{1,6} .*$/, 't-h1'],
      [/^\s*> .*$/, 't-quote'],
      [/^\s*(?:---+|\*\*\*+)\s*$/, 't-rule'],
      [/^\s*(?:[-*+]|\d+\.)\s/, 't-bullet'],
      [/`[^`]*`/, 't-code'],
      [/\[[^\]]*\]\([^)]*\)/, 't-link'],
      [/\*\*[^*]+\*\*/, 't-bold'],
      [/\*[^*\n]+\*/, 't-quote'],
    ],
    json: [
      [/"(?:[^"\\]|\\.)*"(?=\s*:)/, 't-key'],
      [/"(?:[^"\\]|\\.)*"/, 't-str'],
      [/\b(?:true|false|null)\b/, 't-kw'],
      [/-?\b\d+(?:\.\d+)?\b/, 't-num'],
    ],
    ts: [
      [/\/\/.*$/, 't-com'],
      [/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/, 't-str'],
      [/\b(?:return|if|else|for|while|await|of|in|try|catch|throw)\b/, 't-ctl'],
      [/\b(?:export|default|const|let|var|interface|type|function|import|from|as|new|class|extends|implements|async)\b/, 't-kw'],
      [/\b(?:string|number|boolean|any|void|unknown|never)\b/, 't-type'],
      [/\b[A-Z][A-Za-z0-9_]*\b/, 't-type'],
      [/\b[A-Za-z_$][\w$]*(?=\s*:)/, 't-key'],
      [/\b[a-zA-Z_$][\w$]*(?=\()/, 't-fn'],
      [/\b\d+(?:\.\d+)?\b/, 't-num'],
    ],
    python: [
      [/#.*$/, 't-com'],
      [/"""[\s\S]*?"""|'''[\s\S]*?'''/, 't-str'],
      [/f?'(?:[^'\\]|\\.)*'|f?"(?:[^"\\]|\\.)*"/, 't-str'],
      [/\b(?:return|if|elif|else|for|while|try|except|finally|raise|with|yield|pass|continue|break)\b/, 't-ctl'],
      [/\b(?:def|class|import|from|as|None|True|False|and|or|not|in|is|lambda|global|async|await|self)\b/, 't-kw'],
      [/@[\w.]+/, 't-fn'],
      [/\b(?:str|int|float|bool|dict|list|tuple|set|Path|bytes)\b/, 't-type'],
      [/\b[A-Z][A-Za-z0-9_]*\b/, 't-type'],
      [/\b[a-zA-Z_]\w*(?=\()/, 't-fn'],
      [/\b\d+(?:\.\d+)?\b/, 't-num'],
    ],
    html: [
      [/<!--[\s\S]*?-->|<!--.*$/, 't-com'],
      [/<!?\/?[a-zA-Z][\w-]*/, 't-kw'],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, 't-str'],
      [/\b[a-zA-Z-]+(?==)/, 't-key'],
      [/\{\{.*?\}\}|\{%.*?%\}/, 't-fn'],
      [/[<>/]/, 't-kw'],
    ],
    css: [
      [/\/\*[\s\S]*?\*\/|\/\*.*$/, 't-com'],
      [/--[\w-]+(?=\s*:)/, 't-key'],
      [/[.#][\w-]+|:{1,2}[\w-]+|@[\w-]+/, 't-type'],
      [/#[0-9a-fA-F]{3,8}\b/, 't-num'],
      [/\b[a-z-]+(?=\s*:)/, 't-kw'],
      [/'[^']*'|"[^"]*"/, 't-str'],
      [/\b\d+(?:\.\d+)?(?:px|em|rem|vh|vw|%|s|ms|deg)?\b/, 't-num'],
    ],
    env: [
      [/^#.*$/, 't-com'],
      [/^[A-Z_][A-Z0-9_]*(?==)/, 't-key'],
      [/=.*$/, 't-str'],
    ],
    text: [],
  };

  // One combined regex per language, groups in rule order.
  const COMPILED = {};
  for (const [lang, rules] of Object.entries(RULES)) {
    if (!rules.length) continue;
    COMPILED[lang] = {
      rules,
      re: new RegExp(rules.map(([re]) => '(' + re.source + ')').join('|'), 'g'),
    };
  }

  function line(text, lang) {
    const c = COMPILED[lang];
    if (!c || !text) return esc(text);
    c.re.lastIndex = 0;
    let out = '', last = 0, m;
    while ((m = c.re.exec(text))) {
      if (m[0] === '') { c.re.lastIndex++; continue; }
      if (m.index > last) out += esc(text.slice(last, m.index));
      const hit = m.slice(1).findIndex((g) => g !== undefined);
      out += `<span class="${c.rules[hit][1]}">${esc(m[0])}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }

  return { line, esc };
})();
