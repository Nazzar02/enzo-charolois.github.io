const COMPANY_FILES = {
  TSM: "assets/data/companies/TSM.json",
  NVDA: "assets/data/companies/NVDA.json",
  ASML: "assets/data/companies/ASML.json",
  AVGO: "assets/data/companies/AVGO.json",
  AMD: "assets/data/companies/AMD.json",
  ARM: "assets/data/companies/ARM.json",
  INTC: "assets/data/companies/INTC.json",
  QCOM: "assets/data/companies/QCOM.json",
  MRVL: "assets/data/companies/MRVL.json",
  MU: "assets/data/companies/MU.json",
  AMAT: "assets/data/companies/AMAT.json",
  LRCX: "assets/data/companies/LRCX.json",
  KLAC: "assets/data/companies/KLAC.json",
  MSFT: "assets/data/companies/MSFT.json",
  GOOGL: "assets/data/companies/GOOGL.json",
  AMZN: "assets/data/companies/AMZN.json",
  META: "assets/data/companies/META.json",
  ORCL: "assets/data/companies/ORCL.json",
  ADBE: "assets/data/companies/ADBE.json",
  CRM: "assets/data/companies/CRM.json",
  NOW: "assets/data/companies/NOW.json",
  SNOW: "assets/data/companies/SNOW.json",
  PLTR: "assets/data/companies/PLTR.json",
  DDOG: "assets/data/companies/DDOG.json",
  MDB: "assets/data/companies/MDB.json",
  CRWD: "assets/data/companies/CRWD.json",
  PANW: "assets/data/companies/PANW.json",
  NET: "assets/data/companies/NET.json",
  ZS: "assets/data/companies/ZS.json",
  SAP: "assets/data/companies/SAP.json",
  STM: "assets/data/companies/STM.json",
  IFX: "assets/data/companies/IFX.json"
};

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load ${path} (${response.status})`);
  }
  return response.json();
}

export async function loadDashboardData() {
  const [metadata, peers, companies] = await Promise.all([
    loadJson("assets/data/metadata.json"),
    loadJson("assets/data/peers/semiconductors_ai.json"),
    Promise.all(Object.entries(COMPANY_FILES).map(async ([ticker, path]) => [ticker, await loadJson(path)]))
  ]);

  const companyMap = Object.fromEntries(companies);
  peers.companies = Object.values(companyMap).map((company) => ({
    ticker: company.ticker,
    name: company.name,
    sector: company.sector,
    ...company.metrics
  }));

  return {
    metadata,
    peers,
    companies: companyMap,
    tickers: Object.keys(COMPANY_FILES)
  };
}
