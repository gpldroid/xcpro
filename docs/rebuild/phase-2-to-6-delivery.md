# XConvert Pro — Phases 2–6 Delivery Notes

## Phase 2 — Shared interface

- Shared Astro layout, header, footer, theme switch, and responsive mobile tab navigation.
- Shared design tokens, responsive styles, skip navigation, focus styles, semantic landmarks, and reduced-motion handling.
- Delayed cookie preference UI using browser storage only.
- System font stack to avoid an external font request blocking first render.

## Phase 3 — Image engine

- Framework-independent canvas rendering module.
- OffscreenCanvas Web Worker path with main-thread fallback.
- Raster MIME allowlist, 40 MB input limit, 12,000-pixel dimension limit, and 16 MP processing cap.
- Blob export, output filename sanitization, output-size reporting, and Worker cancellation.
- Background removal is edge-connected color flood fill, not AI segmentation. Upscaling is canvas interpolation, not AI detail reconstruction. JPEG transparency is flattened onto white; background removal exports PNG.

## Phase 4 — Tool workspaces

- Registry-driven pages for all ten existing tool URLs.
- Compression, resize, crop, conversion, photo adjustments, edge-color background removal, interpolation upscale, text watermark, meme captions, and rotate/flip.
- Original source files remain untouched; export is a separate user action.

## Phase 5 — Site systems and content

- Homepage, tool directory, About, Archives, Contact, legal pages, API status page, and 404 page.
- Astro preserve build format retains directory index URLs and explicit legacy HTML tool URLs.
- Canonical metadata, Open Graph, Twitter metadata, sitemap, robots, favicon, manifest, and conservative service worker.
- WebMCP list-tools and per-workspace processing registration through the React lifecycle hook. WebMCP remains experimental and feature-detected.

## Phase 6 — Validation

- Vitest tests for image math, MIME selection, file-name/size helpers, and tool route inventory.
- GitHub Actions validation workflow on the rebuild branch.
- Local dependency installation, lockfile generation, typecheck, lint, tests, and production build could not be executed in the authoring environment because outbound package-registry/GitHub access was unavailable.
- CI must pass before runtime verification. Real browser E2E, screen-reader, cross-browser, and Lighthouse/Core Web Vitals checks remain release requirements.

## Migration safeguards

Existing production files remain on the original branch and are not deleted or overwritten. The rebuild branch has no production deployment workflow or DNS changes. Merge and production release require separate explicit approval.
