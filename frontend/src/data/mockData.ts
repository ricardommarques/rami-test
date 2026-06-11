export type SignalLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export interface WeekData {
  week: number;
  level: SignalLevel | null;
  date: string;
}

export interface SignalData {
  name: string;
  weeks: WeekData[];
}

export interface CountryData {
  name: string;
  signals: {
    foodPrices: WeekData[];
    energyPrices: WeekData[];
    accessToMarkets: WeekData[];
    foodAvailability: WeekData[];
    cashLiquidity: WeekData[];
    exchangeRates: WeekData[];
  };
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  source: string;
  reliability: 'Verified' | 'Unverified';
  category: string;
  country: string;
  region: string;
  dimensions: string[];
}

export interface KeyMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

export interface SummarySource {
  name: string;
  url: string;
}

export interface KeySummary {
  headline: string;
  body: string;
  metrics: KeyMetric[];
  lastUpdated: string;
  alertLevel: SignalLevel;
  direction: 'deteriorating' | 'stable' | 'improving';
  confidence: number;
  sources?: SummarySource[];
}

const generateMockWeeks = (levels: (SignalLevel | null)[]): WeekData[] => {
  return levels.map((level, index) => ({
    week: index + 1,
    level,
    date: `Week ${index + 1}, Apr 2026`,
  }));
};

export const countries: CountryData[] = [
  {
    name: 'Lebanon',
    signals: {
      foodPrices: generateMockWeeks(['low', 'moderate', 'moderate', 'high', 'critical']),
      energyPrices: generateMockWeeks(['low', 'moderate', 'elevated', 'high', 'critical']),
      accessToMarkets: generateMockWeeks(['low', 'low', 'low', 'low', 'low']),
      foodAvailability: generateMockWeeks(['low', 'low', 'low', 'moderate', null]),       // current missing
      cashLiquidity: generateMockWeeks(['low', 'moderate', 'elevated', 'high', 'critical']),
      exchangeRates: generateMockWeeks(['high', 'high', 'critical', 'critical', 'critical']),
    },
  },
  {
    name: 'Syria',
    signals: {
      foodPrices: generateMockWeeks(['high', 'elevated', 'elevated', 'moderate', 'moderate']),
      energyPrices: generateMockWeeks(['low', 'moderate', 'moderate', 'elevated', 'critical']),
      accessToMarkets: generateMockWeeks(['low', 'moderate', 'moderate', 'elevated', 'critical']),
      foodAvailability: generateMockWeeks(['low', 'low', 'low', 'moderate', 'moderate']),
      cashLiquidity: generateMockWeeks(['low', 'moderate', 'moderate', 'elevated', 'elevated']),
      exchangeRates: generateMockWeeks(['high', 'elevated', 'elevated', null, 'moderate']),    // last-week ref missing
    },
  },
  {
    name: 'Palestine',
    signals: {
      foodPrices: generateMockWeeks(['high', 'high', 'critical', 'critical', 'critical']),
      energyPrices: generateMockWeeks(['low', 'low', 'moderate', null, 'high']),             // last-week ref missing
      accessToMarkets: generateMockWeeks(['high', 'high', 'critical', 'critical', 'critical']),
      foodAvailability: generateMockWeeks(['high', 'critical', 'critical', 'critical', 'critical']),
      cashLiquidity: generateMockWeeks(['high', 'elevated', 'elevated', 'elevated', 'moderate']),
      exchangeRates: generateMockWeeks(['high', 'elevated', 'elevated', 'elevated', 'moderate']),
    },
  },
];

// Sub-national regions per country, with approximate grid position for the
// stylised region map (col 1-2, row 1-2 reading top-left → bottom-right).
export interface RegionInfo {
  name: string;
  col: number;
  row: number;
}

// Per-region adjustments applied on top of national data when a region is
// selected on a Dimension page. priceMultiplier scales the time-series and
// AI price points; alertBump shifts the AI banner alert level (e.g. +1 = one
// step worse, -1 = one step better). summaryNote is appended to the AI body
// to make the banner feel region-specific.
export interface RegionAdjustment {
  priceMultiplier: number;
  alertBump: number;
  summaryNote: string;
  sources?: SummarySource[];
}

export const regionAdjustments: Record<string, Record<string, RegionAdjustment>> = {
  Lebanon: {
    'Beirut':        { priceMultiplier: 1.10, alertBump:  1, summaryNote: 'Beirut and its southern suburbs show consistently higher pressure than the country average, driven by dense urban demand and concentrated import dependency.', sources: [
      { name: 'WFP Beirut Market Monitor', url: 'https://www.wfp.org/countries/lebanon' },
      { name: 'L\'Orient-Le Jour — Beirut economy', url: 'https://www.lorientlejour.com' },
      { name: 'Beirut Port Authority bulletins', url: 'https://www.portdebeyrouth.com' },
    ] },
    'North Lebanon': { priceMultiplier: 1.05, alertBump:  0, summaryNote: 'North Lebanon shows mixed signals — supply availability is constrained but prices remain closer to the national average.', sources: [
      { name: 'WFP Akkar & North field reports', url: 'https://www.wfp.org/countries/lebanon' },
      { name: 'Tripoli wholesalers association', url: 'https://www.lorientlejour.com' },
      { name: 'FAO regional price tracker', url: 'https://www.fao.org/giews' },
    ] },
    'South Lebanon': { priceMultiplier: 1.20, alertBump:  1, summaryNote: 'South Lebanon is the most affected region, with cross-border restrictions and elevated security risk amplifying both prices and access constraints.', sources: [
      { name: 'OCHA South Lebanon access snapshot', url: 'https://www.unocha.org' },
      { name: 'WFP Tyre & Sidon monitoring', url: 'https://www.wfp.org/countries/lebanon' },
      { name: 'Reuters — border security', url: 'https://www.reuters.com' },
    ] },
    'Bekaa':         { priceMultiplier: 0.92, alertBump: -1, summaryNote: 'Bekaa is currently the most stable region, with local agricultural production cushioning food prices and broader market functionality.', sources: [
      { name: 'WFP Bekaa agricultural survey', url: 'https://www.wfp.org/countries/lebanon' },
      { name: 'FAO Lebanon crop outlook', url: 'https://www.fao.org/giews' },
      { name: 'Zahle market trader reports', url: 'https://www.lorientlejour.com' },
    ] },
  },
  Syria: {
    'Aleppo / Northwest':    { priceMultiplier: 1.08, alertBump:  0, summaryNote: 'Aleppo and the northwest remain stressed by displacement movements and intermittent corridor closures.', sources: [
      { name: 'WFP Aleppo hub situation report', url: 'https://www.wfp.org/countries/syria' },
      { name: 'OCHA Northwest Syria updates', url: 'https://www.unocha.org' },
      { name: 'REACH market assessment', url: 'https://www.reach-initiative.org' },
    ] },
    'Hasakah / Northeast':   { priceMultiplier: 1.15, alertBump:  1, summaryNote: 'Hasakah and the northeast show the sharpest disruptions, with the M4 highway closures driving longer delivery times and price spikes.', sources: [
      { name: 'WFP Northeast Syria logistics', url: 'https://www.wfp.org/countries/syria' },
      { name: 'OCHA M4 corridor advisory', url: 'https://www.unocha.org' },
      { name: 'North Press Agency', url: 'https://npasyria.com' },
    ] },
    'Damascus':              { priceMultiplier: 0.95, alertBump: -1, summaryNote: 'Damascus markets are relatively stable, with the recently reopened Aleppo–Damascus corridor easing wheat supply.', sources: [
      { name: 'WFP Damascus market monitor', url: 'https://www.wfp.org/countries/syria' },
      { name: 'FAO Syria wheat outlook', url: 'https://www.fao.org/giews' },
      { name: 'SANA economic bulletins', url: 'https://www.sana.sy' },
    ] },
    'Deir ez-Zor / East':    { priceMultiplier: 1.18, alertBump:  1, summaryNote: 'Deir ez-Zor and the east are the most affected, with limited access to formal markets and dependence on cross-line trade.', sources: [
      { name: 'WFP Deir ez-Zor field reports', url: 'https://www.wfp.org/countries/syria' },
      { name: 'OCHA East Syria access', url: 'https://www.unocha.org' },
      { name: 'REACH cross-line trade brief', url: 'https://www.reach-initiative.org' },
    ] },
  },
  Palestine: {
    'Northern Gaza':   { priceMultiplier: 1.40, alertBump:  2, summaryNote: 'Northern Gaza shows extreme disruption — commercial markets have collapsed and informal prices are several multiples of the national reference.', sources: [
      { name: 'WFP Gaza situation report', url: 'https://www.wfp.org/countries/state-palestine' },
      { name: 'OCHA oPt humanitarian update', url: 'https://www.ochaopt.org' },
      { name: 'PCBS price statistics', url: 'https://www.pcbs.gov.ps' },
    ] },
    'Southern Gaza':   { priceMultiplier: 1.25, alertBump:  1, summaryNote: 'Southern Gaza markets are operating intermittently, dependent on the Kerem Shalom crossing and limited truck movements.', sources: [
      { name: 'WFP Rafah & Khan Younis monitor', url: 'https://www.wfp.org/countries/state-palestine' },
      { name: 'OCHA crossings tracker', url: 'https://www.ochaopt.org' },
      { name: 'Logistics Cluster Gaza', url: 'https://logcluster.org' },
    ] },
    'West Bank':       { priceMultiplier: 1.05, alertBump:  0, summaryNote: 'The West Bank shows comparatively stable market functioning, with localised access restrictions affecting specific governorates.', sources: [
      { name: 'PCBS West Bank price index', url: 'https://www.pcbs.gov.ps' },
      { name: 'OCHA movement & access', url: 'https://www.ochaopt.org' },
      { name: 'WFP West Bank monitoring', url: 'https://www.wfp.org/countries/state-palestine' },
    ] },
    'East Jerusalem':  { priceMultiplier: 1.08, alertBump:  0, summaryNote: 'East Jerusalem markets are influenced by movement restrictions but supply chains remain largely operational.', sources: [
      { name: 'PCBS East Jerusalem data', url: 'https://www.pcbs.gov.ps' },
      { name: 'OCHA Jerusalem barrier report', url: 'https://www.ochaopt.org' },
      { name: 'WFP urban market brief', url: 'https://www.wfp.org/countries/state-palestine' },
    ] },
  },
};

