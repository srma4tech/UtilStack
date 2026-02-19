import { loadScript } from '../core/utils.js';

export async function render(root) {
  root.innerHTML = `
    <div class="grid gap-4">
      <label class="grid gap-2 text-sm">
        <span class="font-medium">Upload Screenshot/Image</span>
        <input id="ocr-file" type="file" accept="image/*" />
      </label>
      <label class="grid gap-2 text-sm">
        <span class="font-medium">Language</span>
        <select id="ocr-lang">
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="spa">Spanish</option>
        </select>
      </label>
      <div class="flex flex-wrap gap-2">
        <button id="ocr-run" class="btn-primary" type="button">Extract Text</button>
        <button id="ocr-copy" class="btn-secondary" type="button">Copy Result</button>
      </div>
      <p id="ocr-status" class="text-sm text-slate-600 dark:text-slate-300">Tesseract.js loads only when you run OCR.</p>
      <textarea id="ocr-result" placeholder="Recognized text appears here..."></textarea>
    </div>
  `;

  const fileInput = root.querySelector('#ocr-file');
  const runBtn = root.querySelector('#ocr-run');
  const copyBtn = root.querySelector('#ocr-copy');
  const statusEl = root.querySelector('#ocr-status');
  const resultEl = root.querySelector('#ocr-result');
  const langEl = root.querySelector('#ocr-lang');

  runBtn.addEventListener('click', async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      statusEl.textContent = 'Please upload an image first.';
      return;
    }

    runBtn.disabled = true;
    statusEl.textContent = 'Loading OCR engine...';

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
      statusEl.textContent = 'Processing image...';

      const { data } = await window.Tesseract.recognize(file, langEl.value, {
        logger: (msg) => {
          if (msg.status === 'recognizing text') {
            statusEl.textContent = `Recognizing: ${Math.round(msg.progress * 100)}%`;
          }
        }
      });

      resultEl.value = data.text.trim();
      statusEl.textContent = 'OCR complete.';
    } catch (error) {
      statusEl.textContent = `OCR failed: ${error.message}`;
    } finally {
      runBtn.disabled = false;
    }
  });

  copyBtn.addEventListener('click', async () => {
    if (!resultEl.value.trim()) {
      return;
    }
    await navigator.clipboard.writeText(resultEl.value);
    statusEl.textContent = 'Result copied to clipboard.';
  });
}
