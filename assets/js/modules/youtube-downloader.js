import { initDownloaderUI } from '../downloader.js';

export async function render(root) {
  initDownloaderUI(root, {
    toolName: 'YouTube Video Downloader',
    platform: 'youtube'
  });
}
