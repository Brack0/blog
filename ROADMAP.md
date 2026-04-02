# Roadmap

## Overview

This roadmap outlines the direction for the blog. Items are organized by priority and timeline.

**⚠️ Note**: A visual redesign (new theme) is planned; avoid investing in layout/theme elements that may change soon.

## High Priority

### Theme Redesign

- **Status**: Planned
- **Description**: Create a new visual theme from scratch
- **Impact**: High (affects all pages)
- **Blocked by**: None
- **Unblocks**: Most cosmetic and CSS work
- **ETA**: TBD

## In Progress / Next

### Content Improvements

- [ ] Translate "Welcome to Zola" article to French
- [ ] Improve 404 page design and messaging
- [ ] Fix pagination arrow direction inconsistency
  - At the end of section (articles/fec): `→` for older, `←` for newer
  - At the end of a post: `←` for older, `→` for newer
- [ ] Remove automatic pagination (`paginate_by`) from articles and FEC sections

### Accessibility

- [ ] Fix remaining accessibility issues
  - Audit contrast ratios
  - Verify keyboard navigation
  - Review ARIA attributes

### Template & Markup

- [ ] Clean up unnecessary HTML tags (simplify DOM structure)
- [ ] Audit and fix `| safe` filters (currently missing some, others unnecessary)
- [ ] Add inline style documentation (Tera comments only; no HTML comments in production)

### Site Quality & Monitoring

- [ ] Run Mozilla Observatory analysis: <https://observatory.mozilla.org/analyze/blog.brack0.dev>
- [ ] Add Observatory badge to README
- [ ] Ensure consistent visuals across browsers

## Medium Priority

### Styling & CSS Architecture

- [ ] Standardize spacing units (0.5rem, 2rem, 8rem instead of 10px, 40px, 150px)
- [ ] Remove unused CSS rules
- [x] Decide on naming methodology: BEM vs. tag-based
- [ ] Split CSS for better code organization
- [ ] Consider CSS reset: <https://keithjgrant.com/posts/2024/01/my-css-resets/>
- [ ] Implement inline style injection (Tera macro)

### Configuration & i18n

- [ ] Rename translation keys to follow consistent convention
- [ ] Document key naming strategy

## Status Legend

- **Done** — Shipped
- **In Progress** — Currently being worked on
- **Next** — Planned for the next cycle
- **On Hold** — Blocked or awaiting other work
- **Planned** — Scheduled but not yet started
