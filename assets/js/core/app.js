import { tools, toolMap } from './tools-registry.js';

const navEl = document.getElementById('tool-nav');
const rootEl = document.getElementById('tool-root');
const titleEl = document.getElementById('tool-title');
const descEl = document.getElementById('tool-description');
const homeTabEl = document.getElementById('route-home');
const toolsTabEl = document.getElementById('route-tools');
const toolPanelEl = document.getElementById('tool-panel');

let currentRoute = 'home';
let panelOverlayEl = null;
const HOME_TAB_TITLE = 'UtilStack - Free Online Tools for OCR, PDF, JSON & More';

function getBasePathPrefix() {
  const path = window.location.pathname;
  return path.includes('/tools/') ? '../' : './';
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 1023px)').matches;
}

function ensureMobilePanelElements() {
  if (!toolPanelEl || panelOverlayEl) {
    return;
  }

  panelOverlayEl = document.createElement('button');
  panelOverlayEl.type = 'button';
  panelOverlayEl.className = 'mobile-tool-overlay';
  panelOverlayEl.setAttribute('aria-label', 'Close tools menu');
  panelOverlayEl.addEventListener('click', closeMobileToolPanel);
  document.body.appendChild(panelOverlayEl);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'btn-secondary lg:hidden';
  closeButton.textContent = 'Close';
  closeButton.setAttribute('aria-label', 'Close tools menu');
  closeButton.addEventListener('click', closeMobileToolPanel);

  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'mb-3 flex items-center justify-between lg:hidden';
  mobileHeader.innerHTML = '<p class="font-display text-lg">Tools Menu</p>';
  mobileHeader.appendChild(closeButton);

  toolPanelEl.prepend(mobileHeader);
}

function openMobileToolPanel() {
  if (!toolPanelEl || !panelOverlayEl || !isMobileViewport()) {
    return;
  }

  toolPanelEl.classList.add('open');
  panelOverlayEl.classList.add('open');
}

function closeMobileToolPanel() {
  if (!toolPanelEl || !panelOverlayEl) {
    return;
  }

  toolPanelEl.classList.remove('open');
  panelOverlayEl.classList.remove('open');
}

function syncPanelViewportMode() {
  if (!toolPanelEl) {
    return;
  }

  if (isMobileViewport()) {
    toolPanelEl.classList.add('mobile-tool-panel');
    toolPanelEl.classList.remove('open');
    panelOverlayEl?.classList.remove('open');
  } else {
    toolPanelEl.classList.remove('mobile-tool-panel', 'open');
    panelOverlayEl?.classList.remove('open');
  }
}

function markTopNav(route) {
  const isHome = route === 'home';

  if (homeTabEl) {
    homeTabEl.classList.toggle('active', isHome);
    homeTabEl.setAttribute('aria-current', isHome ? 'page' : 'false');
  }

  if (toolsTabEl) {
    toolsTabEl.classList.toggle('active', !isHome);
    toolsTabEl.setAttribute('aria-current', !isHome ? 'page' : 'false');
  }
}

function buildNav() {
  if (!navEl) {
    return;
  }

  navEl.innerHTML = tools
    .map(
      (tool) => `
      <button class="tool-link" type="button" data-tool-id="${tool.id}">
        <span>${tool.name}</span>
        <span aria-hidden="true">-></span>
      </button>`
    )
    .join('');

  navEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tool-id]');
    if (!button) {
      return;
    }

    openRoute(button.dataset.toolId, true);
    closeMobileToolPanel();
  });
}

function markActive(toolId) {
  navEl?.querySelectorAll('.tool-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.toolId === toolId);
  });
}

function setHeaderForHome() {
  titleEl.textContent = 'UtilStack Home';
  descEl.textContent = 'Free everyday online tools with private, in-browser processing.';
  document.title = HOME_TAB_TITLE;
}

function setHeaderForTool(tool) {
  titleEl.textContent = tool.name;
  descEl.textContent = tool.description;
  document.title = `${tool.name} | UtilStack`;
}