// National (country/dimension) sources for the AI Overview box, used when no
// sub-national region is selected. Keyed by `${country}_${dimension}`.
export const summarySources: Record<string, SummarySource[]> = {
  lebanon_foodPrices:       [{ name: 'WFP Lebanon Food Price Monitor', url: 'https://www.wfp.org/countries/lebanon' }, { name: 'FAO GIEWS food price data', url: 'https://www.fao.org/giews' }, { name: 'L\'Orient-Le Jour', url: 'https://www.lorientlejour.com' }],
  lebanon_energyPrices:     [{ name: 'Lebanon Ministry of Energy bulletins', url: 'https://www.energyandwater.gov.lb' }, { name: 'Reuters energy desk', url: 'https://www.reuters.com' }, { name: 'WFP cold-chain monitoring', url: 'https://www.wfp.org/countries/lebanon' }],
  lebanon_accessToMarkets:  [{ name: 'OCHA Lebanon access snapshot', url: 'https://www.unocha.org' }, { name: 'WFP supply-route monitoring', url: 'https://www.wfp.org/countries/lebanon' }, { name: 'Beirut Port Authority', url: 'https://www.portdebeyrouth.com' }],
  lebanon_foodAvailability: [{ name: 'WFP wholesaler stock reports', url: 'https://www.wfp.org/countries/lebanon' }, { name: 'FAO Lebanon supply outlook', url: 'https://www.fao.org/giews' }, { name: 'OCHA Lebanon updates', url: 'https://www.unocha.org' }],
  lebanon_cashLiquidity:    [{ name: 'Banque du Liban statistics', url: 'https://www.bdl.gov.lb' }, { name: 'WFP cash & markets unit', url: 'https://www.wfp.org/countries/lebanon' }, { name: 'Reuters finance', url: 'https://www.reuters.com' }],
  lebanon_exchangeRates:    [{ name: 'Banque du Liban', url: 'https://www.bdl.gov.lb' }, { name: 'Lira Rate parallel-market tracker', url: 'https://lirarate.org' }, { name: 'Reuters FX', url: 'https://www.reuters.com' }],
  syria_foodPrices:         [{ name: 'WFP Syria mVAM price bulletin', url: 'https://www.wfp.org/countries/syria' }, { name: 'FAO GIEWS Syria', url: 'https://www.fao.org/giews' }, { name: 'REACH market monitoring', url: 'https://www.reach-initiative.org' }],
  syria_energyPrices:       [{ name: 'WFP Syria fuel monitoring', url: 'https://www.wfp.org/countries/syria' }, { name: 'OCHA Syria updates', url: 'https://www.unocha.org' }, { name: 'SANA', url: 'https://www.sana.sy' }],
  syria_accessToMarkets:    [{ name: 'OCHA Syria access monitoring', url: 'https://www.unocha.org' }, { name: 'Logistics Cluster Syria', url: 'https://logcluster.org' }, { name: 'REACH', url: 'https://www.reach-initiative.org' }],
  syria_foodAvailability:   [{ name: 'WFP Syria supply reports', url: 'https://www.wfp.org/countries/syria' }, { name: 'FAO Syria crop outlook', url: 'https://www.fao.org/giews' }, { name: 'OCHA Syria', url: 'https://www.unocha.org' }],
  syria_cashLiquidity:      [{ name: 'WFP Syria cash & markets', url: 'https://www.wfp.org/countries/syria' }, { name: 'Central Bank of Syria', url: 'https://www.cb.gov.sy' }, { name: 'REACH financial brief', url: 'https://www.reach-initiative.org' }],
  syria_exchangeRates:      [{ name: 'Central Bank of Syria', url: 'https://www.cb.gov.sy' }, { name: 'WFP Syria FX monitoring', url: 'https://www.wfp.org/countries/syria' }, { name: 'Reuters FX', url: 'https://www.reuters.com' }],
  palestine_foodPrices:     [{ name: 'PCBS price statistics', url: 'https://www.pcbs.gov.ps' }, { name: 'WFP Palestine food monitor', url: 'https://www.wfp.org/countries/state-palestine' }, { name: 'OCHA oPt', url: 'https://www.ochaopt.org' }],
  palestine_energyPrices:   [{ name: 'WFP Palestine fuel tracking', url: 'https://www.wfp.org/countries/state-palestine' }, { name: 'OCHA oPt energy update', url: 'https://www.ochaopt.org' }, { name: 'PCBS', url: 'https://www.pcbs.gov.ps' }],
  palestine_accessToMarkets:[{ name: 'OCHA oPt crossings tracker', url: 'https://www.ochaopt.org' }, { name: 'Logistics Cluster Gaza', url: 'https://logcluster.org' }, { name: 'WFP Palestine access reports', url: 'https://www.wfp.org/countries/state-palestine' }],
  palestine_foodAvailability:[{ name: 'WFP Gaza food security update', url: 'https://www.wfp.org/countries/state-palestine' }, { name: 'IPC Palestine analysis', url: 'https://www.ipcinfo.org' }, { name: 'OCHA oPt', url: 'https://www.ochaopt.org' }],
  palestine_cashLiquidity:  [{ name: 'PMA banking data', url: 'https://www.pma.ps' }, { name: 'WFP Palestine cash unit', url: 'https://www.wfp.org/countries/state-palestine' }, { name: 'OCHA oPt', url: 'https://www.ochaopt.org' }],
  palestine_exchangeRates:  [{ name: 'Palestine Monetary Authority', url: 'https://www.pma.ps' }, { name: 'PCBS', url: 'https://www.pcbs.gov.ps' }, { name: 'Reuters FX', url: 'https://www.reuters.com' }],
};

export const countryRegions: Record<string, RegionInfo[]> = {
  Lebanon: [
    { name: 'North Lebanon', col: 1, row: 1 },
    { name: 'Bekaa',         col: 2, row: 1 },
    { name: 'Beirut',        col: 1, row: 2 },
    { name: 'South Lebanon', col: 2, row: 2 },
  ],
  Syria: [
    { name: 'Aleppo / Northwest', col: 1, row: 1 },
    { name: 'Hasakah / Northeast', col: 2, row: 1 },
    { name: 'Damascus',            col: 1, row: 2 },
    { name: 'Deir ez-Zor / East',  col: 2, row: 2 },
  ],
  Palestine: [
    { name: 'Northern Gaza', col: 1, row: 1 },
    { name: 'West Bank',     col: 2, row: 1 },
    { name: 'Southern Gaza', col: 1, row: 2 },
    { name: 'East Jerusalem', col: 2, row: 2 },
  ],
};

export const signalLabels = {
  foodPrices: 'Food Prices',
  energyPrices: 'Energy Prices',
  accessToMarkets: 'Access to Markets',
  foodAvailability: 'Food Availability',
  cashLiquidity: 'Cash Availability',
  exchangeRates: 'Exchange Rates',
};

