const THEME_KEY = 'utilstack-theme';

function syncThemeButton() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) {
    return;
  }

  const isDark = document.documentElement.classList.contains('dark');
  btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

export function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = stored ? stored === 'dark' : prefersDark;

  document.documentElement.classList.toggle('dark', shouldUseDark);
  syncThemeButton();
}

export function wireThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) {
    return;
  }

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    syncThemeButton();
  });

  syncThemeButton();
}
