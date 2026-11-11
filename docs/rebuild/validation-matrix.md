# XConvert Pro Rebuild — Validation Matrix

## Automated checks

Run `npm run validate` in Node.js 22.23.4 or later. This executes Astro and TypeScript diagnostics, ESLint, Vitest unit tests, and a complete static Astro production build. Run `npm run format:check` separately after formatting with `npm run format`. The GitHub Actions workflow runs the same sequence on pushes to the rebuild branch, installs Chromium, and runs the Playwright browser suite with `npx playwright test`.

## Browser verification still required

Automated Chromium E2E coverage checks the homepage tool inventory, all ten legacy `.html` routes, sample-image crop processing, theme switching, and mobile navigation.

Before production release, manually verify Chrome, Firefox, Safari, and Edge on desktop and mobile; Android Chrome and iOS Safari file selection and downloads; theme persistence; keyboard and screen-reader access; Worker execution and fallback; PNG transparency; JPEG flattening; WebP output; large-file handling; every tool's dimensions and output; PWA installation and offline behavior; and WebMCP registration in a supported Chromium preview build.

Run Lighthouse/Core Web Vitals on a preview deployment. No performance scores are claimed by this source-only change.

## Release gate

Do not merge or deploy until automated validation and browser verification are reviewed and the maintainer separately approves the release.
