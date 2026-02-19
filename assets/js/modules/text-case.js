function toTitleCase(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toSentenceCase(text) {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());
}

function invertCase(text) {
  return [...text]
    .map((ch) => (ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()))
    .join('');
}

export async function render(root) {
  root.innerHTML = `
    <div class="grid gap-4">
      <textarea id="case-input" placeholder="Type or paste text..."></textarea>
      <div class="flex flex-wrap gap-2">
        <button class="btn-primary" data-action="upper" type="button">UPPERCASE</button>
        <button class="btn-secondary" data-action="lower" type="button">lowercase</button>
        <button class="btn-secondary" data-action="title" type="button">Title Case</button>
        <button class="btn-secondary" data-action="sentence" type="button">Sentence case</button>
        <button class="btn-secondary" data-action="invert" type="button">iNVERT cASE</button>
      </div>
      <div class="flex flex-wrap gap-2">
        <button id="case-copy" class="btn-secondary" type="button">Copy</button>
        <button id="case-clear" class="btn-danger" type="button">Clear</button>
      </div>
    </div>
  `;

  const input = root.querySelector('#case-input');

  root.addEventListener('click', async (event) => {
    const action = event.target.dataset.action;
    if (action) {
      if (action === 'upper') input.value = input.value.toUpperCase();
      if (action === 'lower') input.value = input.value.toLowerCase();
      if (action === 'title') input.value = toTitleCase(input.value);
      if (action === 'sentence') input.value = toSentenceCase(input.value);
      if (action === 'invert') input.value = invertCase(input.value);
    }

    if (event.target.id === 'case-copy') {
      await navigator.clipboard.writeText(input.value);
    }

    if (event.target.id === 'case-clear') {
      input.value = '';
    }
  });
}
