(function () {
  const QUALITY_THRESHOLDS = [
    { label: "Exceptional", min: 80 },
    { label: "Strong", min: 25 },
    { label: "Solid", min: 10 },
    { label: "Neutral", min: 0 },
    { label: "Caution", min: -10 },
    { label: "Weak", min: -30 },
    { label: "Severe", min: -Infinity }
  ];

  const MARGIN_THRESHOLDS = [
    { label: "Exceptional", min: 55 },
    { label: "Strong", min: 40 },
    { label: "Solid", min: 25 },
    { label: "Neutral", min: 15 },
    { label: "Caution", min: 5 },
    { label: "Weak", min: 0 },
    { label: "Severe", min: -Infinity }
  ];

  function labelFromThresholds(value, thresholds) {
    if (!Number.isFinite(value)) return "Not meaningful";
    return thresholds.find((item) => value >= item.min)?.label || "Neutral";
  }

  function growthLabel(value) {
    return labelFromThresholds(value, QUALITY_THRESHOLDS);
  }

  function marginLabel(value) {
    return labelFromThresholds(value, MARGIN_THRESHOLDS);
  }

  function absoluteValuation(metrics) {
    const fpe = metrics.forwardPe;
    const evSales = metrics.evSales;
    const evFcf = metrics.evFcf;
    if (![fpe, evSales, evFcf].some(Number.isFinite)) {
      return { label: "Not meaningful", tone: "mid" };
    }
    const demandingSignals = [fpe > 35, evSales > 16, evFcf > 45].filter(Boolean).length;
    const lowSignals = [fpe < 18, evSales < 7, evFcf < 25].filter(Boolean).length;
    if (demandingSignals >= 2) return { label: "Demanding", tone: "risk" };
    if (lowSignals >= 2) return { label: "Low", tone: "good" };
    return { label: "Fair", tone: "mid" };
  }

  window.Scoring = {
    growthLabel,
    marginLabel,
    absoluteValuation
  };
})();
