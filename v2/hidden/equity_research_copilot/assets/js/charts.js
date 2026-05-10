import { companyColors, indexed } from "./metrics.js";

export const chartRegistry = {
  growth: null,
  margins: null,
  cash: null,
  market: null,
  valuation: null
};

const benchmarkColor = "#c8d3e4";
let zoomRegistered = false;

function destroyChart(key) {
  if (!chartRegistry[key]) return;
  chartRegistry[key].destroy();
  chartRegistry[key] = null;
}

export function resetChartZoom(key) {
  chartRegistry[key]?.resetZoom?.();
}

function showFallback(key, canvasId, fallbackId, message) {
  destroyChart(key);
  const canvas = document.getElementById(canvasId);
  const note = document.getElementById(fallbackId);
  if (canvas) canvas.hidden = true;
  if (note) {
    note.hidden = false;
    note.textContent = message;
  }
}

function context(canvasId, fallbackId) {
  const canvas = document.getElementById(canvasId);
  const note = document.getElementById(fallbackId);
  if (note) note.hidden = true;
  if (canvas) canvas.hidden = false;
  return canvas?.getContext("2d");
}

function lineOptions(title, unit) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      title: { display: true, text: `${title} (${unit})`, color: "#eef5ff", align: "start", font: { size: 15, weight: "700" } },
      legend: { labels: { color: "#c9d7ea", usePointStyle: true } },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}${unit === "%" ? "%" : ""}`
        }
      },
      zoom: {
        limits: { x: { min: "original", max: "original" } },
        pan: { enabled: true, mode: "x", modifierKey: "ctrl" },
        zoom: {
          drag: { enabled: true, backgroundColor: "rgba(107, 183, 255, 0.16)", borderColor: "rgba(107, 183, 255, 0.55)", borderWidth: 1 },
          mode: "x"
        }
      }
    },
    scales: {
      x: { ticks: { color: "#8ea3bd" }, grid: { color: "rgba(142, 163, 189, 0.12)" } },
      y: { ticks: { color: "#8ea3bd" }, grid: { color: "rgba(142, 163, 189, 0.12)" } }
    }
  };
}

function periodLabel(period) {
  return period === "ttm" ? "TTM" : period[0].toUpperCase() + period.slice(1);
}

function periodUnit(period) {
  if (period === "quarterly") return "quarters";
  if (period === "annual") return "annual points";
  return "rolling TTM points";
}

function availabilityTitle(metric, period, chartWindow, points) {
  return `${metric} comparison · ${periodLabel(period)} · ${chartWindow} requested · ${points} ${periodUnit(period)} available`;
}

function companyDataset(company, values, options = {}) {
  const color = options.color || companyColors[company.ticker] || benchmarkColor;
  return {
    label: options.label || company.ticker,
    data: values,
    borderColor: color,
    backgroundColor: `${color}22`,
    borderDash: options.borderDash || [],
    borderWidth: options.borderWidth || 2,
    pointRadius: options.pointRadius ?? 3,
    pointHoverRadius: 5,
    tension: 0.3,
    clip: false
  };
}

function lastLabels(chart) {
  const { ctx, chartArea } = chart;
  if (!chartArea) return;
  ctx.save();
  ctx.font = "700 11px Inter, sans-serif";
  ctx.textBaseline = "middle";
  chart.data.datasets.forEach((set, index) => {
    const meta = chart.getDatasetMeta(index);
    const last = meta.data[meta.data.length - 1];
    if (!last) return;
    ctx.fillStyle = set.borderColor;
    ctx.fillText(set.label, Math.min(last.x + 8, chartArea.right - 40), last.y);
  });
  ctx.restore();
}

const lastLabelPlugin = { id: "lastLabels", afterDatasetsDraw: lastLabels };

function createChart(key, canvasId, fallbackId, chartConfig) {
  if (!window.Chart) {
    showFallback(key, canvasId, fallbackId, "Chart.js did not load. The numeric dashboard remains available.");
    return null;
  }
  if (!zoomRegistered && window.ChartZoom) {
    window.Chart.register(window.ChartZoom);
    zoomRegistered = true;
  }
  const ctx = context(canvasId, fallbackId);
  if (!ctx) return null;
  destroyChart(key);
  const plugins = [lastLabelPlugin];
  chartRegistry[key] = new Chart(ctx, { ...chartConfig, plugins });
  return chartRegistry[key];
}

function renderLine({ key, canvasId, fallbackId, title, unit, labels, datasets }) {
  if (!labels?.length || labels.length < 2) {
    showFallback(key, canvasId, fallbackId, "Only one data point is available in this chart window. Select a longer window or a more frequent fundamental period to view a trend.");
    return;
  }
  createChart(key, canvasId, fallbackId, {
    type: "line",
    data: { labels, datasets },
    options: lineOptions(title, unit)
  });
}

export function renderGrowthChart({ companies, selectedCompanies, period, chartWindow, revenueMode, seriesCache }) {
  const first = seriesCache.getFinancialWindow(selectedCompanies[0], period, "revenue", revenueMode, chartWindow);
  if (first.reason) {
    showFallback("growth", "revenue-chart", "revenue-fallback", first.reason);
    return;
  }
  renderLine({
    key: "growth",
    canvasId: "revenue-chart",
    fallbackId: "revenue-fallback",
    title: availabilityTitle("Revenue", period, chartWindow, first.periods.length),
    unit: revenueMode === "indexed" ? "indexed to 100" : "USD bn",
    labels: first.periods,
    datasets: selectedCompanies.map((ticker) => {
      const company = companies[ticker];
      const series = seriesCache.getFinancialWindow(ticker, period, "revenue", revenueMode, chartWindow);
      return companyDataset(company, series.values);
    })
  });
}

export function renderMarginsChart({ companies, selectedCompanies, period, chartWindow, marginMetric, seriesCache, metricLabel }) {
  const first = seriesCache.getFinancialWindow(selectedCompanies[0], period, marginMetric, "absolute", chartWindow);
  if (first.reason) {
    showFallback("margins", "margin-chart", "margin-fallback", first.reason);
    return;
  }
  renderLine({
    key: "margins",
    canvasId: "margin-chart",
    fallbackId: "margin-fallback",
    title: availabilityTitle(metricLabel, period, chartWindow, first.periods.length),
    unit: "%",
    labels: first.periods,
    datasets: selectedCompanies.map((ticker) => {
      const company = companies[ticker];
      const series = seriesCache.getFinancialWindow(ticker, period, marginMetric, "absolute", chartWindow);
      return companyDataset(company, series.values);
    })
  });
}

export function renderCashChart({ companies, selectedCompanies, period, chartWindow, fcfMode, seriesCache }) {
  const first = seriesCache.getFinancialWindow(selectedCompanies[0], period, "freeCashFlow", fcfMode, chartWindow);
  if (first.reason) {
    showFallback("cash", "cash-chart", "cash-fallback", first.reason);
    return;
  }
  renderLine({
    key: "cash",
    canvasId: "cash-chart",
    fallbackId: "cash-fallback",
    title: availabilityTitle("Free cash flow", period, chartWindow, first.periods.length),
    unit: fcfMode === "indexed" ? "indexed to 100" : "USD bn",
    labels: first.periods,
    datasets: selectedCompanies.map((ticker) => {
      const company = companies[ticker];
      const series = seriesCache.getFinancialWindow(ticker, period, "freeCashFlow", fcfMode, chartWindow);
      return companyDataset(company, series.values);
    })
  });
}

export function renderMarketChart({ companies, selectedCompanies, chartWindow, stockMode, showBenchmark, benchmark, seriesCache }) {
  const first = seriesCache.getMarketWindow(selectedCompanies[0], chartWindow, stockMode);
  if (!first) {
    showFallback("market", "stock-chart", "stock-fallback", `No sample market data is available for ${chartWindow}.`);
    return;
  }
  const datasets = selectedCompanies.map((ticker) => {
    const company = companies[ticker];
    const series = seriesCache.getMarketWindow(ticker, chartWindow, stockMode);
    return companyDataset(company, series.values);
  });
  if (showBenchmark && benchmark?.series?.[chartWindow]) {
    const raw = benchmark.series[chartWindow].price;
    const values = stockMode === "percent" ? raw.map((value) => Number(((value / raw[0] - 1) * 100).toFixed(1))) : indexed(raw);
    datasets.push({
      label: benchmark.ticker,
      data: values,
      borderColor: benchmarkColor,
      backgroundColor: `${benchmarkColor}18`,
      borderDash: [4, 5],
      borderWidth: 1.5,
      pointRadius: 1.5,
      pointHoverRadius: 4,
      tension: 0.25
    });
  }
  renderLine({
    key: "market",
    canvasId: "stock-chart",
    fallbackId: "stock-fallback",
    title: `Market performance window - ${chartWindow}`,
    unit: stockMode === "percent" ? "% change" : "indexed to 100",
    labels: first.periods,
    datasets
  });
}

export function activeChartCount() {
  return Object.values(chartRegistry).filter(Boolean).length;
}