export const getLevelColor = (level: SignalLevel): string => {
  const colors = {
    low: 'bg-success-400',
    moderate: 'bg-ivory-300',
    elevated: 'bg-warning-400',
    high: 'bg-warning-500',
    critical: 'bg-danger-500',
  };
  return colors[level];
};

export const mockKeySummaries: Record<string, KeySummary> = {
  'lebanon_foodPrices': {
    headline: 'Critical food price escalation driven by import bottlenecks and currency collapse',
    body: 'AI analysis of price monitoring data (12 weeks), news intelligence, and exchange rate signals indicates a sustained and accelerating deterioration in food affordability across Lebanon. The food basket price has risen 36.8% since early February, with the steepest weekly gains recorded since late March. Bread and cooking oil are the most affected commodities. Convergent signals from multiple news sources and commodity trackers confirm continued upward pressure driven by LBP depreciation and Strait of Hormuz shipping disruptions.',
    metrics: [
      { label: 'Food Basket (latest AI)', value: '$58 / month', trend: 'up' },
      { label: 'WoW Change', value: '+7.4%', trend: 'up' },
      { label: 'Vs. Feb Baseline', value: '+52.6%', trend: 'up' },
      { label: 'Most Affected Item', value: 'Bread (+70%)', trend: 'up' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 82,
  },
  'lebanon_energyPrices': {
    headline: 'Fuel prices reach critical threshold as power grid failures compound humanitarian needs',
    body: 'AI monitoring of energy price feeds, news sources, and grid status reports shows fuel and electricity costs have reached critical levels. Diesel prices in Beirut are up 38% versus the February baseline. Generator fuel cost spikes are cascading into cold-chain food storage failures and water pumping outages. The AI system has captured 11 corroborating signals across Beirut, North Lebanon, and Mount Lebanon governorates over the past two weeks.',
    metrics: [
      { label: 'Diesel Price (latest)', value: '$2.1 / litre', trend: 'up' },
      { label: 'WoW Change', value: '+12.3%', trend: 'up' },
      { label: 'Generator Hours / Day', value: '4.2 hrs', trend: 'down' },
      { label: 'Power Outage Duration', value: '19+ hrs/day', trend: 'up' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 79,
  },
  'lebanon_accessToMarkets': {
    headline: 'Market access remains stable — no significant road or checkpoint disruptions detected',
    body: 'AI monitoring of traffic data, social media, and news feeds shows no material deterioration in market access across Lebanon. Key supply routes from Beirut port to inland governorates remain operational. The AI system has scanned 240+ sources over the past week without detecting checkpoint closures or road blockages. Informal market activity appears normal in Tripoli, Sidon, and Tyre based on social listening signals.',
    metrics: [
      { label: 'Open Markets', value: '94%', trend: 'stable' },
      { label: 'Road Closures', value: '0 major', trend: 'stable' },
      { label: 'Beirut Port Status', value: 'Operational', trend: 'stable' },
      { label: 'Sources Scanned', value: '240+', trend: 'stable' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'low',
    direction: 'stable',
    confidence: 88,
  },
  'lebanon_foodAvailability': {
    headline: 'Emerging stock gaps for wheat flour and vegetable oil in northern governorates',
    body: 'AI signals derived from wholesaler reports, social media, and supply chain monitoring indicate tightening food availability — particularly for vegetable oil and wheat flour in Akkar and North Lebanon. The AI system has detected 6 separate corroborating reports of stock depletion or procurement difficulty since 28 April. Beirut and Mount Lebanon remain adequately supplied. Import pipeline delays of 5–7 days from Turkey and Egypt are extending into a second consecutive week.',
    metrics: [
      { label: 'Flour Availability', value: 'Adequate (Beirut)', trend: 'down' },
      { label: 'Vegetable Oil Stock', value: 'Low in North', trend: 'down' },
      { label: 'Rice / Pulses', value: 'Normal', trend: 'stable' },
      { label: 'Import Pipeline Delay', value: '5-7 days', trend: 'down' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'elevated',
    direction: 'deteriorating',
    confidence: 71,
  },
  'lebanon_cashLiquidity': {
    headline: 'Severe cash liquidity crisis — banking restrictions and remittance disruptions at peak',
    body: 'AI analysis of banking sector data, remittance flow indicators, and household survey signals shows cash liquidity at critical levels. ATM withdrawal caps remain at USD 200/week. The USD parallel market premium has widened to 18%. AI monitoring of Western Union and Moneygram networks shows remittance disruptions affecting an estimated 42% of usual transfer volume since early May. Social listening signals indicate growing reliance on informal credit arrangements.',
    metrics: [
      { label: 'ATM Withdrawal Cap', value: 'USD 200 / wk', trend: 'stable' },
      { label: 'USD Black Market Premium', value: '+18%', trend: 'up' },
      { label: 'Remittance Volume', value: '-42% vs baseline', trend: 'down' },
      { label: 'Informal Credit Usage', value: '67% of HHs', trend: 'up' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 76,
  },
  'lebanon_exchangeRates': {
    headline: 'Lebanese pound in free fall — critical exchange rate pressure on food import costs',
    body: 'AI monitoring of parallel market exchange rate feeds and financial news shows the Lebanese pound at historically weak levels — 130,000 LBP/USD on the parallel market, a 15% decline since the February baseline. The AI system has cross-referenced this against food import cost estimates, concluding that LBP depreciation alone accounts for approximately 60% of the observed food basket price increase over the 12-week monitoring period. Banque du Liban intervention signals remain absent.',
    metrics: [
      { label: 'LBP/USD (Parallel)', value: '130,000', trend: 'up' },
      { label: 'Since Feb Baseline', value: '-15.3%', trend: 'down' },
      { label: 'vs. Official Rate', value: '+22% premium', trend: 'up' },
      { label: 'BdL Intervention', value: 'None detected', trend: 'stable' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 91,
  },
  'syria_foodPrices': {
    headline: 'Food prices moderating as post-transition supply chains gradually stabilise',
    body: 'AI analysis of market price feeds from Damascus, Aleppo, and Homs, combined with trade corridor monitoring, indicates a moderation in food price levels over the 12-week period. Prices peaked in early February at the height of transition uncertainty and have since declined by 11.2%. The AI system detects continued normalisation of wheat and legume prices, though cooking oil supply constraints persist. Confidence is moderate given partial data coverage in some governorates.',
    metrics: [
      { label: 'Food Basket (latest)', value: 'SYP 485,000 / mo', trend: 'down' },
      { label: 'WoW Change', value: '-3.1%', trend: 'down' },
      { label: 'Vs. Feb Baseline', value: '-11.2%', trend: 'down' },
      { label: 'Wheat Price Trend', value: 'Stabilising', trend: 'stable' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'moderate',
    direction: 'improving',
    confidence: 68,
  },
  'syria_energyPrices': {
    headline: 'Critical energy price spike driven by fuel import disruption from Iran',
    body: 'AI monitoring of energy price feeds and sanctions-related news shows a sharp deterioration in Syria\'s energy price situation over the past 3 weeks, reversing the improving food price trend. Subsidised Iranian fuel imports have dropped 68% since February following re-imposition of secondary sanctions. The AI system has captured diesel price data from 14 monitoring points across Syria, confirming a 19.4% week-on-week increase. Aleppo and Deir ez-Zor show the most severe impacts.',
    metrics: [
      { label: 'Diesel Price', value: 'SYP 12,500 / litre', trend: 'up' },
      { label: 'LPG Cylinder', value: 'SYP 280,000', trend: 'up' },
      { label: 'Iranian Fuel Imports', value: '-68% vs Feb', trend: 'down' },
      { label: 'WoW Diesel Change', value: '+19.4%', trend: 'up' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 84,
  },
  'syria_accessToMarkets': {
    headline: 'Market access deteriorating in northeast Syria — armed group checkpoints multiplying',
    body: 'AI analysis of humanitarian movement reports, OCHA situation updates, and social media monitoring indicates critical deterioration in market access across northeast Syria. The system has detected 34 active checkpoints in Hasakah and Deir ez-Zor governorates — up from 21 in February. M4 highway closures have been logged on 8 of the past 14 days. Average UN convoy delay has increased to 2.4 days. Bab al-Hawa cross-border route from Turkey remains open and is being used as a partial bypass.',
    metrics: [
      { label: 'NE Syria Checkpoints', value: '34 active', trend: 'up' },
      { label: 'M4 Highway Status', value: 'Intermittent', trend: 'down' },
      { label: 'UN Convoy Delays', value: '+2.4 days avg', trend: 'up' },
      { label: 'Bab al-Hawa Status', value: 'Open', trend: 'stable' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 87,
  },
  'palestine_foodPrices': {
    headline: 'Food prices at critical levels — commercial market collapse in northern Gaza',
    body: 'AI intelligence derived from informal trader network monitoring, satellite market activity analysis, and media triangulation confirms a complete commercial market breakdown in northern Gaza. Flour prices in Gaza City and Jabalia informal markets range from USD 12–15/kg — 520% above pre-conflict baselines. The AI system cross-referenced 14 independent source signals to establish this estimate with high confidence. The West Bank situation is elevated but not catastrophic, with Ramallah and Nablus markets partially functional.',
    metrics: [
      { label: 'Gaza: Flour (1kg)', value: 'USD 12–15', trend: 'up' },
      { label: 'Vs. Pre-conflict', value: '+520%', trend: 'up' },
      { label: 'W Bank: Food Basket', value: '+34% vs baseline', trend: 'up' },
      { label: 'N. Gaza Commercial Mkts', value: 'Collapsed', trend: 'down' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 89,
  },
  'palestine_foodAvailability': {
    headline: 'Famine conditions confirmed in northern Gaza — humanitarian access blocked 12+ days',
    body: 'AI synthesis of satellite imagery, humanitarian agency reports, and media signals confirms famine-level food scarcity in northern Gaza. The Kerem Shalom crossing has been operating at 18% of pre-conflict capacity for 3 consecutive weeks. The AI system logged 7 WFP convoy access denial events in the past 7 days through OCHA and agency reporting. IPC Phase 5 (Famine) classification is corroborated by all available AI-monitored signals. West Bank food availability is disrupted in Jenin and Tulkarm due to military operations.',
    metrics: [
      { label: 'N. Gaza Food Access', value: 'Blocked 12+ days', trend: 'down' },
      { label: 'Kerem Shalom Capacity', value: '18% of normal', trend: 'down' },
      { label: 'WFP Convoy Denials', value: '7 in past week', trend: 'up' },
      { label: 'IPC Phase', value: 'Phase 5 (Famine)', trend: 'stable' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 93,
  },
  'syria_foodAvailability': {
    headline: 'Uneven food availability recovery — eastern governorates remain severely under-supplied',
    body: 'AI monitoring of NGO situation reports, market surveys, and satellite imagery indicates a split picture across Syria. Damascus and Aleppo are showing gradual improvement in commodity availability as trade routes reopen, while Deir ez-Zor and Hasakah governorates remain critically under-supplied due to access restrictions and displacement. The AI system has detected 9 reports of flour rationing or zero-stock events in the east over the past two weeks. Supply chain normalisation is expected to remain incomplete for the next 4–6 weeks.',
    metrics: [
      { label: 'Damascus / Aleppo', value: 'Stabilising', trend: 'up' },
      { label: 'Deir ez-Zor Status', value: 'Critical shortage', trend: 'down' },
      { label: 'Flour Rationing Reports', value: '9 events (2 wks)', trend: 'up' },
      { label: 'Import Recovery', value: '61% of pre-crisis', trend: 'up' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'elevated',
    direction: 'improving',
    confidence: 65,
  },
  'syria_cashLiquidity': {
    headline: 'Cash liquidity moderately constrained — banking sector dysfunction persists in rural areas',
    body: 'AI analysis of banking network data, remittance tracking, and community monitoring signals shows a moderate cash liquidity situation in Syria. ATM coverage in Damascus and major cities has partially recovered, but rural and eastern governorates face significant cash access gaps. The transition government has suspended previous informal banking restrictions, creating some improvement, but the SYP remains highly volatile and informal lending remains widespread. Remittance inflows from the diaspora have increased 22% since February, providing a partial liquidity buffer.',
    metrics: [
      { label: 'ATM Coverage (urban)', value: '68% operational', trend: 'up' },
      { label: 'Rural Cash Access', value: 'Severely limited', trend: 'stable' },
      { label: 'Diaspora Remittances', value: '+22% vs Feb', trend: 'up' },
      { label: 'Informal Lending Rate', value: '54% of HHs', trend: 'down' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'elevated',
    direction: 'improving',
    confidence: 60,
  },
  'syria_exchangeRates': {
    headline: 'SYP under renewed pressure — sanctions on Iranian fuel imports driving depreciation',
    body: 'AI monitoring of parallel market currency feeds, financial news, and trade data shows the Syrian pound declining again after a brief period of post-transition stabilisation. The re-imposition of secondary sanctions targeting Iranian fuel exports to Syria has triggered an 8% weekly decline in the SYP. The AI system has cross-referenced this with commodity import cost data, estimating that currency depreciation will add 12–18% to food basket costs over the next four weeks if the trend continues. No central bank stabilisation mechanism is currently active.',
    metrics: [
      { label: 'SYP/USD (parallel)', value: '~14,200', trend: 'up' },
      { label: 'Weekly Change', value: '-8.1%', trend: 'down' },
      { label: 'Food Import Cost Impact', value: '+12–18% projected', trend: 'up' },
      { label: 'BdS Intervention', value: 'None active', trend: 'stable' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'high',
    direction: 'deteriorating',
    confidence: 78,
  },
  'palestine_energyPrices': {
    headline: 'Energy supply near-total collapse in Gaza — West Bank fuel costs at critical highs',
    body: 'AI monitoring of energy infrastructure reports, satellite data, and UN situation updates confirms near-complete energy system failure in Gaza. The Gaza Power Plant has not operated for 47 consecutive days. Diesel for emergency generators is available only via limited humanitarian deliveries and commands prices of USD 8–12/litre on informal markets. The West Bank is experiencing elevated but non-catastrophic fuel costs, with petrol prices up 28% since February driven by Israeli import restrictions and global oil price movements.',
    metrics: [
      { label: 'Gaza Power Plant', value: 'Offline 47 days', trend: 'down' },
      { label: 'Gaza Diesel (informal)', value: 'USD 8–12 / litre', trend: 'up' },
      { label: 'W Bank Petrol Change', value: '+28% vs Feb', trend: 'up' },
      { label: 'Hospital Generator Fuel', value: 'Critical (< 24h)', trend: 'down' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 91,
  },
  'palestine_accessToMarkets': {
    headline: 'Market access catastrophic in Gaza — West Bank movement restrictions escalating',
    body: 'AI intelligence from satellite imagery, checkpoint monitoring networks, and humanitarian reporting confirms total commercial market collapse in northern Gaza and critical access restrictions across the territory. The AI system has detected 23 active military checkpoints controlling entry to Gaza, with Kerem Shalom operating at minimal capacity. In the West Bank, 8 cities are under full or partial closure, with AI monitoring of road network data confirming a 61% reduction in passable routes compared to February baselines.',
    metrics: [
      { label: 'Gaza Crossings Open', value: '1 of 4 (partial)', trend: 'down' },
      { label: 'Gaza: Kerem Shalom', value: '18% capacity', trend: 'down' },
      { label: 'W Bank Closures', value: '8 cities affected', trend: 'up' },
      { label: 'Passable Routes (W Bank)', value: '-61% vs Feb', trend: 'down' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 94,
  },
  'palestine_cashLiquidity': {
    headline: 'Cash economy near-collapse in Gaza — West Bank banking system under severe stress',
    body: 'AI analysis of banking sector monitoring, remittance network data, and field reporting shows cash liquidity at critical levels across Palestinian territories. In Gaza, commercial banking has effectively ceased; the AI system detected zero ATM transactions in northern Gaza in the past 18 days from available signals. West Bank banking continues to function but under significant constraint — the AI has captured 14 reports of branch closures or restricted operations in Area A cities. WFP cash-based transfer programming faces mounting delivery barriers.',
    metrics: [
      { label: 'Gaza: ATM Operations', value: 'Ceased (N. Gaza)', trend: 'down' },
      { label: 'W Bank Branch Closures', value: '14 reports (2 wks)', trend: 'up' },
      { label: 'WFP CBT Delivery Rate', value: '38% of target', trend: 'down' },
      { label: 'Cash Availability Index', value: 'Critical', trend: 'down' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'critical',
    direction: 'deteriorating',
    confidence: 88,
  },
  'palestine_exchangeRates': {
    headline: 'Dual-currency stress — ILS under pressure; USD scarcity acute in Gaza',
    body: 'AI monitoring of currency exchange data and financial sector reports shows significant exchange rate stress across Palestinian territories. Gaza operates in a de facto USD economy with acute dollar scarcity; AI signals indicate USD-to-local-goods premiums of 40–60% in informal markets. The West Bank uses the Israeli New Shekel (ILS), which has depreciated 7.4% against the USD since February due to broader regional uncertainty. The AI system has detected 6 reports of exchange rate manipulation by informal traders in the West Bank, exploiting the ILS/USD volatility.',
    metrics: [
      { label: 'Gaza USD Premium', value: '+40–60% (informal)', trend: 'up' },
      { label: 'ILS/USD Change', value: '-7.4% since Feb', trend: 'down' },
      { label: 'ILS/USD (current)', value: '3.82', trend: 'up' },
      { label: 'Exchange Manipulation Reports', value: '6 detected', trend: 'up' },
    ],
    lastUpdated: '2026-05-12',
    alertLevel: 'high',
    direction: 'deteriorating',
    confidence: 72,
  },
};

export const mockNewsData: NewsItem[] = [
  {
    id: 1,
    title: 'Food prices increased 20% last week across Beirut markets',
    content: 'Food prices increased 20% last week across all major market clusters in Beirut and its southern suburbs, according to monitoring data compiled by Al Jazeera correspondents on the ground.',
    date: '2026-05-10',
    source: 'Al Jazeera',
    reliability: 'Verified',
    category: 'Price Alert',
    country: 'Lebanon',
    region: 'Beirut',
    dimensions: ['foodPrices'],
  },
  {
    id: 2,
    title: 'Bread prices double in two days following Strait of Hormuz closure',
    content: 'Price of bread doubled in the last 2 days in major Lebanese cities following the partial closure of the Strait of Hormuz, which has disrupted wheat shipments from key exporting countries.',
    date: '2026-05-11',
    source: 'Reuters',
    reliability: 'Verified',
    category: 'Supply Disruption',
    country: 'Lebanon',
    region: 'National',
    dimensions: ['foodPrices', 'energyPrices'],
  },
  {
    id: 3,
    title: 'Reports of vegetable oil shortage emerging in northern Lebanon',
    content: 'Several Tripoli residents are posting that local shops have run out of vegetable oil, with one user claiming distributors have stopped receiving shipments from Turkey and Egypt. Not yet corroborated by official sources.',
    date: '2026-05-11',
    source: 'X (@TripoliVoices)',
    reliability: 'Unverified',
    category: 'Availability Alert',
    country: 'Lebanon',
    region: 'North Lebanon',
    dimensions: ['foodAvailability', 'foodPrices'],
  },
  {
    id: 4,
    title: 'Lebanese pound hits 130,000 LBP/USD on parallel market — new record low',
    content: 'The Lebanese pound fell to a record low of 130,000 to the US dollar on the parallel market on Monday, intensifying pressure on food import costs and household purchasing power.',
    date: '2026-05-12',
    source: 'Naharnet',
    reliability: 'Verified',
    category: 'Exchange Rate',
    country: 'Lebanon',
    region: 'National',
    dimensions: ['exchangeRates', 'cashLiquidity', 'foodPrices'],
  },
  {
    id: 5,
    title: 'WFP convoy denied access to northern Gaza for 12th consecutive day',
    content: 'World Food Programme humanitarian convoys were again prevented from reaching northern Gaza governorates, extending the access blockage to 12 consecutive days and deepening fears of famine.',
    date: '2026-05-12',
    source: 'WFP Situation Report',
    reliability: 'Verified',
    category: 'Market Access',
    country: 'Palestine',
    region: 'Northern Gaza',
    dimensions: ['accessToMarkets', 'foodAvailability'],
  },
  {
    id: 6,
    title: 'Damascus traders posting that wheat prices are stabilising after corridor reopening',
    content: 'Facebook posts from several Damascus market traders claim wheat prices dropped roughly 4% this week after the Aleppo–Damascus highway reopened to commercial traffic. No official confirmation yet.',
    date: '2026-05-09',
    source: 'Facebook (Damascus Traders Group)',
    reliability: 'Unverified',
    category: 'Price Alert',
    country: 'Syria',
    region: 'Damascus',
    dimensions: ['foodPrices', 'accessToMarkets'],
  },
  {
    id: 7,
    title: 'M4 highway intermittent closures disrupting northeast Syria aid deliveries',
    content: 'Armed groups have imposed intermittent checkpoints and closures on the M4 highway in Hasakah governorate, causing significant delays to UN and NGO humanitarian supply convoys.',
    date: '2026-05-11',
    source: 'OCHA Syria',
    reliability: 'Verified',
    category: 'Market Access',
    country: 'Syria',
    region: 'Hasakah / Northeast Syria',
    dimensions: ['accessToMarkets'],
  },
  {
    id: 8,
    title: 'Gaza flour prices reach USD 15/kg as commercial markets collapse in north',
    content: 'The price of one kilogram of flour in northern Gaza has reached between USD 12 and USD 15 in informal markets — more than 500% above pre-conflict baselines — as commercial distribution networks have ceased operating.',
    date: '2026-05-12',
    source: 'Reuters',
    reliability: 'Verified',
    category: 'Price Alert',
    country: 'Palestine',
    region: 'Northern Gaza',
    dimensions: ['foodPrices', 'foodAvailability'],
  },
  {
    id: 9,
    title: 'Tripoli wholesalers report critical vegetable oil shortfall as Turkish supply delayed',
    content: 'At least four major food distributors in Tripoli have confirmed to NNA correspondents that their vegetable oil stocks will be depleted within 4–6 days unless pending shipments from Turkey arrive. The shipments have been delayed due to port congestion at Mersin.',
    date: '2026-05-11',
    source: 'NNA – National News Agency Lebanon',
    reliability: 'Verified',
    category: 'Availability Alert',
    country: 'Lebanon',
    region: 'North Lebanon',
    dimensions: ['foodAvailability', 'foodPrices'],
  },
  {
    id: 10,
    title: 'Generator diesel surpasses USD 2/litre threshold in Beirut suburbs',
    content: 'Diesel prices for private generators have crossed USD 2 per litre for the first time in Beirut\'s southern suburbs, pushing monthly electricity costs for households beyond USD 120, according to L\'Orient Today\'s cost-of-living tracker.',
    date: '2026-05-10',
    source: "L'Orient Today",
    reliability: 'Verified',
    category: 'Price Alert',
    country: 'Lebanon',
    region: 'Beirut',
    dimensions: ['energyPrices', 'cashLiquidity'],
  },
  {
    id: 11,
    title: 'Kerem Shalom crossing opens for 4 hours — only 12 trucks allowed through',
    content: 'The Kerem Shalom crossing between Israel and Gaza opened for four hours on Tuesday but only 12 aid trucks were permitted to enter — far below the 100+ daily movements required to meet minimum humanitarian needs, according to OCHA.',
    date: '2026-05-12',
    source: 'OCHA oPt Situation Report',
    reliability: 'Verified',
    category: 'Market Access',
    country: 'Palestine',
    region: 'Southern Gaza',
    dimensions: ['accessToMarkets', 'foodAvailability'],
  },
  {
    id: 12,
    title: 'Posts claim Syrian pound has lost 8% against USD this week',
    content: 'A widely shared X thread from Damascus-based money changers claims the Syrian pound has lost roughly 8% against the US dollar over the past week amid renewed sanctions pressure. The figure has not been confirmed by official exchanges.',
    date: '2026-05-11',
    source: 'X (@SyriaFXWatch)',
    reliability: 'Unverified',
    category: 'Exchange Rate',
    country: 'Syria',
    region: 'National',
    dimensions: ['exchangeRates', 'energyPrices', 'foodPrices'],
  },
];

export type ReferencePeriod = 'lastWeek' | 'lastMonth' | 'threeMonthsAgo';

export interface HistoricalBaseline {
  lastMonth?: SignalLevel;
  threeMonthsAgo?: SignalLevel;
}

export const historicalBaselines: Record<string, Record<string, HistoricalBaseline>> = {
  Lebanon: {
    foodPrices:       { lastMonth: 'low',      threeMonthsAgo: 'low' },
    energyPrices:     { lastMonth: 'low',      threeMonthsAgo: 'low' },
    accessToMarkets:  { lastMonth: 'low',      threeMonthsAgo: 'low' },
    foodAvailability: { lastMonth: 'low',      threeMonthsAgo: 'low' },
    cashLiquidity:    {                         threeMonthsAgo: 'low' },      // lastMonth missing
    exchangeRates:    { lastMonth: 'moderate'                        },      // threeMonthsAgo missing
  },
  Syria: {
    foodPrices:       {                         threeMonthsAgo: 'critical' }, // lastMonth missing
    energyPrices:     { lastMonth: 'moderate', threeMonthsAgo: 'high' },
    accessToMarkets:  { lastMonth: 'moderate', threeMonthsAgo: 'high' },
    foodAvailability: { lastMonth: 'moderate', threeMonthsAgo: 'elevated' },
    cashLiquidity:    { lastMonth: 'moderate', threeMonthsAgo: 'elevated' },
    exchangeRates:    { lastMonth: 'critical', threeMonthsAgo: 'critical' },
  },
  Palestine: {
    foodPrices:       { lastMonth: 'high',     threeMonthsAgo: 'moderate' },
    energyPrices:     { lastMonth: 'low',      threeMonthsAgo: 'low' },
    accessToMarkets:  { lastMonth: 'high'                               },   // threeMonthsAgo missing
    foodAvailability: { lastMonth: 'high',     threeMonthsAgo: 'elevated' },
    cashLiquidity:    { lastMonth: 'elevated', threeMonthsAgo: 'moderate' },
    exchangeRates:    { lastMonth: 'elevated', threeMonthsAgo: 'moderate' },
  },
};

// AI-derived directional signal for food-price commodities, informed by news
// narrative rather than by numerical comparison. Null = "Information not
// available" (no relevant news since the reference point).
export interface NarrativeSignal {
  direction: 'deteriorating' | 'improving' | 'stable';
  rationale: string;
  source: string;
  date: string;
  url?: string;
}

export const foodPriceNarrativeSignals: Record<string, Record<string, NarrativeSignal | null>> = {
  Lebanon: {
    foodBasket: {
      direction: 'deteriorating',
      rationale: 'Multiple outlets report 20%+ price increases across Beirut markets in the past week, driven by import disruptions and a weakening currency.',
      source: 'Al Jazeera',
      date: '10 May 2026',
      url: 'https://www.aljazeera.com/',
    },
    bread: {
      direction: 'deteriorating',
      rationale: 'Bread prices reported to have doubled in two days following the Strait of Hormuz partial closure, with wheat imports disrupted.',
      source: 'Reuters',
      date: '11 May 2026',
      url: 'https://www.reuters.com/world/middle-east/',
    },
    oil: null,
    beans: {
      direction: 'stable',
      rationale: 'No new reporting indicating substantive movement; informal market chatter suggests prices broadly unchanged since the reference period.',
      source: 'NNA – National News Agency Lebanon',
      date: '11 May 2026',
    },
    sorghum: {
      direction: 'deteriorating',
      rationale: 'Distributors report shortfalls in cereals supply chains feeding through to sorghum availability and price pressure.',
      source: 'L\'Orient Today',
      date: '10 May 2026',
    },
  },
  Syria: {
    foodBasket: {
      direction: 'improving',
      rationale: 'Aleppo–Damascus highway reopening to commercial traffic has eased supply constraints; traders report modest price reductions.',
      source: 'Facebook (Damascus Traders Group)',
      date: '09 May 2026',
    },
    bread: {
      direction: 'improving',
      rationale: 'Wheat prices in Damascus central market reported down approximately 4% as corridor access restored.',
      source: 'Facebook (Damascus Traders Group)',
      date: '09 May 2026',
    },
    oil: null,
    beans: null,
    sorghum: {
      direction: 'stable',
      rationale: 'No major shifts reported in cereals trade; northeast disruptions are offset by improved Damascus corridor.',
      source: 'OCHA Syria',
      date: '11 May 2026',
    },
  },
  Palestine: {
    foodBasket: {
      direction: 'deteriorating',
      rationale: 'Northern Gaza flour prices reported in informal markets at USD 12–15/kg — more than 500% above pre-conflict baselines — as commercial distribution networks have ceased operating.',
      source: 'Reuters',
      date: '12 May 2026',
      url: 'https://www.reuters.com/world/middle-east/',
    },
    bread: {
      direction: 'deteriorating',
      rationale: 'WFP convoy access denied for 12th consecutive day; bread supply collapse driving informal market price spikes.',
      source: 'WFP Situation Report',
      date: '12 May 2026',
    },
    oil: null,
    beans: {
      direction: 'deteriorating',
      rationale: 'Kerem Shalom crossing opened only 4 hours with 12 trucks permitted — far below the 100+ required; legumes among the categories most affected.',
      source: 'OCHA oPt Situation Report',
      date: '12 May 2026',
    },
    sorghum: null,
  },
};

export interface WfpDataPoint {
  date: string;
  price: number;
}

export interface AiUpdatePoint {
  value: number;
  unit: string;
  date: string;
  source: string;
  url: string;
}

export interface CommodityData {
  unit: string;
  wfpPoints: WfpDataPoint[];
  aiUpdate: AiUpdatePoint | null;
}

export const mockPriceData: Record<string, CommodityData> = {
  foodBasket: {
    unit: 'USD / month',
    wfpPoints: [
      { date: '03 Feb', price: 38 },
      { date: '10 Feb', price: 39 },
      { date: '17 Feb', price: 40 },
      { date: '24 Feb', price: 40 },
      { date: '03 Mar', price: 41 },
      { date: '10 Mar', price: 42 },
      { date: '17 Mar', price: 43 },
      { date: '24 Mar', price: 44 },
      { date: '31 Mar', price: 46 },
      { date: '07 Apr', price: 48 },
      { date: '14 Apr', price: 50 },
      { date: '21 Apr', price: 52 },
    ],
    aiUpdate: {
      value: 58,
      unit: 'USD / month',
      date: '12 May 2026',
      source: 'Numbeo Lebanon Cost of Living',
      url: 'https://www.numbeo.com/cost-of-living/country_result.jsp?country=Lebanon',
    },
  },
  bread: {
    unit: 'USD / kg',
    wfpPoints: [
      { date: '03 Feb', price: 2.0 },
      { date: '10 Feb', price: 2.1 },
      { date: '17 Feb', price: 2.1 },
      { date: '24 Feb', price: 2.2 },
      { date: '03 Mar', price: 2.3 },
      { date: '10 Mar', price: 2.3 },
      { date: '17 Mar', price: 2.4 },
      { date: '24 Mar', price: 2.5 },
      { date: '31 Mar', price: 2.6 },
      { date: '07 Apr', price: 2.7 },
      { date: '14 Apr', price: 2.8 },
      { date: '21 Apr', price: 2.9 },
    ],
    aiUpdate: {
      value: 3.4,
      unit: 'USD / kg',
      date: '11 May 2026',
      source: 'Reuters – Lebanon Bread Prices Report',
      url: 'https://www.reuters.com/world/middle-east/',
    },
  },
  oil: {
    unit: 'USD / litre',
    wfpPoints: [
      { date: '03 Feb', price: 6.5 },
      { date: '10 Feb', price: 6.8 },
      { date: '17 Feb', price: 7.0 },
      { date: '24 Feb', price: 7.2 },
      { date: '03 Mar', price: 7.5 },
      { date: '10 Mar', price: 7.7 },
      { date: '17 Mar', price: 7.8 },
      { date: '24 Mar', price: 8.0 },
      { date: '31 Mar', price: 8.2 },
      { date: '07 Apr', price: 8.5 },
      { date: '14 Apr', price: 8.8 },
      { date: '21 Apr', price: 9.0 },
    ],
    aiUpdate: null,
  },
  beans: {
    unit: 'USD / kg',
    wfpPoints: [
      { date: '03 Feb', price: 10.0 },
      { date: '10 Feb', price: 10.2 },
      { date: '17 Feb', price: 10.5 },
      { date: '24 Feb', price: 10.8 },
      { date: '03 Mar', price: 11.0 },
      { date: '10 Mar', price: 11.2 },
      { date: '17 Mar', price: 11.5 },
      { date: '24 Mar', price: 11.8 },
      { date: '31 Mar', price: 12.0 },
      { date: '07 Apr', price: 12.2 },
      { date: '14 Apr', price: 12.5 },
      { date: '21 Apr', price: 13.0 },
    ],
    aiUpdate: {
      value: 14,
      unit: 'USD / kg',
      date: '10 May 2026',
      source: 'FAO GIEWS Foodprices',
      url: 'https://www.fao.org/giews/food-prices/food-currencies/en/',
    },
  },
  sorghum: {
    unit: 'USD / kg',
    wfpPoints: [
      { date: '03 Feb', price: 13.0 },
      { date: '10 Feb', price: 13.2 },
      { date: '17 Feb', price: 13.5 },
      { date: '24 Feb', price: 13.8 },
      { date: '03 Mar', price: 14.0 },
      { date: '10 Mar', price: 14.2 },
      { date: '17 Mar', price: 14.5 },
      { date: '24 Mar', price: 14.8 },
      { date: '31 Mar', price: 15.0 },
      { date: '07 Apr', price: 15.2 },
      { date: '14 Apr', price: 15.5 },
      { date: '21 Apr', price: 16.0 },
    ],
    aiUpdate: {
      value: 17,
      unit: 'USD / kg',
      date: '09 May 2026',
      source: 'Al-Monitor Food Security Tracker',
      url: 'https://www.al-monitor.com/originals/2026/05/lebanon-food-prices',
    },
  },
};

// ── Status Signals (non-time-series dimensions) ───────────────────────────────

export interface StatusSignal {
  id: string;
  label: string;
  currentValue: string;
  status: 'good' | 'moderate' | 'poor' | 'critical';
  trend: 'improving' | 'stable' | 'deteriorating';
  description: string;
  aiUpdate: {
    observation: string;
    date: string;
    source: string;
    url: string;
  } | null;
}

export const accessToMarketsSignals: StatusSignal[] = [
  {
    id: 'marketOperationalRate',
    label: 'Markets Operational',
    currentValue: '74%',
    status: 'moderate',
    trend: 'deteriorating',
    description: 'Share of monitored markets in the country that are currently open and selling food items. Down from 89% four weeks ago.',
    aiUpdate: {
      observation: 'Street-level reporting from Beirut suburbs indicates at least 3 major market clusters closed due to vendor inability to restock. Informal trading continues in some locations.',
      date: '12 May 2026',
      source: 'Reliefweb Market Monitoring – Lebanon',
      url: 'https://reliefweb.int/country/lbn',
    },
  },
  {
    id: 'checkpoints',
    label: 'Active Checkpoints',
    currentValue: '18 active',
    status: 'poor',
    trend: 'deteriorating',
    description: 'Number of military or security checkpoints that restrict or slow the movement of goods. Higher counts correlate with longer supply chain delays.',
    aiUpdate: {
      observation: 'Social media reports of new checkpoints established on the Beirut–Tripoli highway following last week\'s security incidents, adding 2–3 hours to northern supply routes.',
      date: '11 May 2026',
      source: 'Lebanon Crisis Observatory',
      url: 'https://www.lcrp.gov.lb/',
    },
  },
  {
    id: 'queueTimes',
    label: 'Avg. Queue Time',
    currentValue: '55 min',
    status: 'poor',
    trend: 'stable',
    description: 'Estimated average time spent queuing to access food items at monitored market points. Values above 30 minutes indicate constrained supply.',
    aiUpdate: {
      observation: 'Photos shared via community groups show queues of 40–70 people at subsidised bakeries in Tripoli. Queue times estimated at 45–60 minutes based on crowd density analysis.',
      date: '10 May 2026',
      source: 'Twitter / Community Monitoring Network',
      url: 'https://twitter.com/search?q=Lebanon+bakery+queue',
    },
  },
  {
    id: 'routeStatus',
    label: 'Supply Routes',
    currentValue: '3 of 8 disrupted',
    status: 'moderate',
    trend: 'stable',
    description: 'Number of major supply routes assessed as blocked or significantly delayed out of the 8 primary arterial routes monitored.',
    aiUpdate: {
      observation: 'The Masnaa border crossing (Lebanon–Syria) reported intermittent closures over the past week, affecting vegetable and fuel imports. Alternate routing adds ~4 hrs to delivery times.',
      date: '09 May 2026',
      source: 'OCHA Lebanon Situation Report',
      url: 'https://www.unocha.org/lebanon',
    },
  },
];

export const foodAvailabilitySignals: StatusSignal[] = [
  {
    id: 'rationingReports',
    label: 'Rationing Reports',
    currentValue: '11 areas',
    status: 'poor',
    trend: 'deteriorating',
    description: 'Number of geographic areas where systematic food rationing has been reported by humanitarian monitors or community sources.',
    aiUpdate: {
      observation: 'WFP VAM and partner reports confirm rationing of bread and cooking oil in at least 11 sub-districts across northern and eastern Lebanon.',
      date: '12 May 2026',
      source: 'WFP VAM – Lebanon Food Security',
      url: 'https://www.wfp.org/countries/lebanon',
    },
  },
  {
    id: 'foodQueueIndex',
    label: 'Food Queue Severity',
    currentValue: 'High',
    status: 'poor',
    trend: 'deteriorating',
    description: 'Composite index (Low / Moderate / High / Severe) based on reported queue frequencies and lengths across monitored distribution points.',
    aiUpdate: {
      observation: 'Multiple NGO situation reports note queues of 2+ hours at WFP distribution points in Bekaa Valley and Akkar governorates. Demand exceeds available stock by an estimated 30%.',
      date: '11 May 2026',
      source: 'ACTED Lebanon Situation Update',
      url: 'https://www.acted.org/en/countries/lebanon/',
    },
  },
  {
    id: 'flourAvailability',
    label: 'Wheat Flour',
    currentValue: 'Scarce',
    status: 'critical',
    trend: 'deteriorating',
    description: 'Availability status of wheat flour in monitored market outlets. Scarcity indicates less than 30% of outlets have stock.',
    aiUpdate: {
      observation: 'Mill closures due to power outages and fuel costs have cut flour production by an estimated 40%. Import substitution from Turkey is underway but insufficient to fill the gap.',
      date: '12 May 2026',
      source: 'Reuters Middle East Commodities',
      url: 'https://www.reuters.com/world/middle-east/',
    },
  },
  {
    id: 'cookingOilAvailability',
    label: 'Cooking Oil',
    currentValue: 'Limited',
    status: 'poor',
    trend: 'stable',
    description: 'Availability status of cooking oil in monitored market outlets. Limited indicates 30–60% of outlets have stock.',
    aiUpdate: null,
  },
  {
    id: 'riceAvailability',
    label: 'Rice',
    currentValue: 'Available',
    status: 'moderate',
    trend: 'stable',
    description: 'Availability status of rice in monitored market outlets. Available indicates 60–80% of outlets have stock, though prices are elevated.',
    aiUpdate: {
      observation: 'Import data suggests rice stocks are currently adequate at the national level, though retail availability is uneven — urban centers are better stocked than rural areas.',
      date: '08 May 2026',
      source: 'FAO GIEWS – Lebanon',
      url: 'https://www.fao.org/giews/countrybrief/country.jsp?code=LBN',
    },
  },
  {
    id: 'pulsesAvailability',
    label: 'Pulses / Legumes',
    currentValue: 'Available',
    status: 'good',
    trend: 'stable',
    description: 'Availability status of pulses (lentils, chickpeas, dried beans) in monitored market outlets.',
    aiUpdate: null,
  },
];

export const cashAvailabilitySignals: StatusSignal[] = [
  {
    id: 'atmAvailability',
    label: 'ATM Availability',
    currentValue: '31% operational',
    status: 'critical',
    trend: 'deteriorating',
    description: 'Share of monitored ATMs that are operational and dispensing cash. Includes both bank-operated and independent ATMs at monitored locations.',
    aiUpdate: {
      observation: 'Community-sourced ATM status updates show widespread cash-out notices across Beirut, Tripoli, and Sidon. Customers report travelling 5–15 km to find a functioning machine.',
      date: '12 May 2026',
      source: 'BDL Monitor – Lebanon Banking Watch',
      url: 'https://bdl.gov.lb/',
    },
  },
  {
    id: 'exchangeAgents',
    label: 'Exchange Agents Active',
    currentValue: '~420 agents',
    status: 'moderate',
    trend: 'stable',
    description: 'Estimated number of informal currency exchange agents (sarrafa) operating across monitored urban and peri-urban areas.',
    aiUpdate: {
      observation: 'Informal exchange agent counts have remained broadly stable, but several large operators in Hamra and Dora districts have suspended USD-to-cash operations citing stock shortage.',
      date: '10 May 2026',
      source: 'Lebanon Economy Observatory',
      url: 'https://leb-economy.com/',
    },
  },
  {
    id: 'cashUsageRate',
    label: 'Cash-Based Transactions',
    currentValue: '88% of purchases',
    status: 'moderate',
    trend: 'stable',
    description: 'Estimated proportion of food market transactions conducted in physical cash. High cash usage indicates reduced financial system functionality.',
    aiUpdate: null,
  },
  {
    id: 'withdrawalLimit',
    label: 'Bank Withdrawal Limit',
    currentValue: '$400 / month',
    status: 'poor',
    trend: 'stable',
    description: 'Maximum monthly USD cash withdrawal permitted per account holder under current Central Bank circulars.',
    aiUpdate: {
      observation: 'Banque du Liban circular from May 2026 maintains the $400/month withdrawal cap with no revision announced. Legal challenges from depositor groups remain pending in the commercial courts.',
      date: '07 May 2026',
      source: 'The Legal Agenda – Lebanon',
      url: 'https://english.legal-agenda.com/',
    },
  },
];

// ── Energy price time-series ──────────────────────────────────────────────────

export const energyPriceData: Record<string, CommodityData> = {
  diesel: {
    unit: 'USD / 20L',
    wfpPoints: [
      { date: '03 Feb', price: 22.0 },
      { date: '10 Feb', price: 22.5 },
      { date: '17 Feb', price: 23.0 },
      { date: '24 Feb', price: 23.5 },
      { date: '03 Mar', price: 24.0 },
      { date: '10 Mar', price: 24.8 },
      { date: '17 Mar', price: 25.5 },
      { date: '24 Mar', price: 26.0 },
      { date: '31 Mar', price: 27.0 },
      { date: '07 Apr', price: 28.0 },
      { date: '14 Apr', price: 29.5 },
      { date: '21 Apr', price: 31.0 },
    ],
    aiUpdate: {
      value: 34.5,
      unit: 'USD / 20L',
      date: '12 May 2026',
      source: 'Lebanon Fuel Monitor – May 2026',
      url: 'https://www.al-monitor.com/originals/2026/05/lebanon-fuel-prices',
    },
  },
  gasoline: {
    unit: 'USD / 20L',
    wfpPoints: [
      { date: '03 Feb', price: 26.0 },
      { date: '10 Feb', price: 26.5 },
      { date: '17 Feb', price: 27.0 },
      { date: '24 Feb', price: 27.5 },
      { date: '03 Mar', price: 28.0 },
      { date: '10 Mar', price: 28.8 },
      { date: '17 Mar', price: 29.5 },
      { date: '24 Mar', price: 30.0 },
      { date: '31 Mar', price: 31.0 },
      { date: '07 Apr', price: 32.5 },
      { date: '14 Apr', price: 33.5 },
      { date: '21 Apr', price: 35.0 },
    ],
    aiUpdate: {
      value: 38.0,
      unit: 'USD / 20L',
      date: '11 May 2026',
      source: 'Reuters – Lebanon Fuel Report',
      url: 'https://www.reuters.com/world/middle-east/',
    },
  },
  lpg: {
    unit: 'USD / cylinder',
    wfpPoints: [
      { date: '03 Feb', price: 28.0 },
      { date: '10 Feb', price: 28.5 },
      { date: '17 Feb', price: 29.0 },
      { date: '24 Feb', price: 29.5 },
      { date: '03 Mar', price: 30.0 },
      { date: '10 Mar', price: 31.0 },
      { date: '17 Mar', price: 32.0 },
      { date: '24 Mar', price: 33.0 },
      { date: '31 Mar', price: 34.5 },
      { date: '07 Apr', price: 36.0 },
      { date: '14 Apr', price: 38.0 },
      { date: '21 Apr', price: 40.0 },
    ],
    aiUpdate: {
      value: 45,
      unit: 'USD / cylinder',
      date: '10 May 2026',
      source: 'Numbeo Lebanon Energy Costs',
      url: 'https://www.numbeo.com/cost-of-living/country_result.jsp?country=Lebanon',
    },
  },
  electricity: {
    unit: 'USD / kWh (generator)',
    wfpPoints: [
      { date: '03 Feb', price: 0.38 },
      { date: '10 Feb', price: 0.40 },
      { date: '17 Feb', price: 0.41 },
      { date: '24 Feb', price: 0.42 },
      { date: '03 Mar', price: 0.44 },
      { date: '10 Mar', price: 0.45 },
      { date: '17 Mar', price: 0.47 },
      { date: '24 Mar', price: 0.48 },
      { date: '31 Mar', price: 0.50 },
      { date: '07 Apr', price: 0.52 },
      { date: '14 Apr', price: 0.55 },
      { date: '21 Apr', price: 0.58 },
    ],
    aiUpdate: {
      value: 0.65,
      unit: 'USD / kWh',
      date: '12 May 2026',
      source: 'Syndicate of Generator Owners – Lebanon',
      url: 'https://reliefweb.int/country/lbn',
    },
  },
};

// ── Exchange rate time-series ─────────────────────────────────────────────────

export const exchangeRateData: Record<string, CommodityData> = {
  parallelRate: {
    unit: 'LBP / USD (parallel)',
    wfpPoints: [
      { date: '03 Feb', price: 88500 },
      { date: '10 Feb', price: 89200 },
      { date: '17 Feb', price: 90100 },
      { date: '24 Feb', price: 91000 },
      { date: '03 Mar', price: 92500 },
      { date: '10 Mar', price: 94000 },
      { date: '17 Mar', price: 95800 },
      { date: '24 Mar', price: 97500 },
      { date: '31 Mar', price: 99000 },
      { date: '07 Apr', price: 101500 },
      { date: '14 Apr', price: 104000 },
      { date: '21 Apr', price: 107000 },
    ],
    aiUpdate: {
      value: 112000,
      unit: 'LBP / USD',
      date: '12 May 2026',
      source: 'LiveLira – Lebanon Exchange Rate Tracker',
      url: 'https://livelira.com/',
    },
  },
  blackMarketPremium: {
    unit: '% above official rate',
    wfpPoints: [
      { date: '03 Feb', price: 12 },
      { date: '10 Feb', price: 14 },
      { date: '17 Feb', price: 15 },
      { date: '24 Feb', price: 16 },
      { date: '03 Mar', price: 18 },
      { date: '10 Mar', price: 20 },
      { date: '17 Mar', price: 22 },
      { date: '24 Mar', price: 24 },
      { date: '31 Mar', price: 26 },
      { date: '07 Apr', price: 28 },
      { date: '14 Apr', price: 30 },
      { date: '21 Apr', price: 33 },
    ],
    aiUpdate: {
      value: 37,
      unit: '% premium',
      date: '12 May 2026',
      source: 'Syria Direct – Black Market Report',
      url: 'https://syriadirect.org/',
    },
  },
};

export const chatbotResponses: Record<string, string[]> = {
  default: [
    "Based on the latest AI-collected signals and WFP data, the current situation shows significant concern. Would you like me to break down the specific commodity trends or focus on a particular region?",
    "The data I have access to covers W1–W5 price monitoring across five commodities. The most recent week (W5) relies on AI-collected signals. Is there a specific aspect of the market situation you'd like me to analyse?",
    "I can provide analysis on price trends, availability constraints, or cross-commodity comparisons for this country and dimension. What would be most useful for your assessment?",
  ],
  price: [
    "Looking at the price trend data, the W3–W5 period shows continued upward pressure based on AI-collected signals from informal market monitors. The gap between WFP official data (W1–W3) and AI signals (W3–W5) suggests rapid deterioration in the current reporting period.",
    "Commodity price analysis across the five tracked items indicates bread and cooking oil are experiencing the most severe price inflation. The food basket composite price has risen 28.9% versus the W1 baseline, exceeding the critical threshold of 20% used by WFP for emergency classification.",
    "Price data confidence is high for W1–W3 (WFP official collection) and medium for W4–W5 (AI-collected signals from multiple informal sources). Reliability ratings on the news items below are assigned based on source triangulation.",
  ],
  access: [
    "Market access conditions are a key driver of price inflation in this context. Where physical access is restricted, prices in available informal markets tend to spike disproportionately as supply is concentrated among fewer vendors.",
    "The AI system is monitoring social media, journalist networks, and NGO situation reports to triangulate access conditions. Current signals suggest intermittent restrictions that do not yet constitute a full market closure.",
    "From a programming perspective, reduced market access at this level would suggest activating cash-based intervention alternatives with wider distribution networks, or pre-positioning stocks in accessible hubs.",
  ],
  forecast: [
    "Based on current trend trajectories, prices are projected to continue rising in the short term (1–2 weeks). The primary drivers — currency depreciation, import bottlenecks, and regional shipping constraints — do not show signs of near-term resolution.",
    "AI signal analysis of social media sentiment and commodity news suggests that supply chains are unlikely to normalise within the current monitoring period. Expect W6 conditions to remain at the same or higher alert level.",
    "Forecast confidence for W6 is approximately 65% based on current signal consistency. Key uncertainty factors include diplomatic developments affecting the Strait of Hormuz and potential new EU/US sanctions packages.",
  ],
  recommendation: [
    "Given the current critical risk level, WFP programming recommendations would include: (1) Activating emergency food assistance at scale; (2) Prioritising cash-based transfers to households with market access; (3) Pre-positioning in-kind supplies in forward hubs for areas with restricted access.",
    "For market system strengthening, priority actions at this alert level include: engaging with wholesaler networks to identify stock bottlenecks, liaising with government authorities on import facilitation, and establishing price monitoring surge capacity.",
    "The combination of high food prices and cash liquidity constraints creates a compound vulnerability. Intervention design should consider both the purchasing power component and the supply-side availability constraints simultaneously.",
  ],
};
