// Chrome paints a text selection as tall as the text's own line-height. With
// the text straight inside <p>, that is the full 1.7 line spacing, so the
// highlight looks bloated. Wrapping the inline content in a span lets CSS give
// the span a tighter line-height while the <p> keeps the 1.7 spacing.

type Node = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: Node[];
};

const BLOCK_TAGS = new Set([
	'p',
	'ul',
	'ol',
	'li',
	'pre',
	'figure',
	'blockquote',
	'table',
	'div',
	'img',
	'video',
	'iframe',
	'hr',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6'
]);

// mdsvex hands highlighted code blocks and inline HTML to rehype as raw strings.
const BLOCK_RAW = /^\s*<(figure|pre|div|table|ul|ol|p|blockquote|h[1-6]|img|video|iframe|hr)\b/i;

function isBlock(node: Node): boolean {
	if (node.type === 'element') return BLOCK_TAGS.has(node.tagName ?? '');
	if (node.type === 'raw') return BLOCK_RAW.test(node.value ?? '');
	return false;
}

function isBlank(node: Node): boolean {
	return node.type === 'text' && !node.value?.trim();
}

function wrapInlineRuns(children: Node[]): Node[] {
	const out: Node[] = [];
	let run: Node[] = [];

	const flush = () => {
		if (run.some((node) => !isBlank(node))) {
			out.push({
				type: 'element',
				tagName: 'span',
				properties: { className: ['text'] },
				children: run
			});
		} else {
			out.push(...run);
		}
		run = [];
	};

	for (const child of children) {
		if (isBlock(child)) {
			flush();
			out.push(child);
		} else {
			run.push(child);
		}
	}
	flush();
	return out;
}

function walk(node: Node) {
	if (!node.children) return;
	node.children.forEach(walk);
	if (node.type === 'element' && (node.tagName === 'p' || node.tagName === 'li')) {
		node.children = wrapInlineRuns(node.children);
	}
}

/** Rehype plugin: wraps the inline content of every <p> and <li> in <span class="text">. */
export function wrapText() {
	return (tree: Node) => walk(tree);
}
