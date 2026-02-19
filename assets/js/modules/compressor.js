import { formatBytes, triggerDownload } from '../core/utils.js';

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function render(root) {
  root.innerHTML = `
    <div class="grid gap-4">
      <label class="grid gap-2 text-sm">
        <span class="font-medium">Select Image</span>
        <input id="cmp-file" type="file" accept="image/*" />
      </label>
      <label class="grid gap-2 text-sm">
        <span class="font-medium">Quality: <span id="cmp-quality-value">70</span>%</span>
        <input id="cmp-quality" type="range" min="10" max="95" value="70" />
      </label>
      <button id="cmp-run" class="btn-primary" type="button">Compress Image</button>
      <p id="cmp-stats" class="text-sm text-slate-600 dark:text-slate-300"></p>
      <img id="cmp-preview" class="hidden max-h-72 rounded-xl border border-slate-300 object-contain dark:border-slate-700" alt="Compressed preview" />
      <button id="cmp-download" class="btn-secondary hidden" type="button">Download Compressed</button>
    </div>
  `;

  const fileInput = root.querySelector('#cmp-file');
  const quality = root.querySelector('#cmp-quality');
  const qualityValue = root.querySelector('#cmp-quality-value');
  const runBtn = root.querySelector('#cmp-run');
  const stats = root.querySelector('#cmp-stats');
  const preview = root.querySelector('#cmp-preview');
  const downloadBtn = root.querySelector('#cmp-download');
  let compressedBlob = null;

  quality.addEventListener('input', () => {
    qualityValue.textContent = quality.value;
  });

  runBtn.addEventListener('click', async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      stats.textContent = 'Select an image first.';
      return;
    }

    const src = await readImage(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            stats.textContent = 'Compression failed.';
            return;
          }

          compressedBlob = blob;
          const ratio = ((1 - blob.size / file.size) * 100).toFixed(1);
          stats.textContent = `Original: ${formatBytes(file.size)} | Compressed: ${formatBytes(blob.size)} | Saved: ${ratio}%`;
          preview.src = URL.createObjectURL(blob);
          preview.classList.remove('hidden');
          downloadBtn.classList.remove('hidden');
        },
        'image/jpeg',
        Number(quality.value) / 100
      );
    };

    img.src = src;
  });

  downloadBtn.addEventListener('click', () => {
    if (!compressedBlob) {
      return;
    }
    triggerDownload(compressedBlob, 'utilstack-compressed.jpg');
  });
}
