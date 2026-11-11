# Rebuild — Phase 1 Foundation

## Scope

An isolated Astro 7.4.9 + React 19.3.1 + TypeScript application foundation. Existing production pages, image tools, assets, service worker, and integrations remain untouched.

## Repository safeguards

- Work branch: `rebuild/architecture-v2`
- Base branch: `main`
- No production deployment configuration
- Merge and release require separate approval

## Foundation

- Astro static output with the official React integration
- TypeScript strict configuration
- Node.js runtime baseline: 22.23.4
- ESLint, Prettier, and Vitest configuration
- Static output directory: `dist/`
- Canonical site origin: `https://xconvert.pro`

## Validation status

The repository scaffold was committed in phase 1. Dependency installation, lockfile generation, and runtime build checks were not possible in the initial authoring environment. See the validation matrix for required checks.
