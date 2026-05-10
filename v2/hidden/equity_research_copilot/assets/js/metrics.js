export const companyColors = {
  TSM: "#6bb7ff",
  NVDA: "#64d6b0",
  ASML: "#f1a15d",
  AVGO: "#b18cff",
  AMD: "#ff8f8f",
  ARM: "#d9b46a",
  INTC: "#8aa7ff",
  QCOM: "#56c2d6",
  MRVL: "#f6c177",
  MU: "#8bd17c",
  AMAT: "#c792ea",
  LRCX: "#7dcfff",
  KLAC: "#f78c6c",
  MSFT: "#5ab0ff",
  GOOGL: "#f2c94c",
  AMZN: "#f2994a",
  META: "#56ccf2",
  ORCL: "#eb5757",
  ADBE: "#ff6b6b",
  CRM: "#45b7d1",
  NOW: "#7ed957",
  SNOW: "#bde7ff",
  PLTR: "#cfd6e6",
  DDOG: "#b28dff",
  MDB: "#57c785",
  CRWD: "#ff7a90",
  PANW: "#ffb86b",
  NET: "#f2994a",
  ZS: "#79d2ff",
  SAP: "#7aa2f7",
  STM: "#6ee7b7",
  IFX: "#e0af68"
};

export function latest(financials, key) {
  const values = financials?.[key] || [];
  return values.length ? values[values.length - 1] : null;
}

export function formatValue(metric, value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Not meaningful";
  const number = Number(value);
  const abs = Math.abs(number);
  const display = abs >= 100 ? abs.toFixed(0) : abs >= 10 ? abs.toFixed(1).replace(".0", "") : abs.toFixed(1);
  const sign = number < 0 ? "-" : "";
  if (metric?.unit === "percent") return `${number > 0 ? "" : ""}${sign}${display}%`;
  if (metric?.unit === "x") return `${sign}${display}x`;
  if (metric?.unit === "usd_bn") return `${sign}$${display}bn`;
  return `${sign}${display}`;
}

export function indexed(values) {
  const first = values.find((value) => Number(value) > 0);
  if (!first) return values.map(() => null);
  return values.map((value) => Number(((value / first) * 100).toFixed(1)));
}

export function comparisonSet(state) {
  return [state.selectedTicker, ...state.peers].filter(Boolean).filter((ticker, index, all) => all.indexOf(ticker) === index);
}

export function metricInfoButton(config, key) {
  const metric = config.availableMetrics[key];
  if (!metric?.description) return "";
  return `<span class="info-dot" tabindex="0" aria-label="${metric.description}" title="${metric.description}">i</span>`;
}

export function periodLabel(period) {
  return period === "ttm" ? "TTM" : period[0].toUpperCase() + period.slice(1);
}
