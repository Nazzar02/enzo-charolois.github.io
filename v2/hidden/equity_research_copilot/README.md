# Equity Research Copilot

Equity Research Copilot is a hidden static web app for educational interview preparation. It is now positioned as a mobile-first case study preparation companion for quick revision, reusable company notes, and first-pass bottom-up reviews of listed technology companies.

This is not investment advice. It does not produce automatic investment recommendations, and it should not be used as a production financial platform.

## Version 1

Version 1 uses static sample data for a technology company universe across semiconductors, semiconductor equipment, cloud and big tech, software and data, cybersecurity, and European technology. The figures are approximate, manually prepared or mock-generated examples stored in local JSON files under `assets/data/`.

The app is compatible with GitHub Pages and uses only:

1. Static HTML
2. CSS
3. Vanilla JavaScript
4. Local JSON
5. Optional Chart.js from CDN, with readable fallback text

There is no backend, no Streamlit app, no API key, no database, no GitHub Actions workflow, and no live financial-data API call.

## Current Features

Version 1.1 adds a more useful analysis workflow:

1. Granular transparent badges from Exceptional to Severe
2. Separate financial period controls for annual, quarterly, and TTM data
3. Separate stock-price horizon controls for 1M through MAX
4. Multi-company comparison for 2 to 4 companies
5. Absolute and indexed chart modes
6. Interactive peer table with sorting, column visibility, metric explanations, and metric-specific heatmap logic
7. Clearer valuation diagnosis separating absolute valuation from relative valuation

Version 1.2 adds static analyst-workflow features:

1. Editable generated sections persisted in `localStorage` by ticker
2. Data freshness and source metadata per company
3. Local JSON import and export from the browser with `FileReader`
4. Optional local scripts for building compatible company JSON files
5. No upload, backend, browser API key, database, or scheduled workflow

Version 1.3 adds a Data Manager workflow:

1. Download an empty JSON template
2. Download the local Python generator script
3. Generate mock or manual company JSON locally
4. Import the generated JSON into the static dashboard
5. Export the current company JSON for review or reuse

Version 1.4 adds mobile-first case study preparation:

1. Case Study Prep Mode for compact mobile revision
2. Company search and sector filters
3. Compact company cards with business, moat, quality, valuation, risks, catalysts, and possible conclusion
4. A phone-friendly case framework, 30 minute plan, oral answer structure, and stock pitch template
5. Expanded static sample database and local bulk mock database generation

## Purpose

The goal is to automate repetitive analysis blocks that a junior analyst would often prepare during initial review or interview preparation:

1. Business overview
2. Growth
3. Quality of growth
4. Cash and capex
5. Absolute valuation
6. Relative valuation
7. Peer comparison
8. Risks and catalysts
9. Preliminary investment note

The analyst still needs to judge the business model, moat, market structure, cycle position, risks, valuation assumptions, and final conclusion.

## Financial Logic

The dashboard always separates absolute valuation from relative valuation. A company can screen as expensive in absolute terms while still being cheaper than peers, and that distinction must remain visible.

The generated note uses language such as "preliminary view", "quality business", "positive watchlist", "valuation demanding", and "requires human review". It should never make an automatic buy or sell recommendation.

## JSON Schema

Each company file now includes:

1. `profile` for business model, segments, customers, moat, and geography
2. `financials.annual`, `financials.quarterly`, and `financials.ttm`
3. `valuation` and latest `metrics`
4. `stockPerformance.horizons` and sample chart series
5. `risks`, `catalysts`, and `analystFlags`

Quarterly data should ideally contain at least:

1. 5 quarters for latest year-over-year growth context
2. 12 quarters for a 3Y trend
3. 20 quarters for a 5Y trend

If a file has fewer points, the dashboard should still load it and show data sufficiency messages such as "Only 5 quarters available" instead of a vague `n/a`.

The peer config file defines available metrics, default visible table columns, metric category, direction, explanations, and thresholds. This keeps the scoring visible and avoids a black-box model.

## Adding Data

The browser can import a compatible company JSON file through `Import JSON` or the Data Manager tab. Imported companies are available during the browser session and can be stored in `localStorage`.

For local preparation, optional generator tools live in `tools/`. They are not required by the frontend and currently use a mock provider only:

```powershell
python tools/build_company_json.py --ticker TSM --provider mock --output TSM.json
```

The same script can generate the bundled sample universe locally:

```powershell
python tools/build_company_json.py generate_sample_database --output-dir assets/data/companies
```

## Running Locally

Open through a local static server so the browser can load JSON files:

```powershell
python -m http.server 3031
```

Then visit:

```text
http://localhost:3031/v2/hidden/equity_research_copilot/
```

Opening `index.html` directly from the filesystem may block local JSON loading in some browsers.

## Future Versions

Future versions may update JSON files using sources such as SEC EDGAR, Financial Modeling Prep, Daloopa, Quartr, or a scheduled GitHub Actions data refresh. Those upgrades should preserve the static frontend and keep credentials out of the browser.