function renderHome() {
  const cards = tools
    .map(
      (tool) => `
      <button class="tool-card rounded-xl border border-slate-200 bg-white/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70" type="button" data-open-tool="${tool.id}">
        <p class="mb-2 text-2xl" aria-hidden="true">${tool.icon ?? '🧰'}</p>
        <h3 class="font-display text-base font-semibold">${tool.name}</h3>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">${tool.description}</p>
      </button>`
    )
    .join('');

  rootEl.innerHTML = `
    <div class="grid gap-8">
      <section class="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-slate-50 px-5 py-8 text-center shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:px-8">
        <p class="mx-auto mb-3 inline-flex rounded-full border border-brand-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:border-brand-700/50 dark:bg-slate-900/80 dark:text-brand-100">Private. Fast. Browser-Only.</p>
        <h3 class="font-display text-3xl font-semibold leading-tight sm:text-4xl">UtilStack - Free Everyday Online Tools</h3>
        <p class="mx-auto mt-3 max-w-2xl text-sm text-slate-700 sm:text-base dark:text-slate-300">Use practical tools instantly with no sign-up, no backend dependency, and no file upload to external servers for core processing.</p>
        <button id="home-explore-tools" class="btn-primary mt-5" type="button">Explore Tools</button>
      </section>

      <section id="home-tools-grid" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Tools Overview">
        ${cards}
      </section>

      <section class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 class="font-display text-xl font-semibold">How It Works</h3>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <article class="stat-box"><p class="text-xs uppercase">Step 1</p><p class="mt-1 font-semibold">Choose a tool</p><p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Pick OCR, PDF, JSON, text, or utility workflows from the tool list.</p></article>
          <article class="stat-box"><p class="text-xs uppercase">Step 2</p><p class="mt-1 font-semibold">Process in browser</p><p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Your input is handled locally with lightweight, client-side modules.</p></article>
          <article class="stat-box"><p class="text-xs uppercase">Step 3</p><p class="mt-1 font-semibold">Download or copy</p><p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Export files or copy output instantly for daily productivity tasks.</p></article>
        </div>
      </section>

      <section class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 class="font-display text-xl font-semibold">SRMA4Tech Ecosystem</h3>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Built under SRMA4Tech with a focus on free tools, developer utilities, and separate spiritual applications.</p>
        <div class="mt-3 flex flex-wrap gap-3 text-sm">
          <a class="footer-link underline-offset-4 hover:underline" href="https://srma4tech.github.io/gitapath/" target="_blank" rel="noopener noreferrer">GitaPath</a>
          <a class="footer-link underline-offset-4 hover:underline" href="https://github.com/srma4tech" target="_blank" rel="noopener noreferrer">GitHub Profile</a>
        </div>
      </section>
    </div>
  `;

  rootEl.querySelector('#home-explore-tools')?.addEventListener('click', () => {
    rootEl.querySelector('#home-tools-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  rootEl.querySelectorAll('[data-open-tool]').forEach((button) => {
    button.addEventListener('click', () => {
      openRoute(button.dataset.openTool, true);
    });
  });
}

async function openTool(toolId, updateHash = false) {
  const tool = toolMap[toolId] ?? tools[0];
  currentRoute = tool.id;
  markActive(tool.id);
  markTopNav(tool.id);
  setHeaderForTool(tool);

  rootEl.innerHTML = '<p class="text-sm text-slate-500">Loading tool...</p>';

  try {
    const module = await import(tool.modulePath);
    rootEl.innerHTML = '';
    await module.render(rootEl, { basePathPrefix: getBasePathPrefix() });

    if (updateHash) {
      window.location.hash = tool.id;
    }
  } catch (error) {
    rootEl.innerHTML = `<div class="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">Failed to load this tool. ${error.message}</div>`;
  }
}

function getInitialRoute() {
  const fromBody = document.body.dataset.defaultTool;
  if (toolMap[fromBody]) {
    return fromBody;
  }

  return 'home';
}

function openHome(updateHash = false) {
  currentRoute = 'home';
  markActive('');
  markTopNav('home');
  setHeaderForHome();
  renderHome();

  if (updateHash) {
    window.location.hash = 'home';
  }
}

function openRoute(route, updateHash = false) {
  if (route === 'home') {
    openHome(updateHash);
    return;
  }

  if (toolMap[route]) {
    openTool(route, updateHash);
    return;
  }

  openHome(updateHash);
}

function wireTopNav() {
  homeTabEl?.addEventListener('click', () => {
    openRoute('home', true);
    closeMobileToolPanel();
  });

  toolsTabEl?.addEventListener('click', () => {
    if (isMobileViewport()) {
      if (toolPanelEl?.classList.contains('open')) {
        closeMobileToolPanel();
      } else {
        openMobileToolPanel();
      }
      return;
    }

    if (currentRoute === 'home') {
      rootEl.querySelector('#home-tools-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    toolPanelEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    navEl?.querySelector('[data-tool-id]')?.focus();
  });
}

export function initApp() {
  ensureMobilePanelElements();
  syncPanelViewportMode();
  buildNav();
  wireTopNav();
  openRoute(getInitialRoute(), false);

  window.addEventListener('hashchange', () => {
    const nextRoute = window.location.hash.replace('#', '').trim();
    openRoute(nextRoute || 'home', false);
    closeMobileToolPanel();
  });

  window.addEventListener('resize', syncPanelViewportMode);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileToolPanel();
    }
  });
}
