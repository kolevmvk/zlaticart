# Legacy Boundary

## Purpose
Prevent the 2024 static prototype from contaminating the 2026 redesign.

## Legacy artifacts
- `/index.html`
- existing inline CSS/JS inside that file
- sidebar navigation concept
- Great Vibes typography
- hover-expand portfolio grid
- fixed social icon stack
- old color system and spacing

These are reference-only artifacts and must not be reused.

## What may be preserved
Only factual/content assets may survive the migration:
- images under `/img/`
- category hints inferred from filenames (e.g. watercolor, graphics, mosaic, oil) only as provisional organization
- factual social/account links once verified

## New architecture rule
The redesign must be scaffolded independently as a modern Next.js application. No incremental migration from `index.html`.

If useful during development, move legacy files into a clearly named archival location on the feature branch, but do not delete them from `main` and do not import them into the new app.

## Review test
A reviewer should be able to remove the legacy `index.html` entirely and the new application must build and run unchanged.
