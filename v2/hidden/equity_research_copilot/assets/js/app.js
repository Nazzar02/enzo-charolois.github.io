import { loadDashboardData } from "./data_loader.js";
import { comparisonSet, formatValue, indexed, latest, metricInfoButton, periodLabel } from "./metrics.js";
import { absoluteValuation, badgeClass, heatmapClass, relativeValuation, scoreMetric } from "./scoring.js";
import { activeChartCount, renderCashChart, renderGrowthChart, renderMarginsChart, renderMarketChart, resetChartZoom } from "./charts.js";
import { buildInvestmentNote } from "./narrative.js";

const DEBUG = new URLSearchParams(window.location.search).has("debug");
const $ = (id) => document.getElementById(id);

const appState = {
  data: null,
  selectedTicker: "TSM",
  peers: ["NVDA", "ASML", "AVGO"],
  period: "annual",
  chartWindow: "1Y",
  revenueMode: "absolute",
  fcfMode: "absolute",
  stockMode: "indexed",
  marginMetric: "grossMargin",
  showBenchmark: false,
  visibleColumns: [],
  sort: { key: "revenueGrowth", direction: "desc" },
  activeTab: "overview",
  search: "",
  sector: "All",
  caseMode: localStorage.getItem("equityCopilot.caseMode") === "true"
};

const seriesCache = {
  financial: new Map(),
  market: new Map(),
  getFinancialWindow(ticker, period, key, mode = "absolute", chartWindow = "MAX") {
    const cacheKey = `${ticker}:${period}:${key}:${mode}:${chartWindow}`;
    if (this.financial.has(cacheKey)) return this.financial.get(cacheKey);
    const source = getFundamentalSeries(appState.data.companies[ticker], period, key);
    if (source.reason) {
      this.financial.set(cacheKey, source);
      return source;
    }
    const sliced = sliceFinancialWindow(source.periods, source.values, period, chartWindow);
    if (sliced.reason) {
      this.financial.set(cacheKey, sliced);
      return sliced;
    }
    const result = sliced.values.length < 2
      ? { ...sliced, reason: onePointMessage(period) }
      : { ...sliced, values: mode === "indexed" ? indexed(sliced.values) : sliced.values };
    this.financial.set(cacheKey, result);
    return result;
  },
  getMarketWindow(ticker, chartWindow, mode = "indexed") {
    const cacheKey = `${ticker}:${chartWindow}:${mode}`;
    if (this.market.has(cacheKey)) return this.market.get(cacheKey);
    const series = appState.data.companies[ticker].stockPerformance.series[chartWindow];
    if (!series) return null;
    const values = mode === "percent"
      ? series.price.map((value) => Number(((value / series.price[0] - 1) * 100).toFixed(1)))
      : indexed(series.price);
    const result = { periods: series.periods, values };
    this.market.set(cacheKey, result);
    return result;
  }
};

function onePointMessage(period) {
  if (period === "ttm") return "Only current TTM value available. Rolling TTM trend requires at least four quarters per point.";
  return "Only one data point is available in this chart window. Select a longer chart window or a more frequent fundamental period to view a trend.";
}

function windowSize(period, chartWindow) {
  if (chartWindow === "MAX") return Infinity;
  if (period === "annual") {
    return { "1Y": 1, "3Y": 3, "5Y": 5, "10Y": 10 }[chartWindow] || null;
  }
  return { "1M": 1, "3M": 1, "6M": 2, "YTD": 2, "1Y": 4, "3Y": 12, "5Y": 20, "10Y": 40 }[chartWindow] || Infinity;
}

function sliceFinancialWindow(periods, values, period, chartWindow) {
  const count = windowSize(period, chartWindow);
  if (count === null) return { periods: [], values: [], reason: "Annual data cannot show a 6M window. Use Quarterly or choose 1Y plus." };
  if (count === Infinity) return { periods, values };
  return { periods: periods.slice(-count), values: values.slice(-count) };
}

function periodUnit(period) {
  if (period === "quarterly") return "quarters";
  if (period === "annual") return "annual points";
  return "rolling TTM points";
}

function getRequiredPeriods(period, chartWindow) {
  if (chartWindow === "MAX") return { supported: true, periods: null };
  if (period === "annual") {
    const periods = { "1Y": 1, "3Y": 3, "5Y": 5, "10Y": 10 }[chartWindow];
    if (!periods) return { supported: false, periods: null, message: "Not available for annual data. Switch to Quarterly or choose 1Y plus." };
    return { supported: true, periods };
  }
  if (period === "quarterly") {
    const periods = { "6M": 2, "1Y": 4, "3Y": 12, "5Y": 20, "10Y": 40 }[chartWindow];
    if (!periods) return { supported: false, periods: null, message: "Not meaningful for quarterly fundamentals. Use 6M or longer for window growth." };
    return { supported: true, periods };
  }
  const periods = { "1Y": 4, "3Y": 12, "5Y": 20, "10Y": 40 }[chartWindow];
  if (!periods) return { supported: false, periods: null, message: "Only current TTM value available. Add rolling TTM series or switch to Quarterly or Annual to view a trend." };
  return { supported: true, periods };
}

function getFundamentalSeries(company, period, key) {
  if (period !== "ttm") {
    const source = company.financials[period];
    return { periods: source?.periods || [], values: source?.[key] || [] };
  }
  return rollingTtmSeries(company, key);
}

function rollingTtmSeries(company, key) {
  const q = company.financials.quarterly;
  if (!q || q.periods.length < 4) {
    return { periods: [], values: [], reason: "Not enough quarterly data to compute rolling TTM trend." };
  }
  const revenue = rollingSum(q.revenue);
  const fcf = rollingSum(q.freeCashFlow);
  const grossProfit = rollingSum(q.revenue.map((value, index) => value * q.grossMargin[index] / 100));
  const operatingIncome = rollingSum(q.revenue.map((value, index) => value * q.operatingMargin[index] / 100));
  const netIncome = rollingSum(q.revenue.map((value, index) => value * q.netMargin[index] / 100));
  const periods = q.periods.slice(3).map((label) => `TTM ${label}`);
  const map = {
    revenue,
    freeCashFlow: fcf,
    grossMargin: grossProfit.map((value, index) => Number((value / revenue[index] * 100).toFixed(1))),
    operatingMargin: operatingIncome.map((value, index) => Number((value / revenue[index] * 100).toFixed(1))),
    netMargin: netIncome.map((value, index) => Number((value / revenue[index] * 100).toFixed(1))),
    fcfMargin: fcf.map((value, index) => Number((value / revenue[index] * 100).toFixed(1)))
  };
  if (!map[key]) {
    return { periods: [], values: [], reason: "Not enough quarterly data to compute rolling TTM trend." };
  }
  return { periods, values: map[key].map((value) => Number(value.toFixed ? value.toFixed(1) : value)) };
}

function rollingSum(values) {
  const result = [];
  for (let i = 3; i < values.length; i += 1) {
    result.push(Number((values[i] + values[i - 1] + values[i - 2] + values[i - 3]).toFixed(1)));
  }
  return result;
}

