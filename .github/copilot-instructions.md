# Copilot Instructions for Venator Blog

## Project Overview

This is a personal blog and podcast site, built with [Zola](https://www.getzola.org/) (v0.18.0), a Rust-based static site generator. The Zola site itself is intentionally free of Node.js, npm, and JavaScript build tooling. However, the repository also contains a Node.js utility script (`scripts/sync_podcast/`) for syncing podcast episodes from an RSS feed — that script has its own `package.json` and `node_modules`, separate from the site build.

The site is deployed to GitHub Pages via GitHub Actions and is accessible at `https://brack0.dev/blog`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Static site generator | [Zola](https://www.getzola.org/) v0.18.0 (Rust binary) |
| Template engine | [Tera](https://keats.github.io/tera/) (Zola's built-in) |
| Styling | SCSS/Sass (compiled by Zola) |
| Content | Markdown with TOML front matter |
| Syntax highlighting | Zola built-in, custom "venator" theme (`highlight_themes/venator.tmTheme`) |
| i18n | Zola multilingual support (English + French) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`, `.github/workflows/sync_podcast.yml`) |

**The Zola site itself has no `package.json`, no `node_modules`, and no JavaScript build step.** The only exception is `scripts/sync_podcast/`, which is a standalone Node.js utility and is never imported by the site build.

---

## Repository Structure

```
/
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
│       ├── deploy.yml          # Build & deploy to GitHub Pages on push to main
│       └── sync_podcast.yml    # Manually triggered podcast RSS sync workflow
├── content/                    # All Markdown content
│   ├── about.md                # About page
│   ├── articles/               # Blog posts
│   │   ├── _index.md           # Section metadata (EN)
│   │   ├── _index.fr.md        # Section metadata (FR)
│   │   └── YYYY-MM-DD-slug.md  # Individual posts (+ .fr.md for translations)
│   └── fec/                    # Front-end Chronicles podcast episodes
│       ├── _index.md
│       ├── _index.fr.md
│       └── YYYY-MM-DD-fec-N.md # Individual episodes (+ .fr.md)
├── highlight_themes/
│   └── venator.tmTheme         # Custom syntax highlighting theme (TextMate format)
├── sass/                       # SCSS source files
│   ├── style.scss              # Entry point – imports all modules
│   ├── variables.scss          # Breakpoint variables only
│   ├── color.scss              # Dark/light theme mixins and CSS custom properties
│   ├── main.scss               # Base typography, grid, headings
│   ├── header.scss             # Navigation styles
│   ├── post.scss               # Post card styles
│   ├── pagination.scss         # Pagination controls
│   ├── buttons.scss            # Button styles
│   └── footer.scss             # Footer styles
├── scripts/
│   └── sync_podcast/           # Standalone Node.js podcast RSS sync utility
│       ├── sync.js             # Main script (ES module, Node 22)
│       ├── sync.test.js        # Black-box unit tests (node:test)
│       └── package.json        # npm metadata and test runner config
├── static/                     # Static assets served as-is
│   ├── favicon.ico
│   └── og-image.png
├── templates/                  # Tera templates
│   ├── base.html               # Root layout (head, header, footer)
│   ├── index.html              # Homepage
│   ├── page.html               # Single article/page
│   ├── section.html            # Section listing (articles, fec)
│   ├── 404.html                # Not-found page
│   ├── robots.txt              # robots.txt template
│   ├── macros/
│   │   ├── header.html         # Site header and navigation macro
│   │   └── head.html           # Head meta macro
│   ├── shortcodes/             # Custom Markdown shortcodes
│   │   ├── advice.html         # Info/warning callout boxes
│   │   ├── codeblock.html      # Code block with filename label
│   │   ├── youtube.html        # Privacy-friendly YouTube embed
│   │   └── spotify.html        # Spotify embed
│   └── tags/
│       ├── list.html           # All-tags page
│       └── single.html         # Tag detail page
├── config.toml                 # Zola configuration (languages, menu, i18n strings)
└── TODO.md                     # Project roadmap
```

---

## Content Conventions

### File naming
- Blog posts: `content/articles/YYYY-MM-DD-slug.md` (English) and `content/articles/YYYY-MM-DD-slug.fr.md` (French)
- Posts with assets (images, etc.): use a folder `content/articles/YYYY-MM-DD-slug/index.md` + `index.fr.md`
- Podcast episodes: `content/fec/YYYY-MM-DD-fec-N.md` and `content/fec/YYYY-MM-DD-fec-N.fr.md`

### Front matter (TOML)
Every content file starts with a TOML front matter block:

```toml
+++
title = "Post title"

[taxonomies]
tags = ["tag-one", "tag-two"]
+++
```

- `title` is required. `date` is inferred from the filename prefix (`YYYY-MM-DD-`).
- `description` is optional — templates fall back to `page.summary | striptags` when absent.
- `summary` can be used to control the excerpt shown in list pages.
- Tags use kebab-case slugs.

### Section metadata (`_index.md`)
Section index files configure the section behaviour:

```toml
+++
sort_by = "date"
paginate_by = 5          # 5 for articles, 10 for fec
generate_feed = true
+++
```

### i18n
- English is the default language.
- French translations are parallel files with `.fr.md` suffix.
- Not all posts need a French translation; untranslated posts are only shown in their original language.
- Translation strings for UI elements live in `config.toml` under `[translations]` (English) and `[languages.fr.translations]` (French).
- Use `{{ trans(key="key_name", lang=lang) }}` in templates.
- Translation key names follow `section_description` snake_case format (e.g. `hero_tagline`, `paginator_newer_posts`).

---

## Template Conventions (Tera)

- All templates extend `base.html` via `{%- extends "base.html" -%}`.
- Use `{%-` / `-%}` (dash variants) for whitespace trimming.
- Use `{# comment #}` for template comments. **Never use HTML comments** (`<!-- -->`); they pass through to production HTML.
- External links always include `rel="noopener noreferrer"` and `target="_blank"`.
- Use `| safe` only when the value is known to be safe HTML. Audit usages carefully; the TODO notes many are missing or unnecessary.
- Access i18n via `{{ trans(key="...", lang=lang) }}`. The `lang` variable is automatically provided by Zola.
- Macros are imported at the top of the file: `{%- import "macros/header.html" as header -%}` and called with `{{ header::content(...) }}`.
- Shortcodes live in `templates/shortcodes/` and are called from Markdown: `{% advice(type="info", name="Title") %}content{% end %}`.
- URLs in templates use `get_url(path="...")` to respect the configured `base_url`. When a full production URL is needed (canonical, alternate hreflang), prefix with `config.extra.site_url`.

---

## Styling Conventions (SCSS)

### Architecture
- `sass/style.scss` is the main entry point and imports all shared SCSS modules in order.
- `sass/header.scss` is compiled separately to `header.css` and inlined by the header template via `load_data(path="header.css")`; do **not** import it into `style.scss`.
- Never add new styles directly to `style.scss`; create or extend a module file.

### Theming
- Colors are defined as CSS custom properties in `sass/color.scss` using two mixins: `light-theme` and `dark-theme`.
- Primary variables: `--primary`, `--background`, `--foreground`, `--border-color`.
- Themes are applied via:
  - `@media (prefers-color-scheme: dark/light)` for system preference.
  - `.dark` / `.light` class on `:root` for user override (toggled via JavaScript and persisted to `localStorage`).
- New or refactored styles should use these CSS custom properties instead of hard-coding colour values; legacy files that still use hard-coded colours can be gradually migrated toward `color.scss` variables.

### Sizing and units
- Breakpoints are defined in `sass/variables.scss`:
  - `$phone-max-width: 683px`
  - `$tablet-max-width: 899px`

### Naming
- Class names follow a BEM-like convention: `.block__element` and `.block__element--modifier`.
- Use CSS custom properties (variables) for theming; use Sass variables only for breakpoints and compile-time constants.

---

## JavaScript

The site has **minimal, inline JavaScript** for the dark/light theme toggle only (inside `templates/macros/header.html`). It uses `localStorage` to persist the user's choice and applies `.dark` or `.light` to `:root`.

There is no JavaScript build step, no bundler, and no external JS libraries for the site itself. Keep it that way unless a feature absolutely requires JS, and even then prefer a small inline script.

The `scripts/sync_podcast/` utility is the sole exception: it is a standalone Node.js ES module (not part of the site build) used exclusively via the `sync_podcast.yml` GitHub Actions workflow.

---

## Configuration (`config.toml`)

- `base_url = "/blog"` — used for all internal `get_url()` calls.
- `config.extra.site_url = "https://brack0.dev"` — used only when a full absolute production URL is required (canonical links, hreflang).
- Menu items are defined in `config.extra.menu_items`. External links have `external = true`.
- Taxonomies: only `tags` is enabled.
- HTML minification is enabled in production (`minify_html = true`).

---

## Development Workflow

### Running locally
```sh
zola serve -u /
```
This starts a dev server at `http://127.0.0.1:1111/` with hot reload (overrides the `/blog` base_url for local development).

### Building
```sh
zola build
```
Output goes to `public/` (git-ignored).

### Checking
```sh
zola check
```
Validates links and configuration without building.

---

## CI/CD

GitHub Actions automates both deployment and podcast content sync.

### Site deployment (`.github/workflows/deploy.yml`)

Runs automatically on every push to `main`:

1. **build**: Runs `getzola/github-pages@v1` with Zola v0.18.0. Uploads the built site as a Pages artifact.
2. **deploy**: Deploys the artifact to GitHub Pages via `actions/deploy-pages@v4`.

Concurrency is limited to one deployment at a time (newer runs cancel older ones in the same group).

### Podcast RSS sync (`.github/workflows/sync_podcast.yml`)

Triggered manually via `workflow_dispatch`. Uses Node.js 22 to run `scripts/sync_podcast/sync.js`:

1. Fetches the podcast RSS feed from Anchor/Spotify.
2. Parses episodes and creates new `content/fec/YYYY-MM-DD-fec-N.md` (EN) and `.fr.md` (FR) files for episodes not yet present on disk.
3. Commits the new files and opens a pull request for review.

Episodes that already exist on disk are skipped. Run `npm test` in `scripts/sync_podcast/` to execute the unit tests locally.

---

## Key Principles

1. **No Node.js in the site build.** Zola handles everything. Do not add JavaScript dependencies or a build step to the site itself. The `scripts/sync_podcast/` Node.js utility is a standalone exception used only via GitHub Actions.
2. **Bilingual by default.** Every user-visible string must have both English and French translations in `config.toml`. New content should ideally have a `.fr.md` companion.
3. **Minimal JavaScript.** The only JS is the theme toggle. New features should be implemented in HTML/CSS first.
4. **Semantic HTML.** Keep the DOM clean and meaningful. Avoid unnecessary wrapper elements.
5. **Accessibility first.** Ensure colour contrast, keyboard navigation, and ARIA attributes are correct.
6. **Template comments only.** Use `{# #}` in Tera templates, never `<!-- -->`.
7. **Respect the existing style.** Match naming, formatting, and architecture patterns already in use in each file before introducing new ones.

---

## Git Guidelines

### Branching (Trunk-Based Development)
- `main` must always be deployable; branches must be short-lived (< 2 days).
- Branch name format: `<type>/<short-description>` in kebab-case (e.g. `feat/rss-feed`, `fix/mobile-menu`).
- Common types: `feat`, `fix`, `chore`, `docs`, `refactor`.

### Conventional Commits
Format: `<type>(scope): <description>`

- `feat(articles): add pagination`
- `fix(header): correct mobile menu layout`
- `chore: update Zola to vX.Y.Z`

### History & Merging
- Prefer `rebase` over merge to keep a linear history.
- Make atomic commits — one logical change per commit.
- Rebase on the latest `main` and clean up commits before opening a pull request.
