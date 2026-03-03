import { initDownloaderUI } from '../downloader.js';

export async function render(root) {
  initDownloaderUI(root, {
    toolName: 'Facebook Video Downloader',
    platform: 'facebook'
  });
}
