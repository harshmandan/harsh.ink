import { code_highlighter, escapeSvelte } from 'mdsvex';

type Highlighter = typeof code_highlighter;

const LABELS: Record<string, string> = {
	bash: 'Shell',
	css: 'CSS',
	gradle: 'Gradle',
	html: 'HTML',
	ini: 'INI',
	java: 'Java',
	js: 'JavaScript',
	javascript: 'JavaScript',
	json: 'JSON',
	kotlin: 'Kotlin',
	kt: 'Kotlin',
	markdown: 'Markdown',
	md: 'Markdown',
	python: 'Python',
	rs: 'Rust',
	rust: 'Rust',
	sh: 'Shell',
	sshconfig: 'SSH config',
	svelte: 'Svelte',
	svg: 'SVG',
	toml: 'TOML',
	ts: 'TypeScript',
	typescript: 'TypeScript',
	yaml: 'YAML',
	yml: 'YAML'
};

const COPY_ICON = `<svg class="code-block__icon code-block__icon--copy" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>`;
const CHECK_ICON = `<svg class="code-block__icon code-block__icon--check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

function labelFor(lang: string | null | undefined): string {
	if (!lang) return 'Text';
	const name = LABELS[lang.toLowerCase()] ?? lang;
	return name.replace(/[^\w .+#-]/g, '');
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Wraps mdsvex's Prism output in a figure with a language label and a copy button. */
export const highlight: Highlighter = async (code, lang, ...rest) => {
	// Rendered to SVG in the browser by the post page (see renderDiagrams).
	if (lang === 'mermaid') {
		return `<div class="mermaid-diagram"><pre class="mermaid">${escapeSvelte(escapeHtml(code))}</pre></div>`;
	}

	const pre = await code_highlighter(code, lang, ...rest);
	return (
		`<figure class="code-block">` +
		`<figcaption class="code-block__header">` +
		`<span class="code-block__lang">${labelFor(lang)}</span>` +
		`<button type="button" class="code-block__copy" aria-label="Copy code">${COPY_ICON}${CHECK_ICON}</button>` +
		`</figcaption>` +
		pre +
		`</figure>`
	);
};