function latestPointLabel(company) {
  if (appState.period === "ttm") return "Latest available";
  const source = company.financials[appState.period] || company.financials.annual;
  return source.periods[source.periods.length - 1] || "Latest available";
}

function cardContext(company) {
  return `${company.ticker} · ${periodLabel(appState.period)} · ${appState.period === "ttm" ? "Latest available" : `Latest point ${latestPointLabel(company)}`}`;
}

function latestReportedRevenueGrowth(company) {
  const source = getFundamentalSeries(company, appState.period, "revenueGrowth");
  if (!source.reason && source.values?.length) return latest(source, "values");
  const fallback = company.financials[appState.period] || company.financials.annual;
  return latest(fallback, "revenueGrowth");
}

function revenueGrowthForWindow(company) {
  const source = getFundamentalSeries(company, appState.period, "revenue");
  if (source.reason) return { value: null, note: source.reason };
  const current = source.values[source.values.length - 1];
  const required = getRequiredPeriods(appState.period, appState.chartWindow);
  if (!required.supported) return { value: null, note: `Window growth ${appState.chartWindow}: ${required.message}` };
  const lookback = required.periods === null ? source.values.length - 1 : required.periods;
  if (!lookback) return { value: null, note: `Window growth ${appState.chartWindow}: not meaningful.` };
  if (source.values.length <= lookback) {
    return {
      value: null,
      note: `Window growth ${appState.chartWindow}: not available, ${source.values.length} ${periodUnit(appState.period)} available, ${lookback} required.`
    };
  }
  const base = source.values[source.values.length - 1 - lookback];
  if (!base) return { value: null, note: `Window growth ${appState.chartWindow}: not enough usable revenue data.` };
  return { value: Number(((current / base - 1) * 100).toFixed(1)), note: `Window growth ${appState.chartWindow}: ${Number(((current / base - 1) * 100).toFixed(1))}%` };
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function config() {
  return appState.data.peers;
}

function currentCompany() {
  return appState.data.companies[appState.selectedTicker];
}

function selectedTickers() {
  return comparisonSet(appState);
}

function filteredTickers() {
  const query = appState.search.trim().toLowerCase();
  return appState.data.tickers.filter((ticker) => {
    const company = appState.data.companies[ticker];
    const matchesSector = appState.sector === "All" || company.sector === appState.sector;
    const matchesQuery = !query || ticker.toLowerCase().includes(query) || company.name.toLowerCase().includes(query);
    return matchesSector && matchesQuery;
  });
}

function ensureSelectedTickerVisible() {
  const tickers = filteredTickers();
  if (tickers.length && !tickers.includes(appState.selectedTicker)) {
    appState.selectedTicker = tickers[0];
    normalizePeers(true);
  }
}

function selectedPeerRows() {
  const selected = new Set(appState.peers.filter(Boolean));
  return { ...config(), companies: config().companies.filter((row) => selected.has(row.ticker)) };
}

function list(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function message(text) {
  const el = $("state-message");
  el.textContent = text;
  el.hidden = false;
  window.clearTimeout(message.timer);
  message.timer = window.setTimeout(() => { el.hidden = true; }, 2200);
}

function debounce(fn, delay = 120) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function normalizePeers(showNotice = false) {
  const before = appState.peers.join("|");
  const used = new Set([appState.selectedTicker]);
  appState.peers = appState.peers.map((ticker) => {
    if (!ticker) return "";
    if (used.has(ticker)) return "";
    used.add(ticker);
    return ticker;
  });
  if (showNotice && before !== appState.peers.join("|")) message("Duplicate peer removed.");
}

function optionHtml(selected, selectIndex) {
  const usedByOtherPeers = new Set(appState.peers.filter((ticker, index) => index !== selectIndex && ticker));
  return `<option value="">None</option>${appState.data.tickers.map((ticker) => {
    const disabled = ticker === appState.selectedTicker || usedByOtherPeers.has(ticker);
    return `<option value="${ticker}" ${ticker === selected ? "selected" : ""} ${disabled ? "disabled" : ""}>${ticker} - ${escapeHtml(appState.data.companies[ticker].name)}</option>`;
  }).join("")}`;
}

function storageKey(kind, ticker = appState.selectedTicker) {
  return `equityCopilot.${kind}.${ticker}`;
}

function loadJsonStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function addCompanyToRuntime(company, persist = false) {
  const ticker = company.ticker;
  appState.data.companies[ticker] = company;
  if (!appState.data.tickers.includes(ticker)) appState.data.tickers.push(ticker);
  if (!config().companies.some((row) => row.ticker === ticker)) {
    config().companies.push({ ticker, name: company.name, sector: company.sector, ...company.metrics });
  }
  if (persist) {
    const imports = loadJsonStorage("equityCopilot.importedCompanies", {});
    imports[ticker] = company;
    saveJsonStorage("equityCopilot.importedCompanies", imports);
  }
}

function mergeImportedCompanies() {
  const imports = loadJsonStorage("equityCopilot.importedCompanies", {});
  Object.values(imports).forEach((company) => {
    if (company?.ticker) addCompanyToRuntime(company, false);
  });
}

function importedCompanies() {
  return loadJsonStorage("equityCopilot.importedCompanies", {});
}

function deleteImportedCompany(ticker) {
  const imports = importedCompanies();
  delete imports[ticker];
  saveJsonStorage("equityCopilot.importedCompanies", imports);
  delete appState.data.companies[ticker];
  appState.data.tickers = appState.data.tickers.filter((item) => item !== ticker);
  config().companies = config().companies.filter((row) => row.ticker !== ticker);
  if (appState.selectedTicker === ticker) appState.selectedTicker = appState.data.tickers[0] || "TSM";
  initControls();
  renderApp("all");
  message(`${ticker} removed from imported companies.`);
  renderImportedCompanyList();
}

function validateCompanySchema(company) {
  const required = ["ticker", "name", "profile", "financials", "metrics", "stockPerformance", "risks", "catalysts"];
  const missing = required.filter((key) => company[key] === undefined);
  if (missing.length) return `Missing required fields: ${missing.join(", ")}`;
  if (!company.financials.annual || !company.financials.quarterly) return "Financials must include annual and quarterly data.";
  if (!company.stockPerformance.series) return "Stock performance must include sample series data.";
  return "";
}

function exportCurrentCompanyJson() {
  const company = currentCompany();
  downloadText(`${company.ticker}.json`, JSON.stringify(company, null, 2));
}

function emptyCompanyTemplate() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    ticker: "TEMPLATE",
    name: "Company name",
    exchange: "",
    industry: "",
    currency: "USD",
    dataStatus: "Sample data",
    profile: {
      summary: "",
      segments: [],
      customers: [],
      moat: [],
      geography: ""
    },
    financials: {
      annual: {
        periods: [],
        revenue: [],
        revenueGrowth: [],
        grossMargin: [],
        operatingMargin: [],
        netMargin: [],
        cashFlowOperations: [],
        capex: [],
        freeCashFlow: [],
        fcfMargin: [],
        roic: [],
        source: { name: "", url: "", as_of: "", retrieved_at: today, notes: "" }
      },
      quarterly: {
        periods: [],
        revenue: [],
        revenueGrowth: [],
        grossMargin: [],
        operatingMargin: [],
        netMargin: [],
        cashFlowOperations: [],
        capex: [],
        freeCashFlow: [],
        fcfMargin: [],
        roic: [],
        source: { name: "", url: "", as_of: "", retrieved_at: today, notes: "" }
      },
      ttm: {
        periods: ["TTM"],
        revenue: [],
        revenueGrowth: [],
        grossMargin: [],
        operatingMargin: [],
        netMargin: [],
        cashFlowOperations: [],
        capex: [],
        freeCashFlow: [],
        fcfMargin: [],
        roic: [],
        source: { name: "", url: "", as_of: "", retrieved_at: today, notes: "" }
      }
    },
    valuation: {
      metrics: { pe: null, forwardPe: null, evSales: null, evEbitda: null, evFcf: null, pFcf: null, debt: null, netDebt: null, capexIntensity: null },
      source: { name: "", url: "", as_of: "", retrieved_at: today, notes: "" }
    },
    metrics: {
      revenueGrowth: null,
      grossMargin: null,
      operatingMargin: null,
      netMargin: null,
      cashFlowOperations: null,
      capex: null,
      freeCashFlow: null,
      fcfMargin: null,
      pe: null,
      forwardPe: null,
      evSales: null,
      evEbitda: null,
      evFcf: null,
      pFcf: null,
      roic: null,
      debt: null,
      netDebt: null,
      capexIntensity: null
    },
    stockPerformance: {
      note: "Sample market data for demo purposes.",
      horizons: {},
      series: {}
    },
    risks: [],
    catalysts: [],
    analystFlags: [],
    data_status: {
      last_updated: today,
      source_type: "sample_manual",
      source_notes: "Static sample data for interview demo.",
      latest_annual_period: "",
      latest_quarterly_period: "",
      latest_market_period: "",
      latest_valuation_period: "",
      has_mixed_freshness: false
    },
    market_source: { name: "", url: "", as_of: "", retrieved_at: today, notes: "" }
  };
}

