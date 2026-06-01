# Attitude Cycle

Static site for [Attitude Cycle](https://attitudecycle.com) — brand landing plus interactive tools. Each tool lives in its own folder under `tools/` so new ones can be added without new repos.

## Site map

| URL path | Tool |
|----------|------|
| `/` | **Landing** — Attitude as the soil of every stage |
| `/tools/purpose-driven/` | **Purpose Driven Exercise** — Five Stages (Why · What · How · When · Who) |
| `/tools/harbor-compass/` | **Harbor Compass** — Wellness wheel, ten dimensions, vision, actions, budget |

More tools: copy `tools/_template/` and register on `index.html`.

## Running locally

```bash
npm run dev
# or: npx --yes serve .
```

Open http://localhost:3000

## Deploy

Push to `main` → GitHub Actions (`.github/workflows/deploy-pages.yml`) publishes GitHub Pages.

- **Default URL:** `https://shayneismagic.github.io/wellness_wheel/` until the repo is renamed or a custom domain is set
- **Custom domain:** Settings → Pages → set `attitudecycle.com` (and update Cloudflare `@` / `www` to GitHub Pages)

## Repo layout

```
/
├── index.html
├── tools/
│   ├── purpose-driven/
│   ├── harbor-compass/
│   └── _template/
├── 404.html
├── AGENTS.md
└── archive/
```

## Privacy

Tool data is stored in the browser (`localStorage`) unless the user exports a backup. Nothing is sent to a server by default.

## Legacy repos

- [ZBTools](https://github.com/ShayneIsMagic/ZBTools) — retired; use this repo instead.
