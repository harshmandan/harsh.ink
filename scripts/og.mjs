// Renders a 1200x630 share card per post into src/lib/og/<slug>.png,
// and the default card into static/og.png.
// Run with `bun run og` after adding a post or changing a title.
// Uses headless Chrome because it is the only renderer here that reads the site's woff2 fonts.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const postsDir = join(root, 'src/posts');
const outDir = join(root, 'src/lib/og');
const chrome =
	process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const only = process.argv.slice(2);
const slugs = readdirSync(postsDir)
	.filter((f) => f.endsWith('.md'))
	.map((f) => f.slice(0, -3))
	.filter((slug) => only.length === 0 || only.includes(slug));

function field(source, key) {
	const value = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim();
	if (!value) return '';
	if (value.startsWith("'")) return value.slice(1, -1).replaceAll("''", "'");
	if (value.startsWith('"')) return JSON.parse(value);
	return value;
}

function post(slug) {
	const source = readFileSync(join(postsDir, `${slug}.md`), 'utf8');
	const title = field(source, 'title');
	if (!title) throw new Error(`${slug}: no title in frontmatter`);
	return { title, description: field(source, 'excerpt') };
}

// Cut at a word boundary so the card doesn't end mid-word.
function clamp(text, max) {
	if (text.length <= max) return text;
	const cut = text.slice(0, max - 1);
	return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}

const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const font = (weight, file) =>
	`@font-face{font-family:Begum;font-weight:${weight};src:url('file://${root}/static/fonts/${file}') format('woff2')}`;

const html = ({ title, description }) => `<!doctype html><meta charset="utf-8"><style>
${font(500, 'Begum-Medium.woff2')}
${font(300, 'Begum-Light.woff2')}
html,body{margin:0}
body{width:1200px;height:630px;box-sizing:border-box;padding:80px;background:#c5796d;color:#fff;
	font-family:Begum,Georgia,serif;display:flex;flex-direction:column;justify-content:space-between}
header{display:flex;align-items:center;gap:18px;font-size:30px;font-weight:300}
svg{width:44px;height:44px}
h1{margin:0;font-size:${title.length > 44 ? 68 : 80}px;font-weight:500;line-height:1.15;text-wrap:balance}
p{margin:28px 0 0;font-size:34px;font-weight:300;line-height:1.35;opacity:.85;text-wrap:pretty}
</style>
<header>
<svg viewBox="0 0 227 227"><path d="M33.1371 33.1371H193.137V193.137H33.1371V33.1371Z" fill="#fff"/><path d="M0 113.137L113.137 0L226.274 113.137L113.137 226.274L0 113.137Z" fill="#fff"/></svg>
harsh.ink
</header>
<div><h1>${escape(title)}</h1>${description ? `<p>${escape(clamp(description, 120))}</p>` : ''}</div>`;

mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'og-'));

function render(name, card, out) {
	const page = join(tmp, `${name}.html`);
	writeFileSync(page, html(card));
	execFileSync(
		chrome,
		[
			'--headless',
			'--disable-gpu',
			'--hide-scrollbars',
			'--force-device-scale-factor=1',
			'--window-size=1200,630',
			'--allow-file-access-from-files',
			`--screenshot=${out}`,
			`file://${page}`
		],
		{ stdio: 'ignore' }
	);
	console.log(name);
}

// The card for pages that aren't posts.
if (only.length === 0) render('default', { title: 'Harsh Mandan' }, join(root, 'static/og.png'));
for (const slug of slugs) render(slug, post(slug), join(outDir, `${slug}.png`));

rmSync(tmp, { recursive: true });
