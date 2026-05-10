# AGENTS.md

## Project

This folder contains a hidden static portfolio project called Equity Research Copilot.

It is an educational and interview preparation dashboard for a Junior Analyst role in asset management.

The goal is to help structure a first pass bottom up equity review for listed technology companies.

The tool is an analyst assistant, not an investment advisor.

## Location

Work only inside:

v2/hidden/equity_research_copilot/

Do not modify the visible portfolio navigation.

Do not add links from the main website.

Do not modify files outside this folder unless explicitly requested.

## Deployment target

The project must remain compatible with GitHub Pages.

GitHub Pages serves static HTML, CSS and JavaScript files from a repository, so this project must remain fully static. Do not add a backend, server, database, Streamlit app or runtime API dependency.

## Version 1 constraints

Use only:

1. HTML
2. CSS
3. Vanilla JavaScript
4. Local JSON files
5. Optional Chart.js CDN with fallback text

Do not use:

1. Backend
2. API keys
3. Live browser API calls to financial data providers
4. GitHub Actions
5. Build step
6. Database
7. Web scraping

## Data policy

Version 1 uses static sample data stored in:

assets/data/

The data is for demonstration and interview preparation.

If data is approximate or manually prepared, clearly label it as sample data in metadata.json and README.md.

Do not scrape StockAnalysis or any other website.

Future versions may update JSON files using Daloopa, Quartr, SEC EDGAR, Financial Modeling Prep or another source, but the frontend must stay static.

## Financial logic

The app should support a bottom up equity review framework:

1. Business overview
2. Market context
3. Segments
4. Moat
5. Earnings
6. Cash and capex
7. Guidance
8. Valuation
9. Risks
10. Catalysts
11. Preliminary view

Always separate:

1. Business quality
2. Financial quality
3. Absolute valuation
4. Relative valuation
5. Risks
6. Human judgment

Never output automatic investment recommendations.

Use labels such as:

1. High quality
2. Strong
3. Neutral
4. Caution
5. Risk
6. Relatively attractive
7. Demanding valuation
8. Human review required

## UI principles

The dashboard should look premium, clear and professional.

Use:

1. Dark navy background
2. Clean cards
3. Subtle blue and gold accents
4. Clear typography
5. Responsive layout
6. Readable tables
7. Visual badges
8. Simple charts

Avoid:

1. Crowded tables
2. Overly complex scoring
3. Black box conclusions
4. Trading bot language
5. Automatic recommendation calls

## Files

Expected structure:

index.html
README.md
AGENTS.md
assets/css/equity_copilot.css
assets/js/app.js
assets/js/data_loader.js
assets/js/metrics.js
assets/js/scoring.js
assets/js/charts.js
assets/js/narrative.js
assets/data/companies/TSM.json
assets/data/companies/NVDA.json
assets/data/companies/ASML.json
assets/data/companies/AVGO.json
assets/data/peers/semiconductors_ai.json
assets/data/metadata.json

## Git safety

This project is developed locally first.

Before making changes, check:

git status
git branch --show-current

The expected branch is:

equity_research_copilot

Do not push.

Do not configure remotes.

Do not create pull requests.

Do not commit unless explicitly requested.

If there are unexpected local changes, stop and report them.

## Testing checklist

Before finishing a task:

1. Confirm index.html can open locally.
2. Confirm JSON data loads.
3. Confirm ticker selector works.
4. Confirm charts or fallback messages display.
5. Confirm peer comparison displays.
6. Confirm preliminary note is generated.
7. Confirm responsive layout is acceptable.
8. Run git status.
9. Summarize changed files.
10. Mention any limitations.
