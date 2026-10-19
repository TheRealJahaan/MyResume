// Builds the static site into dist/: validates data, renders HTML, copies assets.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderPage } from './render.mjs';
import { validateResume } from './validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

// SITE_URL is set by the Pages workflow; locally the page works without it.
const siteUrl = process.env.SITE_URL?.replace(/\/?$/, '/') ?? '';

const resume = JSON.parse(await readFile(join(root, 'data', 'resume.json'), 'utf8'));
const errors = validateResume(resume);
if (errors.length) {
  console.error(`data/resume.json has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(join(root, 'public'), out, { recursive: true });

// Self-host Inter so the page and the PDF render identically on every machine and CI runner.
const fonts = join(root, 'node_modules', '@fontsource-variable', 'inter', 'files');
await mkdir(join(out, 'fonts'), { recursive: true });
for (const file of ['inter-latin-wght-normal.woff2', 'inter-latin-wght-italic.woff2']) {
  await cp(join(fonts, file), join(out, 'fonts', file));
}
await writeFile(join(out, 'index.html'), renderPage(resume, { siteUrl }));
await writeFile(join(out, 'resume.json'), JSON.stringify(resume, null, 2));
await writeFile(join(out, '.nojekyll'), '');
await writeFile(
  join(out, 'robots.txt'),
  `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}sitemap.xml\n` : ''}`,
);
if (siteUrl) {
  await writeFile(
    join(out, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`,
  );
}
console.log(`Built dist/ for ${resume.basics.name}${siteUrl ? ` (${siteUrl})` : ''}`);
