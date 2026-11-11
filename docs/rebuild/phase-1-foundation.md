# Rebuild — Phase 1 Foundation

## Scope

This phase establishes an isolated Astro + React + TypeScript application foundation. It does not migrate or replace the existing production pages, image tools, assets, service worker, or site integrations.

## Repository safeguards

- Work branch: `rebuild/architecture-v2`
- Base branch: `main`
- Production deployment: not configured from this branch
- Merge to `main`: requires separate user approval
- Production release: requires separate user approval

## Foundation

- Astro static output with the official React integration
- TypeScript strict configuration
- Node.js runtime baseline: 22.23.4
- ESLint configuration for the new application source
- Prettier with Astro file support
- Static output directory: `dist/`
- Domain metadata: `https://xconvert.pro`
- Domain CNAME copied into `public/CNAME` for a future static deployment

## Initial source boundary

New application code belongs under `src/`. Existing root-level HTML, `assets/`, `tools/`, and `pages/` remain legacy production sources during the parallel migration.

The initial `src/pages/index.astro` is a deliberately minimal, non-indexable foundation placeholder. It is not a finished homepage.

## Commands

```sh
npm install
npm run dev
npm run check
npm run lint
npm run format:check
npm run build
npm run validate
```

## Validation status

The repository scaffold and configuration have been committed to the rebuild branch. Dependency installation, lockfile generation, and runtime build checks must be run in a Node.js 22.23.4+ environment before this phase can be marked fully verified.

No deployment workflow, publishing configuration, or production DNS/domain change is introduced in this phase.
