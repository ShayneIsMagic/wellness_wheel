# AGENTS Guidelines — Attitude Cycle (Static HTML / CSS / JS)

Guidelines for this repository: a **plain static site** (no React, no Flask, no backend). Landing page plus interactive tools under `tools/`. Read this file before modifying or extending the codebase.

**Default to asking.** Prefer more questions over fewer. If scope, design, content, analytics, forms, or hosting are partly specified or ambiguous — ask, even when questions overlap. Redundant confirmation beats silent assumptions and rework.

---

## Shared Rules

### Plan first
- Create a plan and share it with the user **before making changes**.
- Wait for explicit approval before proceeding unless the user asked for a direct fix.

### Dev server
- Use a local dev server while iterating (`npm run dev` or `npx --yes serve .`). **Do not run a production build during an agent session** unless the user explicitly asks.
- Check whether a server is already running on the expected port before starting another. If one exists, stop it first.
- When in doubt, restart the dev server rather than debugging a stale state.

### Dependencies
- **Ask the user before installing** any new library or package.
- After any install, update `package-lock.json` if applicable.

### Existing code first
- Search the repo before creating new files, patterns, or duplicate logic.
- Match naming, structure, and conventions already in the project.
- Reuse `tools/_template/` when adding a new tool.

### Security
- Use HTTPS for all links and resources. No mixed content.
- Use `rel="noopener noreferrer"` on all `target="_blank"` links.
- Avoid inline JavaScript (`onclick`, `onload`, etc.) — use external scripts and event delegation.
- Never hardcode secrets, API keys, or tokens.
- Sanitize and validate user input in any form or dynamic UI. **Never trust client-side validation alone** if a server endpoint is added later.

### Documentation
- Prefer **1–3 core `.md` files** (README, AGENTS). No sprawl.
- Add to existing docs when guidance is needed; do not duplicate rules across README and AGENTS.
- Update README with site name, description, and exact local run commands when those change.

### Git
- Follow the workflow in [README.md](./README.md): branch from `main` (e.g. `<initials>/feature-name`), merge via PR when multiple contributors; solo work may commit to `main` when the user requests.
- Do not commit unless the user asks.

---

## This Project — Attitude Cycle

### Site map

| Path | Purpose |
|------|---------|
| `/` (`index.html`) | Brand landing — Attitude as the soil of every stage |
| `/tools/purpose-driven/` | Purpose Driven Exercise (Five Stages) |
| `/tools/harbor-compass/` | Harbor Compass — wellness wheel, vision, actions, **Fund the Life** budget |

### File structure (canonical)

```
/
├── index.html
├── tools/
│   ├── purpose-driven/       # index.html + assets
│   ├── harbor-compass/       # index.html, css/, js/
│   └── _template/            # copy when adding a tool
├── 404.html
├── robots.txt
├── .github/workflows/        # GitHub Pages deploy
├── README.md
└── AGENTS.md
```

Do **not** assume `pages/about.html` or `components/header.html` unless the user asks for that layout.

### Privacy and data
- Tool progress (wheel, reflections, budget, etc.) is stored in **`localStorage` in the user's browser only** (e.g. `harbor-compass-v1`). Nothing is sent to a server by default.
- Do not add server-side storage without an explicit user request and privacy review.
- Document local-only behavior when adding forms or analytics.

### New tool checklist
1. Copy `tools/_template/` → `tools/<tool-name>/`
2. Build the tool (prefer `index.html` at folder root for clean URLs)
3. Add links on root `index.html` (landing nav + CTAs)
4. Add cross-links: back to `../../index.html`, sibling tools under `../`
5. Update README site map if the tool is public-facing

