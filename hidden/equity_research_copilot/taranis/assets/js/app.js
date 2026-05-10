(function () {
  const TICKERS = ["TSM", "NVDA", "ASML", "AVGO"];
  const state = {
    company: "TSM",
    peerSet: "ai_semiconductors",
    companies: {},
    peerSets: {},
    metadata: null
  };

  const fallbackData = {
    metadata: {
      dataset_name: "Demo dataset",
      last_updated: "2026-05-05",
      notes: "Static JSON-compatible data prepared for a shareable product POC. Figures are illustrative and not live."
    },
    peerSets: {
      ai_semiconductors: {
        id: "ai_semiconductors",
        name: "AI infrastructure peers",
        tickers: ["TSM", "NVDA", "ASML", "AVGO"]
      }
    },
    companies: {
      TSM: company("TSM", "Taiwan Semiconductor Manufacturing Company", "Semiconductors", "Leading independent foundry manufacturing advanced chips for global fabless and IDM customers.", "Manufactures wafers for fabless semiconductor and IDM customers at scale, with premium economics tied to leading-edge nodes and advanced packaging.", ["Advanced nodes", "Specialty technologies", "Advanced packaging"], ["Process leadership", "Manufacturing scale", "Customer trust"], "Core manufacturing bottleneck for AI, smartphones and high performance computing.", ["Taiwan concentration", "High capex requirements", "Semiconductor cyclicality"], ["AI accelerator demand", "Advanced packaging growth", "Leading-node pricing"], "Quality business with strategic relevance to AI infrastructure. Valuation requires judgment around geopolitical risk, capex intensity and durability of advanced-node demand.", [113.4, 123.1, 133.3, 127.8, 138.2], [9, 14, 19, 18, 17], [54, 54.8, 55.5, 56.2, 57], [45.5, 46.1, 46.8, 47.4, 48], [26.8, 26.8, 26.8, 26.8, 26.8], [25, 25.5, 26, 26.5, 27], [65.9, 69.9, 74.1, 71.8, 76], [35.5, 36.9, 38.4, 37.5, 39], [30.4, 33, 35.7, 34.3, 37], { pe: 25, forwardPe: 21, evSales: 10, evEbitda: 16, evFcf: 58, pFcf: 48 }),
      NVDA: company("NVDA", "NVIDIA", "Semiconductors", "Platform company supplying GPUs, networking and software for accelerated computing.", "Sells AI accelerators, networking systems and software platforms to hyperscalers, enterprises and specialist AI builders.", ["Data center", "Gaming", "Networking", "Automotive"], ["CUDA ecosystem", "Scale and roadmap velocity", "Developer lock-in"], "Reference platform for AI infrastructure spend and accelerated computing architecture.", ["AI digestion risk", "Customer concentration", "Export controls"], ["Blackwell ramp", "Networking attach", "Software monetization"], "Exceptional franchise with high margins and strong cash conversion. The central debate is whether growth durability justifies a demanding absolute valuation.", [49.8, 66.6, 84.6, 92.3, 110.9], [106, 111, 116, 115, 114], [70, 70.8, 71.5, 72.2, 73], [58.5, 59.1, 59.8, 60.4, 61], [63.5, 58.9, 55.8, 55, 53.2], [38, 42, 48, 52, 55], [32.9, 40.7, 48.9, 52.6, 61], [1.3, 1.5, 1.7, 1.8, 2], [31.6, 39.2, 47.2, 50.8, 59], { pe: 55, forwardPe: 38, evSales: 26, evEbitda: 45, evFcf: 54, pFcf: 50 }),
      ASML: company("ASML", "ASML Holding", "Semiconductor equipment", "Monopoly-like supplier of EUV lithography systems used in advanced semiconductor manufacturing.", "Sells lithography systems, installed-base services and upgrades to leading logic and memory manufacturers.", ["EUV systems", "DUV systems", "Installed base management"], ["EUV technology leadership", "Deep supplier ecosystem", "Long customer roadmaps"], "Critical equipment bottleneck for advanced semiconductor scaling.", ["Export restrictions", "Customer capex cycles", "Long-cycle system demand volatility"], ["High-NA EUV adoption", "Service revenue growth", "Advanced node capacity additions"], "High-quality equipment franchise with strategic scarcity value. Valuation depends on semiconductor capex recovery and the pace of next-generation EUV adoption.", [22, 23.8, 27.6, 30.1, 32.5], [18, 13, 30, 11, 10], [51, 51.5, 51.8, 52.1, 52.5], [30.5, 31.2, 31.8, 32.3, 33], [22.7, 22.7, 22.8, 22.9, 23.1], [32, 32.5, 33, 33.5, 34], [8.4, 8.8, 10.2, 10.8, 11.7], [1.8, 1.9, 2.1, 2.2, 2.4], [6.6, 6.9, 8.1, 8.6, 9.3], { pe: 40, forwardPe: 32, evSales: 12, evEbitda: 28, evFcf: 46, pFcf: 44 }),
      AVGO: company("AVGO", "Broadcom", "Semiconductors and infrastructure software", "Diversified semiconductor and infrastructure software company with exposure to AI networking and custom silicon.", "Combines high-margin semiconductor franchises with infrastructure software assets and long-term enterprise relationships.", ["Semiconductors", "Infrastructure software", "AI networking"], ["Switching silicon", "Customer-specific design wins", "Software renewal base"], "AI networking and custom ASIC exposure with software-like margin resilience.", ["Integration execution", "Leverage after acquisitions", "Customer concentration in AI programs"], ["AI networking growth", "VMware synergy realization", "Custom silicon demand"], "Quality compounder profile with improving AI exposure and software durability. The key question is balance sheet deleveraging and sustainability of AI networking growth.", [27.5, 31.7, 35.8, 41.1, 47.5], [15, 21, 18, 17, 16], [64, 64.5, 65, 65.4, 66], [48, 49, 50, 51, 52], [48, 47.9, 47.8, 47.7, 47.6], [24, 25, 26, 27, 28], [15.8, 18.1, 20.3, 23, 26.2], [2.6, 2.9, 3.2, 3.4, 3.6], [13.2, 15.2, 17.1, 19.6, 22.6], { pe: 34, forwardPe: 27, evSales: 14, evEbitda: 22, evFcf: 34, pFcf: 32 })
    }
  };

  function company(ticker, companyName, sector, summary, businessModel, segments, moat, thesis, risks, catalysts, preliminaryView, revenue, revenueGrowth, grossMargin, operatingMargin, fcfMargin, roic, cfo, capex, fcf, valuation) {
    return {
      ticker,
      company_name: companyName,
      sector,
      currency: "USD",
      profile: { summary, business_model: businessModel, segments, moat, key_thesis: thesis },
      financials: {
        annual: {
          periods: ["2021", "2022", "2023", "2024", "2025E"],
          revenue,
          revenueGrowth,
          grossMargin,
          operatingMargin,
          fcfMargin,
          roic,
          cashFlowOperations: cfo,
          capex,
          freeCashFlow: fcf
        }
      },
      valuation: { metrics: valuation },
      risks,
      catalysts,
      analyst_view: { preliminary_view: preliminaryView },
      data_status: {
        source_type: "demo_dataset",
        last_updated: "2026-05-05",
        latest_annual_period: "2025E",
        latest_valuation_period: "May 2026",
        source_notes: "Illustrative static dataset for product demonstration. Not live or verified market data."
      }
    };
  }

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    await loadData();
    bindEvents();
    populateControls();
    render();
    if (window.Chart) {
      window.PocCharts.loadZoomPlugin();
    }
  }

  async function loadData() {
    try {
      const [metadata, peerSet, ...companies] = await Promise.all([
        fetchJson("assets/data/metadata.json"),
        fetchJson("assets/data/peers/ai_semiconductors.json"),
        ...TICKERS.map((ticker) => fetchJson(`assets/data/companies/${ticker}.json`))
      ]);
      state.metadata = metadata;
      state.peerSets[peerSet.id] = peerSet;
      companies.forEach((item) => {
        state.companies[item.ticker] = item;
      });
    } catch (error) {
      state.metadata = fallbackData.metadata;
      state.peerSets = fallbackData.peerSets;
      state.companies = fallbackData.companies;
    }
  }

  async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return response.json();
  }

  function bindEvents() {
    window.addEventListener("chartjs-ready", () => {
      window.PocCharts.loadZoomPlugin();
      const activeTab = document.querySelector(".tab.is-active")?.dataset.tab;
      if (activeTab === "financials") {
        window.PocCharts.renderFinancialCharts(state.companies[state.company]);
      }
    });
    window.addEventListener("chartjs-zoom-ready", () => {
      if (document.querySelector(".tab.is-active")?.dataset.tab === "financials") {
        window.PocCharts.renderFinancialCharts(state.companies[state.company]);
      }
    });
    document.getElementById("company-select").addEventListener("change", (event) => {
      state.company = event.target.value;
      render();
    });
    document.getElementById("peer-select").addEventListener("change", (event) => {
      state.peerSet = event.target.value;
      render();
    });
    document.querySelectorAll(".tab").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".tab, .tab-panel").forEach((element) => element.classList.remove("is-active"));
        button.classList.add("is-active");
        document.getElementById(button.dataset.tab).classList.add("is-active");
        if (button.dataset.tab === "financials") {
          setTimeout(() => {
            window.PocCharts.renderFinancialCharts(state.companies[state.company]);
            window.PocCharts.resizeAll();
          }, 0);
        }
      });
    });
    document.querySelectorAll("[data-reset-zoom]").forEach((button) => {
      button.addEventListener("click", () => {
        window.PocCharts.resetZoom(button.dataset.resetZoom);
      });
    });
  }

  function populateControls() {
    const companySelect = document.getElementById("company-select");
    companySelect.innerHTML = TICKERS.map((ticker) => {
      const item = state.companies[ticker];
      return `<option value="${ticker}">${ticker} - ${item.company_name}</option>`;
    }).join("");
    const peerSelect = document.getElementById("peer-select");
    peerSelect.innerHTML = Object.values(state.peerSets).map((peerSet) => `<option value="${peerSet.id}">${peerSet.name}</option>`).join("");
  }

  function render() {
    const companyData = state.companies[state.company];
    const peers = state.peerSets[state.peerSet].tickers.map((ticker) => state.companies[ticker]).filter(Boolean);
    document.getElementById("dataset-updated").textContent = `Last updated ${state.metadata.last_updated}`;
    document.getElementById("dataset-notes").textContent = state.metadata.notes;
    document.getElementById("footer-updated").textContent = `Last updated ${state.metadata.last_updated}`;
    document.getElementById("control-summary").textContent = `${companyData.sector} / ${companyData.data_status.latest_annual_period} annuals / ${companyData.data_status.latest_valuation_period} valuation`;
    renderOverview(companyData);
    renderFinancials(companyData);
    renderValuation(companyData, peers);
    renderPeers(peers);
    renderRisks(companyData);
    document.getElementById("analyst-note").innerHTML = window.Narrative.analystNote(companyData, peers);
  }

  function renderOverview(companyData) {
    document.getElementById("overview-title").textContent = `${companyData.ticker} overview`;
    document.getElementById("company-name").textContent = companyData.company_name;
    document.getElementById("company-summary").textContent = companyData.profile.summary;
    document.getElementById("business-model").textContent = companyData.profile.business_model;
    renderList("segment-list", companyData.profile.segments);
    renderList("moat-list", companyData.profile.moat);
    document.getElementById("key-thesis").textContent = companyData.profile.key_thesis;
    renderList("overview-risks", companyData.risks.slice(0, 3));
    renderList("overview-catalysts", companyData.catalysts.slice(0, 3));
  }

  function renderFinancials(companyData) {
    const metrics = window.Metrics.latestMetrics(companyData);
    const kpis = [
      ["Revenue growth", metrics.revenueGrowth, "%", window.Scoring.growthLabel(metrics.revenueGrowth)],
      ["Operating margin", metrics.operatingMargin, "%", window.Scoring.marginLabel(metrics.operatingMargin)],
      ["FCF margin", metrics.fcfMargin, "%", window.Scoring.marginLabel(metrics.fcfMargin)],
      ["ROIC", metrics.roic, "%", window.Scoring.marginLabel(metrics.roic)],
      ["Forward P/E", metrics.forwardPe, "x", window.Scoring.absoluteValuation(metrics).label]
    ];
    document.getElementById("kpi-grid").innerHTML = kpis.map(([label, value, unit, badge]) => `
      <article class="kpi">
        <span class="context">${companyData.ticker} / Annual / ${companyData.data_status.latest_annual_period}</span>
        <h3>${label}</h3>
        <span class="value">${window.Metrics.formatMetric(value, unit)}</span>
        <span class="badge badge-${badgeClass(badge)}">${badge}</span>
      </article>
    `).join("");
    if (document.querySelector(".tab.is-active")?.dataset.tab === "financials") {
      window.PocCharts.renderFinancialCharts(companyData);
    } else {
      window.PocCharts.destroyAll();
    }
  }

  function renderValuation(companyData, peers) {
    const metrics = window.Metrics.latestMetrics(companyData);
    const absolute = window.Scoring.absoluteValuation(metrics);
    const relative = window.Metrics.relativeValuation(companyData, peers);
    const valuationItems = [
      ["P/E", metrics.pe, "x"],
      ["Forward P/E", metrics.forwardPe, "x"],
      ["EV/Sales", metrics.evSales, "x"],
      ["EV/EBITDA", metrics.evEbitda, "x"],
      ["EV/FCF", metrics.evFcf, "x"],
      ["P/FCF", metrics.pFcf, "x"],
      ["ROIC", metrics.roic, "%"]
    ];
    document.getElementById("valuation-metrics").innerHTML = valuationItems.map(([label, value, unit]) => `<span class="metric-pill">${label}: <strong>${window.Metrics.formatMetric(value, unit)}</strong></span>`).join("");
    document.getElementById("absolute-label").textContent = absolute.label;
    document.getElementById("absolute-evidence").textContent = `Forward P/E ${window.Metrics.formatMetric(metrics.forwardPe, "x")}, EV/Sales ${window.Metrics.formatMetric(metrics.evSales, "x")} and EV/FCF ${window.Metrics.formatMetric(metrics.evFcf, "x")}.`;
    document.getElementById("relative-label").textContent = relative.label;
    document.getElementById("relative-evidence").textContent = relative.evidence;
    document.getElementById("valuation-interpretation").textContent = `${companyData.ticker} screens ${absolute.label.toLowerCase()} in absolute terms and ${relative.label.toLowerCase()} against the selected peer set. This is not an automatic recommendation; it frames the valuation question for qualitative judgment.`;
  }

  function renderPeers(peers) {
    const columns = window.Metrics.METRICS;
    const thead = document.querySelector("#peer-table thead");
    const tbody = document.querySelector("#peer-table tbody");
    thead.innerHTML = `<tr><th>Ticker</th>${columns.map(([, label]) => `<th>${label}</th>`).join("")}</tr>`;
    tbody.innerHTML = peers.map((companyData) => {
      const metrics = window.Metrics.latestMetrics(companyData);
      const cells = columns.map(([key, , unit]) => {
        const value = metrics[key];
        const heat = window.Metrics.heatClass(peers, key, value);
        return `<td class="${heat}">${window.Metrics.formatMetric(value, unit)}</td>`;
      }).join("");
      return `<tr><th>${companyData.ticker}</th>${cells}</tr>`;
    }).join("");
  }

  function renderRisks(companyData) {
    renderList("risk-list", companyData.risks);
    renderList("catalyst-list", companyData.catalysts);
  }

  function renderList(id, items) {
    document.getElementById(id).innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  function badgeClass(label) {
    return String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "neutral";
  }
})();
