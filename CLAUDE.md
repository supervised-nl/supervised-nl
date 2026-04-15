# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development (live reload at http://localhost:1313)
hugo server

# Production build
hugo --minify --gc
```

Hugo extended edition v0.147.0 or later is required. No npm, no build pipeline.

## Architecture

Custom Hugo theme (`themes/supervised/`) with a single CSS file processed via Hugo Pipes. There is no JavaScript framework and no package manager.

**Content** (`content/`): Markdown pages with front matter. All copy is Dutch.
- Regular pages: `title`, `description`, optional `layout` override
- Homepage (`_index.md`): also has a `clients:` list (name + file pairs) rendered as client logos
- Blog posts: also require `date` and `slug`
- FAQ page: uses `layout: "faq"` and a `faq:` front matter array of `{q, a}` objects — rendered as Schema.org FAQPage structured data

**Layouts** (`themes/supervised/layouts/`):
- `_default/baseof.html` — single base template for all pages; includes header, nav, footer, inline JS, structured data (JSON-LD)
- `_default/faq.html`, `blog/list.html`, `blog/single.html`, `contact/single.html` — section/type-specific overrides
- `partials/logo.html` — SVG logo partial

**CSS** (`themes/supervised/assets/css/main.css`): single 339-line file, no framework. Hugo Pipes fingerprints and integrity-hashes it at build time.

**Static assets** (`themes/supervised/static/`): fonts, images, and `js/lenis.min.js`. Root `static/` holds favicon and `llms.txt`.

## CSP and inline scripts

`vercel.json` contains a strict Content-Security-Policy with explicit `sha256-` hashes for every inline `<script>` in `baseof.html`. **If you modify any inline script in `baseof.html`, the corresponding hash in `vercel.json` must be recalculated and updated** — otherwise the script will be blocked in production.

To recalculate: build the site, copy the inline script content, and compute `echo -n "<script content>" | openssl dgst -sha256 -binary | base64`.

## Adding content

- New page: create `content/<slug>.md` with `title` and `description` front matter; add to `[[menu.main]]` in `hugo.toml` if it should appear in nav
- New blog post: create `content/blog/<slug>.md` with `title`, `slug`, `date`, `description`
- Client logos on homepage: add SVG to `themes/supervised/static/img/` and add entry to `clients:` in `content/_index.md`
