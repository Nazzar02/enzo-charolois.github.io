#!/usr/bin/env python3
"""Build static company JSON files for Equity Research Copilot.

The dashboard is a static GitHub Pages app. This local companion script can
generate compatible JSON files, but it never runs in the browser and never
requires frontend API keys.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import date
from pathlib import Path


TODAY = date.today().isoformat()


@dataclass(frozen=True)
class CompanySeed:
    ticker: str
    name: str
    sector: str
    industry: str
    one_sentence: str
    segments: list[str]
    moat: list[str]
    why_it_matters: str
    case_study_angle: str
    possible_conclusion: str
    risks: list[str]
    catalysts: list[str]
    metrics: dict[str, float]


SAMPLE_COMPANIES: dict[str, CompanySeed] = {
    "TSM": CompanySeed("TSM", "Taiwan Semiconductor Manufacturing Company", "Semiconductors", "Semiconductor foundry", "Leading independent foundry manufacturing advanced chips for global fabless and IDM customers.", ["Advanced nodes", "Specialty technologies", "Advanced packaging"], ["Scale manufacturing", "Process leadership", "Customer trust"], "Core manufacturing bottleneck for AI, smartphones, and high performance computing.", "Can premium growth and geopolitical risk coexist with a reasonable multiple?", "Quality business, valuation sensitive to AI durability and Taiwan risk.", ["Taiwan concentration", "High capex", "Semiconductor cyclicality"], ["AI accelerator demand", "Advanced packaging", "Pricing at leading nodes"], {"revenueGrowth": 17, "grossMargin": 57, "operatingMargin": 48, "netMargin": 43, "cashFlowOperations": 76, "capex": 39, "freeCashFlow": 37, "fcfMargin": 35, "pe": 25, "forwardPe": 21, "evSales": 10, "evEbitda": 16, "evFcf": 58, "pFcf": 48, "roic": 27, "debt": 33, "netDebt": -36, "capexIntensity": 37}),
    "NVDA": CompanySeed("NVDA", "NVIDIA", "Semiconductors", "Accelerated computing", "Platform company supplying GPUs, networking, and software for AI computing.", ["Data center", "Gaming", "Networking", "Automotive"], ["CUDA ecosystem", "Scale", "Developer lock-in"], "Sets the pace for AI infrastructure spending and datacenter capex cycles.", "Is AI demand durable enough to justify exceptional growth and high valuation?", "Exceptional franchise, but conclusion depends on growth durability versus valuation.", ["AI digestion risk", "Customer concentration", "Export controls"], ["Blackwell ramp", "Networking attach", "Software monetization"], {"revenueGrowth": 114, "grossMargin": 73, "operatingMargin": 61, "netMargin": 53, "cashFlowOperations": 61, "capex": 2, "freeCashFlow": 59, "fcfMargin": 51, "pe": 52, "forwardPe": 34, "evSales": 30, "evEbitda": 45, "evFcf": 59, "pFcf": 57, "roic": 78, "debt": 10, "netDebt": -16, "capexIntensity": 2}),
    "ASML": CompanySeed("ASML", "ASML Holding", "Semiconductor equipment", "Lithography equipment", "Sole supplier of EUV lithography tools used to manufacture leading-edge semiconductors.", ["EUV", "DUV", "Services"], ["Monopoly technology", "Installed base", "Supplier ecosystem"], "Critical enabler of semiconductor scaling and advanced node capacity.", "Does near-term order cyclicality obscure a long-term monopoly-like moat?", "Moat is exceptional, but timing and valuation need order-cycle judgment.", ["Export restrictions", "Customer capex cycles", "Long lead times"], ["EUV demand", "High-NA adoption", "Service revenue"], {"revenueGrowth": 2, "grossMargin": 51, "operatingMargin": 31, "netMargin": 27, "cashFlowOperations": 9, "capex": 2, "freeCashFlow": 7, "fcfMargin": 20, "pe": 36, "forwardPe": 31, "evSales": 11, "evEbitda": 26, "evFcf": 55, "pFcf": 52, "roic": 38, "debt": 5, "netDebt": -2, "capexIntensity": 7}),
    "AVGO": CompanySeed("AVGO", "Broadcom", "Semiconductors", "Connectivity and infrastructure software", "Diversified semiconductor and infrastructure software company with strong cash generation.", ["Semiconductor solutions", "Infrastructure software", "VMware"], ["Scale", "Customer relationships", "High switching costs"], "Bridges AI networking, custom silicon, and enterprise infrastructure software cash flow.", "Can VMware integration and AI networking offset leverage and cyclical chip exposure?", "Strong cash compounder, but leverage and integration risk frame the debate.", ["High leverage", "Integration execution", "Customer concentration"], ["AI networking", "VMware synergies", "FCF deleveraging"], {"revenueGrowth": 44, "grossMargin": 76, "operatingMargin": 46, "netMargin": 24, "cashFlowOperations": 22, "capex": 1, "freeCashFlow": 21, "fcfMargin": 40, "pe": 42, "forwardPe": 29, "evSales": 18, "evEbitda": 28, "evFcf": 42, "pFcf": 40, "roic": 31, "debt": 74, "netDebt": 63, "capexIntensity": 2}),
    "AMD": CompanySeed("AMD", "Advanced Micro Devices", "Semiconductors", "CPUs and accelerators", "Chip designer competing in CPUs, GPUs, and AI accelerators.", ["Data center", "Client", "Gaming", "Embedded"], ["x86 portfolio", "Chiplet design", "Partner ecosystem"], "Key challenger in AI accelerators and server CPUs.", "Can AMD take profitable AI share without eroding margins?", "Improving growth option, but execution and competitive intensity matter.", ["NVIDIA competition", "PC cyclicality", "Margin pressure"], ["MI accelerator adoption", "EPYC share gains", "AI software progress"], {"revenueGrowth": 18, "grossMargin": 52, "operatingMargin": 18, "netMargin": 12, "cashFlowOperations": 4, "capex": 1, "freeCashFlow": 3, "fcfMargin": 12, "pe": 48, "forwardPe": 31, "evSales": 9, "evEbitda": 30, "evFcf": 45, "pFcf": 43, "roic": 11, "debt": 3, "netDebt": -2, "capexIntensity": 3}),
    "ARM": CompanySeed("ARM", "Arm Holdings", "Semiconductors", "Processor IP", "Licenses processor architectures and IP used across mobile, cloud, auto, and edge devices.", ["Royalties", "Licensing", "Compute subsystems"], ["Ecosystem standard", "Asset-light model", "High switching costs"], "IP toll road for compute architectures across many end markets.", "Does royalty growth justify a premium multiple?", "High-quality asset-light model, valuation is the central constraint.", ["High valuation", "China exposure", "RISC-V competition"], ["Data center Arm adoption", "Royalty rate uplift", "AI edge devices"], {"revenueGrowth": 25, "grossMargin": 96, "operatingMargin": 32, "netMargin": 24, "cashFlowOperations": 1.3, "capex": 0.1, "freeCashFlow": 1.2, "fcfMargin": 34, "pe": 95, "forwardPe": 70, "evSales": 32, "evEbitda": 65, "evFcf": 80, "pFcf": 78, "roic": 22, "debt": 0.2, "netDebt": -2.0, "capexIntensity": 2}),
    "INTC": CompanySeed("INTC", "Intel", "Semiconductors", "Integrated device manufacturer", "Designs and manufactures CPUs while rebuilding foundry capabilities.", ["Client", "Data center", "Foundry", "Network and edge"], ["x86 installed base", "Manufacturing ambition", "Enterprise relationships"], "Turnaround bellwether for Western semiconductor manufacturing capacity.", "Can foundry investment restore competitiveness before cash burn weighs on equity value?", "Turnaround potential, but quality and cash conversion are under pressure.", ["Execution risk", "High capex", "Share loss"], ["Process roadmap", "Foundry customers", "Government support"], {"revenueGrowth": 4, "grossMargin": 41, "operatingMargin": 7, "netMargin": 3, "cashFlowOperations": 12, "capex": 25, "freeCashFlow": -13, "fcfMargin": -20, "pe": 38, "forwardPe": 24, "evSales": 3, "evEbitda": 14, "evFcf": 0, "pFcf": 0, "roic": 3, "debt": 50, "netDebt": 25, "capexIntensity": 38}),
    "QCOM": CompanySeed("QCOM", "Qualcomm", "Semiconductors", "Mobile and connectivity chips", "Supplies mobile processors, modems, and connectivity IP with licensing income.", ["Handsets", "Automotive", "IoT", "Licensing"], ["Patent portfolio", "Connectivity expertise", "OEM relationships"], "Important read-through for smartphones, edge AI, and automotive silicon.", "Can diversification offset smartphone maturity?", "Cash-generative franchise, but growth depends on diversification beyond handsets.", ["Apple modem risk", "Smartphone cycles", "China competition"], ["Automotive backlog", "Edge AI phones", "Licensing resilience"], {"revenueGrowth": 9, "grossMargin": 56, "operatingMargin": 28, "netMargin": 24, "cashFlowOperations": 12, "capex": 1, "freeCashFlow": 11, "fcfMargin": 29, "pe": 20, "forwardPe": 17, "evSales": 5, "evEbitda": 13, "evFcf": 18, "pFcf": 17, "roic": 28, "debt": 15, "netDebt": 5, "capexIntensity": 3}),
    "MRVL": CompanySeed("MRVL", "Marvell Technology", "Semiconductors", "Data infrastructure silicon", "Designs data infrastructure chips for cloud, networking, storage, and custom silicon.", ["Data center", "Carrier", "Enterprise", "Automotive"], ["Custom silicon relationships", "Networking portfolio", "Cloud exposure"], "AI custom silicon and optical connectivity supplier.", "Can AI custom silicon scale fast enough to offset legacy weakness?", "AI upside is real, but valuation needs confidence in margin expansion.", ["Execution risk", "Customer concentration", "Cyclical legacy markets"], ["Custom AI ASICs", "Optical DSP demand", "Margin recovery"], {"revenueGrowth": 20, "grossMargin": 61, "operatingMargin": 19, "netMargin": 8, "cashFlowOperations": 1.6, "capex": 0.3, "freeCashFlow": 1.3, "fcfMargin": 22, "pe": 60, "forwardPe": 36, "evSales": 12, "evEbitda": 30, "evFcf": 48, "pFcf": 46, "roic": 9, "debt": 4.2, "netDebt": 3.1, "capexIntensity": 5}),
    "MU": CompanySeed("MU", "Micron Technology", "Semiconductors", "Memory", "Produces DRAM and NAND memory used in data center, PCs, mobile, and industrial systems.", ["DRAM", "NAND", "HBM"], ["Scale", "Process know-how", "HBM positioning"], "Memory cycle and HBM demand are important AI infrastructure indicators.", "Where is the company in the memory cycle and how durable is HBM pricing?", "Cyclical recovery story, quality depends on pricing discipline and capex.", ["Memory cyclicality", "Capex discipline", "Commodity pricing"], ["HBM demand", "Supply discipline", "AI server memory content"], {"revenueGrowth": 45, "grossMargin": 35, "operatingMargin": 18, "netMargin": 12, "cashFlowOperations": 9, "capex": 8, "freeCashFlow": 1, "fcfMargin": 4, "pe": 30, "forwardPe": 18, "evSales": 5, "evEbitda": 10, "evFcf": 70, "pFcf": 68, "roic": 8, "debt": 14, "netDebt": 6, "capexIntensity": 30}),
    "AMAT": CompanySeed("AMAT", "Applied Materials", "Semiconductor equipment", "Wafer fabrication equipment", "Supplies materials engineering equipment for semiconductor and display manufacturing.", ["Semiconductor systems", "Applied global services", "Display"], ["Installed base", "Process breadth", "Service revenue"], "Broadest WFE exposure and strong read-through to fab investment.", "Is WFE demand broadening beyond leading-edge AI capacity?", "High-quality equipment compounder, but cycle and China exposure matter.", ["China controls", "Capex cycles", "Customer concentration"], ["Foundry logic capex", "Services growth", "Packaging tools"], {"revenueGrowth": 7, "grossMargin": 48, "operatingMargin": 29, "netMargin": 25, "cashFlowOperations": 8, "capex": 0.8, "freeCashFlow": 7.2, "fcfMargin": 27, "pe": 24, "forwardPe": 20, "evSales": 6, "evEbitda": 16, "evFcf": 24, "pFcf": 23, "roic": 36, "debt": 6, "netDebt": 1, "capexIntensity": 3}),
    "LRCX": CompanySeed("LRCX", "Lam Research", "Semiconductor equipment", "Etch and deposition equipment", "Supplies etch and deposition tools critical to memory and logic manufacturing.", ["Systems", "Customer support", "Spares"], ["Process depth", "Installed base", "Memory relationships"], "Key beneficiary of memory capex and advanced packaging complexity.", "How much memory recovery is already reflected in valuation?", "Strong equipment quality with memory-cycle sensitivity.", ["Memory capex cycles", "Export controls", "Order volatility"], ["HBM capex", "NAND recovery", "Services growth"], {"revenueGrowth": 13, "grossMargin": 47, "operatingMargin": 31, "netMargin": 27, "cashFlowOperations": 5.5, "capex": 0.4, "freeCashFlow": 5.1, "fcfMargin": 29, "pe": 26, "forwardPe": 21, "evSales": 7, "evEbitda": 17, "evFcf": 25, "pFcf": 24, "roic": 42, "debt": 5, "netDebt": 0, "capexIntensity": 2}),
    "KLAC": CompanySeed("KLAC", "KLA Corporation", "Semiconductor equipment", "Process control", "Provides inspection and metrology tools for semiconductor manufacturing yield control.", ["Semiconductor process control", "Services", "Specialty semiconductor"], ["Mission-critical yield tools", "High share", "Services base"], "Process control intensity rises as chips become harder to manufacture.", "Does high margin quality offset cyclical equipment risk?", "Exceptional profitability, valuation and cycle timing need judgment.", ["WFE cyclicality", "China exposure", "High expectations"], ["Leading-edge process complexity", "Services", "Advanced packaging"], {"revenueGrowth": 8, "grossMargin": 61, "operatingMargin": 39, "netMargin": 32, "cashFlowOperations": 4.1, "capex": 0.3, "freeCashFlow": 3.8, "fcfMargin": 34, "pe": 31, "forwardPe": 25, "evSales": 10, "evEbitda": 22, "evFcf": 31, "pFcf": 30, "roic": 55, "debt": 6, "netDebt": 2, "capexIntensity": 3}),
    "MSFT": CompanySeed("MSFT", "Microsoft", "Cloud and big tech", "Cloud software and platforms", "Platform company spanning cloud, productivity software, operating systems, gaming, and AI.", ["Azure", "Office", "Windows", "LinkedIn", "Gaming"], ["Distribution", "Enterprise trust", "Cloud scale"], "Core AI platform and enterprise software compounder.", "Can AI monetization justify capex and premium valuation?", "Quality compounder, valuation depends on Azure and AI monetization.", ["AI capex", "Regulation", "Cloud competition"], ["Copilot adoption", "Azure AI", "Operating leverage"], {"revenueGrowth": 15, "grossMargin": 69, "operatingMargin": 45, "netMargin": 36, "cashFlowOperations": 119, "capex": 45, "freeCashFlow": 74, "fcfMargin": 30, "pe": 36, "forwardPe": 29, "evSales": 13, "evEbitda": 24, "evFcf": 39, "pFcf": 38, "roic": 34, "debt": 75, "netDebt": -5, "capexIntensity": 18}),
    "GOOGL": CompanySeed("GOOGL", "Alphabet", "Cloud and big tech", "Search, ads, cloud, and AI", "Digital advertising and cloud platform with major AI infrastructure investments.", ["Search", "YouTube", "Google Cloud", "Other bets"], ["Search distribution", "Data scale", "AI research"], "Key case for AI disruption versus AI reinforcement of search economics.", "Is AI a margin headwind, moat enhancer, or both?", "Strong business, debate is AI disruption and capex intensity versus valuation.", ["Search disruption", "Regulation", "AI capex"], ["Cloud profitability", "AI search monetization", "YouTube ads"], {"revenueGrowth": 14, "grossMargin": 58, "operatingMargin": 32, "netMargin": 27, "cashFlowOperations": 105, "capex": 52, "freeCashFlow": 53, "fcfMargin": 17, "pe": 24, "forwardPe": 20, "evSales": 6, "evEbitda": 14, "evFcf": 32, "pFcf": 31, "roic": 29, "debt": 28, "netDebt": -80, "capexIntensity": 17}),
    "AMZN": CompanySeed("AMZN", "Amazon", "Cloud and big tech", "E-commerce, cloud, and advertising", "Operates marketplace, logistics, AWS, ads, and subscription ecosystems.", ["AWS", "North America retail", "International retail", "Advertising"], ["Scale", "Logistics network", "AWS ecosystem"], "Shows interaction between cloud AI demand, retail margins, and capex.", "Can AWS and ads margin expansion offset heavy infrastructure investment?", "Powerful platform, conclusion depends on margin trajectory and capex payback.", ["Retail margin pressure", "Cloud competition", "Capex"], ["AWS AI demand", "Advertising growth", "Logistics efficiency"], {"revenueGrowth": 11, "grossMargin": 48, "operatingMargin": 11, "netMargin": 8, "cashFlowOperations": 110, "capex": 70, "freeCashFlow": 40, "fcfMargin": 6, "pe": 40, "forwardPe": 31, "evSales": 4, "evEbitda": 19, "evFcf": 42, "pFcf": 41, "roic": 14, "debt": 135, "netDebt": 55, "capexIntensity": 11}),
    "META": CompanySeed("META", "Meta Platforms", "Cloud and big tech", "Social platforms and AI", "Operates social platforms, messaging, ads, and AI infrastructure.", ["Family of apps", "Reality Labs"], ["Network effects", "Ad targeting", "Distribution"], "Ad cash flow funds one of the largest AI infrastructure programs.", "Will AI improve engagement and ads enough to justify capex?", "High cash quality, but AI capex and regulatory risks frame valuation.", ["Regulation", "AI capex", "Reality Labs losses"], ["AI ad tools", "Reels monetization", "Capital returns"], {"revenueGrowth": 18, "grossMargin": 82, "operatingMargin": 42, "netMargin": 34, "cashFlowOperations": 90, "capex": 40, "freeCashFlow": 50, "fcfMargin": 31, "pe": 28, "forwardPe": 23, "evSales": 9, "evEbitda": 17, "evFcf": 30, "pFcf": 29, "roic": 31, "debt": 38, "netDebt": -25, "capexIntensity": 25}),
    "ORCL": CompanySeed("ORCL", "Oracle", "Cloud and big tech", "Enterprise software and cloud infrastructure", "Enterprise software company expanding cloud infrastructure and database services.", ["Cloud services", "License support", "Hardware", "Services"], ["Database installed base", "Enterprise relationships", "Switching costs"], "Infrastructure cloud challenger with database lock-in and AI capacity demand.", "Can cloud infrastructure growth offset leverage and mature license exposure?", "Useful enterprise cloud story, but leverage and capex need attention.", ["Debt load", "Cloud competition", "Capex execution"], ["OCI demand", "Database cloud migration", "AI infrastructure contracts"], {"revenueGrowth": 8, "grossMargin": 72, "operatingMargin": 41, "netMargin": 20, "cashFlowOperations": 20, "capex": 14, "freeCashFlow": 6, "fcfMargin": 11, "pe": 36, "forwardPe": 28, "evSales": 9, "evEbitda": 20, "evFcf": 55, "pFcf": 48, "roic": 17, "debt": 88, "netDebt": 76, "capexIntensity": 25}),
    "ADBE": CompanySeed("ADBE", "Adobe", "Software and data", "Creative and document software", "Provides creative, document, and marketing software subscriptions.", ["Creative Cloud", "Document Cloud", "Experience Cloud"], ["Creative workflow standard", "Brand", "Switching costs"], "Key test of generative AI risk versus product enhancement in software.", "Does AI expand Adobe's market or pressure pricing?", "High-quality software franchise, but AI narrative and growth reacceleration matter.", ["AI disruption", "Growth deceleration", "Competition"], ["Firefly monetization", "Seat expansion", "Enterprise upsell"], {"revenueGrowth": 10, "grossMargin": 88, "operatingMargin": 45, "netMargin": 30, "cashFlowOperations": 8, "capex": 0.6, "freeCashFlow": 7.4, "fcfMargin": 34, "pe": 28, "forwardPe": 23, "evSales": 9, "evEbitda": 20, "evFcf": 27, "pFcf": 26, "roic": 32, "debt": 4, "netDebt": -3, "capexIntensity": 3}),
    "CRM": CompanySeed("CRM", "Salesforce", "Software and data", "Customer relationship software", "Enterprise software platform for sales, service, marketing, data, and AI workflows.", ["Sales", "Service", "Marketing", "Data cloud", "Slack"], ["Installed base", "Workflow data", "Partner ecosystem"], "Large-cap software efficiency story with AI upsell optionality.", "Can AI and Data Cloud reaccelerate growth while margins expand?", "Improved quality, but thesis needs growth reacceleration evidence.", ["Seat saturation", "Integration complexity", "Competition"], ["Data Cloud", "AI agents", "Margin discipline"], {"revenueGrowth": 9, "grossMargin": 77, "operatingMargin": 32, "netMargin": 19, "cashFlowOperations": 12, "capex": 0.8, "freeCashFlow": 11.2, "fcfMargin": 31, "pe": 35, "forwardPe": 27, "evSales": 7, "evEbitda": 22, "evFcf": 25, "pFcf": 24, "roic": 18, "debt": 9, "netDebt": -2, "capexIntensity": 2}),
    "NOW": CompanySeed("NOW", "ServiceNow", "Software and data", "Workflow automation", "Cloud platform for enterprise workflow automation and IT service management.", ["IT workflows", "Employee workflows", "Customer workflows", "Creator workflows"], ["Workflow depth", "Platform expansion", "Enterprise trust"], "Premium software compounder tied to workflow automation and AI agents.", "Can premium growth remain durable enough for the valuation?", "Excellent software quality, valuation requires durable high growth.", ["High valuation", "Enterprise budget cycles", "Platform competition"], ["AI workflow adoption", "Expansion deals", "Public sector"], {"revenueGrowth": 22, "grossMargin": 79, "operatingMargin": 30, "netMargin": 20, "cashFlowOperations": 4.2, "capex": 0.4, "freeCashFlow": 3.8, "fcfMargin": 35, "pe": 72, "forwardPe": 52, "evSales": 16, "evEbitda": 42, "evFcf": 50, "pFcf": 49, "roic": 19, "debt": 2, "netDebt": -5, "capexIntensity": 4}),
    "SNOW": CompanySeed("SNOW", "Snowflake", "Software and data", "Data cloud", "Cloud data platform for analytics, data sharing, and AI workloads.", ["Product revenue", "Professional services"], ["Data ecosystem", "Cloud neutrality", "Usage-based model"], "Usage-based software bellwether for data and AI workloads.", "Can consumption growth reaccelerate without sacrificing margins?", "Strategic data platform, but valuation depends on durable consumption growth.", ["Consumption volatility", "Competition", "High valuation"], ["AI data workloads", "Product innovation", "Enterprise consumption"], {"revenueGrowth": 28, "grossMargin": 72, "operatingMargin": 8, "netMargin": 3, "cashFlowOperations": 1.1, "capex": 0.1, "freeCashFlow": 1.0, "fcfMargin": 28, "pe": 0, "forwardPe": 95, "evSales": 13, "evEbitda": 70, "evFcf": 45, "pFcf": 44, "roic": 4, "debt": 0.3, "netDebt": -4, "capexIntensity": 3}),
    "PLTR": CompanySeed("PLTR", "Palantir", "Software and data", "Data analytics and AI platforms", "Provides data operating systems and AI platforms for government and commercial customers.", ["Government", "Commercial", "AIP"], ["Deployment depth", "Ontology", "Security clearance"], "AI software adoption case with strong government and commercial momentum.", "Is AIP growth durable enough for the valuation?", "Strong narrative and improving quality, but valuation demands execution.", ["High valuation", "Lumpy contracts", "Government concentration"], ["AIP adoption", "Commercial expansion", "Margin leverage"], {"revenueGrowth": 24, "grossMargin": 81, "operatingMargin": 22, "netMargin": 18, "cashFlowOperations": 1.2, "capex": 0.1, "freeCashFlow": 1.1, "fcfMargin": 38, "pe": 140, "forwardPe": 85, "evSales": 32, "evEbitda": 80, "evFcf": 75, "pFcf": 73, "roic": 18, "debt": 0.2, "netDebt": -3.5, "capexIntensity": 2}),
    "DDOG": CompanySeed("DDOG", "Datadog", "Software and data", "Observability and cloud monitoring", "Cloud observability platform for infrastructure, applications, logs, and security monitoring.", ["Infrastructure monitoring", "APM", "Logs", "Security"], ["Developer adoption", "Platform breadth", "Usage data"], "Cloud-native usage trend and software consolidation case.", "Can product expansion sustain growth while customers optimize cloud spend?", "Strong product-led platform, valuation needs growth durability.", ["Cloud optimization", "Competition", "Usage volatility"], ["AI observability", "Security expansion", "Large customer growth"], {"revenueGrowth": 23, "grossMargin": 80, "operatingMargin": 18, "netMargin": 10, "cashFlowOperations": 0.9, "capex": 0.1, "freeCashFlow": 0.8, "fcfMargin": 28, "pe": 95, "forwardPe": 62, "evSales": 15, "evEbitda": 55, "evFcf": 48, "pFcf": 47, "roic": 10, "debt": 0.8, "netDebt": -2, "capexIntensity": 3}),
    "MDB": CompanySeed("MDB", "MongoDB", "Software and data", "Developer data platform", "Database platform for modern applications with cloud-hosted Atlas as growth engine.", ["Atlas", "Enterprise Advanced", "Services"], ["Developer adoption", "Document database model", "Cloud platform"], "Database modernization and AI application data infrastructure case.", "Can Atlas growth offset macro and competitive database pressure?", "Good platform, but profitability and valuation require scrutiny.", ["Database competition", "Consumption volatility", "Profitability"], ["Atlas expansion", "AI app development", "Enterprise migrations"], {"revenueGrowth": 19, "grossMargin": 75, "operatingMargin": 8, "netMargin": 2, "cashFlowOperations": 0.4, "capex": 0.1, "freeCashFlow": 0.3, "fcfMargin": 16, "pe": 0, "forwardPe": 70, "evSales": 10, "evEbitda": 65, "evFcf": 55, "pFcf": 54, "roic": 3, "debt": 1.2, "netDebt": -0.8, "capexIntensity": 4}),
    "CRWD": CompanySeed("CRWD", "CrowdStrike", "Cybersecurity", "Endpoint and cloud security", "Cloud-native cybersecurity platform focused on endpoint, cloud, identity, and threat intelligence.", ["Endpoint", "Cloud", "Identity", "LogScale"], ["Threat graph", "Agent footprint", "Platform breadth"], "Premium cybersecurity platform and consolidation story.", "Can platform expansion overcome incident-related trust and valuation risk?", "High-quality security platform, but valuation and execution must be tested.", ["Trust after outages", "High valuation", "Competition"], ["Module adoption", "Cloud security", "Enterprise consolidation"], {"revenueGrowth": 27, "grossMargin": 77, "operatingMargin": 23, "netMargin": 12, "cashFlowOperations": 1.4, "capex": 0.1, "freeCashFlow": 1.3, "fcfMargin": 33, "pe": 100, "forwardPe": 65, "evSales": 18, "evEbitda": 58, "evFcf": 52, "pFcf": 51, "roic": 15, "debt": 0.8, "netDebt": -3, "capexIntensity": 3}),
    "PANW": CompanySeed("PANW", "Palo Alto Networks", "Cybersecurity", "Network and cloud security", "Cybersecurity platform spanning network, cloud, endpoint, and security operations.", ["Network security", "Cloud security", "Security operations"], ["Platform breadth", "Enterprise relationships", "Threat intelligence"], "Security consolidation case with platformization strategy.", "Does platformization improve long-term value despite near-term billing pressure?", "Strategic platform, but transition effects and valuation need judgment.", ["Platform transition", "Competition", "Billing volatility"], ["Platformization", "Cloud security", "AI security operations"], {"revenueGrowth": 16, "grossMargin": 76, "operatingMargin": 28, "netMargin": 18, "cashFlowOperations": 3.3, "capex": 0.2, "freeCashFlow": 3.1, "fcfMargin": 37, "pe": 58, "forwardPe": 42, "evSales": 12, "evEbitda": 38, "evFcf": 33, "pFcf": 32, "roic": 20, "debt": 3, "netDebt": -1, "capexIntensity": 2}),
    "NET": CompanySeed("NET", "Cloudflare", "Cybersecurity", "Connectivity cloud and security", "Provides edge network, security, performance, and developer services.", ["Application services", "Zero trust", "Developer platform"], ["Global edge network", "Developer adoption", "Security platform"], "Edge cloud and security platform with broad optionality.", "Can revenue scale and margin expansion justify premium valuation?", "Strategic platform with optionality, but valuation requires execution.", ["High valuation", "Competition", "Enterprise sales execution"], ["Zero trust", "Workers platform", "AI inference at edge"], {"revenueGrowth": 28, "grossMargin": 77, "operatingMargin": 12, "netMargin": 2, "cashFlowOperations": 0.45, "capex": 0.16, "freeCashFlow": 0.29, "fcfMargin": 18, "pe": 0, "forwardPe": 95, "evSales": 18, "evEbitda": 80, "evFcf": 70, "pFcf": 69, "roic": 4, "debt": 1.4, "netDebt": -0.5, "capexIntensity": 10}),
    "ZS": CompanySeed("ZS", "Zscaler", "Cybersecurity", "Zero trust security", "Cloud security platform for secure internet access, private access, and data protection.", ["ZIA", "ZPA", "Data protection"], ["Cloud architecture", "Zero trust focus", "Enterprise base"], "Zero trust adoption and security architecture transition case.", "Can Zscaler maintain growth as zero trust matures?", "Strong security platform, but growth and valuation need proof.", ["Competition", "Sales cycles", "Valuation"], ["Zero trust demand", "Data security", "Large enterprise expansion"], {"revenueGrowth": 26, "grossMargin": 78, "operatingMargin": 17, "netMargin": 6, "cashFlowOperations": 0.8, "capex": 0.1, "freeCashFlow": 0.7, "fcfMargin": 25, "pe": 0, "forwardPe": 70, "evSales": 13, "evEbitda": 55, "evFcf": 45, "pFcf": 44, "roic": 8, "debt": 1.1, "netDebt": -1.5, "capexIntensity": 4}),
    "SAP": CompanySeed("SAP", "SAP", "European technology", "Enterprise applications", "European enterprise software leader focused on ERP, cloud migration, and business applications.", ["Cloud ERP", "Business technology platform", "Support"], ["ERP installed base", "Mission-critical workflows", "European scale"], "European software bellwether for cloud migration and AI in enterprise processes.", "Can cloud transition sustain growth and margin expansion?", "Quality European software compounder, valuation depends on cloud execution.", ["Migration complexity", "Macro IT budgets", "Competition"], ["S/4HANA cloud", "AI copilot", "Margin expansion"], {"revenueGrowth": 9, "grossMargin": 73, "operatingMargin": 29, "netMargin": 20, "cashFlowOperations": 8.5, "capex": 0.9, "freeCashFlow": 7.6, "fcfMargin": 24, "pe": 36, "forwardPe": 29, "evSales": 8, "evEbitda": 23, "evFcf": 34, "pFcf": 33, "roic": 19, "debt": 12, "netDebt": 2, "capexIntensity": 3}),
    "STM": CompanySeed("STM", "STMicroelectronics", "European technology", "Analog and embedded semiconductors", "European chipmaker serving automotive, industrial, personal electronics, and embedded markets.", ["Automotive", "Industrial", "Personal electronics", "Microcontrollers"], ["Customer breadth", "Manufacturing know-how", "European footprint"], "European semiconductor cycle and auto/industrial demand read-through.", "Is weakness cyclical or structural in auto and industrial chips?", "Cyclical quality business, timing and end-market recovery are key.", ["Auto slowdown", "Industrial destocking", "China competition"], ["Inventory normalization", "SiC demand", "Industrial recovery"], {"revenueGrowth": -18, "grossMargin": 38, "operatingMargin": 15, "netMargin": 12, "cashFlowOperations": 3.5, "capex": 2.5, "freeCashFlow": 1.0, "fcfMargin": 7, "pe": 22, "forwardPe": 18, "evSales": 2.5, "evEbitda": 8, "evFcf": 28, "pFcf": 26, "roic": 11, "debt": 3, "netDebt": -1, "capexIntensity": 18}),
    "IFX": CompanySeed("IFX", "Infineon Technologies", "European technology", "Power and automotive semiconductors", "European semiconductor company focused on power, automotive, industrial, and IoT chips.", ["Automotive", "Green industrial power", "Power and sensor systems"], ["Power semiconductor expertise", "Auto relationships", "Scale"], "Important European power semiconductor and electrification case.", "Can structural electrification offset cyclical auto weakness?", "Good structural exposure, but cycle and margins need care.", ["Auto cycle", "Industrial weakness", "China pricing"], ["EV power content", "Industrial recovery", "Margin stabilization"], {"revenueGrowth": -6, "grossMargin": 41, "operatingMargin": 20, "netMargin": 14, "cashFlowOperations": 4.8, "capex": 3.3, "freeCashFlow": 1.5, "fcfMargin": 9, "pe": 25, "forwardPe": 20, "evSales": 3.2, "evEbitda": 10, "evFcf": 30, "pFcf": 28, "roic": 12, "debt": 7, "netDebt": 3, "capexIntensity": 20}),
}


def pct_growth(values: list[float]) -> list[float | None]:
    growth: list[float | None] = [None]
    for previous, current in zip(values, values[1:]):
        growth.append(round((current / previous - 1) * 100, 1) if previous else None)
    return growth


def latest(values: list[float | None]) -> float | None:
    usable = [value for value in values if value is not None]
    return usable[-1] if usable else None


def make_series(latest_value: float, growth: float, points: int, volatility: float = 0.04) -> list[float]:
    if points <= 1:
        return [round(latest_value, 1)]
    start = latest_value / max(0.18, (1 + growth / 100))
    values = []
    for index in range(points):
        ratio = index / (points - 1)
        value = start + (latest_value - start) * ratio
        wobble = 1 + ((index % 3) - 1) * volatility
        values.append(round(value * wobble, 1))
    values[-1] = round(latest_value, 1)
    return values


def make_margin_series(latest_value: float, points: int, spread: float = 3.0) -> list[float]:
    return [round(latest_value - spread + (spread * index / max(1, points - 1)), 1) for index in range(points)]


def financials(seed: CompanySeed, period: str) -> dict:
    annual_periods = ["2021", "2022", "2023", "2024", "2025E"]
    quarterly_periods = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"]
    periods = quarterly_periods if period == "quarterly" else annual_periods
    scale = 0.25 if period == "quarterly" else 1
    growth = seed.metrics["revenueGrowth"]
    revenue = make_series(max(1.0, seed.metrics["cashFlowOperations"] / 0.55) * scale, growth, len(periods))
    cfo = make_series(seed.metrics["cashFlowOperations"] * scale, growth * 0.7, len(periods), 0.03)
    capex = make_series(seed.metrics["capex"] * scale, growth * 0.45, len(periods), 0.02)
    fcf = [round(cash - spend, 1) for cash, spend in zip(cfo, capex)]
    g = seed.metrics["revenueGrowth"]
    reported_growth = [round(g - 8, 1), round(g - 3, 1), round(g + 2, 1), round(g + 1, 1), round(g, 1)]
    return {
        "periods": periods,
        "revenue": revenue,
        "revenueGrowth": [None if value is None else round(value, 1) for value in reported_growth],
        "grossMargin": make_margin_series(seed.metrics["grossMargin"], len(periods)),
        "operatingMargin": make_margin_series(seed.metrics["operatingMargin"], len(periods), 2.5),
        "netMargin": make_margin_series(seed.metrics["netMargin"], len(periods), 2.0),
        "cashFlowOperations": cfo,
        "capex": capex,
        "freeCashFlow": fcf,
        "fcfMargin": [round(value / rev * 100, 1) if rev else None for value, rev in zip(fcf, revenue)],
        "roic": make_margin_series(seed.metrics["roic"], len(periods), 2.0),
        "source": {
            "name": f"{seed.ticker} {period} sample model",
            "url": "",
            "as_of": periods[-1],
            "retrieved_at": TODAY,
            "notes": "Static sample data for interview preparation. Not live financial data.",
        },
    }


def market_series(seed: CompanySeed) -> dict:
    one_year = max(-35, min(95, seed.metrics["revenueGrowth"] * 1.6))
    return {
        "note": "Sample market data for demo purposes.",
        "horizons": {"1M": round(one_year / 12, 1), "3M": round(one_year / 4, 1), "6M": round(one_year / 2, 1), "YTD": round(one_year / 2.4, 1), "1Y": round(one_year, 1), "3Y": round(one_year * 2.1, 1), "5Y": round(one_year * 3.0, 1), "10Y": round(one_year * 4.8, 1), "MAX": round(one_year * 7.5, 1)},
        "series": {
            "1M": {"periods": ["Week 1", "Week 2", "Week 3", "Week 4"], "price": make_series(100 + one_year / 12, one_year / 12, 4, 0.01)},
            "3M": {"periods": ["Month 1", "Month 2", "Month 3"], "price": make_series(100 + one_year / 4, one_year / 4, 3, 0.01)},
            "6M": {"periods": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], "price": make_series(100 + one_year / 2, one_year / 2, 6, 0.015)},
            "YTD": {"periods": ["Jan", "Feb", "Mar", "Apr", "May"], "price": make_series(100 + one_year / 2.4, one_year / 2.4, 5, 0.015)},
            "1Y": {"periods": ["Q1", "Q2", "Q3", "Q4"], "price": make_series(100 + one_year, one_year, 4, 0.02)},
            "3Y": {"periods": ["2023", "2024", "2025", "2026E"], "price": make_series(100 + one_year * 2.1, one_year * 2.1, 4, 0.03)},
            "5Y": {"periods": ["2021", "2022", "2023", "2024", "2025", "2026E"], "price": make_series(100 + one_year * 3, one_year * 3, 6, 0.04)},
            "10Y": {"periods": ["2016", "2018", "2020", "2022", "2024", "2026E"], "price": make_series(100 + one_year * 4.8, one_year * 4.8, 6, 0.04)},
            "MAX": {"periods": ["2010", "2013", "2016", "2019", "2022", "2026E"], "price": make_series(100 + one_year * 7.5, one_year * 7.5, 6, 0.04)},
        },
    }


def build_company(seed: CompanySeed, source_type: str = "sample_manual") -> dict:
    annual = financials(seed, "annual")
    quarterly = financials(seed, "quarterly")
    ttm_revenue = sum(quarterly["revenue"][-4:])
    ttm_fcf = sum(quarterly["freeCashFlow"][-4:])
    metrics = dict(seed.metrics)
    return {
        "ticker": seed.ticker,
        "name": seed.name,
        "exchange": "",
        "industry": seed.industry,
        "sector": seed.sector,
        "currency": "USD",
        "dataStatus": "Sample data",
        "profile": {
            "summary": seed.one_sentence,
            "segments": seed.segments,
            "customers": ["Enterprise customers", "Cloud platforms", "Technology buyers"],
            "moat": seed.moat,
            "geography": "Global revenue base. Static geography note for interview preparation.",
        },
        "caseStudy": {
            "company": seed.name,
            "ticker": seed.ticker,
            "sector": seed.sector,
            "oneSentenceBusiness": seed.one_sentence,
            "keySegments": seed.segments,
            "whyItMatters": seed.why_it_matters,
            "moat": "; ".join(seed.moat),
            "growthQuality": growth_quality(metrics["revenueGrowth"], metrics["operatingMargin"]),
            "cashQuality": cash_quality(metrics["fcfMargin"], metrics["capexIntensity"]),
            "valuationView": valuation_view(metrics["forwardPe"], metrics["evSales"]),
            "mainRisks": seed.risks,
            "mainCatalysts": seed.catalysts,
            "caseStudyAngle": seed.case_study_angle,
            "possibleConclusion": seed.possible_conclusion,
        },
        "financials": {
            "annual": annual,
            "quarterly": quarterly,
            "ttm": {
                "periods": ["TTM"],
                "revenue": [round(ttm_revenue, 1)],
                "revenueGrowth": [latest(quarterly["revenueGrowth"])],
                "grossMargin": [latest(quarterly["grossMargin"])],
                "operatingMargin": [latest(quarterly["operatingMargin"])],
                "netMargin": [latest(quarterly["netMargin"])],
                "cashFlowOperations": [round(sum(quarterly["cashFlowOperations"][-4:]), 1)],
                "capex": [round(sum(quarterly["capex"][-4:]), 1)],
                "freeCashFlow": [round(ttm_fcf, 1)],
                "fcfMargin": [round(ttm_fcf / ttm_revenue * 100, 1) if ttm_revenue else None],
                "roic": [latest(quarterly["roic"])],
                "source": {"name": f"{seed.ticker} rolling TTM sample model", "url": "", "as_of": quarterly["periods"][-1], "retrieved_at": TODAY, "notes": "Derived from quarterly sample data."},
            },
        },
        "valuation": {"metrics": metrics, "source": {"name": "Manual sample valuation model", "url": "", "as_of": "May 2026", "retrieved_at": TODAY, "notes": "Approximate valuation multiples for static demo only."}},
        "metrics": metrics,
        "stockPerformance": market_series(seed),
        "risks": seed.risks,
        "catalysts": seed.catalysts,
        "analystFlags": ["Sample data for preparation only.", "Verify all metrics before professional use."],
        "data_status": {
            "last_updated": TODAY,
            "source_type": source_type,
            "source_notes": "Static sample data for interview preparation. Figures are approximate and not live.",
            "latest_annual_period": "2025E",
            "latest_quarterly_period": "Q1 2026",
            "latest_market_period": "May 2026",
            "latest_valuation_period": "May 2026",
            "has_mixed_freshness": False,
        },
        "market_source": {"name": f"{seed.ticker} sample market performance", "url": "", "as_of": "May 2026", "retrieved_at": TODAY, "notes": "Sample market data for demo purposes, not live pricing."},
    }


def growth_quality(revenue_growth: float, operating_margin: float) -> str:
    if revenue_growth >= 25 and operating_margin >= 25:
        return "Strong growth with attractive profitability."
    if revenue_growth >= 10:
        return "Solid growth, confirm margin quality and durability."
    if revenue_growth >= 0:
        return "Moderate growth; focus on drivers and cycle position."
    return "Weak reported growth; separate cycle from structural decline."


def cash_quality(fcf_margin_value: float, capex_intensity: float) -> str:
    if fcf_margin_value >= 25 and capex_intensity <= 10:
        return "High cash conversion with limited capex intensity."
    if fcf_margin_value >= 15:
        return "Good cash conversion; review reinvestment needs."
    if capex_intensity >= 25:
        return "Cash quality constrained by high capex intensity."
    return "Cash conversion needs deeper review."


def valuation_view(forward_pe: float, ev_sales: float) -> str:
    if forward_pe >= 45 or ev_sales >= 18:
        return "Valuation demanding; requires strong growth justification."
    if forward_pe <= 22 and ev_sales <= 8:
        return "Valuation appears more reasonable versus growth profile."
    return "Valuation needs peer and business-quality context."


def manual_template(args: argparse.Namespace) -> dict:
    seed = SAMPLE_COMPANIES.get(args.ticker.upper()) or next(iter(SAMPLE_COMPANIES.values()))
    company = build_company(seed, "sample_manual")
    company["ticker"] = args.ticker.upper()
    company["name"] = args.company_name or f"{args.ticker.upper()} manual template"
    company["profile"]["summary"] = ""
    company["profile"]["segments"] = []
    company["profile"]["moat"] = []
    company["risks"] = []
    company["catalysts"] = []
    company["caseStudy"]["oneSentenceBusiness"] = ""
    company["caseStudy"]["keySegments"] = []
    company["data_status"]["source_notes"] = "Manual template. Fill with analyst-owned source data."
    return company


def build_mock_company(args: argparse.Namespace) -> dict:
    seed = SAMPLE_COMPANIES.get(args.ticker.upper()) or CompanySeed(
        args.ticker.upper(),
        args.company_name or f"{args.ticker.upper()} Sample Company",
        "Software and data",
        "Technology",
        "Sample technology company profile generated locally.",
        ["Segment 1", "Segment 2"],
        ["Scale", "Technology depth"],
        "Useful placeholder for interview practice.",
        "Replace mock data with analyst-reviewed information.",
        "Needs deeper review before any conclusion.",
        ["Replace with analyst risk"],
        ["Replace with catalyst"],
        SAMPLE_COMPANIES["ADBE"].metrics,
    )
    if args.company_name:
        seed = CompanySeed(seed.ticker, args.company_name, seed.sector, seed.industry, seed.one_sentence, seed.segments, seed.moat, seed.why_it_matters, seed.case_study_angle, seed.possible_conclusion, seed.risks, seed.catalysts, seed.metrics)
    return build_company(seed, "generated_mock")


def fmp_placeholder(_: argparse.Namespace) -> dict:
    # Future implementation: read an API key from local environment only,
    # fetch FMP data locally, normalize it, and write static JSON.
    raise NotImplementedError("Financial Modeling Prep provider is a placeholder for a future local-only workflow.")


def sec_edgar_placeholder(_: argparse.Namespace) -> dict:
    # Future implementation: retrieve SEC EDGAR filing/XBRL data locally,
    # normalize statement lines, and write static JSON.
    raise NotImplementedError("SEC EDGAR provider is a placeholder for a future local-only workflow.")


def generate_sample_database(output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for seed in SAMPLE_COMPANIES.values():
        path = output_dir / f"{seed.ticker}.json"
        path.write_text(json.dumps(build_company(seed, "sample_manual"), indent=2), encoding="utf-8")
        print(f"Wrote {path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Equity Research Copilot company JSON.")
    sub = parser.add_subparsers(dest="command")
    sample = sub.add_parser("generate_sample_database", help="Generate the full static sample database.")
    sample.add_argument("--output-dir", default="assets/data/companies", help="Directory for generated company JSON files.")

    parser.add_argument("--ticker", help="Company ticker, for example TSM.")
    parser.add_argument("--provider", choices=["mock", "manual", "fmp_placeholder", "sec_edgar_placeholder"], default="mock")
    parser.add_argument("--output", help="Output JSON path.")
    parser.add_argument("--company-name", default="", help="Optional company name.")
    parser.add_argument("--currency", default="USD", help="Reporting currency.")
    parser.add_argument("--period", choices=["annual", "quarterly"], default=None, help="Reserved for future provider-specific period limiting.")
    parser.add_argument("--limit", type=int, default=None, help="Reserved for future provider-specific period limiting.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.command == "generate_sample_database":
      generate_sample_database(Path(args.output_dir))
      return
    if not args.ticker or not args.output:
        raise SystemExit("--ticker and --output are required unless using generate_sample_database.")
    providers = {
        "mock": build_mock_company,
        "manual": manual_template,
        "fmp_placeholder": fmp_placeholder,
        "sec_edgar_placeholder": sec_edgar_placeholder,
    }
    company = providers[args.provider](args)
    output = Path(args.output)
    output.write_text(json.dumps(company, indent=2), encoding="utf-8")
    print(f"Wrote {output} for {company['ticker']} using provider {args.provider}.")


if __name__ == "__main__":
    main()
