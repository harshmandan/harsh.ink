export type Frontmatter = {
	title: string;
	date: string;
	updated?: string;
	coverImage?: string;
	categories?: string[];
	coverWidth?: number;
	coverHeight?: number;
	excerpt?: string;
	draft?: boolean;
	link?: string;
	npm_url?: string;
	source_url?: string;
};
