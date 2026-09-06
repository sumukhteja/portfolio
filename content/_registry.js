// Tiny registry. Every content file calls PORTFOLIO.file(...) exactly once.
// One file = one thing. Add a file here, add a <script> tag in index.html, done.
window.PORTFOLIO = {
  files: [],
  file(def) { this.files.push(def); }
};
