# Video Downloader Proxy (Secure API Key)

GitHub Pages is static, so frontend env vars are not secret.  
To keep RapidAPI key safe, use a backend proxy with an environment variable.

## 1) Configure frontend

Edit `assets/js/config.js`:

```js
export const RAPID_API_CONFIG = {
  proxyEndpoint: 'https://your-proxy.example.com/api/video-downloader',
  key: 'YOUR_RAPIDAPI_KEY',
  youtubeHost: 'youtube-mp36.p.rapidapi.com',
  youtubeEndpoint: 'https://youtube-mp36.p.rapidapi.com/dl',
  socialHost: 'social-media-video-downloader.p.rapidapi.com',
  socialEndpoint: 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all'
};
```

When `proxyEndpoint` is set, frontend calls proxy first and does not require key in browser.

## 2) Example backend (Cloudflare Worker style)

```js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { platform, url } = await request.json();
    if (!platform || !url) {
      return new Response(JSON.stringify({ error: 'Missing platform/url' }), { status: 400 });
    }

    let targetUrl = '';
    let host = '';

    if (platform === 'youtube') {
      const videoId = new URL(url).searchParams.get('v') || '';
      targetUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${encodeURIComponent(videoId)}`;
      host = 'youtube-mp36.p.rapidapi.com';
    } else {
      targetUrl = `https://social-media-video-downloader.p.rapidapi.com/smvd/get/all?url=${encodeURIComponent(url)}`;
      host = 'social-media-video-downloader.p.rapidapi.com';
    }

    const apiRes = await fetch(targetUrl, {
      headers: {
        'x-rapidapi-key': env.RAPID_API_KEY,
        'x-rapidapi-host': host
      }
    });

    return new Response(await apiRes.text(), {
      status: apiRes.status,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }
    });
  }
};
```

Set `RAPID_API_KEY` in Worker/hosting environment variables.
