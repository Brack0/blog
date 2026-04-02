# Contributing

Thank you for your interest in contributing to this project! This is a personal blog, so contributions are scoped to **technical improvements only**.

---

## What is welcome

- **Security fixes** — If you spot a vulnerability (e.g. in templates, configuration, or dependencies), please report it responsibly (see [Reporting a security issue](#reporting-a-security-issue) below).
- **Visual bugs** — Layout regressions, broken styles, rendering issues across browsers or screen sizes.
- **Typos and grammar** — Spelling or grammatical errors in templates, UI strings (`config.toml` translations), or documentation files.
- **Accessibility** — Contrast issues, missing ARIA attributes, keyboard navigation problems.
- **Build/CI issues** — Broken workflows, Zola configuration errors.

## What is not welcome

- **Content suggestions** — What to write about, which topics to cover, or how to phrase my opinions.
- **Personal feedback** — Comments about me, my choices, or my point of view.
- **New features** — Unsolicited feature additions beyond what is already planned; open an issue to discuss first.

---

## Reporting a security issue

Please **do not** open a public issue for security vulnerabilities. Instead, use [GitHub's private vulnerability reporting](https://github.com/Brack0/blog/security/advisories/new) to disclose the issue privately.

---

## Opening an issue

Before opening an issue, check that:

1. The bug is reproducible with the latest commit on `main`.
2. No existing issue already tracks the same problem.

When filing a bug, include:

- A clear description of the problem.
- Steps to reproduce it (browser, OS, screen size if relevant).
- A screenshot or recording if the issue is visual.

---

## Submitting a pull request

1. Fork the repository and create a branch following the naming convention: `<type>/<short-description>` (e.g. `fix/mobile-menu-overlap`, `chore/update-zola`).
2. Keep changes **small and focused** — one logical fix per PR.
3. Run `zola check` locally to make sure nothing is broken.
4. Write a clear PR description explaining what was changed and why.
5. Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>(scope): <description>`.

### Local development

```sh
# Start the dev server (overrides the /blog base_url for local preview)
zola serve -u /

# Validate links and configuration
zola check
```

Requires [Zola v0.18.0](https://www.getzola.org/documentation/getting-started/installation/).
There is no Node.js, npm, or any JavaScript build step involved.

---

## Style guidelines

- **Templates** — Use `{# #}` for comments, never `<!-- -->`. Keep whitespace trimming (`{%-`/`-%}`) consistent with surrounding code.
- **SCSS** — Follow the hybrid naming methodology in use:
  - **BEM for components**: use `block__element` and `block--modifier` for component-specific classes (e.g. `.header__logo`, `.post--regulation`, `.button__text`).
  - **Tag-based for global defaults**: use plain element selectors (`h1`, `a`, `table`, `code`, etc.) to set base typography and element resets; do not add classes to these.
  - **`%placeholder` + `@extend`**: use SCSS placeholder selectors for shared style fragments within a component (e.g. `%meta` in `post.scss`).
  - Use CSS custom properties from `color.scss` instead of hard-coded colour values.
- **i18n** — Any user-visible string added to a template must have both an English and a French entry in `config.toml`.

---

All contributions are reviewed by the repository owner. By submitting a pull request you agree that your contribution may be used under the terms of the project's [license](LICENSE.md).
