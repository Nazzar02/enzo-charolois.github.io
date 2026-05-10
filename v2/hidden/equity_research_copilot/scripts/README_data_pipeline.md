# Equity Research Copilot Local Data Pipeline

This folder is optional. The static frontend works without these scripts.

The goal is to help generate company JSON files compatible with the dashboard while keeping API keys, scraping, and provider-specific workflows out of the browser.

## Version 1 Scope

Version 1 includes:

1. A provider interface
2. A mock provider
3. Basic normalization into the dashboard schema
4. A CLI that writes one company JSON file

No live provider is implemented yet.

Future provider candidates:

1. SEC EDGAR
2. Financial Modeling Prep
3. Alpha Vantage
4. Daloopa
5. Quartr
6. Codex-assisted manual extraction from source documents

## Usage

```powershell
python build_company_json.py --ticker TEST --output ../assets/data/companies/TEST.json
```

The resulting JSON can also be imported directly in the dashboard through the `Import JSON` button.

## Security

Do not put API keys in frontend files.
Do not commit `.env`.
Use `.env.example` as a template only.
