# Jahaan Suthar · Resume

[![CI](https://github.com/TheRealJahaan/MyResume/actions/workflows/ci.yml/badge.svg)](https://github.com/TheRealJahaan/MyResume/actions/workflows/ci.yml)
[![Deploy](https://github.com/TheRealJahaan/MyResume/actions/workflows/deploy.yml/badge.svg)](https://github.com/TheRealJahaan/MyResume/actions/workflows/deploy.yml)

**Live:** https://therealjahaan.github.io/MyResume/ · **PDF:** https://therealjahaan.github.io/MyResume/Jahaan_Suthar_Resume.pdf

My resume as code. One JSON file is the single source of truth; a tiny zero-dependency Node build turns it into a fast, accessible web page, and headless Chromium prints the same page to a one-page A4 PDF. Every push to `main` rebuilds and redeploys both.

## Highlights

- **Single source of truth.** Edit [`data/resume.json`](data/resume.json) (based on the [JSON Resume](https://jsonresume.org/schema) schema) and the website, PDF, JSON-LD and machine-readable `resume.json` all update together.
- **No framework, no runtime dependencies.** Plain HTML and CSS rendered at build time. The only JavaScript is an optional theme toggle and print button; the page works fully without it.
- **Print-perfect.** A dedicated print stylesheet produces a clean, ATS-friendly, selectable-text PDF. CI fails if new content pushes it past one page.
- **Light and dark themes** that follow the system setting, with a remembered manual toggle.
- **Accessible and SEO-ready.** Semantic landmarks, skip link, visible focus states, reduced-motion support, Open Graph tags, `schema.org/Person` JSON-LD, sitemap and robots.txt.
- **Safe by construction.** Every value from the data file is HTML-escaped, and the JSON-LD is escaped so it cannot break out of its `<script>` tag. Both are covered by tests.
- **Quality gates.** Unit tests (`node:test`), data validation, Prettier and `html-validate` run on every pull request.

## Project structure

```
data/resume.json        ← the only file you normally edit
src/validate.mjs        data validation (dates, URLs, required fields)
src/render.mjs          pure functions: data → HTML
src/build.mjs           writes dist/ (HTML, assets, sitemap, robots, resume.json)
scripts/pdf.mjs         prints dist/index.html to dist/Jahaan_Suthar_Resume.pdf
public/                 static assets copied as-is (CSS, JS, favicon)
test/                   unit tests
docs/                   the original Canva resume, kept for reference
.github/workflows/      CI on pull requests, deploy to GitHub Pages on main
```

## Run it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev          # builds and serves dist/ at http://localhost:3000
npm test             # unit tests + data validation
npm run lint         # Prettier + HTML validation (run after build)

# Optional: generate the PDF locally
npx playwright install chromium
npm run pdf
```

## Updating the resume

1. Edit `data/resume.json`.
2. Run `npm test && npm run build && npm run pdf` and open `dist/index.html`.
3. Commit and push to `main`. GitHub Actions rebuilds and redeploys the site and PDF.

## Deployment

The site deploys to **GitHub Pages** through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

One-time setup: in the repository go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**. After that, every push to `main` publishes automatically.

Because the output is a plain static folder (`dist/`), it also deploys anywhere else with no changes:

| Host           | Build command                                                                                  | Output |
| -------------- | ---------------------------------------------------------------------------------------------- | ------ |
| Netlify/Vercel | `npm run build` (add `npx playwright install --with-deps chromium && npm run pdf` for the PDF) | `dist` |
| Custom domain  | Add the domain under Settings → Pages and point a `CNAME` record at `therealjahaan.github.io`  |        |

## License

The code (everything outside `data/` and `docs/`) is MIT licensed, so feel free to reuse it for your own resume. The resume content itself is © Jahaan Suthar.
