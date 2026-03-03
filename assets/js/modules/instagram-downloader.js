import { initDownloaderUI } from '../downloader.js';

export async function render(root) {
  initDownloaderUI(root, {
    toolName: 'Instagram Reel Downloader',
    platform: 'instagram'
  });
}
