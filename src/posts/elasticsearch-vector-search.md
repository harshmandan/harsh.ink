---
title: 'Elasticsearch as a vector database'
date: '29-04-2025'
draft: false
categories:
  - 'ai'
excerpt: How we used Elasticsearch to search videos and help articles by meaning.
docs_url: https://www.elastic.co/docs/solutions/search/vector/knn
---

Our app already used Elasticsearch for most of its search and analytics. When we wanted to search videos by meaning, not just by keyword, we had to decide where to keep the embeddings. Elasticsearch has a `dense_vector` field type and approximate kNN search, so we put them in the same cluster as everything else.

There are two vector indexes now: parts of videos, and chunks of our help articles. Both are only used for search. Our AI agents use the first to find where something happens in a video, and the second to answer how-to questions. The assistant's own conversation memory isn't in Elasticsearch at all. It uses pgvector in Postgres, next to the rest of Mastra's storage.

## One index for text and vectors

Each document in the video index is a span of a video: its start and end time, a description of what happens in it, a summary, the team and video it belongs to, and an embedding of its text. There are a few sizes: short spans, wider windows that cover several of them, and one document for the whole video.

```ts
embedding: {
	type: 'dense_vector',
	dims: 3072,
	index: true,
	similarity: 'cosine'
},
embeddingModel: { type: 'keyword' }
```

The embeddings come from OpenAI's `text-embedding-3-large`, which returns 3072 dimensions, generated in batches when a video is indexed. The model name is stored next to each vector, so a future model change can tell old vectors from new ones.

Keeping the vectors next to the text means one query can filter by team, video, granularity and time range and rank by similarity at the same time, with no second database to keep in sync.

## Searching by meaning

A search embeds the query with the same model and sends a kNN query, with the usual filters moved inside it:

```ts
query.knn = {
	field: 'embedding',
	query_vector: embedding,
	k,
	num_candidates: Math.max(100, k * 5),
	filter: query.query?.bool?.filter
};
query.min_score = threshold;
```

Putting the filters inside `knn` matters. Elasticsearch applies them while it searches the graph, so a query for one team's videos returns `k` results from that team. Filtering afterwards could leave fewer than `k`, or none.

It returns 5 results by default, considers at least 100 candidates, and drops anything under a minimum score of 0.7. If the embedding call fails, the search falls back to a plain `match` on the description and summary, so a provider outage makes search worse rather than broken.

## Help search

I moved our help centre off Intercom and into our app: articles are markdown files in the repo, edited in the app and published through pull requests. Search went into Elasticsearch, in a second index built the same way as the video one.

When an article is published, it's split into one chunk per heading. Each chunk's search text is the article title, its description, the path of headings above it and the section's plain text. All the chunks are embedded with `text-embedding-3-large` in one call and bulk-indexed, replacing the chunks from the previous revision.

A search runs two queries at once against the same index: a kNN query on the embedding, and a `multi_match` across the title, headings, description and text, with fuzzy matching. The two scores aren't on the same scale. kNN scores sit between 0 and 1, and BM25 scores are unbounded. So the lexical scores are divided by the best lexical score and squeezed into a band from 0.62 to 0.87, each chunk keeps whichever of its two scores is higher, and anything under 0.62 is dropped:

```ts
const lexicalScore =
	normalizedLexicalScore > 0
		? MIN_SEARCH_SCORE + normalizedLexicalScore * LEXICAL_SEARCH_SCORE_RANGE
		: 0;

return {
	chunk: hit.chunk,
	score: Math.max(hit.semanticScore, lexicalScore)
};
```

Results are then reduced to one per article. The same function backs the help page, a `searchKnowledgeBase` tool for our in-app assistant and the MCP server, so the assistant answers "how do I…" questions from the published articles instead of guessing.

## When the nearest neighbour isn't an answer

A search for "approved viewer list" returned an unrelated article. Two things let it through.

The first was the threshold. Elasticsearch doesn't return cosine similarity as the kNN score. It returns `(1 + cosine) / 2`, so that scores are never negative. A cutoff of 0.62 is a cosine similarity of 0.24, and with a small corpus almost every query has some chunk that close. The nearest article always looked like a result.

We wrote a calibration script that embedded 16 questions phrased the way a user would ask them, each with a known target article, and 8 questions that have nothing to do with our app, such as how to bake sourdough bread:

|                                     | Score range |
| :---------------------------------- | :---------- |
| The right article, paraphrased      | 0.662–0.770 |
| Unrelated questions, nearest chunk  | 0.556–0.651 |
| "approved viewer list", wrong match | 0.703       |

A semantic match now needs 0.71 to count. That admits 12 of the 16 paraphrases, where 0.75 would admit only 5, and rejects every unrelated question and the original bad match. The other four only return results if their words also match. The script refuses to run against production.

The second was the keyword query, which matched any one of the words. It now drops phrases like "how do I", requires most of the remaining words to match, and stops fuzzy matching from turning short words into other words, so "add" no longer matches "and". Inflections come from an English-stemmed subfield instead of the hand-written variants it replaced. The subfield was added to the existing index with `update_by_query`, which reindexed every chunk in place and kept its embedding, so nothing had to be embedded again.

<img class="screenshot wide" src="/images/blog/elasticsearch-vector-search/help-search.webp" alt="Help search for 'how do I add viewers to an approved list', with Filtering Results first at a score of 0.8700, then three weaker matches at about 0.75 and 0.74, each with a snippet and the matched words highlighted" loading="lazy" />

The same question asked in full now puts the right article first. Its score of 0.87 is the top of the keyword band, which goes to the best keyword match of each search.

## The filter is the access control

In a shared vector index, the filter inside the kNN query is the only thing keeping one team's videos out of another team's results. A security review found that the endpoint for searching videos by meaning took its team from a request header, with no check that the caller belonged to that team, or was signed in at all. Anyone could search any team's videos.

I changed it to require a signed-in user or an API key with an active membership in the team, checked before the request body is even parsed. "Team not found" and "not a member" return the same response, so the endpoint can't be used to find out which team IDs exist.
