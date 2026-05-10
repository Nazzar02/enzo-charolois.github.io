(function () {
  function analystNote(company, peers) {
    const metrics = window.Metrics.latestMetrics(company);
    const absolute = window.Scoring.absoluteValuation(metrics);
    const relative = window.Metrics.relativeValuation(company, peers);
    const growth = window.Scoring.growthLabel(metrics.revenueGrowth);
    const quality = window.Scoring.marginLabel(metrics.operatingMargin);
    return [
      section("Company overview", company.profile.summary),
      section("Financial quality", `${company.ticker} screens as a ${quality.toLowerCase()} profitability profile, with operating margin around ${window.Metrics.formatMetric(metrics.operatingMargin, "%")} and FCF margin around ${window.Metrics.formatMetric(metrics.fcfMargin, "%")}.`),
      section("Growth quality", `Latest annual revenue growth is ${window.Metrics.formatMetric(metrics.revenueGrowth, "%")}, which screens as ${growth.toLowerCase()} on the demo threshold scale.`),
      section("Valuation view", `Absolute valuation appears ${absolute.label.toLowerCase()}. Relative valuation screens ${relative.label.toLowerCase()} versus the selected peer set. This is not an automatic recommendation.`),
      section("Peer comparison", relative.evidence),
      section("Main risks", company.risks.join("; ")),
      section("Main catalysts", company.catalysts.join("; ")),
      section("Preliminary view", company.analyst_view.preliminary_view)
    ].join("");
  }

  function section(title, body) {
    return `<h3>${title}</h3><p>${body}</p>`;
  }

  window.Narrative = {
    analystNote
  };
})();
