// Pure rendering functions: resume data in, HTML string out.
// Everything user-supplied goes through esc() so the data file can never inject markup.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatDate(date) {
  if (!date) return '';
  const [year, month] = date.split('-');
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

export function formatRange(start, end) {
  if (!start && !end) return '';
  const from = formatDate(start);
  const to = end ? formatDate(end) : 'Present';
  if (!start) return to;
  return from === to ? from : `${from} – ${to}`;
}

const machineDate = (d) => (d ? ` datetime="${esc(d)}"` : '');

function timeRange(start, end, { ongoing = true } = {}) {
  const text = ongoing ? formatRange(start, end) : formatRange(start, end ?? start);
  if (!text) return '';
  return `<span class="when"><time${machineDate(start)}>${esc(text)}</time></span>`;
}

const list = (items, cls = 'bullets') =>
  items?.length ? `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '';

const ICONS = {
  GitHub:
    '<path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>',
  LinkedIn:
    '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/>',
  Portfolio:
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8ZM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96ZM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26Zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.07 16Zm2.95-8H5.07a7.99 7.99 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.02 8ZM12 19.96A14 14 0 0 1 10.09 16h3.82A14 14 0 0 1 12 19.96ZM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4Zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56ZM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4h-3.38Z"/>',
  Email:
    '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-8 5-8-5V6l8 5 8-5v2.24Z"/>',
};

const icon = (name) =>
  ICONS[name] ? `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>` : '';

function renderContacts(basics) {
  const items = [];
  if (basics.email) {
    items.push(`<li><a href="mailto:${esc(basics.email)}">${icon('Email')}<span>${esc(basics.email)}</span></a></li>`);
  }
  for (const p of basics.profiles ?? []) {
    const label = p.network === 'Portfolio' ? p.username : `${p.network}`;
    items.push(
      `<li><a href="${esc(p.url)}" rel="me noopener" target="_blank">${icon(p.network)}<span>${esc(label)}</span></a></li>`,
    );
  }
  if (basics.location?.region) items.push(`<li class="plain"><span>📍 ${esc(basics.location.region)}</span></li>`);
  return `<ul class="contacts">${items.join('')}</ul>`;
}

function section(id, title, body) {
  if (!body) return '';
  return `<section id="${id}" aria-labelledby="${id}-h"><h2 id="${id}-h">${esc(title)}</h2>${body}</section>`;
}

function renderWork(work = []) {
  return work
    .map(
      (w) => `<article class="entry">
  <header><h3>${esc(w.position)}</h3>${timeRange(w.startDate, w.endDate)}</header>
  <p class="org">${esc(w.name)}</p>
  ${list(w.highlights)}
</article>`,
    )
    .join('');
}

function renderEducation(education = []) {
  return education
    .map(
      (e) => `<article class="entry">
  <header><h3>${esc(e.institution)}</h3>${timeRange(e.startDate, e.endDate)}</header>
  <p class="org">${esc([e.studyType, e.area].filter(Boolean).join(' in '))}${e.score ? ` · <strong>${esc(e.score)}</strong>` : ''}</p>
</article>`,
    )
    .join('');
}

function renderProjects(projects = []) {
  return `<div class="cards">${projects
    .map(
      (p) => `<article class="card">
  <header><h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h3>${timeRange(p.startDate, p.endDate, { ongoing: false })}</header>
  ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ''}
  ${list(p.highlights)}
  ${list(p.keywords, 'tags')}
</article>`,
    )
    .join('')}</div>`;
}

function renderSkills(skills = [], languages = []) {
  const rows = skills.map(
    (s) => `<div class="skill-row"><dt>${esc(s.name)}</dt><dd>${list(s.keywords, 'tags')}</dd></div>`,
  );
  if (languages.length) {
    rows.push(
      `<div class="skill-row"><dt>Languages</dt><dd>${list(
        languages.map((l) => l.language),
        'tags',
      )}</dd></div>`,
    );
  }
  return `<dl class="skills">${rows.join('')}</dl>`;
}

export function jsonLd(resume) {
  const b = resume.basics;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: b.name,
    jobTitle: b.label,
    email: b.email ? `mailto:${b.email}` : undefined,
    url: b.url,
    sameAs: (b.profiles ?? []).map((p) => p.url),
    alumniOf: (resume.education ?? []).map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    knowsAbout: (resume.skills ?? []).flatMap((s) => s.keywords),
  };
  // Escape "<" so the JSON can never close the surrounding <script> tag.
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}

export function renderPage(resume, { siteUrl = '', pdfPath = 'Jahaan_Suthar_Resume.pdf', builtAt = new Date() } = {}) {
  const b = resume.basics;
  const title = `${b.name} · ${b.label}`;
  const description = b.summary.split('. ')[0].replace(/\.$/, '') + '.';
  const canonical = siteUrl ? `<link rel="canonical" href="${esc(siteUrl)}" />` : '';
  const ogUrl = siteUrl ? `<meta property="og:url" content="${esc(siteUrl)}" />` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="author" content="${esc(b.name)}" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" content="#0b1020" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#f7f8fb" media="(prefers-color-scheme: light)" />
${canonical}
<meta property="og:type" content="profile" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
${ogUrl}
<meta name="twitter:card" content="summary" />
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
<link rel="preload" href="fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="styles.css" />
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<script type="application/ld+json">${jsonLd(resume)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="toolbar no-print" role="toolbar" aria-label="Page actions">
  <a class="btn primary" href="${esc(pdfPath)}" download>Download PDF</a>
  <button class="btn" type="button" data-action="print">Print</button>
  <button class="btn icon-btn" type="button" data-action="theme" aria-label="Toggle dark mode" title="Toggle dark mode"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18V4a8 8 0 0 1 0 16Z"/></svg></button>
</div>
<main id="main" class="sheet">
  <header class="hero">
    <h1>${esc(b.name)}</h1>
    <p class="label">${esc(b.label)}${b.headline ? ` <span class="sep">·</span> ${esc(b.headline)}` : ''}</p>
    ${renderContacts(b)}
  </header>
  ${section('summary', 'Summary', `<p class="summary">${esc(b.summary)}</p>`)}
  ${section('experience', 'Experience', renderWork(resume.work))}
  ${section('education', 'Education', renderEducation(resume.education))}
  ${section('projects', 'Projects', renderProjects(resume.projects))}
  ${
    resume.current
      ? section(
          'current',
          'Currently Working On',
          `<article class="entry"><header><h3>${esc(resume.current.name)}</h3></header><p>${esc(resume.current.description)}</p></article>`,
        )
      : ''
  }
  ${section('skills', 'Skills', renderSkills(resume.skills, resume.languages))}
</main>
<footer class="foot no-print">
  <p>Built from <a href="https://github.com/TheRealJahaan/MyResume">data/resume.json</a> · Updated <time datetime="${builtAt.toISOString().slice(0, 10)}">${builtAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</time></p>
</footer>
<script src="app.js" defer></script>
</body>
</html>
`;
}
