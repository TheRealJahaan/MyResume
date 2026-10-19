// Lightweight structural validation for data/resume.json.
// Returns a list of human-readable problems; an empty list means the data is valid.

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const DATE = /^\d{4}(-\d{2})?(-\d{2})?$/;

function checkUrl(value, path, errors) {
  try {
    const u = new URL(value);
    if (!['https:', 'http:', 'mailto:'].includes(u.protocol))
      errors.push(`${path}: unsupported protocol ${u.protocol}`);
  } catch {
    errors.push(`${path}: not a valid URL (${value})`);
  }
}

function checkDate(value, path, errors) {
  if (value !== undefined && !DATE.test(value))
    errors.push(`${path}: expected YYYY, YYYY-MM or YYYY-MM-DD, got "${value}"`);
}

function checkHighlights(list, path, errors) {
  if (list === undefined) return;
  if (!Array.isArray(list)) return errors.push(`${path}: must be an array`);
  list.forEach((h, i) => {
    if (!isNonEmptyString(h)) errors.push(`${path}[${i}]: must be a non-empty string`);
  });
}

export function validateResume(resume) {
  const errors = [];
  if (!resume || typeof resume !== 'object') return ['resume: must be an object'];

  const b = resume.basics;
  if (!b) {
    errors.push('basics: required');
  } else {
    for (const key of ['name', 'label', 'summary']) {
      if (!isNonEmptyString(b[key])) errors.push(`basics.${key}: required`);
    }
    if (b.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) errors.push('basics.email: invalid');
    if (b.url !== undefined) checkUrl(b.url, 'basics.url', errors);
    (b.profiles ?? []).forEach((p, i) => {
      if (!isNonEmptyString(p.network)) errors.push(`basics.profiles[${i}].network: required`);
      checkUrl(p.url, `basics.profiles[${i}].url`, errors);
    });
  }

  for (const section of ['work', 'education', 'projects', 'skills']) {
    if (resume[section] !== undefined && !Array.isArray(resume[section])) errors.push(`${section}: must be an array`);
  }

  (resume.work ?? []).forEach((w, i) => {
    const p = `work[${i}]`;
    if (!isNonEmptyString(w.name)) errors.push(`${p}.name: required`);
    if (!isNonEmptyString(w.position)) errors.push(`${p}.position: required`);
    checkDate(w.startDate, `${p}.startDate`, errors);
    checkDate(w.endDate, `${p}.endDate`, errors);
    if (w.startDate && w.endDate && w.endDate < w.startDate) errors.push(`${p}: endDate is before startDate`);
    checkHighlights(w.highlights, `${p}.highlights`, errors);
  });

  (resume.education ?? []).forEach((e, i) => {
    const p = `education[${i}]`;
    if (!isNonEmptyString(e.institution)) errors.push(`${p}.institution: required`);
    checkDate(e.startDate, `${p}.startDate`, errors);
    checkDate(e.endDate, `${p}.endDate`, errors);
  });

  (resume.projects ?? []).forEach((pr, i) => {
    const p = `projects[${i}]`;
    if (!isNonEmptyString(pr.name)) errors.push(`${p}.name: required`);
    if (pr.url !== undefined) checkUrl(pr.url, `${p}.url`, errors);
    checkDate(pr.startDate, `${p}.startDate`, errors);
    checkHighlights(pr.highlights, `${p}.highlights`, errors);
  });

  (resume.skills ?? []).forEach((s, i) => {
    if (!isNonEmptyString(s.name)) errors.push(`skills[${i}].name: required`);
    if (!Array.isArray(s.keywords) || s.keywords.length === 0)
      errors.push(`skills[${i}].keywords: needs at least one entry`);
  });

  return errors;
}
