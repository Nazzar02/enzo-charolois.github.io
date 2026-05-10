# POC Equity Research Copilot

This folder contains a static, shareable proof of concept for a lightweight equity research dashboard focused on technology and AI infrastructure companies.

It is designed as a product demo, not an official Taranis product page. The visual language uses discreet Taranis-inspired branding where a local logo asset is available, but it does not imply affiliation, endorsement, or production deployment.

## What it does

- Provides a first pass equity research cockpit for TSM, NVDA, ASML and AVGO.
- Shows company overview, financial quality, valuation, peer comparison, risks and a generated preliminary analyst view.
- Separates absolute valuation from relative peer valuation.
- Avoids automatic investment recommendations.

## Data

Version 1 uses a demo dataset stored as local JSON files. The data is illustrative, static and not live. It should not be used as investment advice or as verified market data.

The app is compatible with GitHub Pages and also includes an embedded fallback so `index.html` remains usable when opened directly from the filesystem.

## Constraints

- Static HTML, CSS and vanilla JavaScript.
- No backend.
- No live browser API calls.
- No exposed API keys.
- No GitHub Actions.
- No build step.

Future versions could connect to cleaner JSON generation workflows or controlled APIs outside the browser, while keeping the public frontend static.
