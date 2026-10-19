// Progressive enhancement only: the resume is fully readable without this file.
(() => {
  const root = document.documentElement;
  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = () => root.dataset.theme || (prefersDark() ? 'dark' : 'light');

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action === 'print') window.print();
    if (button.dataset.action === 'theme') {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage may be blocked; the toggle still works for this visit */
      }
    }
  });
})();