### Deploy
- **Canonical repo:** [attitude_cycle](https://github.com/ShayneIsMagic/attitude_cycle) (this tree may also push to `wellness_wheel` during transition).
- GitHub Pages via `.github/workflows/deploy-pages.yml` on push to `main`.
- Custom domain: `attitudecycle.com` / `tools.attitudecycle.com` — Cloudflare CNAME target must be **`shayneismagic.github.io` only** (no URL paths in DNS).

### Sync note
Harbor Compass source of truth is **`tools/harbor-compass/`** in this repo. Do not maintain a duplicate copy in [ZBTools](https://github.com/ShayneIsMagic/ZBTools) (archived).

---

## Before Starting a Build

Confirm **before** locking `:root` variables, layout, or copy:

- Fonts (names, weights, files)
- Color palette (hex or tokens)
- Logo and brand assets
- Pages, sections, and tool list
- Forms — fields, endpoint (Formspree, Netlify Forms, etc.), captcha
- Analytics — GTM container ID, or none
- Hosting — URL structure, redirects, `404.html`
- Accessibility and SEO priorities

If unavailable, use clearly marked placeholders and list what is still needed.

---

## Suggested Build Order

1. Create file structure (`tools/<name>/`, shared `css/`, `js/`, `assets/` as needed)
2. Shared styles and scripts; reference from each page
3. Consistent header/footer/nav across pages (copy or build step)
4. Add pages using Common Patterns below
5. GTM placeholder only if needed — `window.dataLayer = window.dataLayer || [];` before GTM loads
6. `404.html` with link home and tool links
7. Update README (name, description, run commands)
8. Commit and push when the user asks

---

## When Fixing an Existing Site

**Audit order:**
1. Security and accessibility — never defer
2. Structure — shared CSS/JS, consistent nav across tools
3. Tracking — remove duplicate GTM/gtag; fix `dataLayer` init order
4. Dead code — remove orphaned DOM queries/listeners when markup changes (null checks alone are not a fix)

**Specific fixes:**
- Migrate inline `onclick` to `data-*` + event delegation
- Move tracking out of inline `<script>` into external files or IIFEs
- Consolidate duplicate CSS into shared stylesheets per tool

**Done when:**
- [ ] QA Checklist below passes for affected pages
- [ ] No inline `onclick` in changed markup
- [ ] No duplicate GTM/gtag on touched pages
- [ ] No orphaned JS for removed elements
- [ ] HTTPS / `noopener` on external links

---

## Best Practices

### HTML
- Semantic markup: `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`.
- `<!DOCTYPE html>`, `<html lang="en">`, `<meta charset="utf-8">`, viewport meta first in `<head>`.
- Skip link (`href="#main"`) and `id="main"` on `<main>`.
- `aria-label` where needed; `alt` on images; `aria-expanded` on toggles; keyboard support (Enter/Space, Escape, arrows).
- Visible focus states; WCAG AA contrast (4.5:1 text, 3:1 large text).
- Absolute URLs for `og:image`, `twitter:image`, `canonical` when used.
- Favicon and `apple-touch-icon` when available.
- Every input has an associated `<label>` (`for`/`id` or wrap).
- `rel="noopener noreferrer"` on `target="_blank"`.

### CSS
- External stylesheets via `<link>`; avoid duplicating large blocks across pages.
- `:root` CSS variables for colors, spacing, typography.
- Consistent breakpoints (e.g. 768px, 1024px).
- Avoid `!important` unless truly necessary.
- Consistent class names site-wide (e.g. BEM-style where established).

### JavaScript
- External `.js` for non-trivial or reused logic; `defer` or end of `<body>`.
- `data-*` + event delegation; one init path per interaction type.
- IIFEs/modules; `const` / `let`; DOM work after `DOMContentLoaded`.
- Null-check DOM lookups; **remove** dead code when elements are removed.
- Debounce/throttle scroll, resize, and heavy input handlers.
- `window.dataLayer = window.dataLayer || [];` before GTM.
- No `alert()` for feedback — inline messages or in-app UI.
- Form: validate before submit; handle fetch errors; static sites need a real endpoint or documented JS handler.

### SEO and Google Tag Manager
- Unique `<title>` and `<meta name="description">` per page.
- One `<h1>` per page; logical heading hierarchy (no skips).
- JSON-LD when content fits a schema — **Organization** / **WebSite** on home; other types only when accurate. Inline `<script type="application/ld+json">` in HTML; not JS-injected alone for crawlers. [Rich Results Test](https://search.google.com/test/rich-results) when beyond basics.
- Lowercase hyphenated URLs; descriptive internal link text.
- GTM early in `<head>` after charset/viewport; noscript iframe in `<body>`.
- **Do not** load GTM and separate `gtag.js` on the same page.
- `robots.txt` and `sitemap.xml` when the site should be indexed.

### Component reusability
- Repeat header/footer/nav consistently; `aria-current="page"` or `.active` for current tool.
- Reusable classes for buttons, cards, grids, forms.
- One pattern per interaction type (accordion, modal, tabs) within a tool.

### Performance
- `loading="lazy"` below the fold; explicit `width`/`height` on images.
- `srcset`/`sizes` and WebP/AVIF when multiple resolutions exist.
- `fetchpriority="high"` only on critical hero images.
- Preload key fonts; `font-display: swap` or `optional`.
- `preconnect` for fonts and analytics origins.
- `preload="none"` on non-critical video.

### Browser support
- Last 2 major versions of Chrome, Safari, Edge, Firefox.
- Mobile-first; `min-width` media queries for larger screens.
- `@supports` or fallbacks when needed.

### Development workflow
- Local server before deploy.
- Lowercase hyphenated filenames (`hero-banner.webp`, `contact-form.html`).
- Short names (`nav`, `btn`) are fine when clear.

### Common patterns

| Pattern | Usage |
|---------|--------|
| **Hero block** | Headline + supporting text + CTA; above the fold |
| **Testimonial card** | Quote, attribution, optional photo |
| **CTA button** | Primary and secondary variants; consistent sizing |
| **Accordion / FAQ** | `<details>`/`<summary>` or ARIA; keyboard accessible |
| **Contact form** | Labeled fields; captcha if needed; endpoint for user to configure |
| **Tool directory** | Landing lists tools with clear links to `/tools/<name>/` |

---

## QA Checklist

**Code review (before browser):**
- [ ] `<!DOCTYPE html>` and `lang` on every touched page
- [ ] Skip link + `id="main"` on `<main>`
- [ ] Form inputs have `<label>` associations
- [ ] Favicon / touch icon if site provides them
- [ ] No duplicate GTM/gtag; `dataLayer` initialized first
- [ ] Absolute URLs for OG/Twitter/canonical when used
- [ ] `target="_blank"` links have `rel="noopener noreferrer"`
- [ ] No inline `onclick`; delegation used
- [ ] README accurate for run commands and site map
- [ ] Internal links resolve (especially `tools/` paths)

**Accessibility (in browser):**
- [ ] Skip link visible on focus
- [ ] Tab through interactive elements; focus visible
- [ ] Keyboard operable menus/toggles
- [ ] Alt text; `alt=""` on decorative images
- [ ] One `<h1>`; no skipped heading levels
- [ ] Contrast acceptable (AA target)

**Layout (in browser):**
- [ ] 375px, 768px, 1280px+ — no broken overflow
- [ ] Nav consistent landing ↔ tools
- [ ] Harbor Compass: budget rollup and buckets update when income/expenses change

**Cross-browser (spot check):**
- [ ] Chrome (primary)
- [ ] Safari (fonts, flex, CSS variables)
- [ ] Firefox / Edge as needed

**Interactive tools (Harbor Compass / similar):**
- [ ] localStorage save/restore works in same browser
- [ ] Export/import JSON backup works
- [ ] Reset clears expected state
- [ ] No console errors on tab/pane switches

**Forms (if added):**
- [ ] Endpoint works end to end
- [ ] Success and error states shown
- [ ] Required validation before submit

**Tracking (if GTM added):**
- [ ] Preview mode; no double pageviews
- [ ] `dataLayer.push` visible in debug

**Performance (before major release):**
- [ ] Lighthouse: Accessibility and SEO ≥ 90 where applicable
- [ ] Lazy-load only below-the-fold images

**404:**
- [ ] Unknown URL serves `404.html` on the host

---

## Anti-Patterns

### HTML

| Avoid | Do instead |
|-------|------------|
| Repeating header/footer without a plan | Consistent copy or includes/build step |
| Relative OG/Twitter/canonical URLs | Absolute URLs |
| Inline presentation CSS | Classes; inline only for runtime values |
| Skipped heading levels | h1 → h2 → h3 |
| Generic or missing alt | Descriptive alt; `alt=""` decorative |
| "Click here" links | Descriptive anchor text |
| Inputs without labels | `for`/`id` or wrap |
| `action="#"` with no JS fallback | Real endpoint or documented handler |
| Clickable elements without pointer affordance | `cursor: pointer` on custom controls |

### CSS

| Avoid | Do instead |
|-------|------------|
| Duplicated CSS across pages | Shared stylesheet per tool/site |
| Hardcoded colors mixed with variables | Variables consistently |
| Conflicting breakpoints + `!important` | One breakpoint system |
| Undefined classes in HTML | Define or remove |
| Inconsistent names (`.lbl` vs `.label`) | Same names site-wide |

### JavaScript

| Avoid | Do instead |
|-------|------------|
| Inline `onclick` everywhere | `data-*` + delegation |
| Global tracking on `window` | IIFE / external file |
| `dataLayer.push` without init | `window.dataLayer = window.dataLayer \|\| []` |
| DOM queries for removed elements | Remove dead code |
| Duplicated handler logic | Single init module |
| Same script pasted on every page | Shared `main.js` |
| `alert()` for UX | Inline messages / in-app UI |
| Sync scripts blocking `<head>` | `defer` or end of `<body>` |

### Project-specific

| Avoid | Do instead |
|-------|------------|
| New repo per tool | New folder under `tools/` |
| CNAME with path (`github.io/wellness_wheel/`) | CNAME → `shayneismagic.github.io` only |
| Assuming React/Flask structure | This repo is static HTML only |
| Editing ZBTools as canonical | Edit this repo |

---

## Quick Reference

DOCTYPE + lang · semantic HTML · skip-link + `id="main"` · a11y (aria, alt, focus, labels, contrast) · favicon · `noopener` on `_blank` · HTTPS · external CSS/JS · delegation not onclick · remove dead DOM code · absolute social URLs · JSON-LD inline when appropriate · mobile-first · `dataLayer` before GTM · no duplicate GTM/gtag · lazy images · debounce heavy handlers · **`tools/` layout** · **localStorage = private per browser** · plan first · ask before new packages · QA before done.

---

*When in doubt: ask the user, check existing code in this repo, restart the dev server, and keep Attitude Cycle as one static site with tools under `tools/`.*
