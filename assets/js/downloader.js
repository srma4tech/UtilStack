import { RAPID_API_CONFIG } from './config.js';

const PLATFORM_CONFIG = {
  youtube: { label: 'YouTube', icon: '▶️', colorClass: 'platform-youtube' },
  instagram: { label: 'Instagram', icon: '📸', colorClass: 'platform-instagram' },
  facebook: { label: 'Facebook', icon: '📘', colorClass: 'platform-facebook' }
};
const RAPID_API_KEY_STORAGE = 'utilstack-rapidapi-key';

function ensureDownloaderStylesheet() {
  const href = new URL('../css/downloader.css', import.meta.url).toString();
  const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .some((link) => link.href === href);
  if (exists) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function normalizeUrl(value = '') {
  return value.trim();
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return 'Unknown size';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = units[0];

  for (let i = 0; i < units.length - 1 && size >= 1024; i += 1) {
    size /= 1024;
    unit = units[i + 1];
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${unit}`;
}

function normalizeDuration(raw) {
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }

  if (!Number.isFinite(raw)) {
    return 'Unknown';
  }

  const total = Math.max(0, Math.floor(raw));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function withProxy(url) {
  return `${url}`;
}

function resolveRapidApiKey() {
  if (typeof window !== 'undefined' && typeof window.RAPID_API_KEY === 'string' && window.RAPID_API_KEY.trim()) {
    return window.RAPID_API_KEY.trim();
  }

  const stored = localStorage.getItem(RAPID_API_KEY_STORAGE);
  if (stored && stored.trim()) {
    return stored.trim();
  }

  if (RAPID_API_CONFIG.key && RAPID_API_CONFIG.key !== 'YOUR_RAPIDAPI_KEY') {
    return RAPID_API_CONFIG.key.trim();
  }

  return '';
}

function hasProxyEndpoint() {
  return Boolean(RAPID_API_CONFIG.proxyEndpoint && RAPID_API_CONFIG.proxyEndpoint.trim());
}

function detectPlatform(url) {
  const value = normalizeUrl(url).toLowerCase();
  if (/youtu\.be|youtube\.com/.test(value)) {
    return 'youtube';
  }
  if (/instagram\.com/.test(value)) {
    return 'instagram';
  }
  if (/facebook\.com|fb\.watch/.test(value)) {
    return 'facebook';
  }
  return null;
}

function youtubeVideoId(input) {
  try {
    const parsed = new URL(input);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.replace('/', '').trim();
    }

    const queryId = parsed.searchParams.get('v');
    if (queryId) {
      return queryId;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.at(-1) || '';
  } catch {
    return '';
  }
}

function formatLabel(entry) {
  const quality = entry.quality || entry.resolution || entry.height || entry.label || '';
  const ext = (entry.ext || entry.format || '').toUpperCase();
  if (quality && ext) {
    return `${quality} - ${ext}`;
  }
  if (quality) {
    return `${quality}`;
  }
  if (ext) {
    return ext;
  }
  return 'Download';
}

function normalizeFormatEntries(entries = [], type = 'video') {
  return entries
    .map((entry, index) => {
      const url = entry.url || entry.link || entry.download || entry.downloadUrl || entry.href;
      if (!url) {
        return null;
      }
      const ext = (entry.ext || entry.format || (type === 'audio' ? 'mp3' : 'mp4')).toLowerCase();
      return {
        id: `${type}-${index}`,
        type,
        ext,
        quality: entry.quality || entry.resolution || entry.height || '',
        bitrate: entry.bitrate || '',
        label: formatLabel(entry),
        sizeText: entry.filesize
          || entry.sizeText
          || (Number.isFinite(entry.size) ? formatBytes(entry.size) : null)
          || (Number.isFinite(entry.filesizeBytes) ? formatBytes(entry.filesizeBytes) : null)
          || 'Unknown size',
        url
      };
    })
    .filter(Boolean);
}

function fallbackFormats(platform, raw) {
  const link = raw?.link || raw?.url || raw?.download || raw?.downloadUrl;
  if (!link) {
    return { videoFormats: [], audioFormats: [] };
  }

  if (platform === 'youtube') {
    return {
      videoFormats: [],
      audioFormats: [
        {
          id: 'audio-0',
          type: 'audio',
          ext: 'mp3',
          quality: '192kbps',
          bitrate: '192kbps',
          label: 'MP3 - 192kbps',
          sizeText: raw.filesize || 'Unknown size',
          url: link
        }
      ]
    };
  }

  return {
    videoFormats: [
      {
        id: 'video-0',
        type: 'video',
        ext: 'mp4',
        quality: raw.quality || 'Original',
        label: `MP4 - ${raw.quality || 'Original'}`,
        sizeText: raw.filesize || 'Unknown size',
        url: link
      }
    ],
    audioFormats: []
  };
}

function normalizeApiResponse(platform, raw, originalUrl) {
  const title = raw?.title || raw?.meta?.title || raw?.data?.title || `${PLATFORM_CONFIG[platform].label} video`;
  const thumbnail = raw?.thumbnail || raw?.thumb || raw?.meta?.thumbnail || raw?.data?.thumbnail || '';
  const duration = normalizeDuration(raw?.duration || raw?.length || raw?.meta?.duration || raw?.data?.duration);

  const nested = raw?.data || raw?.result || raw;
  const videoCandidates = nested?.videoFormats
    || nested?.videos
    || nested?.video
    || nested?.video_links
    || nested?.links
    || [];
  const audioCandidates = nested?.audioFormats
    || nested?.audios
    || nested?.audio
    || [];

  const videoCandidateList = Array.isArray(videoCandidates) ? videoCandidates : [];
  const audioCandidateList = Array.isArray(audioCandidates) ? audioCandidates : [];

  const inferredAudio = [];
  const inferredVideo = [];

  if (!audioCandidateList.length && videoCandidateList.length) {
    videoCandidateList.forEach((entry) => {
      const hint = `${entry?.format || ''} ${entry?.ext || ''} ${entry?.quality || ''}`.toLowerCase();
      if (/mp3|m4a|webm|audio|kbps/.test(hint)) {
        inferredAudio.push(entry);
      } else {
        inferredVideo.push(entry);
      }
    });
  }

  let videoFormats = normalizeFormatEntries(audioCandidateList.length ? videoCandidateList : inferredVideo, 'video');
  let audioFormats = normalizeFormatEntries(audioCandidateList.length ? audioCandidateList : inferredAudio, 'audio');

  if (!videoFormats.length && !audioFormats.length) {
    const fallback = fallbackFormats(platform, nested);
    videoFormats = fallback.videoFormats;
    audioFormats = fallback.audioFormats;
  }

  return {
    platform,
    title,
    thumbnail,
    duration,
    sourceUrl: originalUrl,
    videoFormats,
    audioFormats
  };
}

async function fetchFromRapid(url, host, params = {}) {
  const apiKey = resolveRapidApiKey();
  if (!apiKey) {
    throw new Error('RapidAPI key is missing. Add it in assets/js/config.js or configure RAPID_API_CONFIG.proxyEndpoint.');
  }

  const endpoint = new URL(withProxy(url));
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      endpoint.searchParams.set(key, value);
    }
  });

  const response = await fetch(endpoint.toString(), {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host
    }
  });

  if (!response.ok) {
    const message = response.status === 404
      ? 'Video not found. Verify the URL and try again.'
      : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return response.json();
}

async function fetchFromProxy(platform, sourceUrl) {
  const endpoint = RAPID_API_CONFIG.proxyEndpoint?.trim();
  if (!endpoint) {
    throw new Error('Proxy endpoint is not configured.');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, url: sourceUrl })
  });

  if (!response.ok) {
    throw new Error(`Proxy request failed with status ${response.status}.`);
  }

  return response.json();
}

async function fetchMediaData(platform, sourceUrl) {
  if (hasProxyEndpoint()) {
    const raw = await fetchFromProxy(platform, sourceUrl);

    // Accept already-normalized proxy payloads to keep backend flexible.
    if (raw && Array.isArray(raw.videoFormats) && Array.isArray(raw.audioFormats)) {
      return {
        platform: raw.platform || platform,
        title: raw.title || `${PLATFORM_CONFIG[platform].label} video`,
        thumbnail: raw.thumbnail || '',
        duration: normalizeDuration(raw.duration),
        sourceUrl: raw.sourceUrl || sourceUrl,
        videoFormats: raw.videoFormats,
        audioFormats: raw.audioFormats
      };
    }

    return normalizeApiResponse(platform, raw, sourceUrl);
  }

  if (platform === 'youtube') {
    const id = youtubeVideoId(sourceUrl);
    if (!id) {
      throw new Error('Unable to read YouTube video ID from the URL.');
    }

    const raw = await fetchFromRapid(
      RAPID_API_CONFIG.youtubeEndpoint,
      RAPID_API_CONFIG.youtubeHost,
      { id }
    );
    return normalizeApiResponse(platform, raw, sourceUrl);
  }

  const raw = await fetchFromRapid(
    RAPID_API_CONFIG.socialEndpoint,
    RAPID_API_CONFIG.socialHost,
    { url: sourceUrl }
  );
  return normalizeApiResponse(platform, raw, sourceUrl);
}

function renderFormatCards(formats) {
  if (!formats.length) {
    return '<p class="downloader-empty">No options available for this section.</p>';
  }

  return `
    <div class="download-grid">
      ${formats
        .map(
          (entry) => `
            <button type="button" class="download-card" data-download-url="${entry.url}">
              <span class="download-label">${entry.label}</span>
              <span class="download-size">${entry.sizeText}</span>
            </button>
          `
        )
        .join('')}
    </div>
  `;
}

function renderSkeleton(container) {
  container.innerHTML = `
    <div class="downloader-skeleton">
      <div class="skeleton-line w-1/3"></div>
      <div class="skeleton-line w-2/3"></div>
      <div class="skeleton-thumb"></div>
      <div class="skeleton-line w-full"></div>
      <div class="skeleton-line w-full"></div>
      <div class="skeleton-line w-2/5"></div>
    </div>
  `;
}

function renderResult(container, data) {
  const platform = PLATFORM_CONFIG[data.platform];
  container.innerHTML = `
    <div class="downloader-result">
      <div class="platform-chip ${platform.colorClass}">
        <span>${platform.icon}</span>
        <span>${platform.label} detected</span>
      </div>

      <div class="media-meta">
        <img
          src="${data.thumbnail || 'https://srma4tech.github.io/UtilStack/assets/images/og-cover.png'}"
          alt="${data.title}"
          loading="lazy"
          class="media-thumb"
        >
        <div>
          <h3 class="media-title">${data.title}</h3>
          <p class="media-sub">Duration: ${data.duration}</p>
          <p class="media-sub">Source: <a href="${data.sourceUrl}" target="_blank" rel="noopener noreferrer">Open original video</a></p>
        </div>
      </div>

      <section class="format-block">
        <h4>Video Quality</h4>
        ${renderFormatCards(data.videoFormats)}
      </section>

      <section class="format-block">
        <h4>Audio Only</h4>
        ${renderFormatCards(data.audioFormats)}
      </section>
    </div>
  `;
}

function renderError(container, message) {
  const missingKey = /RapidAPI key is missing/i.test(message);
  container.innerHTML = `
    <div class="downloader-error">
      <p>${message}</p>
      ${missingKey ? '<button type="button" class="btn-primary" data-set-api-key>Set API Key</button>' : ''}
      <button type="button" class="btn-secondary" data-retry-fetch>Retry</button>
    </div>
  `;
}

function downloaderMarkup(toolName) {
  return `
    <section class="downloader-shell">
      <p class="downloader-kicker">New: Video Downloader Tools</p>
      <h2 class="downloader-heading">${toolName}</h2>
      <p class="downloader-note">Paste a public video URL and fetch available download options. UtilStack does not host files.</p>

      <div class="downloader-form">
        <label for="video-url" class="downloader-label">Video URL</label>
        <input
          id="video-url"
          class="field"
          type="text"
          placeholder="Paste YouTube, Instagram, or Facebook URL"
          autocomplete="off"
        >
        <div class="downloader-actions">
          <button id="fetch-video" type="button" class="btn-primary">Fetch</button>
          <button id="paste-video-url" type="button" class="btn-secondary">Paste URL</button>
        </div>
        <p class="downloader-disclaimer">UtilStack does not host or store any videos. Downloads are served directly from the source platform. Please respect copyright and terms of service.</p>
      </div>

      <div id="downloader-feedback" class="downloader-feedback"></div>
    </section>
  `;
}

async function tryClipboardAutofill(input) {
  if (!navigator.clipboard?.readText) {
    return;
  }

  try {
    const text = await navigator.clipboard.readText();
    const platform = detectPlatform(text);
    if (platform) {
      input.value = text;
    }
  } catch {
    // Clipboard permission denied or unavailable.
  }
}

function bindDownloadClicks(container) {
  container.querySelectorAll('[data-download-url]').forEach((button) => {
    button.addEventListener('click', () => {
      const url = button.getAttribute('data-download-url');
      if (!url) {
        return;
      }

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.download = '';
      anchor.click();
    });
  });
}

export function initDownloaderUI(root, options = {}) {
  ensureDownloaderStylesheet();
  const toolName = options.toolName || 'Video Downloader';
  const enforcedPlatform = options.platform || null;

  root.innerHTML = downloaderMarkup(toolName);

  const urlInput = root.querySelector('#video-url');
  const fetchButton = root.querySelector('#fetch-video');
  const pasteButton = root.querySelector('#paste-video-url');
  const feedback = root.querySelector('#downloader-feedback');

  async function runFetch() {
    const inputUrl = normalizeUrl(urlInput.value);
    if (!inputUrl) {
      renderError(feedback, 'Please paste a valid video URL.');
      feedback.querySelector('[data-retry-fetch]')?.addEventListener('click', runFetch);
      return;
    }

    const detectedPlatform = detectPlatform(inputUrl);
    if (!detectedPlatform) {
      renderError(feedback, 'Unsupported platform. Use a YouTube, Instagram, or Facebook URL.');
      feedback.querySelector('[data-retry-fetch]')?.addEventListener('click', runFetch);
      return;
    }

    if (enforcedPlatform && detectedPlatform !== enforcedPlatform) {
      renderError(feedback, `This page supports ${PLATFORM_CONFIG[enforcedPlatform].label} links only.`);
      feedback.querySelector('[data-retry-fetch]')?.addEventListener('click', runFetch);
      return;
    }

    renderSkeleton(feedback);

    try {
      const data = await fetchMediaData(detectedPlatform, inputUrl);

      if (!data.videoFormats.length && !data.audioFormats.length) {
        throw new Error('No downloadable formats were returned for this video.');
      }

      renderResult(feedback, data);
      bindDownloadClicks(feedback);
    } catch (error) {
      const message = /private|copyright/i.test(error.message)
        ? 'This video appears private or restricted. Try a different public URL.'
        : error.message;
      renderError(feedback, message);
      feedback.querySelector('[data-set-api-key]')?.addEventListener('click', () => {
        const value = window.prompt('Enter RapidAPI key');
        if (!value || !value.trim()) {
          return;
        }
        localStorage.setItem(RAPID_API_KEY_STORAGE, value.trim());
      });
      feedback.querySelector('[data-retry-fetch]')?.addEventListener('click', runFetch);
    }
  }

  fetchButton.addEventListener('click', runFetch);
  urlInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      runFetch();
    }
  });

  pasteButton.addEventListener('click', async () => {
    if (!navigator.clipboard?.readText) {
      renderError(feedback, 'Clipboard read is not supported in this browser.');
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      urlInput.value = text.trim();
      runFetch();
    } catch {
      renderError(feedback, 'Clipboard access was denied. Paste URL manually.');
    }
  });

  tryClipboardAutofill(urlInput);
}
