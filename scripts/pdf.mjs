// Prints dist/index.html to an A4 PDF with headless Chromium so the PDF always matches the data.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const page = join(dist, 'index.html');
if (!existsSync(page)) {
  console.error('dist/index.html not found, run `npm run build` first.');
  process.exit(1);
}

const executablePath = process.env.CHROMIUM_PATH || undefined;
const browser = await chromium.launch({ executablePath });
try {
  const tab = await browser.newPage();
  await tab.emulateMedia({ media: 'print', colorScheme: 'light' });
  await tab.goto(pathToFileURL(page).href, { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.pdf({
    path: join(dist, 'Jahaan_Suthar_Resume.pdf'),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });
  // Recruiters expect a one-page resume; fail loudly if new content pushes it onto a second page.
  const pdf = readFileSync(join(dist, 'Jahaan_Suthar_Resume.pdf'), 'latin1');
  const pages = pdf.match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
  const maxPages = Number(process.env.MAX_PAGES ?? 1);
  console.log(`Wrote dist/Jahaan_Suthar_Resume.pdf (${pages} page${pages === 1 ? '' : 's'})`);
  if (pages > maxPages) {
    console.error(`PDF has ${pages} pages, limit is ${maxPages}. Trim data/resume.json or set MAX_PAGES.`);
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
