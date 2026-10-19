/* Build: single self-contained HTML — inlines CSS/JS + base64 images.
   Run from repo root:  node tools/build-single.js */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p));
const b64 = (p, mime) => `data:${mime};base64,${read(p).toString("base64")}`;

let html = read("index.html").toString();
const css = read("assets/css/main.css").toString();
const js = read("assets/js/main.js").toString();

const cssMin = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\n\s*\n/g, "\n")
  .replace(/[ ]{2,}/g, " ")
  .replace(/\s*([{};:,])\s*/g, "$1")
  .trim();

const B64 = {
  photo: b64("photo.jpg", "image/jpeg"),
  mascot: b64("assets/img/mascot-256.png", "image/png"),
  fav: b64("assets/img/favicon-64.png", "image/png"),
  apple: b64("assets/img/apple-touch-icon.png", "image/png"),
  long: b64("assets/img/work/longform.jpg", "image/jpeg"),
  shorts: b64("assets/img/work/shorts.jpg", "image/jpeg"),
};

/* Literal insertion via function replacers: `$` chars are preserved as-is */
html = html
  .replace(/<link rel="preload" as="image" href="photo\.jpg" fetchpriority="high" \/>/, () => "")
  .replace(/<link rel="icon"[^>]*assets\/img\/favicon-64\.png" \/>/, () => `<link rel="icon" type="image/png" sizes="64x64" href="${B64.fav}" />`)
  .replace(/<link rel="apple-touch-icon" href="assets\/img\/apple-touch-icon\.png" \/>/, () => `<link rel="apple-touch-icon" href="${B64.apple}" />`)
  .replace(/<link rel="stylesheet" href="assets\/css\/main\.css" \/>/, () => `<style>\n${cssMin}\n</style>`)
  .replace(/<script src="assets\/js\/main\.js"><\/script>/, () => `<script>\n${js}\n</script>`)
  .replaceAll(/src="assets\/img\/favicon-64\.png"/g, () => `src="${B64.fav}"`)
  .replace(/src="icon\.png"/, () => `src="${B64.mascot}"`)
  .replace(/src="photo\.jpg"/, () => `src="${B64.photo}"`)
  .replace(/src="assets\/img\/work\/longform\.jpg"/, () => `src="${B64.long}"`)
  .replace(/src="assets\/img\/work\/shorts\.jpg"/, () => `src="${B64.shorts}"`);

const out = path.join(root, "portfolio-tig-1-arquivo.html");
fs.writeFileSync(out, html);
console.log(`OK -> ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
