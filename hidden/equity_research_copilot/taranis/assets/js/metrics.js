(function () {
  const METRICS = [
    ["revenueGrowth", "Revenue growth", "%"],
    ["operatingMargin", "Operating margin", "%"],
    ["fcfMargin", "FCF margin", "%"],
    ["forwardPe", "Forward P/E", "x"],
    ["evSales", "EV/Sales", "x"],
    ["evEbitda", "EV/EBITDA", "x"],
    ["evFcf", "EV/FCF", "x"],
    ["roic", "ROIC", "%"]
  ];

  const VALUATION_KEYS = new Set(["forwardPe", "evSales", "evEbitda", "evFcf"]);

  function latestSeriesValue(company, key) {
    const annual = company.financials?.annual || {};
    const values = annual[key] || [];
    return values[values.length - 1];
  }

  function latestMetrics(company) {
    const valuation = company.valuation?.metrics || {};
    return {
      revenueGrowth: latestSeriesValue(company, "revenueGrowth") ?? valuation.revenueGrowth,
      grossMargin: latestSeriesValue(company, "grossMargin") ?? valuation.grossMargin,
      operatingMargin: latestSeriesValue(company, "operatingMargin") ?? valuation.operatingMargin,
      fcfMargin: latestSeriesValue(company, "fcfMargin") ?? valuation.fcfMargin,
      roic: latestSeriesValue(company, "roic") ?? valuation.roic,
      cashFlowOperations: latestSeriesValue(company, "cashFlowOperations") ?? valuation.cashFlowOperations,
      capex: latestSeriesValue(company, "capex") ?? valuation.capex,
      freeCashFlow: latestSeriesValue(company, "freeCashFlow") ?? valuation.freeCashFlow,
      pe: valuation.pe,
      forwardPe: valuation.forwardPe,
      evSales: valuation.evSales,
      evEbitda: valuation.evEbitda,
      evFcf: valuation.evFcf,
      pFcf: valuation.pFcf
    };
  }

  function formatMetric(value, unit) {
    if (!Number.isFinite(value)) return "Not meaningful";
    const digits = Math.abs(value) >= 100 ? 0 : 1;
    if (unit === "%") return `${value.toFixed(digits)}%`;
    if (unit === "x") return `${value.toFixed(1)}x`;
    return `${value.toFixed(1)}`;
  }

  function peerMedian(companies, key) {
    const values = companies.map((company) => latestMetrics(company)[key]).filter(Number.isFinite).sort((a, b) => a - b);
    if (!values.length) return null;
    const middle = Math.floor(values.length / 2);
    return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
  }

  function heatClass(companies, key, value) {
    const values = companies.map((company) => latestMetrics(company)[key]).filter(Number.isFinite);
    if (!Number.isFinite(value) || values.length < 2) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return "heat-mid";
    const percentile = (value - min) / (max - min);
    const score = VALUATION_KEYS.has(key) ? 1 - percentile : percentile;
    if (score >= 0.66) return "heat-good";
    if (score >= 0.34) return "heat-mid";
    return "heat-risk";
  }

  function relativeValuation(company, peers) {
    const metrics = latestMetrics(company);
    const valuationKeys = ["forwardPe", "evSales", "evEbitda", "evFcf"];
    let cheaper = 0;
    let expensive = 0;
    const evidence = [];
    valuationKeys.forEach((key) => {
      const median = peerMedian(peers, key);
      const value = metrics[key];
      if (!Number.isFinite(value) || !Number.isFinite(median)) return;
      if (value < median * 0.92) {
        cheaper += 1;
        evidence.push(`${labelFor(key)} below peer median`);
      } else if (value > median * 1.08) {
        expensive += 1;
        evidence.push(`${labelFor(key)} above peer median`);
      }
    });
    if (!evidence.length) {
      return { label: "Insufficient peer data", evidence: "Selected peers do not provide enough comparable multiples." };
    }
    if (cheaper > expensive) return { label: "Cheaper than peers", evidence: evidence.join("; ") };
    if (expensive > cheaper) return { label: "More expensive than peers", evidence: evidence.join("; ") };
    return { label: "In line with peers", evidence: evidence.join("; ") };
  }

  function labelFor(key) {
    return METRICS.find(([metricKey]) => metricKey === key)?.[1] || key;
  }

  window.Metrics = {
    METRICS,
    latestMetrics,
    formatMetric,
    heatClass,
    relativeValuation,
    labelFor
  };
})();
