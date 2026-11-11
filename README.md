# XConvert Pro

XConvert Pro is a client-side web application for common image editing and conversion tasks.

## Current production application

The existing static application remains intact during the rebuild. Its current entry points and assets are retained on the `main` branch while the replacement is developed independently.

## Rebuild workspace

The replacement application is being developed with Astro, React, and TypeScript. Astro provides static, SEO-friendly pages; React is reserved for interactive workspaces; image-processing logic will live in framework-independent modules and Web Workers.

### Requirements

- Node.js 22.23.4 or later
- npm

### Development commands

```sh
npm install
npm run dev
npm run check
npm run lint
npm run format:check
npm run build
npm run preview
```

Run the full validation sequence with:

```sh
npm run validate
```

The generated static site is written to `dist/`. This rebuild branch is not connected to production deployment. Do not publish or merge it without a separate approval.

## Legacy application inventory

- `index.html` — current main application entry point
- `assets/css/` — existing application styles
- `assets/js/` — existing application logic and modules
- `tools/` — existing image-tool pages
- `pages/` — existing informational and SEO pages
- `sitemap.xml` — current XML sitemap
- `robots.txt` — current crawler directives
- `sw.js` — current service worker

## Main tools

- Compress IMAGE
- Resize IMAGE
- Crop IMAGE
- Convert IMAGE
- Photo Editor
- Remove Background
- Upscale IMAGE
- Watermark IMAGE
- Meme Generator
- Rotate IMAGE

## Official website

[XConvert Pro](https://xconvert.pro/) — official website.

### Resources

- [Image tools](https://xconvert.pro/pages/tools.html)
- [API documentation](https://xconvert.pro/pages/api.html)
- [About XConvert Pro](https://xconvert.pro/pages/about.html)
