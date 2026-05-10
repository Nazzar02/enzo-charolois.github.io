"""Build a dashboard-compatible company JSON file from a local provider."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from normalize_company_data import MockProvider, normalize_company


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Equity Research Copilot company JSON.")
    parser.add_argument("--ticker", required=True, help="Ticker to generate.")
    parser.add_argument("--output", required=True, help="Output JSON path.")
    args = parser.parse_args()

    provider = MockProvider()
    raw = provider.fetch_company(args.ticker)
    company = normalize_company(raw)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(company, indent=2), encoding="utf-8")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
