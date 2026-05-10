# Equity Research Copilot Local Data Generator

This folder contains optional local companion tooling for generating JSON files that the static dashboard can import.

The frontend remains static. It does not call APIs, does not use browser API keys, and does not require a backend. The workflow is:

1. Generate or edit a company JSON file locally.
2. Review the data and source metadata.
3. Import the JSON file into the dashboard through Data Manager.

## Version 1

Version 1 supports:

- `mock` provider: creates realistic sample data using only the Python standard library.
- `manual` provider: creates a fillable company JSON template.
- `generate_sample_database`: creates the bundled interview-prep sample universe.

Example:

```bash
python build_company_json.py --ticker TSM --provider mock --output TSM.json
```

Generate the full static sample database:

```bash
python build_company_json.py generate_sample_database --output-dir ../assets/data/companies
```

Optional arguments:

```bash
python build_company_json.py --ticker TSM --provider mock --company-name "Taiwan Semiconductor Manufacturing Company" --currency USD --period quarterly --limit 5 --output TSM.json
```

## Future Providers

Potential future local providers:

- Financial Modeling Prep for financial statements, ratios, valuation multiples, and market data.
- SEC EDGAR for official filings and XBRL statement data.
- Daloopa or Quartr through a Codex-assisted local workflow.

If future providers require API keys, keep keys in a local `.env` file or shell environment. Do not put keys in the frontend and do not commit `.env`.

## Data Sufficiency

Quarterly data should ideally include:

- At least 5 quarters for latest year-over-year growth context.
- At least 12 quarters for a 3Y trend.
- At least 20 quarters for a 5Y trend.

The dashboard can still load files with fewer points. It will display data sufficiency messages instead of pretending the missing window is available.
