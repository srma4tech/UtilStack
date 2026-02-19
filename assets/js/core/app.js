import { tools, toolMap } from './tools-registry.js';

const navEl = document.getElementById('tool-nav');
const rootEl = document.getElementById('tool-root');
const titleEl = document.getElementById('tool-title');
const descEl = document.getElementById('tool-description');

function getBasePathPrefix() {
  const path = window.location.pathname;
  return path.includes('/tools/') ? '../' : './';
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

    const { toolId } = button.dataset;
    openTool(toolId, true);
  });
}

function markActive(toolId) {
  navEl?.querySelectorAll('.tool-link').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.toolId === toolId);
  });
}

function setHeader(tool) {
  titleEl.textContent = tool.name;
  descEl.textContent = tool.description;
}

async function openTool(toolId, updateHash = false) {
  const tool = toolMap[toolId] ?? tools[0];
  markActive(tool.id);
  setHeader(tool);

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

function getInitialTool() {
  const fromHash = window.location.hash.replace('#', '').trim();
  if (toolMap[fromHash]) {
    return fromHash;
  }

  const fromBody = document.body.dataset.defaultTool;
  if (toolMap[fromBody]) {
    return fromBody;
  }

  return tools[0].id;
}

export function initApp() {
  buildNav();
  openTool(getInitialTool(), false);

  window.addEventListener('hashchange', () => {
    const nextTool = window.location.hash.replace('#', '').trim();
    if (toolMap[nextTool]) {
      openTool(nextTool, false);
    }
  });
}
