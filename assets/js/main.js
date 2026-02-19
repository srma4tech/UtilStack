import { initTheme, wireThemeToggle } from './core/theme.js';
import { initApp } from './core/app.js';

initTheme();
wireThemeToggle();
initApp();

if ('serviceWorker' in navigator) {
  const prefix = window.location.pathname.includes('/tools/') ? '../' : './';
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${prefix}service-worker.js`).catch(() => {});
  });
}
