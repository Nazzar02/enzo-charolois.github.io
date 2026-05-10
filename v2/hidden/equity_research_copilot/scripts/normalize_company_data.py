"""Normalize provider output into Equity Research Copilot company JSON.

This module intentionally avoids live API calls. Providers should return plain
Python dictionaries, and this file maps them into the static frontend schema.
"""

from __future__ import annotations

from datetime import date
from typing import Any, Protocol


class CompanyProvider(Protocol):
    """Provider interface for future local data sources."""

    def fetch_company(self, ticker: str) -> dict[str, Any]:
        """Return raw company data for a ticker."""


class MockProvider:
    """Small mock provider used for schema tests and demos."""

    def fetch_company(self, ticker: str) -> dict[str, Any]:
        ticker = ticker.upper()
        return {
            "ticker": ticker,
            "name": f"{ticker} Sample Company",
            "industry": "Technology sample",
            "summary": "Mock provider output for local schema generation.",
        }


def normalize_company(raw: dict[str, Any]) -> dict[str, Any]:
    """Build a minimal dashboard-compatible company JSON object."""

    ticker = raw["ticker"].upper()
    today = date.today().isoformat()
    return {
        "ticker": ticker,
        "name": raw.get("name", ticker),
        "exchange": raw.get("exchange", "Sample exchange"),
        "industry": raw.get("industry", "Technology sample"),
        "currency": raw.get("currency", "USD"),
        "dataStatus": "Sample data",
        "data_status": {
            "last_updated": today,
            "source_type": "mock_provider",
            "source_notes": "Generated locally from the mock provider.",
            "latest_annual_period": "2025E",
            "latest_quarterly_period": "Q1 2026",
            "latest_market_period": "May 2026",
            "latest_valuation_period": "May 2026",
            "has_mixed_freshness": False,
        },
        "profile": {
            "summary": raw.get("summary", "Sample company profile."),
            "segments": ["Segment A", "Segment B"],
            "customers": ["Enterprise", "Cloud"],
            "moat": ["Sample scale advantage", "Sample switching costs"],
            "geography": "Global sample exposure.",
        },
        "financials": {
            "annual": {
                "periods": ["2021", "2022", "2023", "2024", "2025E"],
                "revenue": [10, 12, 15, 18, 21],
                "revenueGrowth": [0, 20, 25, 20, 16.7],
                "grossMargin": [50, 51, 52, 53, 54],
                "operatingMargin": [20, 21, 22, 23, 24],
                "netMargin": [15, 16, 17, 18, 19],
                "cashFlowOperations": [2, 2.5, 3, 3.5, 4],
                "capex": [0.5, 0.6, 0.7, 0.8, 0.9],
                "freeCashFlow": [1.5, 1.9, 2.3, 2.7, 3.1],
                "fcfMargin": [15, 15.8, 15.3, 15, 14.8],
                "roic": [18, 19, 20, 21, 22],
                "source": {"name": "Mock provider", "as_of": "2025E", "retrieved_at": today},
            },
            "quarterly": {
                "periods": ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"],
                "revenue": [4.5, 4.8, 5.1, 5.4, 5.8],
                "revenueGrowth": [10, 12, 13, 14, 16],
                "grossMargin": [52, 53, 53, 54, 54],
                "operatingMargin": [22, 23, 23, 24, 24],
                "netMargin": [17, 18, 18, 19, 19],
                "cashFlowOperations": [0.8, 0.9, 1.0, 1.1, 1.2],
                "capex": [0.2, 0.2, 0.2, 0.3, 0.3],
                "freeCashFlow": [0.6, 0.7, 0.8, 0.8, 0.9],
                "fcfMargin": [13.3, 14.6, 15.7, 14.8, 15.5],
                "roic": [20, 20, 21, 21, 22],
                "source": {"name": "Mock provider", "as_of": "Q1 2026", "retrieved_at": today},
            },
            "ttm": {
                "periods": ["TTM"],
                "revenue": [21],
                "revenueGrowth": [16],
                "grossMargin": [54],
                "operatingMargin": [24],
                "netMargin": [19],
                "cashFlowOperations": [4],
                "capex": [0.9],
                "freeCashFlow": [3.1],
                "fcfMargin": [14.8],
                "roic": [22],
                "source": {"name": "Mock provider", "as_of": "Q1 2026", "retrieved_at": today},
            },
        },
        "valuation": {
            "metrics": {"pe": 24, "forwardPe": 20, "evSales": 6, "evEbitda": 14, "evFcf": 28, "pFcf": 26},
            "source": {"name": "Mock provider", "as_of": "May 2026", "retrieved_at": today},
        },
        "metrics": {
            "revenueGrowth": 16,
            "grossMargin": 54,
            "operatingMargin": 24,
            "netMargin": 19,
            "cashFlowOperations": 4,
            "capex": 0.9,
            "freeCashFlow": 3.1,
            "fcfMargin": 14.8,
            "pe": 24,
            "forwardPe": 20,
            "evSales": 6,
            "evEbitda": 14,
            "evFcf": 28,
            "pFcf": 26,
            "roic": 22,
            "debt": 2,
            "netDebt": 0,
            "capexIntensity": 4.3,
        },
        "stockPerformance": {
            "note": "Sample market data for demo purposes.",
            "horizons": {"1M": 2, "3M": 5, "6M": 9, "YTD": 8, "1Y": 18, "3Y": 45, "5Y": 90, "10Y": 210, "MAX": 420},
            "series": {
                "1M": {"periods": ["Week 1", "Week 2", "Week 3", "Week 4"], "price": [100, 101, 101.5, 102]},
                "3M": {"periods": ["Month 1", "Month 2", "Month 3"], "price": [100, 103, 105]},
                "6M": {"periods": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], "price": [100, 102, 104, 106, 108, 109]},
                "YTD": {"periods": ["Jan", "Feb", "Mar", "Apr", "May"], "price": [100, 102, 104, 106, 108]},
                "1Y": {"periods": ["Q1", "Q2", "Q3", "Q4"], "price": [100, 105, 112, 118]},
                "3Y": {"periods": ["2023", "2024", "2025", "2026E"], "price": [100, 120, 135, 145]},
                "5Y": {"periods": ["2021", "2022", "2023", "2024", "2025", "2026E"], "price": [100, 95, 125, 150, 175, 190]},
                "10Y": {"periods": ["2016", "2018", "2020", "2022", "2024", "2026E"], "price": [100, 130, 170, 160, 250, 310]},
                "MAX": {"periods": ["2010", "2013", "2016", "2019", "2022", "2026E"], "price": [100, 140, 210, 300, 410, 520]},
            },
        },
        "market_source": {"name": "Mock provider", "as_of": "May 2026", "retrieved_at": today},
        "risks": ["Mock risk"],
        "catalysts": ["Mock catalyst"],
        "analystFlags": ["Review imported data before using in an interview."],
    }
