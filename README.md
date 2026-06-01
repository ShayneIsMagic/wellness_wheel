# Harbor Compass

A single-page wellness reflection tool based on the **Stanford WELL for Life** ten domains. Users work through a visual wheel, dimension wizards, vision statements, focused actions, and a simple budget view. All progress is saved in the browser (localStorage); nothing is sent to a server unless you add analytics later.

## Running locally

From the project root:

```bash
npm run dev
```

Or without npm:

```bash
npx --yes serve .
```

Then open `http://localhost:3000` (or the URL shown in the terminal).

## Project structure

```
/
├── index.html          # App entry
├── css/main.css        # Shared styles
├── js/main.js          # App logic
├── assets/             # Icons and images (when added)
├── 404.html            # Not found (for static hosts)
├── AGENTS.md           # Guidelines for AI agents and contributors
├── archive/            # Legacy single-file build (reference only)
└── README.md
```

## Git workflow

When multiple people work in this repo:

1. Branch from `main` using `<initials>/harbor-compass` (example: `sr/harbor-compass`).
2. Make changes on that branch.
3. Open a pull request into `main`; merge when reviewed.
4. `main` deploys automatically to GitHub Pages (see below).

## Share with a link (public hosting)

This site is static HTML/CSS/JS — no backend required. The recommended way to give **anyone with a link** access is **GitHub Pages**.

### One-time setup

1. Create a GitHub repository and push this project to `main`.
2. On GitHub: **Settings → Pages → Build and deployment**
   - **Source:** GitHub Actions
3. Push to `main`. The workflow in `.github/workflows/deploy-pages.yml` publishes the site.
4. Your public URL will look like:
   - `https://<username>.github.io/<repo-name>/`
   - Or a custom domain if you configure one under Pages settings.

After setup, every push to `main` updates the live site. Share that URL with anyone who should use Harbor Compass.

### Other hosts

You can also deploy the same folder to [Netlify](https://www.netlify.com/), [Cloudflare Pages](https://pages.cloudflare.com/), or any static file host. Upload the repo root (not `archive/`). Set the publish directory to `/` and `index.html` as the entry.

## Privacy note

User reflections and scores stay in **localStorage** on each device. Export/backup JSON is downloaded only when the user chooses. Document this when sharing the public link.

## Documentation

See [AGENTS.md](./AGENTS.md) for HTML/CSS/JS conventions, accessibility expectations, and agent build guidelines.
