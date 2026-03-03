// NOTE:
// This project is static, so anything in this file is publicly visible in production.
// For better protection, route API requests through a backend proxy and keep secrets server-side.
export const RAPID_API_CONFIG = {
  // Preferred for production: deploy a backend proxy and set this path.
  // Example: '/api/video-downloader' (Vercel/Netlify/Cloudflare Worker route)
  proxyEndpoint: '',
  key: 'YOUR_RAPIDAPI_KEY',
  youtubeHost: 'youtube-mp36.p.rapidapi.com',
  youtubeEndpoint: 'https://youtube-mp36.p.rapidapi.com/dl',
  socialHost: 'social-media-video-downloader.p.rapidapi.com',
  socialEndpoint: 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all'
};
