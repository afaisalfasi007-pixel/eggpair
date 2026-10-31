# Google indexing checklist

Google decides when and what to crawl and index. Nothing here can force it, and no result below is claimed until you see it in Search Console.

## Verified by tests and audits (build output)

- [x] 311 pages, all listed in `sitemap.xml`, no duplicates, every URL has a real page.
- [x] Every page has one `<h1>`, a unique title (≤ 70 chars) and description (≤ 160 chars).
- [x] Every page's canonical URL is itself. Pages with `?a=…&b=…` style links canonicalise to the clean URL.
- [x] No page has `noindex` except `404.html` (intended).
- [x] Every page is reachable from the home page within 2 clicks (home → All Pals → Pal page); no orphan pages.
- [x] No broken internal links; no missing assets.

## Things to know

- **robots.txt:** Google only reads `robots.txt` at the *root of the host*. On `https://afaisalfasi007-pixel.github.io/eggpair/` the file at `/eggpair/robots.txt` is ignored, and `https://afaisalfasi007-pixel.github.io/robots.txt` belongs to a different repository (a "user site"). Google treats a missing robots.txt as "everything may be crawled", so this is harmless. It starts working if the site moves to its own domain.
- **Sitemap:** submit `https://afaisalfasi007-pixel.github.io/eggpair/sitemap.xml` in Search Console → Sitemaps. "Couldn't fetch" with an empty "Last read" in the first days usually means Google has not processed it yet.
- **Verification file:** keep `src/static/googlecd181ec0e3da8d20.html`; deleting it un-verifies the property.

## Page-by-page (URL Inspection)

For each URL: Search Console → paste URL in the top bar → read the result. Use **Request indexing** only for the first few pages below, once each. Tick the box when Google shows "URL is on Google".

| Done | URL | What to expect |
|---|---|---|
| [ ] | `https://afaisalfasi007-pixel.github.io/eggpair/` | Home; request indexing |
| [ ] | `.../eggpair/pals/` | Directory; links to all 299 Pals |
| [ ] | `.../eggpair/find/` | Parent finder |
| [ ] | `.../eggpair/planner/` | Route planner |
| [ ] | `.../eggpair/guide/how-breeding-works/` | Guide; request indexing |
| [ ] | `.../eggpair/pals/anubis/` | Sample Pal page |
| [ ] | `.../eggpair/pals/jetragon/` | Sample "only from itself" page |
| [ ] | `.../eggpair/pals/lamball/` | Sample common Pal page |
| [ ] | `.../eggpair/about/`, `/privacy/`, `/terms/`, `/contact/`, `/data-sources/`, `/disclaimer/` | Info pages |

The other Pal pages are found through the sitemap and the directory page; do not request indexing for each one.

## How to read the results

- **"URL is not on Google: URL is unknown to Google"** — Google has not found it yet. Normal for new sites. Wait; check the sitemap status.
- **"Discovered – currently not indexed"** / **"Crawled – currently not indexed"** — Google knows the page but has not chosen to index it. On new sites this is common. It improves with time, links from other sites, and more original content.
- **"Indexed"** — good. It does not mean it will rank.

## Check every 3–7 days

1. Search Console → **Sitemaps**: status "Success", discovered pages ≈ 311.
2. **Pages**: how many are indexed; read the reasons for the rest.
3. **Performance**: first impressions/queries (can take weeks).
