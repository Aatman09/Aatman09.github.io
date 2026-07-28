# aatman09.github.io

Personal portfolio site — Next.js (App Router, static export) deployed to GitHub Pages.

## Structure

```
src/data/projects.ts     single source of truth for all project content
src/data/experience.ts   SilverTouch internship content
src/app/page.tsx         home — hero, skills, project grid, experience teaser
src/app/projects/[slug]  one deep-dive page per project, generated from projects.ts
src/app/experience       SilverTouch internship deep dive
```

Project content should stay consistent with `career-outputs/aatman-cv.html` and the
project READMEs (`achat/README.md`, `gemma2-quant/README.md`) — no invented metrics.

## Develop

```bash
npm run dev
```

## Build (static export)

```bash
npm run build   # outputs to ./out
```

`next.config.ts` sets `output: 'export'` — GitHub Pages serves static files only, no
Node server.

## Deploy

Push to `main`. `.github/workflows/deploy.yml` builds and deploys to GitHub Pages
automatically. One-time manual step: in the repo's Settings → Pages, set the source to
"GitHub Actions".
