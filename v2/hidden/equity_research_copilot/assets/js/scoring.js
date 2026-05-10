const orderedLabels = ["Exceptional", "Strong", "Solid", "Neutral", "Caution", "Weak", "Severe"];

export function badgeClass(label) {
  return `badge-${label.toLowerCase().replaceAll(" ", "-")}`;
}

export function badge(label) {
  return { label, className: badgeClass(label) };
}

export function scoreMetric(value, metric) {
  if (value === null || value === undefined || !metric) return badge("Not meaningful");
  const n = Number(value);
  if (metric.absoluteThresholds) return scoreValuationAbsolute(n, metric.absoluteThresholds);
  if (!metric.thresholds) return badge("Neutral");

  const t = metric.thresholds;
  if (metric.direction === "lower_is_better_risk") {
    if (n <= t.exceptional) return badge("Exceptional");
    if (n <= t.strong) return badge("Strong");
    if (n <= t.solid) return badge("Solid");
    if (n <= t.neutral) return badge("Neutral");
    if (n <= t.caution) return badge("Caution");
    if (n <= t.weak) return badge("Weak");
    return badge("Severe");
  }

  if (n >= t.exceptional) return badge("Exceptional");
  if (n >= t.strong) return badge("Strong");
  if (n >= t.solid) return badge("Solid");
  if (n >= t.neutral) return badge("Neutral");
  if (n >= t.caution) return badge("Caution");
  if (n >= t.weak) return badge("Weak");
  return badge("Severe");
}

export function scoreValuationAbsolute(value, thresholds) {
  if (!Number.isFinite(value) || value <= 0) return badge("Not meaningful");
  if (value < thresholds.low_below) return badge("Low");
  if (value < thresholds.fair_below) return badge("Fair");
  if (value >= thresholds.expensive_above) return badge("Severe");
  if (value >= thresholds.demanding_above) return badge("Demanding");
  return badge("Fair");
}

export function peerMedian(peers, key) {
  const values = peers.companies.map((company) => Number(company[key])).filter(Number.isFinite).sort((a, b) => a - b);
  if (!values.length) return null;
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

export function rankAmongPeers(peers, key, ticker, direction) {
  const rows = peers.companies
    .map((company) => ({ ticker: company.ticker, value: Number(company[key]) }))
    .filter((row) => Number.isFinite(row.value));
  const sorted = rows.sort((a, b) => direction === "higher_is_better" ? b.value - a.value : a.value - b.value);
  const rank = sorted.findIndex((row) => row.ticker === ticker) + 1;
  return rank ? { rank, total: sorted.length } : null;
}

export function relativeValuation(company, peers, config) {
  const keys = ["forwardPe", "evSales", "evEbitda", "evFcf"];
  const evidence = keys.map((key) => {
    const metric = config.availableMetrics[key];
    const median = peerMedian(peers, key);
    const value = company.metrics[key];
    const rankUniverse = { ...peers, companies: [{ ticker: company.ticker, ...company.metrics }, ...peers.companies.filter((row) => row.ticker !== company.ticker)] };
    const rank = rankAmongPeers(rankUniverse, key, company.ticker, "lower_is_better_relative");
    const cheaper = median !== null && value < median;
    const expensive = median !== null && value > median;
    return { key, label: metric.label, value, median, rank, cheaper, expensive };
  });
  const cheaperCount = evidence.filter((item) => item.cheaper).length;
  const expensiveCount = evidence.filter((item) => item.expensive).length;
  let label = "In line with peers";
  if (cheaperCount >= 3) label = "Cheaper than peers";
  if (expensiveCount >= 3) label = "More expensive than peers";
  if (evidence.some((item) => item.median === null)) label = "Insufficient data";
  return { label, evidence };
}

export function absoluteValuation(company, config) {
  const keys = ["pe", "forwardPe", "evSales", "evFcf"];
  const evidence = keys.map((key) => {
    const metric = config.availableMetrics[key];
    return { key, label: metric.label, value: company.metrics[key], badge: scoreValuationAbsolute(company.metrics[key], metric.absoluteThresholds) };
  });
  const labels = evidence.map((item) => item.badge.label);
  const severe = labels.filter((label) => label === "Severe").length;
  const demanding = labels.filter((label) => label === "Demanding").length;
  const low = labels.filter((label) => label === "Low").length;
  let label = "Fair";
  if (severe >= 1 || demanding >= 2) label = "Demanding";
  if (low >= 3) label = "Low";
  if (labels.includes("Not meaningful")) label = "Not meaningful";
  return { label, evidence };
}

export function heatmapClass(value, metric, peers, key) {
  if (key === "ticker" || value === null || value === undefined || !metric) return "";
  if (metric.direction === "lower_is_better_relative") {
    const median = peerMedian(peers, key);
    if (median === null) return "heat-neutral";
    if (value <= median * 0.8) return "heat-good";
    if (value <= median * 1.1) return "heat-neutral";
    if (value <= median * 1.35) return "heat-caution";
    return "heat-risk";
  }
  const label = scoreMetric(value, metric).label;
  if (["Exceptional", "Strong"].includes(label)) return "heat-good";
  if (label === "Solid") return "heat-solid";
  if (label === "Neutral") return "heat-neutral";
  if (label === "Caution") return "heat-caution";
  return "heat-risk";
}

export function qualityLabel(company, config) {
  const scores = ["grossMargin", "operatingMargin", "fcfMargin", "roic"].map((key) => orderedLabels.indexOf(scoreMetric(company.metrics[key], config.availableMetrics[key]).label));
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  if (avg <= 1) return "Exceptional financial quality";
  if (avg <= 2) return "Strong financial quality";
  if (avg <= 3) return "Solid financial quality";
  if (avg <= 4) return "Mixed financial quality";
  return "Financial quality needs review";
}
