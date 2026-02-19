import { loadScript, triggerDownload } from '../core/utils.js';

function fitToA4(width, height) {
  const a4w = 595.28;
  const a4h = 841.89;
  const scale = Math.min(a4w / width, a4h / height);
  return {
    width: width * scale,
    height: height * scale,
    x: (a4w - width * scale) / 2,
    y: (a4h - height * scale) / 2
  };
}

export async function render(root) {
  root.innerHTML = `
    <div class="grid gap-4">
      <label class="grid gap-2 text-sm">
        <span class="font-medium">Select Images (JPG/PNG)</span>
        <input id="pdf-files" type="file" accept="image/*" multiple />
      </label>
      <button id="pdf-generate" class="btn-primary" type="button">Convert to PDF</button>
      <p id="pdf-status" class="text-sm text-slate-600 dark:text-slate-300">pdf-lib loads only when conversion starts.</p>
    </div>
  `;

  const fileInput = root.querySelector('#pdf-files');
  const button = root.querySelector('#pdf-generate');
  const statusEl = root.querySelector('#pdf-status');

  button.addEventListener('click', async () => {
    const files = Array.from(fileInput.files || []);
    if (!files.length) {
      statusEl.textContent = 'Choose at least one image.';
      return;
    }

    button.disabled = true;
    statusEl.textContent = 'Loading PDF engine...';

    try {
      await loadScript('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');
      const { PDFDocument } = window.PDFLib;

      const pdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const isPng = file.type.includes('png');
        const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const dims = fitToA4(image.width, image.height);
        const page = pdf.addPage([595.28, 841.89]);
        page.drawImage(image, dims);
      }

      const output = await pdf.save();
      triggerDownload(new Blob([output], { type: 'application/pdf' }), 'utilstack-images.pdf');
      statusEl.textContent = `Done. ${files.length} image(s) converted.`;
    } catch (error) {
      statusEl.textContent = `Conversion failed: ${error.message}`;
    } finally {
      button.disabled = false;
    }
  });
}
