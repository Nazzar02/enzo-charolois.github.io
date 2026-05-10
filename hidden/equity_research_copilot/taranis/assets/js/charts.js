(function () {
  const registry = {};
  const companyPalette = {
    TSM: "#6fb7e8",
    NVDA: "#6ccf9b",
    ASML: "#e4b563",
    AVGO: "#a991d4"
  };
  const metricPalette = {
    revenue: "#6fb7e8",
    grossMargin: "#d4b06a",
    operatingMargin: "#6fb7e8",
    fcfMargin: "#6ccf9b",
    cashFlowOperations: "#6fb7e8",
    capex: "#e4b563",
    freeCashFlow: "#6ccf9b"
  };
  let zoomLoadStarted = false;

  function canChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    const fallback = document.querySelector(`[data-fallback="${canvasId}"]`);
    if (!window.Chart || !canvas) {
      if (fallback) {
        fallback.textContent = "Chart library unavailable. The dashboard remains readable through KPI cards and tables.";
        fallback.classList.add("is-visible");
      }
      if (canvas) canvas.hidden = true;
      return false;
    }
    canvas.hidden = false;
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
          legend: {
            position: "bottom",
            align: "start",
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              color: "#dce8f6",
              padding: 18,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: "#07111f",
            borderColor: "rgba(212,176,106,.38)",
            borderWidth: 1,
            titleColor: "#eef4f9",
            bodyColor: "#b6c2cf",
            padding: 12
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
              modifierKey: "ctrl"
            },
            zoom: {
              drag: {
                enabled: true,
                backgroundColor: "rgba(212,176,106,.12)",
                borderColor: "rgba(212,176,106,.5)",
                borderWidth: 1
              },
              mode: "x",
              wheel: {
                enabled: false
              }
            },
            limits: {
              x: { min: "original", max: "original" }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#93a4b8", maxRotation: 0 },
            grid: { color: "rgba(201,214,230,.06)" },
            border: { color: "rgba(201,214,230,.16)" }
          },
          y: {
            title: { display: true, text: yTitle, color: "#aab8ca" },
            ticks: { color: "#93a4b8" },
            grid: { color: "rgba(201,214,230,.07)" },
            border: { color: "rgba(201,214,230,.16)" }
          }
        }
      }
    });
  }

  function companyDataset(ticker, label, values) {
    return baseDataset(label, values, companyPalette[ticker] || "#d4b06a");
  }

  function metricDataset(metric, label, values, options = {}) {
    return baseDataset(label, values, metricPalette[metric] || "#d4b06a", options);
  }

  function baseDataset(label, values, color, options = {}) {
    return {
      label,
      data: values,
      borderColor: color,
      backgroundColor: color,
      borderWidth: options.width || 2,
      borderDash: options.dashed ? [5, 5] : [],
      pointRadius: options.points === false ? 0 : 3,
      pointHoverRadius: 5,
      tension: 0.28
    };
  }

  function renderFinancialCharts(company) {
    const annual = company.financials.annual;
    lineChart("revenue-chart", annual.periods, [companyDataset(company.ticker, `${company.ticker} revenue`, annual.revenue)], "USD bn");
    lineChart("margin-chart", annual.periods, [
      metricDataset("grossMargin", "Gross margin", annual.grossMargin),
      metricDataset("operatingMargin", "Operating margin", annual.operatingMargin, { dashed: true }),
      metricDataset("fcfMargin", "FCF margin", annual.fcfMargin)
    ], "%");
    lineChart("cash-chart", annual.periods, [
      metricDataset("cashFlowOperations", "Cash flow from operations", annual.cashFlowOperations),
      metricDataset("capex", "Capex", annual.capex, { dashed: true }),
      metricDataset("freeCashFlow", "Free cash flow", annual.freeCashFlow)
    ], "USD bn");
  }

  function loadZoomPlugin() {
    if (zoomLoadStarted || !window.Chart) return;
    zoomLoadStarted = true;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.2.0/dist/chartjs-plugin-zoom.min.js";
    script.async = true;
    script.onload = () => {
      if (window.ChartZoom && !Chart.registry.plugins.get("zoom")) {
        Chart.register(window.ChartZoom);
      }
      window.dispatchEvent(new Event("chartjs-zoom-ready"));
    };
    document.head.appendChild(script);
  }

  window.PocCharts = {
    renderFinancialCharts,
    loadZoomPlugin,
    resetZoom(canvasId) {
      const chart = registry[canvasId];
      if (!chart) return;
      if (typeof chart.resetZoom === "function") {
        chart.resetZoom();
      } else {
        chart.resize();
      }
    },
    resizeAll() {
      Object.values(registry).forEach((chart) => chart.resize());
    },
    destroyAll() {
      Object.keys(registry).forEach(destroy);
    }
  };
})();
