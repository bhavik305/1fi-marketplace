/*
 * Post-export fix for Expo web apps hosted on a GitHub Pages sub-path
 * (e.g. https://user.github.io/repo-name/).
 *
 * `expo export --platform web` generates an `index.html` whose script/style
 * tags use root-absolute paths (e.g. `/_expo/static/js/web/index.js`). On a
 * sub-path site those resolve against the domain root and 404, which renders
 * a blank page. We inject a <base href> so every root-relative URL resolves
 * under the sub-path. This is a build-time fix; no component code is touched.
 *
 * Usage: node deploy-fix-base.js [repoName]
 *   repoName defaults to "1fi-marketplace"
 */
const fs = require('fs');
const path = require('path');

const repoName = process.argv[2] || '1fi-marketplace';
const base = `/${repoName}/`;
const indexPath = path.join(process.cwd(), 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('deploy-fix-base: dist/index.html not found; run "expo export --platform web" first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

if (!html.includes(`<base href="${base}">`)) {
  html = html.replace(
    /<head>/i,
    `<head>\n    <base href="${base}">`
  );
}

fs.writeFileSync(indexPath, html);
console.log(`deploy-fix-base: injected <base href="${base}"> into dist/index.html`);

// GitHub Pages skips Jekyll processing for any repo containing a .nojekyll file.
// Without it, directories whose names begin with an underscore (such as Expo's
// `_expo/` output) are dropped, causing 404s for the JS bundle on GitHub Pages.
const nojekyllPath = path.join(process.cwd(), 'dist', '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log(`deploy-fix-base: wrote dist/.nojekyll`);
