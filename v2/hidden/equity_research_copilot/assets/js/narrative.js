import { absoluteValuation, qualityLabel, relativeValuation, scoreMetric } from "./scoring.js";

export function buildInvestmentNote(company, peers, config) {
  const absolute = absoluteValuation(company, config);
  const relative = relativeValuation(company, peers, config);
  const growthScore = scoreMetric(company.metrics.revenueGrowth, config.availableMetrics.revenueGrowth).label.toLowerCase();
  const fcfScore = scoreMetric(company.metrics.fcfMargin, config.availableMetrics.fcfMargin).label.toLowerCase();
  const cheaper = relative.evidence.filter((item) => item.cheaper).map((item) => item.label).join(", ") || "no major selected multiple";
  const expensive = relative.evidence.filter((item) => item.expensive).map((item) => item.label).join(", ") || "no major selected multiple";
  const preliminary = absolute.label === "Demanding"
    ? "Quality business, valuation demanding"
    : relative.label === "Cheaper than peers"
      ? "Positive watchlist"
      : "Neutral watchlist";

  return [
    ["Company overview", `${company.name} (${company.ticker}) is a ${company.industry.toLowerCase()} company. ${company.profile.summary}`],
    ["Financial quality", `${qualityLabel(company, config)}, with gross margin of ${company.metrics.grossMargin}% and operating margin of ${company.metrics.operatingMargin}%.`],
    ["Growth quality", `Revenue growth screens ${growthScore} at ${company.metrics.revenueGrowth}%. The analyst should test whether this is structural, cyclical, or comparison-period driven.`],
    ["Cash conversion", `FCF margin screens ${fcfScore} at ${company.metrics.fcfMargin}%, with sample FCF of $${company.metrics.freeCashFlow}bn. Capex intensity and reinvestment needs remain important context.`],
    ["Valuation view", `Absolute valuation appears ${absolute.label.toLowerCase()}. Relative valuation screens as ${relative.label.toLowerCase()}, with cheaper evidence in ${cheaper} and more expensive evidence in ${expensive}.`],
    ["Peer comparison", `${company.ticker} should be compared on indexed revenue, margin quality, FCF conversion, and valuation spreads rather than on size alone.`],
    ["Main risks", company.risks.slice(0, 3).join("; ")],
    ["Main catalysts", company.catalysts.slice(0, 3).join("; ")],
    ["Preliminary view", `${preliminary}. This is not an automatic recommendation; it identifies the next qualitative questions for human review.`]
  ];
}