async function downloadGeneratorScript() {
  try {
    const response = await fetch("tools/build_company_json.py");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    downloadText("build_company_json.py", await response.text());
  } catch (error) {
    message(`Generator download failed: ${error.message}`);
  }
}

function downloadTemplateJson() {
  downloadText("empty_company_template.json", JSON.stringify(emptyCompanyTemplate(), null, 2));
}

function downloadExampleTsmJson() {
  const company = appState.data.companies.TSM || currentCompany();
  downloadText("TSM.example.json", JSON.stringify(company, null, 2));
}

function editableKey(key) {
  return storageKey(`editable.${key}`);
}

function plainList(items) {
  return items.join("\n");
}

function notePlainText() {
  return buildInvestmentNote(currentCompany(), selectedPeerRows(), config()).map(([title, body]) => `${title}\n${body}`).join("\n\n");
}

function generatedEditable(key) {
  const company = currentCompany();
  const generated = {
    business: company.profile.summary,
    segments: plainList(company.profile.segments),
    moat: plainList(company.profile.moat),
    risks: plainList(company.risks),
    catalysts: plainList(company.catalysts),
    note: notePlainText()
  };
  return generated[key] || "";
}

function editableValue(key) {
  const stored = localStorage.getItem(editableKey(key));
  return stored === null ? generatedEditable(key) : stored;
}

