# XConvert Pro

XConvert Pro is a browser-based application for common image editing and conversion tasks.

## Rebuild application

The rebuild uses Astro, React, and TypeScript. Astro generates static, SEO-friendly pages. React powers interactive workspaces. Image processing is isolated in a browser engine with an OffscreenCanvas Worker path and a main-thread fallback.

### Requirements

- Node.js 22.23.4 or later
- npm

### Development

```sh
npm install
npm run dev
```

### Validation

```sh
npm run validate
```

Validation runs Astro/TypeScript diagnostics, ESLint, Vitest, and a production build. Prettier formatting is available through `npm run format`.

## Image tools

Compress, resize, crop, convert, photo edit, simple edge-color background removal, canvas interpolation upscale, text watermark, meme captions, and rotate/flip.

## Processing notes

- Core image processing runs in the browser; the tools do not upload image files to an image-processing backend.
- Background removal is edge-connected color flood fill, not AI segmentation.
- Upscaling uses canvas interpolation, not AI detail reconstruction.
- Browser decoding, memory availability, and canvas encoding affect supported formats and maximum dimensions.

## Existing production application

The original static site remains preserved on the production `main` branch during this parallel migration. The rebuild branch is not configured for automatic production deployment. Do not merge or deploy without separate maintainer approval.

## Official website

[XConvert Pro](https://xconvert.pro/) · [GitHub repository](https://github.com/gpldroid/xcpro)
