export async function render(root) {
  root.innerHTML = `
    <div class="grid gap-4">
      <textarea id="json-input" placeholder='Paste JSON here...'></textarea>
      <div class="flex flex-wrap gap-2">
        <button id="json-validate" class="btn-primary" type="button">Validate</button>
        <button id="json-format" class="btn-secondary" type="button">Format</button>
        <button id="json-minify" class="btn-secondary" type="button">Minify</button>
        <button id="json-clear" class="btn-danger" type="button">Clear</button>
      </div>
      <p id="json-status" class="text-sm text-slate-600 dark:text-slate-300"></p>
    </div>
  `;

  const input = root.querySelector('#json-input');
  const status = root.querySelector('#json-status');

  function parseSafe() {
    try {
      return { ok: true, value: JSON.parse(input.value) };
    } catch (error) {
      return { ok: false, error };
    }
  }

  root.querySelector('#json-validate').addEventListener('click', () => {
    const parsed = parseSafe();
    status.textContent = parsed.ok ? 'Valid JSON.' : `Invalid JSON: ${parsed.error.message}`;
  });

  root.querySelector('#json-format').addEventListener('click', () => {
    const parsed = parseSafe();
    if (!parsed.ok) {
      status.textContent = `Invalid JSON: ${parsed.error.message}`;
      return;
    }
    input.value = JSON.stringify(parsed.value, null, 2);
    status.textContent = 'Formatted successfully.';
  });

  root.querySelector('#json-minify').addEventListener('click', () => {
    const parsed = parseSafe();
    if (!parsed.ok) {
      status.textContent = `Invalid JSON: ${parsed.error.message}`;
      return;
    }
    input.value = JSON.stringify(parsed.value);
    status.textContent = 'Minified successfully.';
  });

  root.querySelector('#json-clear').addEventListener('click', () => {
    input.value = '';
    status.textContent = '';
  });
}
