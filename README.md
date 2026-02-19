# UtilStack - Advanced Free Online Tools Platform

UtilStack is a production-ready, browser-only utility platform built as a static hybrid SPA + multipage system. It is designed for GitHub Pages deployment, SEO discoverability, fast mobile performance, and long-term modular expansion.

## Product Focus

UtilStack focuses on global productivity utilities.
Spiritual tools are maintained as a separate product line.

## Features

- 100% client-side processing (no backend, no database)
- Shared UI shell with dynamic module loading
- SEO crawlable static pages for each tool
- Dark/light theme toggle
- Mobile-first responsive layout
- Service worker baseline caching for offline-friendly behavior

## Phase-1 Tools (7)

1. Screenshot to Text (OCR) - Tesseract.js in browser
2. Text Case Converter
3. Word & Character Counter
4. Image to PDF Converter - pdf-lib in browser
5. Image Compressor - Canvas-based compression
6. JSON Formatter & Validator
7. Age Calculator

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES modules)
- Client-side libraries:
  - Tesseract.js
  - pdf-lib
  - File download via Blob + anchor API (FileSaver-style behavior)

## Project Structure

```text
/
|- index.html
|- 404.html
|- robots.txt
|- sitemap.xml
|- service-worker.js
|- README.md
|- tools/
|  |- ocr.html
|  |- text-case.html
|  |- word-counter.html
|  |- image-to-pdf.html
|  |- compressor.html
|  |- json-formatter.html
|  |- age-calculator.html
|- assets/
|  |- css/
|  |  |- styles.css
|  |- js/
|  |  |- main.js
|  |  |- core/
|  |  |  |- app.js
|  |  |  |- theme.js
|  |  |  |- tools-registry.js
|  |  |  |- utils.js
|  |  |- modules/
|  |     |- ocr.js
|  |     |- text-case.js
|  |     |- word-counter.js
|  |     |- image-to-pdf.js
|  |     |- compressor.js
|  |     |- json-formatter.js
|  |     |- age-calculator.js
|  |- images/
|- data/
```

## Architecture Notes

- `index.html` and each page in `tools/` share the same shell.
- Each tool is its own JS module under `assets/js/modules/`.
- Modules are lazy-loaded with dynamic `import()` only when opened.
- Heavy libraries (OCR/PDF) are lazy-fetched only on user action.
- Static SEO pages set metadata and preload the selected tool through `data-default-tool`.

## GitHub Pages Deployment

1. Push this repository to GitHub.
2. Open repository `Settings -> Pages`.
3. Set source to `Deploy from a branch`.
4. Select `main` branch and `/ (root)` folder.
5. Save and wait for deployment.
6. Update canonical and sitemap URLs:
   - Replace `https://yourusername.github.io/UtilStack/` with your final URL in:
     - `index.html`
     - `tools/*.html`
     - `robots.txt`
     - `sitemap.xml`

## SEO Setup Checklist

- Unique title + meta description for each tool page
- Open Graph tags for social sharing
- Canonical links
- `robots.txt` with sitemap reference
- `sitemap.xml` entries for all primary pages
- Friendly `404.html` redirect strategy for static hosting

## Monetization Roadmap

1. Contextual ad placements in sidebar/footer (AdSense/alternatives)
2. Affiliate blocks for relevant software templates/tools
3. Sponsored tool highlights on homepage cards
4. Premium mode ideas (bulk OCR, larger batch limits, saved history via local export)
5. SEO cluster pages for long-tail utility keywords

## Related Project

GitaPath - Daily Bhagavad Gita Verse App  
Live at: https://srma4tech.github.io/gitapath/

## Development Notes

- Keep all paths relative for GitHub Pages project deployments.
- Add future tools by creating a new module and registry entry in `assets/js/core/tools-registry.js`.
- Keep heavy dependencies lazy-loaded to protect performance.
