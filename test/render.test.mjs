import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { esc, formatDate, formatRange, jsonLd, renderPage } from '../src/render.mjs';
import { validateResume } from '../src/validate.mjs';

const resume = JSON.parse(await readFile(new URL('../data/resume.json', import.meta.url), 'utf8'));

test('esc neutralises HTML special characters', () => {
  assert.equal(esc(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert.equal(esc(undefined), '');
});

test('formatDate handles year and year-month', () => {
  assert.equal(formatDate('2026'), '2026');
  assert.equal(formatDate('2026-05'), 'May 2026');
  assert.equal(formatDate(''), '');
});

test('formatRange covers open, closed and single-year ranges', () => {
  assert.equal(formatRange('2026-05'), 'May 2026 – Present');
  assert.equal(formatRange('2024', '2028'), '2024 – 2028');
  assert.equal(formatRange('2026', '2026'), '2026');
  assert.equal(formatRange(), '');
});

test('the shipped resume data is valid', () => {
  assert.deepEqual(validateResume(resume), []);
});

test('validator reports missing and malformed fields', () => {
  const errors = validateResume({
    basics: { name: '', label: 'x', summary: 'y', email: 'nope', profiles: [{ network: 'GitHub', url: 'ftp://x' }] },
    work: [{ name: 'A', position: 'B', startDate: '2026-05', endDate: '2025' }],
    skills: [{ name: 'Empty', keywords: [] }],
  });
  assert.ok(errors.includes('basics.name: required'));
  assert.ok(errors.includes('basics.email: invalid'));
  assert.ok(errors.some((e) => e.startsWith('basics.profiles[0].url')));
  assert.ok(errors.includes('work[0]: endDate is before startDate'));
  assert.ok(errors.includes('skills[0].keywords: needs at least one entry'));
});

test('rendered page contains every section and entry', () => {
  const html = renderPage(resume, { builtAt: new Date('2026-10-19') });
  for (const id of ['summary', 'experience', 'education', 'projects', 'current', 'skills']) {
    assert.match(html, new RegExp(`<section id="${id}"`));
  }
  for (const p of resume.projects) assert.ok(html.includes(esc(p.name)), `missing project ${p.name}`);
  assert.ok(html.includes(esc(resume.work[0].name)));
  assert.match(html, /<h1>Jahaan Suthar<\/h1>/);
  assert.match(html, /<html lang="en">/);
});

test('rendered page escapes data instead of injecting it', () => {
  const evil = structuredClone(resume);
  evil.basics.name = '<script>alert(1)</script>';
  evil.basics.summary = '</script><img src=x onerror=alert(1)>. More.';
  const html = renderPage(evil);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img src=x'));
});

test('JSON-LD is parseable and cannot close its script tag', () => {
  const evil = structuredClone(resume);
  evil.basics.name = '</script><b>';
  const ld = jsonLd(evil);
  assert.ok(!ld.includes('</script>'));
  assert.equal(JSON.parse(ld).name, '</script><b>');
  assert.equal(JSON.parse(jsonLd(resume))['@type'], 'Person');
});

test('canonical URL is only emitted when a site URL is known', () => {
  assert.ok(!renderPage(resume).includes('rel="canonical"'));
  assert.ok(
    renderPage(resume, { siteUrl: 'https://example.com/' }).includes(
      '<link rel="canonical" href="https://example.com/" />',
    ),
  );
});
