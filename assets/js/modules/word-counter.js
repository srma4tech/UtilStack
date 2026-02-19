function metrics(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed ? (trimmed.match(/[.!?]+/g)?.length ?? 1) : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).length : 0;
  const readMin = words / 200;

  return {
    words,
    chars,
    charsNoSpaces,
    sentences,
    paragraphs,
    readMin
  };
}

export async function render(root) {
  root.innerHTML = `
    <div class="grid gap-4">
      <textarea id="counter-input" placeholder="Start typing..."></textarea>
      <div class="stats-grid">
        <div class="stat-box"><p class="text-xs uppercase">Words</p><p id="c-words" class="text-2xl font-semibold">0</p></div>
        <div class="stat-box"><p class="text-xs uppercase">Characters</p><p id="c-chars" class="text-2xl font-semibold">0</p></div>
        <div class="stat-box"><p class="text-xs uppercase">No Spaces</p><p id="c-nospace" class="text-2xl font-semibold">0</p></div>
        <div class="stat-box"><p class="text-xs uppercase">Sentences</p><p id="c-sent" class="text-2xl font-semibold">0</p></div>
        <div class="stat-box"><p class="text-xs uppercase">Paragraphs</p><p id="c-para" class="text-2xl font-semibold">0</p></div>
        <div class="stat-box"><p class="text-xs uppercase">Read Time</p><p id="c-read" class="text-2xl font-semibold">0 min</p></div>
      </div>
    </div>
  `;

  const input = root.querySelector('#counter-input');

  function update() {
    const m = metrics(input.value);
    root.querySelector('#c-words').textContent = String(m.words);
    root.querySelector('#c-chars').textContent = String(m.chars);
    root.querySelector('#c-nospace').textContent = String(m.charsNoSpaces);
    root.querySelector('#c-sent').textContent = String(m.sentences);
    root.querySelector('#c-para').textContent = String(m.paragraphs);
    root.querySelector('#c-read').textContent = `${Math.max(1, Math.ceil(m.readMin || 0))} min`;
  }

  input.addEventListener('input', update);
  update();
}
