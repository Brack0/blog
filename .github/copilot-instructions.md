# Copilot Instructions for Venator Blog

## Project Overview

**Venator** is a personal blog and podcast site for Denis Souron, built with [Zola](https://www.getzola.org/) (v0.18.0), a Rust-based static site generator. The site is intentionally free of Node.js, npm, and JavaScript build tooling. Zola is the single build binary: it compiles Sass, renders Tera templates, and processes Markdown content into a deployable static site.

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
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |

**There is no `package.json`, no `node_modules`, and no JavaScript build step.**

---

## Repository Structure

```
/
├── .github/
│   └── workflows/deploy.yml    # Build & deploy to GitHub Pages on push to main
├── content/                    # All Markdown content
│   ├── about.md                # About page
│   ├── articles/               # Blog posts
│   │   ├── _index.md           # Section metadata (EN)
│   │   ├── _index.fr.md        # Section metadata (FR)
│   │   └── YYYY-MM-DD-slug.md  # Individual posts (+ .fr.md for translations)
│   └── fec/                    # Front-end Chronicles podcast episodes
│       ├── _index.md
│       ├── _index.fr.md
│       └── fec-N.md            # Individual episodes (+ .fr.md)
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
- Podcast episodes: `content/fec/fec-N.md` and `content/fec/fec-N.fr.md`

### Front matter (TOML)
Every content file starts with a TOML front matter block:

```toml
+++
title = "Post title"
date = 2024-03-15
description = "A short description for SEO and previews."

[taxonomies]
tags = ["tag-one", "tag-two"]
+++
```

- `title` and `date` are required.
- `description` is used for previews and OpenGraph tags.
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
- Shortcodes live in `templates/shortcodes/` and are called from Markdown: `{{ advice(type="info", name="Title") }}content{{ end }}`.
- URLs in templates use `get_url(path="...")` to respect the configured `base_url`. When a full production URL is needed (canonical, alternate hreflang), prefix with `config.extra.site_url`.

---

## Styling Conventions (SCSS)

### Architecture
- `sass/style.scss` is the entry point and imports all other modules in order.
- Never add new styles directly to `style.scss`; create or extend a module file.

### Theming
- Colors are defined as CSS custom properties in `sass/color.scss` using two mixins: `light-theme` and `dark-theme`.
- Primary variables: `--primary`, `--background`, `--foreground`, `--border-color`.
- Themes are applied via:
  - `@media (prefers-color-scheme: dark/light)` for system preference.
  - `.dark` / `.light` class on `:root` for user override (toggled via JavaScript and persisted to `localStorage`).
- Do not hard-code colour values outside of `color.scss`.

### Sizing and units
- **Goal (from TODO)**: Use `rem` consistently for sizing instead of mixing `px` and `rem`. Target values like `0.5rem`, `1rem`, `2rem` over pixel equivalents.
- Breakpoints are defined in `sass/variables.scss`:
  - `$phone-max-width: 683px`
  - `$tablet-max-width: 899px`

### Naming
- Class names follow a BEM-like convention: `.block__element` and `.block__element--modifier`.
- The TODO tracks a decision between full BEM and a tag-based approach — follow the pattern already present in the file you're editing.
- Use CSS custom properties (variables) for theming; use Sass variables only for breakpoints and compile-time constants.

### CSS reset
- A CSS reset is listed in the TODO. When adding one, the reference is [Keith J. Grant's CSS resets](https://keithjgrant.com/posts/2024/01/my-css-resets/).

---

## JavaScript

The site has **minimal, inline JavaScript** for the dark/light theme toggle only (inside `templates/macros/header.html`). It uses `localStorage` to persist the user's choice and applies `.dark` or `.light` to `:root`.

There is no JavaScript build step, no bundler, and no external JS libraries. Keep it that way unless a feature absolutely requires JS, and even then prefer a small inline script.

---

## Configuration (`config.toml`)

- `base_url = "/blog"` — used for all internal `get_url()` calls.
- `config.extra.site_url = "https://brack0.dev"` — used only when a full absolute production URL is required (canonical links, hreflang).
- Menu items are defined in `config.extra.menu_items`. External links have `external = true`.
- Taxonomies: only `tags` is enabled.
- `build_search_index = false` — Algolia integration is planned (see TODO) but not yet implemented.
- HTML minification is enabled in production (`minify_html = true`).

---

## Development Workflow

### Running locally
```sh
zola serve
```
This starts a dev server at `http://127.0.0.1:1111/blog` with hot reload.

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

### There are no tests
The project has no test suite. Correctness is validated by a successful `zola build`.

---

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys the site automatically on every push to `main`:

1. **build**: Runs `getzola/github-pages@v1` with Zola v0.18.0. Uploads the built site as a Pages artifact.
2. **deploy**: Deploys the artifact to GitHub Pages via `actions/deploy-pages@v4`.

Concurrency is limited to one deployment at a time (newer runs cancel older ones in the same group).

---

## Planned Work (from TODO.md)

Use this section to understand intent when contributing. These are active areas of improvement:

### Cosmetic / UI
- Fix mobile menu link layout bug.
- Style inline code (backtick spans) to stand out visually.
- Add background colour to `advice` shortcode boxes.

### Content
- Translate the "Welcome Zola" post to French.
- Improve the 404 page.
- Consider a more advanced landing page (CSS animations, WebGL/WebAssembly — keep browser support in mind).
- Evaluate Algolia for search (`build_search_index` is already `false` anticipating this).
- Split `section.html` into separate templates for the blog and the podcast.
- Fix post navigation arrow direction inconsistency (section list and single post disagree on which direction is "older"/"newer").

### Accessibility (A11Y)
- Audit and fix remaining accessibility issues.

### Technical debt
- **HTML**: Remove unnecessary wrapper elements; audit every `| safe` filter use.
- **CSS**:
  - Standardise on `rem` for all sizing.
  - Remove dead rules.
  - Improve cross-browser compatibility.
  - Decide and apply BEM or tag-based naming consistently.
  - Split CSS per page/section to load only what is needed.
  - Inline critical styles via a macro (`inline_style`).
  - Add a CSS reset.
- **Other**:
  - Rename i18n translation keys to be more consistent.
  - Replace HTML comments with Tera comments `{# #}` throughout templates.
  - Run a [Mozilla Observatory](https://observatory.mozilla.org/analyze/brack0.dev) security audit and add a badge to the README.

---

## Key Principles

1. **No Node.js, no npm, no node_modules.** Zola handles everything. Do not add JavaScript dependencies or a build step.
2. **Bilingual by default.** Every user-visible string must have both English and French translations in `config.toml`. New content should ideally have a `.fr.md` companion.
3. **Minimal JavaScript.** The only JS is the theme toggle. New features should be implemented in HTML/CSS first.
4. **Semantic HTML.** Keep the DOM clean and meaningful. Avoid unnecessary wrapper elements.
5. **Accessibility first.** Ensure colour contrast, keyboard navigation, and ARIA attributes are correct.
6. **Template comments only.** Use `{# #}` in Tera templates, never `<!-- -->`.
7. **Respect the existing style.** Match naming, formatting, and architecture patterns already in use in each file before introducing new ones.
