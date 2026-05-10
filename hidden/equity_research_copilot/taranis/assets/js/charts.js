(function () {
  const registry = {};
  const palette = {
    TSM: "#5db7ff",
    NVDA: "#61d394",
    ASML: "#f0a85f",
    AVGO: "#b998ff"
  };

  function canChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const fallback = document.querySelector(`[data-fallback="${canvasId}"]`);
    if (!window.Chart || !canvas) {
      if (fallback) {
        fallback.textContent = "Chart library unavailable. The dashboard remains readable through KPI cards and tables.";
        fallback.classList.add("is-visible");
      }
      return false;
    }
    if (fallback) fallback.classList.remove("is-visible");
    return true;
  }

  function destroy(canvasId) {
    if (registry[canvasId]) {
      registry[canvasId].destroy();
      delete registry[canvasId];
    }
  }

  function lineChart(canvasId, labels, datasets, yTitle) {
    if (!canChart(canvasId)) return;
    destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    registry[canvasId] = new Chart(ctx, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: "#dce8f6", usePointStyle: true } },
          tooltip: { backgroundColor: "#07111f", borderColor: "rgba(215,181,109,.35)", borderWidth: 1 }
        },
        scales: {
          x: { ticks: { color: "#93a4b8" }, grid: { color: "rgba(186,202,221,.08)" } },
          y: { title: { display: true, text: yTitle, color: "#aab8ca" }, ticks: { color: "#93a4b8" }, grid: { color: "rgba(186,202,221,.08)" } }
        }
      }
    });
  }

  function dataset(ticker, label, values, dashed) {
    return {
      label,
      data: values,
      borderColor: palette[ticker] || "#d7b56d",
      backgroundColor: palette[ticker] || "#d7b56d",
      borderWidth: 2,
      borderDash: dashed ? [5, 5] : [],
      pointRadius: 3,
      tension: 0.32
    };
  }

  function renderFinancialCharts(company) {
    const annual = company.financials.annual;
    lineChart("revenue-chart", annual.periods, [dataset(company.ticker, `${company.ticker} revenue`, annual.revenue)], "USD bn");
    lineChart("margin-chart", annual.periods, [
      dataset(company.ticker, "Gross margin", annual.grossMargin),
      dataset(company.ticker, "Operating margin", annual.operatingMargin, true),
      dataset(company.ticker, "FCF margin", annual.fcfMargin, true)
    ], "%");
    lineChart("cash-chart", annual.periods, [
      dataset(company.ticker, "Cash flow from operations", annual.cashFlowOperations),
      dataset(company.ticker, "Capex", annual.capex, true),
      dataset(company.ticker, "Free cash flow", annual.freeCashFlow)
    ], "USD bn");
  }

  window.PocCharts = {
    renderFinancialCharts,
    resizeAll() {
      Object.values(registry).forEach((chart) => chart.resize());
    },
    destroyAll() {
      Object.keys(registry).forEach(destroy);
    }
  };
})();