function listFromText(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function renderEditableList(key, targetId) {
  document.getElementById(targetId).innerHTML = list(listFromText(editableValue(key)));
  const editor = $(`${key}-editor`);
  if (editor) editor.value = editableValue(key);
}

function renderEditableText(key, targetId) {
  document.getElementById(targetId).textContent = editableValue(key);
  const editor = $(`${key}-editor`);
  if (editor) editor.value = editableValue(key);
}

function renderEditableNote() {
  const value = editableValue("note");
  const isGenerated = localStorage.getItem(editableKey("note")) === null;
  if (isGenerated) {
    $("investment-note").innerHTML = buildInvestmentNote(currentCompany(), selectedPeerRows(), config()).map(([title, body]) => `
      <article class="note-line"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>
    `).join("");
  } else {
    $("investment-note").innerHTML = `<pre class="editable-pre">${escapeHtml(value)}</pre>`;
  }
  $("note-editor").value = value;
}

function setEditableMode(key, editing) {
  const block = document.querySelector(`[data-editable-block="${key}"]`);
  if (!block) return;
  block.querySelectorAll(".editable-display").forEach((el) => { el.hidden = editing; });
  block.querySelectorAll(".editable-editor").forEach((el) => { el.hidden = !editing; });
}

function saveEditable(key) {
  const editor = $(`${key}-editor`);
  localStorage.setItem(editableKey(key), editor.value);
  setEditableMode(key, false);
  renderEditableBlocks();
  message("Editable text saved.");
}

function resetEditable(key) {
  localStorage.removeItem(editableKey(key));
  setEditableMode(key, false);
  renderEditableBlocks();
  message("Reset to generated text.");
}

function clearEditable(key) {
  localStorage.setItem(editableKey(key), "");
  setEditableMode(key, false);
  renderEditableBlocks();
}

function initControls() {
  ensureSelectedTickerVisible();
  const tickers = filteredTickers();
  $("ticker-select").innerHTML = tickers.length
    ? tickers.map((ticker) => `<option value="${ticker}">${ticker} - ${escapeHtml(appState.data.companies[ticker].name)}</option>`).join("")
    : `<option value="${appState.selectedTicker}">${appState.selectedTicker} - ${escapeHtml(currentCompany().name)}</option>`;
  $("period-controls").innerHTML = config().financialPeriods.map((period) => `<button class="segment" data-period="${period}">${periodLabel(period)}</button>`).join("");
  $("horizon-controls").innerHTML = config().horizons.map((horizon) => `<button class="segment" data-horizon="${horizon}">${horizon}</button>`).join("");
  $("margin-metric-select").innerHTML = ["grossMargin", "operatingMargin", "netMargin", "fcfMargin", "roic"].map((key) => `<option value="${key}">${config().availableMetrics[key].label}</option>`).join("");
  $("peer-metric-focus").innerHTML = Object.keys(config().availableMetrics).filter((key) => key !== "ticker").map((key) => `<option value="${key}">${config().availableMetrics[key].label}</option>`).join("");
  renderColumnPicker();
}

function updateControlValues() {
  document.body.classList.toggle("case-mode", appState.caseMode);
  $("company-search").value = appState.search;
  $("sector-filter").value = appState.sector;
  $("case-mode-toggle").checked = appState.caseMode;
  $("ticker-select").value = appState.selectedTicker;
  ["peer-1", "peer-2", "peer-3"].forEach((id, index) => {
    $(id).innerHTML = optionHtml(appState.peers[index], index);
    $(id).value = appState.peers[index] || "";
  });
  $("period-controls").querySelectorAll("[data-period]").forEach((button) => button.classList.toggle("active", button.dataset.period === appState.period));
  $("horizon-controls").querySelectorAll("[data-horizon]").forEach((button) => {
    button.classList.toggle("active", button.dataset.horizon === appState.chartWindow);
    button.disabled = !currentCompany().stockPerformance.series[button.dataset.horizon] && button.dataset.horizon !== "MAX";
  });
  $("margin-metric-select").value = appState.marginMetric;
  $("benchmark-toggle").checked = appState.showBenchmark;
  $("peer-metric-focus").value = appState.sort.key;
  document.querySelectorAll("[data-revenue-mode]").forEach((button) => button.classList.toggle("active", button.dataset.revenueMode === appState.revenueMode));
  document.querySelectorAll("[data-fcf-mode]").forEach((button) => button.classList.toggle("active", button.dataset.fcfMode === appState.fcfMode));
  document.querySelectorAll("[data-stock-mode]").forEach((button) => button.classList.toggle("active", button.dataset.stockMode === appState.stockMode));
}

function renderColumnPicker() {
  const metrics = config().availableMetrics;
  const keys = Object.keys(metrics).filter((key) => key !== "ticker");
  $("column-picker").innerHTML = keys.map((key) => `
    <label><input type="checkbox" value="${key}" ${appState.visibleColumns.includes(key) ? "checked" : ""}> ${metrics[key].label}</label>
  `).join("");
  renderColumnOrder();
}

function persistColumns() {
  saveJsonStorage("equityCopilot.columns", appState.visibleColumns);
}

function renderColumnOrder() {
  const metrics = config().availableMetrics;
  $("column-order").innerHTML = appState.visibleColumns.map((key, index) => `
    <div class="column-order-row">
      <strong>${metrics[key].label}</strong>
      <button class="mode-button" data-column-left="${key}" ${index === 0 ? "disabled" : ""} type="button">Move left</button>
      <button class="mode-button" data-column-right="${key}" ${index === appState.visibleColumns.length - 1 ? "disabled" : ""} type="button">Move right</button>
      <button class="mode-button" data-column-hide="${key}" type="button">Hide</button>
    </div>
  `).join("");
}

function moveColumn(key, offset) {
  const from = appState.visibleColumns.indexOf(key);
  const to = from + offset;
  if (from < 0 || to < 0 || to >= appState.visibleColumns.length) return;
  const next = [...appState.visibleColumns];
  [next[from], next[to]] = [next[to], next[from]];
  appState.visibleColumns = next;
  persistColumns();
  renderColumnPicker();
  renderPeerTable();
}

function metricCard(company, key) {
  const metric = config().availableMetrics[key];
  const currentFinancial = company.financials[appState.period] || company.financials.annual;
  const growthWindow = key === "revenueGrowth" ? revenueGrowthForWindow(company) : null;
  const value = key === "revenueGrowth"
    ? latestReportedRevenueGrowth(company)
    : key in currentFinancial ? latest(currentFinancial, key) : company.metrics[key];
  const scored = scoreMetric(value, metric);
  return `<article class="metric-card">
    <small class="card-context">${cardContext(company)}</small>
    <span>${key === "revenueGrowth" ? "Latest reported revenue growth" : metric.label} ${metricInfoButton(config(), key)}</span>
    <strong>${formatValue(metric, value)}</strong>
    <em class="badge ${scored.className}">${scored.label}</em>
    ${growthWindow?.note ? `<small class="metric-note">${escapeHtml(growthWindow.note)}</small>` : ""}
  </article>`;
}

function sourceBadges(company) {
  const status = company.data_status || {};
  const sample = (status.source_type || company.dataStatus || "").toLowerCase().includes("sample") || (status.source_type || "").includes("mock");
  return `
    <div class="source-badges">
      <span class="badge badge-info">${sample ? "Sample data for preparation" : escapeHtml(status.source_type || "Source noted")}</span>
      <span>Annual ${escapeHtml(status.latest_annual_period || "Not available")}</span>
      <span>Quarterly ${escapeHtml(status.latest_quarterly_period || "Not available")}</span>
      <span>Valuation ${escapeHtml(status.latest_valuation_period || "Not available")}</span>
      ${status.has_mixed_freshness ? `<strong>Mixed freshness, verify before using professionally</strong>` : ""}
    </div>`;
}

function renderCasePrepCard() {
  const company = currentCompany();
  const card = company.caseStudy || {};
  const growthWindow = revenueGrowthForWindow(company);
  $("case-company-card").innerHTML = `
    ${sourceBadges(company)}
    <div class="case-card-head"><div><p>${escapeHtml(company.sector || "Technology")}</p><h2>${escapeHtml(company.ticker)} · ${escapeHtml(company.name)}</h2></div><span class="badge badge-info">30 sec prep</span></div>
    <p class="case-one-liner">${escapeHtml(card.oneSentenceBusiness || company.profile.summary)}</p>
    <div class="case-card-grid">
      <div><span>Key segments</span><strong>${escapeHtml((card.keySegments || company.profile.segments || []).join(", "))}</strong></div>
      <div><span>Why it matters</span><strong>${escapeHtml(card.whyItMatters || "Important technology company for sector context.")}</strong></div>
      <div><span>Moat</span><strong>${escapeHtml(card.moat || (company.profile.moat || []).join(", "))}</strong></div>
      <div><span>Growth quality</span><strong>${escapeHtml(card.growthQuality || "Review growth drivers and margin quality.")}</strong></div>
      <div><span>Cash quality</span><strong>${escapeHtml(card.cashQuality || "Review FCF conversion and capex intensity.")}</strong></div>
      <div><span>Valuation view</span><strong>${escapeHtml(card.valuationView || "Separate absolute and relative valuation.")}</strong></div>
      <div><span>Main risks</span><strong>${escapeHtml((card.mainRisks || company.risks || []).slice(0, 3).join("; "))}</strong></div>
      <div><span>Main catalysts</span><strong>${escapeHtml((card.mainCatalysts || company.catalysts || []).slice(0, 3).join("; "))}</strong></div>
      <div><span>Case study angle</span><strong>${escapeHtml(card.caseStudyAngle || "Identify the central debate quickly.")}</strong></div>
      <div><span>Possible conclusion</span><strong>${escapeHtml(card.possibleConclusion || "Needs deeper review. Do not use buy or sell language.")}</strong></div>
    </div>
    <p class="metric-note"><strong>Revenue growth:</strong> latest reported ${formatValue(config().availableMetrics.revenueGrowth, latestReportedRevenueGrowth(company))}. ${escapeHtml(growthWindow.note)}</p>`;
}

function renderMobileComparison() {
  const metrics = ["revenueGrowth", "operatingMargin", "fcfMargin", "forwardPe", "evSales", "evEbitda", "roic"];
  const tickers = selectedTickers().slice(0, 4);
  $("case-compare-card").innerHTML = `
    <div class="case-card-head"><div><p>Quick comparison</p><h2>Selected company vs peers</h2></div></div>
    <div class="mobile-compare-grid">
      ${metrics.map((key) => {
        const metric = config().availableMetrics[key];
        return `<div class="compare-row"><span>${metric.label}</span>${tickers.map((ticker) => {
          const company = appState.data.companies[ticker];
          const currentFinancial = company.financials[appState.period] || company.financials.annual;
          const value = key === "revenueGrowth" ? latestReportedRevenueGrowth(company) : key in currentFinancial ? latest(currentFinancial, key) : company.metrics[key];
          const scored = scoreMetric(value, metric);
          return `<strong class="company-pill ${ticker === appState.selectedTicker ? "active-pill" : ""}">${ticker} ${formatValue(metric, value)} <em class="badge ${scored.className}">${scored.label}</em></strong>`;
        }).join("")}</div>`;
      }).join("")}
    </div>`;
}

function renderDiagnosis() {
  const company = currentCompany();
  $("diagnosis-strip").innerHTML = ["revenueGrowth", "operatingMargin", "fcfMargin", "roic", "forwardPe"].map((key) => metricCard(company, key).replace("metric-card", "diagnosis-card")).join("");
}

function renderOverview() {
  const company = currentCompany();
  $("company-name").textContent = `${company.name} (${company.ticker})`;
  renderEditableBlocks();
  renderFreshnessCard();
  $("market-performance").innerHTML = ["1M", "3M", "YTD", "1Y"].map((horizon) => {
    const value = company.stockPerformance.horizons[horizon];
    const label = value >= 20 ? "Strong" : value >= 0 ? "Neutral" : "Caution";
    return `<article class="metric-card compact-card"><span>${horizon}</span><strong>${value > 0 ? "+" : ""}${value}%</strong><em class="badge ${badgeClass(label)}">${label}</em></article>`;
  }).join("");
}

function renderImportedCompanyList() {
  const imports = importedCompanies();
  const tickers = Object.keys(imports);
  const target = $("imported-company-list");
  if (!target) return;
  target.innerHTML = tickers.length
    ? tickers.map((ticker) => `<div class="imported-company-row"><span>${ticker} · ${escapeHtml(imports[ticker].name || "Imported company")}</span><button class="mode-button" data-delete-import="${ticker}" type="button">Delete</button></div>`).join("")
    : `<p class="source-note">No imported companies saved in this browser.</p>`;
}

function renderEditableBlocks() {
  renderEditableText("business", "business-summary");
  renderEditableList("segments", "segments-list");
  renderEditableList("moat", "moat-list");
  renderEditableList("risks", "risks-list");
  renderEditableList("catalysts", "catalysts-list");
  renderEditableNote();
}

function renderFreshnessCard() {
  const company = currentCompany();
  const status = company.data_status || {};
  const rows = [
    ["Latest annual", status.latest_annual_period || company.financials.annual?.periods?.at(-1) || "n/a"],
    ["Latest quarterly", status.latest_quarterly_period || company.financials.quarterly?.periods?.at(-1) || "n/a"],
    ["Latest market", status.latest_market_period || "n/a"],
    ["Latest valuation", status.latest_valuation_period || "n/a"],
    ["Source type", status.source_type || company.dataStatus || "sample"],
    ["Last updated", status.last_updated || "n/a"]
  ];
  $("freshness-card").innerHTML = rows.map(([label, value]) => `<div><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  $("freshness-warning").textContent = status.has_mixed_freshness ? "Growth data is older than valuation data." : "";
  const financialSource = company.financials[appState.period]?.source;
  const valuationSource = company.valuation?.source;
  const marketSource = company.market_source;
  $("source-notes").textContent = [
    financialSource ? `Fundamentals: ${financialSource.name} (${financialSource.as_of})` : "",
    valuationSource ? `Valuation: ${valuationSource.name} (${valuationSource.as_of})` : "",
    marketSource ? `Market: ${marketSource.name} (${marketSource.as_of})` : ""
  ].filter(Boolean).join(" · ");
  $("business-source-note").textContent = status.source_notes || "";
}

function renderMetricSections() {
  const company = currentCompany();
  $("growth-metrics").innerHTML = ["revenueGrowth"].map((key) => metricCard(company, key)).join("");
  $("quality-metrics").innerHTML = ["grossMargin", "operatingMargin", "netMargin", "fcfMargin", "roic"].map((key) => metricCard(company, key)).join("");
  $("cash-metrics").innerHTML = ["cashFlowOperations", "capex", "freeCashFlow", "fcfMargin", "capexIntensity"].map((key) => metricCard(company, key)).join("");
}

function valuationEvidence(items) {
  return `<div class="evidence-list">${items.map((item) => `<div><span>${item.label}</span><strong>${formatValue(config().availableMetrics[item.key], item.value)}</strong><em class="badge ${item.badge?.className || "badge-info"}">${item.badge?.label || "Evidence"}</em></div>`).join("")}</div>`;
}

function renderValuation() {
  const company = currentCompany();
  const peerSet = selectedPeerRows();
  const absolute = absoluteValuation(company, config());
  const relative = relativeValuation(company, peerSet, config());
  const relativeLabel = relative.label;
  $("absolute-valuation").innerHTML = `<span class="badge ${badgeClass(absolute.label)}">${absolute.label}</span>${valuationEvidence(absolute.evidence)}`;
  $("relative-valuation").innerHTML = `<span class="badge ${badgeClass(relativeLabel)}">${relativeLabel}</span><div class="evidence-list">${relative.evidence.map((item) => {
    const rank = item.rank ? `${item.rank.rank}/${item.rank.total}` : "n/a";
    const status = item.cheaper ? "Relatively attractive" : item.expensive ? "More expensive" : "In line";
    return `<div><span>${item.label}</span><strong>${formatValue(config().availableMetrics[item.key], item.value)} vs ${formatValue(config().availableMetrics[item.key], item.median)} median</strong><em class="badge badge-info">Rank ${rank}</em><small>${status}</small></div>`;
  }).join("")}</div>`;
  const cheaper = relative.evidence.filter((item) => item.cheaper).map((item) => item.label).join(" and ") || "selected multiples";
  $("valuation-interpretation").innerHTML = `<p>${company.ticker} screens ${absolute.label.toLowerCase()} in absolute terms, but ${relativeLabel.toLowerCase()} versus the selected AI infrastructure peers on ${cheaper}. This is not an automatic recommendation. It means valuation may look relatively more reasonable, but still requires business and risk judgment.</p>`;
}

function enrichedPeerRows() {
  return config().companies.map((row) => {
    const company = appState.data.companies[row.ticker];
    if (!company) return row;
    const currentFinancial = company.financials[appState.period] || company.financials.annual;
    const enriched = { ...row };
    Object.keys(config().availableMetrics).forEach((key) => {
      if (key === "ticker") return;
      if (key === "revenueGrowth") enriched[key] = latestReportedRevenueGrowth(company);
      else if (key in currentFinancial) enriched[key] = latest(currentFinancial, key);
      else if (key in company.metrics) enriched[key] = company.metrics[key];
    });
    return enriched;
  });
}

function renderPeerTable() {
  const metrics = config().availableMetrics;
  const columns = ["ticker", ...appState.visibleColumns.filter((key) => key !== "ticker")];
  $("peer-table-head").innerHTML = `<tr>${columns.map((key) => `<th scope="col"><button class="sort-head" data-sort="${key}" title="${metrics[key].description || ""}">${metrics[key].label}${appState.sort.key === key ? (appState.sort.direction === "asc" ? " ↑" : " ↓") : ""}</button></th>`).join("")}</tr>`;
  const heatmapPeerSet = { ...config(), companies: enrichedPeerRows() };
  const rows = [...heatmapPeerSet.companies].sort((a, b) => {
    const direction = appState.sort.direction === "asc" ? 1 : -1;
    if (appState.sort.key === "ticker") return a.ticker.localeCompare(b.ticker) * direction;
    return (Number(a[appState.sort.key]) - Number(b[appState.sort.key])) * direction;
  });
  $("peer-table-body").innerHTML = rows.map((row) => {
    const focusMetric = metrics[appState.sort.key];
    const rowHeat = heatmapClass(row[appState.sort.key], focusMetric, heatmapPeerSet, appState.sort.key).replace("heat-", "row-");
    return `<tr class="${row.ticker === appState.selectedTicker ? "active-row" : ""} ${rowHeat}">${columns.map((key) => {
    if (key === "ticker") return `<th scope="row">${row.ticker}</th>`;
    const metric = metrics[key];
    return `<td class="${heatmapClass(row[key], metric, heatmapPeerSet, key)}" title="${metric.description}">${formatValue(metric, row[key])}</td>`;
  }).join("")}</tr>`;
  }).join("");
  $("peer-card-list").innerHTML = rows.map((row) => `
    <article class="peer-mobile-card ${row.ticker === appState.selectedTicker ? "active-row" : ""}">
      <h3>${row.ticker} · ${escapeHtml(row.name || appState.data.companies[row.ticker]?.name || "")}</h3>
      <div>${columns.filter((key) => key !== "ticker").map((key) => {
        const metric = metrics[key];
        return `<p><span>${metric.label}</span><strong class="${heatmapClass(row[key], metric, heatmapPeerSet, key)}">${formatValue(metric, row[key])}</strong></p>`;
      }).join("")}</div>
    </article>
  `).join("");
}

function renderNote() {
  renderEditableNote();
}

function defaultRisks() {
  return {
    notes: "",
    items: currentCompany().risks.map((text) => ({ text, severity: "Medium", checked: false }))
  };
}

function loadRisks() {
  return loadJsonStorage(storageKey("risks"), defaultRisks());
}

function saveRisksFromForm() {
  const items = [...document.querySelectorAll("[data-risk-row]")].map((row) => ({
    text: row.querySelector("[data-risk-text]").textContent,
    severity: row.querySelector("[data-risk-severity]").value,
    checked: row.querySelector("[data-risk-checked]").checked
  }));
  saveJsonStorage(storageKey("risks"), { notes: $("analyst-risk-notes").value, items });
  message("Risk notes saved.");
}

function renderAnalystRisks() {
  const risks = loadRisks();
  $("risk-checklist").innerHTML = risks.items.map((item, index) => `
    <div class="risk-row" data-risk-row>
      <label><input type="checkbox" data-risk-checked ${item.checked ? "checked" : ""}> <span data-risk-text>${escapeHtml(item.text)}</span></label>
      <select data-risk-severity>
        ${["Low", "Medium", "High"].map((level) => `<option value="${level}" ${item.severity === level ? "selected" : ""}>${level}</option>`).join("")}
      </select>
      <button class="mode-button" data-risk-remove="${index}" type="button">Remove</button>
    </div>
  `).join("");
  $("analyst-risk-notes").value = risks.notes || "";
}

const noteFields = ["thesis", "moat", "questions", "followup", "final"];

function loadNotes() {
  return loadJsonStorage(storageKey("notes"), {});
}

function saveNotesFromForm() {
  const notes = Object.fromEntries(noteFields.map((field) => [field, $(`${field}-notes`).value]));
  saveJsonStorage(storageKey("notes"), notes);
  message("Notes saved.");
}

function renderManualNotes() {
  const notes = loadNotes();
  noteFields.forEach((field) => { $(`${field}-notes`).value = notes[field] || ""; });
}

function exportRisksText() {
  const risks = loadRisks();
  const lines = [`Risks - ${appState.selectedTicker}`, "", ...risks.items.map((item) => `- [${item.checked ? "x" : " "}] ${item.text} (${item.severity})`), "", risks.notes || ""];
  downloadText(`equity-copilot-${appState.selectedTicker}-risks.txt`, lines.join("\n"));
}

function exportNotesText() {
  const notes = loadNotes();
  const labels = { thesis: "Investment thesis notes", moat: "Moat notes", questions: "Questions to ask", followup: "Follow up points", final: "Final interview notes" };
  const lines = [`Notes - ${appState.selectedTicker}`, "", ...noteFields.flatMap((field) => [labels[field], notes[field] || "", ""])];
  downloadText(`equity-copilot-${appState.selectedTicker}-notes.txt`, lines.join("\n"));
}

function renderAnalystInputs() {
  renderAnalystRisks();
  renderManualNotes();
}

function renderTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.tab === appState.activeTab));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === appState.activeTab));
}

function applyCaseModeChartState() {
  document.querySelectorAll(".chart-wrap").forEach((wrap) => {
    wrap.hidden = appState.caseMode && !wrap.dataset.expanded;
  });
  document.querySelectorAll("[data-chart-toggle]").forEach((button) => {
    const wrap = button.nextElementSibling;
    button.textContent = wrap?.hidden ? "Show charts" : "Hide charts";
  });
}

function initChartToggles() {
  document.querySelectorAll(".chart-wrap").forEach((wrap, index) => {
    if (wrap.previousElementSibling?.dataset?.chartToggle !== undefined) return;
    const button = document.createElement("button");
    button.className = "mode-button chart-mobile-toggle";
    button.type = "button";
    button.dataset.chartToggle = String(index);
    button.textContent = "Show charts";
    wrap.parentNode.insertBefore(button, wrap);
  });
}

function renderChartsOnly() {
  const selectedCompanies = selectedTickers();
  updateChartHeaderTitles();
  const payload = {
    companies: appState.data.companies,
    selectedCompanies,
    period: appState.period,
    chartWindow: appState.chartWindow,
    seriesCache
  };
  renderGrowthChart({ ...payload, revenueMode: appState.revenueMode });
  renderMarginsChart({ ...payload, marginMetric: appState.marginMetric, metricLabel: config().availableMetrics[appState.marginMetric].label });
  renderCashChart({ ...payload, fcfMode: appState.fcfMode });
  renderMarketChart({
    companies: appState.data.companies,
    selectedCompanies,
    chartWindow: appState.chartWindow,
    stockMode: appState.stockMode,
    showBenchmark: appState.showBenchmark,
    benchmark: config().benchmark,
    seriesCache
  });
  applyCaseModeChartState();
}

function renderFinancialChartsOnly() {
  const selectedCompanies = selectedTickers();
  updateChartHeaderTitles();
  const payload = {
    companies: appState.data.companies,
    selectedCompanies,
    period: appState.period,
    chartWindow: appState.chartWindow,
    seriesCache
  };
  renderGrowthChart({ ...payload, revenueMode: appState.revenueMode });
  renderMarginsChart({ ...payload, marginMetric: appState.marginMetric, metricLabel: config().availableMetrics[appState.marginMetric].label });
  renderCashChart({ ...payload, fcfMode: appState.fcfMode });
  applyCaseModeChartState();
}

function renderMarketOnly() {
  updateChartHeaderTitles();
  renderMarketChart({
    companies: appState.data.companies,
    selectedCompanies: selectedTickers(),
    chartWindow: appState.chartWindow,
    stockMode: appState.stockMode,
    showBenchmark: appState.showBenchmark,
    benchmark: config().benchmark,
    seriesCache
  });
  applyCaseModeChartState();
}

function updateChartHeaderTitles() {
  const period = periodLabel(appState.period);
  const windowLabel = appState.chartWindow;
  const revenue = seriesCache.getFinancialWindow(appState.selectedTicker, appState.period, "revenue", appState.revenueMode, appState.chartWindow);
  const margin = seriesCache.getFinancialWindow(appState.selectedTicker, appState.period, appState.marginMetric, "absolute", appState.chartWindow);
  const fcf = seriesCache.getFinancialWindow(appState.selectedTicker, appState.period, "freeCashFlow", appState.fcfMode, appState.chartWindow);
  const revenueWindow = `${windowLabel} requested · ${revenue.values?.length || 0} ${periodUnit(appState.period)} available`;
  const marginWindow = `${windowLabel} requested · ${margin.values?.length || 0} ${periodUnit(appState.period)} available`;
  const cashWindow = `${windowLabel} requested · ${fcf.values?.length || 0} ${periodUnit(appState.period)} available`;
  $("growth-chart-title").textContent = `Revenue comparison · ${period} · ${revenueWindow} · ${appState.revenueMode === "indexed" ? "Indexed to 100" : "USD bn"}`;
  $("margin-chart-title").textContent = `${config().availableMetrics[appState.marginMetric].label} comparison · ${period} · ${marginWindow} · %`;
  $("cash-chart-title").textContent = `FCF comparison · ${period} · ${cashWindow} · ${appState.fcfMode === "indexed" ? "Indexed to 100" : "USD bn"}`;
  $("market-chart-title").textContent = `Market performance · ${windowLabel} · ${appState.stockMode === "percent" ? "% change" : "Indexed to 100"}`;
}

function debugLog() {
  if (DEBUG) {
    const source = getFundamentalSeries(currentCompany(), appState.period, "revenue");
    const rendered = seriesCache.getFinancialWindow(appState.selectedTicker, appState.period, "revenue", appState.revenueMode, appState.chartWindow);
    $("debug-line").hidden = false;
    $("debug-line").textContent = `Debug · ${appState.selectedTicker} · ${periodLabel(appState.period)} · ${appState.chartWindow} · latest available ${source.periods?.at(-1) || "n/a"} · rendered points ${rendered.values?.length || 0}`;
  }
  if (!DEBUG) return;
  console.debug("Equity Copilot state", {
    selectedCompany: appState.selectedTicker,
    selectedPeers: appState.peers.filter(Boolean),
    financialPeriod: appState.period,
    chartWindow: appState.chartWindow,
    datasetsRendered: selectedTickers().length,
    activeCharts: activeChartCount()
  });
}

function renderApp(scope = "all") {
  normalizePeers();
  updateControlValues();
  if (scope === "tabs") {
    renderTabs();
    return;
  }
  if (scope === "charts") {
    renderChartsOnly();
    debugLog();
    return;
  }
  if (scope === "peers") {
    renderMobileComparison();
    renderValuation();
    renderPeerTable();
    renderNote();
    renderChartsOnly();
    debugLog();
    return;
  }
  renderTabs();
  renderCasePrepCard();
  renderMobileComparison();
  renderDiagnosis();
  renderOverview();
  renderMetricSections();
  renderValuation();
  renderPeerTable();
  renderNote();
  renderAnalystInputs();
  renderImportedCompanyList();
  renderChartsOnly();
  debugLog();
}

const debouncedPeerRender = debounce(() => renderApp("peers"), 130);

function bindEvents() {
  $("company-search").addEventListener("input", debounce((event) => {
    appState.search = event.target.value;
    initControls();
    renderApp("all");
  }, 120));
  $("sector-filter").addEventListener("change", (event) => {
    appState.sector = event.target.value;
    initControls();
    renderApp("all");
  });
  $("case-mode-toggle").addEventListener("change", (event) => {
    appState.caseMode = event.target.checked;
    localStorage.setItem("equityCopilot.caseMode", String(appState.caseMode));
    document.querySelectorAll(".chart-wrap").forEach((wrap) => {
      delete wrap.dataset.expanded;
    });
    renderApp("all");
  });
  $("ticker-select").addEventListener("change", (event) => {
    appState.selectedTicker = event.target.value;
    normalizePeers(true);
    renderApp("all");
  });
  ["peer-1", "peer-2", "peer-3"].forEach((id, index) => $(id).addEventListener("change", (event) => {
    appState.peers[index] = event.target.value;
    normalizePeers(true);
    debouncedPeerRender();
  }));
  $("period-controls").addEventListener("click", (event) => {
    if (!event.target.dataset.period) return;
    appState.period = event.target.dataset.period;
    renderMetricSections();
    renderDiagnosis();
    renderFreshnessCard();
    renderPeerTable();
    updateControlValues();
    renderFinancialChartsOnly();
    debugLog();
  });
  $("horizon-controls").addEventListener("click", (event) => {
    if (!event.target.dataset.horizon || event.target.disabled) return;
    appState.chartWindow = event.target.dataset.horizon;
    renderMetricSections();
    renderDiagnosis();
    renderPeerTable();
    updateControlValues();
    renderChartsOnly();
    debugLog();
  });
  $("margin-metric-select").addEventListener("change", (event) => {
    appState.marginMetric = event.target.value;
    updateControlValues();
    renderMarginsChart({
      companies: appState.data.companies,
      selectedCompanies: selectedTickers(),
      period: appState.period,
      chartWindow: appState.chartWindow,
      marginMetric: appState.marginMetric,
      metricLabel: config().availableMetrics[appState.marginMetric].label,
      seriesCache
    });
    debugLog();
  });
  $("benchmark-toggle").addEventListener("change", (event) => {
    appState.showBenchmark = event.target.checked;
    updateControlValues();
    renderMarketOnly();
    debugLog();
  });
  $("export-company-button").addEventListener("click", exportCurrentCompanyJson);
  $("export-company-button-secondary").addEventListener("click", exportCurrentCompanyJson);
  $("download-template-button").addEventListener("click", downloadTemplateJson);
  $("download-generator-button").addEventListener("click", downloadGeneratorScript);
  $("download-example-button").addEventListener("click", downloadExampleTsmJson);
  $("company-import-input").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const company = JSON.parse(reader.result);
        const error = validateCompanySchema(company);
        if (error) {
          message(`Import failed: ${error}`);
          return;
        }
        addCompanyToRuntime(company, true);
        appState.selectedTicker = company.ticker;
        initControls();
        updateControlValues();
        renderApp("all");
        message(`${company.ticker} imported for this browser.`);
      } catch (error) {
        message(`Import failed: ${error.message}`);
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  });
  $("peer-metric-focus").addEventListener("change", (event) => {
    const metric = config().availableMetrics[event.target.value];
    appState.sort = { key: event.target.value, direction: metric.direction === "lower_is_better_relative" ? "asc" : "desc" };
    renderPeerTable();
  });
  $("column-picker").addEventListener("change", (event) => {
    const key = event.target.value;
    if (!key) return;
    appState.visibleColumns = event.target.checked ? [...appState.visibleColumns, key] : appState.visibleColumns.filter((column) => column !== key);
    persistColumns();
    renderColumnOrder();
    renderPeerTable();
  });
  document.querySelector(".tabs").addEventListener("click", (event) => {
    if (!event.target.dataset.tab) return;
    appState.activeTab = event.target.dataset.tab;
    renderApp("tabs");
  });
  document.body.addEventListener("click", (event) => {
    if (event.target.dataset.revenueMode) { appState.revenueMode = event.target.dataset.revenueMode; updateControlValues(); updateChartHeaderTitles(); renderGrowthChart({ companies: appState.data.companies, selectedCompanies: selectedTickers(), period: appState.period, chartWindow: appState.chartWindow, revenueMode: appState.revenueMode, seriesCache }); debugLog(); }
    if (event.target.dataset.fcfMode) { appState.fcfMode = event.target.dataset.fcfMode; updateControlValues(); updateChartHeaderTitles(); renderCashChart({ companies: appState.data.companies, selectedCompanies: selectedTickers(), period: appState.period, chartWindow: appState.chartWindow, fcfMode: appState.fcfMode, seriesCache }); debugLog(); }
    if (event.target.dataset.stockMode) { appState.stockMode = event.target.dataset.stockMode; updateControlValues(); renderMarketOnly(); debugLog(); }
    if (event.target.dataset.resetChart) resetChartZoom(event.target.dataset.resetChart);
    if (event.target.dataset.chartToggle !== undefined) {
      const wrap = event.target.nextElementSibling;
      if (wrap) {
        if (wrap.hidden) wrap.dataset.expanded = "true";
        else delete wrap.dataset.expanded;
        wrap.hidden = !wrap.hidden;
        event.target.textContent = wrap.hidden ? "Show charts" : "Hide charts";
      }
    }
    if (event.target.dataset.editAction) {
      const key = event.target.dataset.editKey;
      if (event.target.dataset.editAction === "edit") {
        const editor = $(`${key}-editor`);
        if (editor) editor.value = editableValue(key);
        setEditableMode(key, true);
      }
      if (event.target.dataset.editAction === "save") saveEditable(key);
      if (event.target.dataset.editAction === "reset") resetEditable(key);
      if (event.target.dataset.editAction === "clear") clearEditable(key);
    }
    if (event.target.dataset.columnLeft) moveColumn(event.target.dataset.columnLeft, -1);
    if (event.target.dataset.columnRight) moveColumn(event.target.dataset.columnRight, 1);
    if (event.target.dataset.columnHide) {
      appState.visibleColumns = appState.visibleColumns.filter((key) => key !== event.target.dataset.columnHide);
      persistColumns();
      renderColumnPicker();
      renderPeerTable();
    }
    if (event.target.dataset.saveRisks !== undefined) saveRisksFromForm();
    if (event.target.dataset.clearRisks !== undefined) {
      localStorage.removeItem(storageKey("risks"));
      renderAnalystRisks();
      message("Risk notes cleared.");
    }
    if (event.target.dataset.exportRisks !== undefined) {
      saveRisksFromForm();
      exportRisksText();
    }
    if (event.target.dataset.saveNotes !== undefined) saveNotesFromForm();
    if (event.target.dataset.clearNotes !== undefined) {
      localStorage.removeItem(storageKey("notes"));
      renderManualNotes();
      message("Notes cleared.");
    }
    if (event.target.dataset.exportNotes !== undefined) {
      saveNotesFromForm();
      exportNotesText();
    }
    if (event.target.id === "add-risk-button") {
      const text = $("custom-risk-input").value.trim();
      if (text) {
        const risks = loadRisks();
        risks.items.push({ text, severity: $("custom-risk-severity").value, checked: false });
        saveJsonStorage(storageKey("risks"), risks);
        $("custom-risk-input").value = "";
        renderAnalystRisks();
      }
    }
    if (event.target.dataset.riskRemove !== undefined) {
      const risks = loadRisks();
      risks.items.splice(Number(event.target.dataset.riskRemove), 1);
      saveJsonStorage(storageKey("risks"), risks);
      renderAnalystRisks();
    }
    if (event.target.dataset.sort) {
      const key = event.target.dataset.sort;
      appState.sort = { key, direction: appState.sort.key === key && appState.sort.direction === "desc" ? "asc" : "desc" };
      renderPeerTable();
    }
    if (event.target.dataset.deleteImport) deleteImportedCompany(event.target.dataset.deleteImport);
    if (event.target.id === "reset-imported-button") {
      Object.keys(importedCompanies()).forEach((ticker) => {
        delete appState.data.companies[ticker];
        appState.data.tickers = appState.data.tickers.filter((item) => item !== ticker);
        config().companies = config().companies.filter((row) => row.ticker !== ticker);
      });
      localStorage.removeItem("equityCopilot.importedCompanies");
      if (!appState.data.companies[appState.selectedTicker]) appState.selectedTicker = appState.data.tickers[0] || "TSM";
      initControls();
      renderApp("all");
      renderImportedCompanyList();
      message("Imported companies reset.");
    }
  });
}

async function boot() {
  try {
    appState.data = await loadDashboardData();
    mergeImportedCompanies();
    appState.visibleColumns = loadJsonStorage("equityCopilot.columns", appState.data.peers.defaultVisibleMetrics.filter((key) => key !== "ticker"));
    $("data-status").textContent = `${appState.data.metadata.data_status} data`;
    $("metadata-copy").textContent = `${appState.data.metadata.disclaimer} As of ${appState.data.metadata.as_of}.`;
    initControls();
    initChartToggles();
    bindEvents();
    renderApp("all");
  } catch (error) {
    $("load-alert").hidden = false;
    $("load-alert").textContent = `Dashboard data could not load: ${error.message}. Use a local static server so the browser can read JSON files.`;
  }
}

boot();
