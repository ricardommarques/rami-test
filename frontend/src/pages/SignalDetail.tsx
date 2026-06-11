import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft, Maximize2, Minus,
  Calendar, MapPin, Tag, Globe, ExternalLink, Bot,
  ChevronUp, ChevronDown, Plus, BarChart3,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  signalLabels,
  mockPriceData,
  energyPriceData,
  exchangeRateData,
  accessToMarketsSignals,
  foodAvailabilitySignals,
  cashAvailabilitySignals,
  mockNewsData,
  mockKeySummaries,
  countries,
  countryRegions,
  regionAdjustments,
  summarySources,
  historicalBaselines,
  type ReferencePeriod,
  foodPriceNarrativeSignals,
  type CommodityData,
  type KeySummary,
  type NewsItem,
  type SignalLevel,
  type NarrativeSignal,
} from "@/data/mockData";
import { WFPHeader } from "@/components/WFPHeader";
import { SectionCard } from "@/components/SectionCard";
import { ReferencePeriodSelector } from "@/components/ReferencePeriodSelector";
import { ReliabilityBadge } from "@/components/ReliabilityBadge";
import { ExpandedChartModal } from "@/components/ExpandedChartModal";
import { MarketChatbot } from "@/components/MarketChatbot";
import { StatusSignalGrid } from "@/components/StatusSignalGrid";
import { RegionMap } from "@/components/RegionMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const FOOD_PRICE_CHARTS: Array<{ key: keyof typeof mockPriceData; label: string }> = [
  { key: "foodBasket", label: "Food Basket Price" },
  { key: "bread",      label: "Bread" },
  { key: "oil",        label: "Oil" },
  { key: "beans",      label: "Beans" },
  { key: "sorghum",    label: "Sorghum" },
];

const ENERGY_PRICE_CHARTS: Array<{ key: keyof typeof energyPriceData; label: string }> = [
  { key: "diesel",      label: "Diesel" },
  { key: "gasoline",    label: "Gasoline" },
  { key: "lpg",         label: "LPG Cylinder" },
  { key: "electricity", label: "Electricity (Generator)" },
];

const EXCHANGE_RATE_CHARTS: Array<{ key: keyof typeof exchangeRateData; label: string }> = [
  { key: "parallelRate",       label: "Parallel Market Rate (LBP/USD)" },
  { key: "blackMarketPremium", label: "Black Market Premium (% above official)" },
];

const LEVEL_TEXT_COLORS: Record<string, string> = {
  low: "text-success-600", moderate: "text-ivory-700", elevated: "text-warning-600",
  high: "text-warning-600", critical: "text-danger-700",
};
const DIRECTION_CONFIG = {
  deteriorating: { icon: <ChevronUp className="h-4 w-4" />,   label: "Deteriorated", color: "text-danger-700",  bg: "bg-danger-100" },
  stable:        { icon: <Minus className="h-4 w-4" />,       label: "Stable",       color: "text-ivory-700",   bg: "bg-ivory-50" },
  improving:     { icon: <ChevronDown className="h-4 w-4" />, label: "Improved",     color: "text-success-600", bg: "bg-success-100" },
};

// ── AI Overall Signal ────────────────────────────────────────────────────────

function AiSignalBanner({ summary }: { summary: KeySummary }) {
  const dir = DIRECTION_CONFIG[summary.direction];
  const levelText = LEVEL_TEXT_COLORS[summary.alertLevel] || "text-neutral-700";

  const bannerBg =
    summary.confidence === 0              ? "bg-neutral-100 border-neutral-300" :
    summary.direction === "deteriorating" ? "bg-danger-100 border-danger-300" :
    summary.direction === "improving"     ? "bg-success-100 border-success-300" :
                                            "bg-ivory-50 border-ivory-200";

  return (
    <div className={`mb-8 border p-5 ${bannerBg}`}>
      {/* Header row */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Overview</h2>

        {summary.confidence !== 0 && (
          <span className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs ${dir.bg} ${dir.color}`}>
            {dir.icon}
            {dir.label}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-neutral-400">
          <span>Updated {summary.lastUpdated}</span>
        </div>
      </div>

      {/* Headline */}
      <h3 className={`mb-3 text-base leading-snug ${summary.confidence === 0 ? "text-neutral-500" : levelText}`}>
        {summary.headline}
      </h3>

      {/* Body */}
      {summary.body.split("\n\n").map((para, i) => (
        <p
          key={i}
          className={`mb-3 text-sm leading-relaxed ${summary.confidence === 0 ? "text-neutral-500" : "text-neutral-700"}`}
        >
          {para}
        </p>
      ))}

      {/* Sources */}
      {summary.confidence !== 0 && summary.sources && summary.sources.length > 0 && (
        <div className="mt-4 border-t border-neutral-alpha-200 pt-3">
          <div className="mb-1.5 text-xs text-neutral-500">Sources</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {summary.sources.map((s) => (
              <Link
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
                title={s.name}
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span>{s.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI update card ────────────────────────────────────────────────────────────

function AiUpdateCard({ commodity }: { commodity: CommodityData }) {
  const { aiUpdate } = commodity;
  if (!aiUpdate) {
    return (
      <div className="mt-3 flex flex-1 flex-col border border-dashed border-neutral-200 bg-neutral-50 p-3">
        <p className="text-xs italic text-neutral-400">No AI updates since last WFP collection</p>
      </div>
    );
  }
  return (
    <div className="mt-3 flex flex-1 flex-col border border-ivory-200 bg-ivory-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ivory-700">
        <Bot className="h-3.5 w-3.5" />
        Latest AI signal
      </div>
      <p className="mb-2 text-xs leading-relaxed text-foreground">
        {aiUpdate.value} {aiUpdate.unit}
      </p>
      <div className="mb-1 mt-auto flex items-center gap-1 text-xs text-neutral-500">
        <Calendar className="h-3 w-3" />
        {aiUpdate.date}
      </div>
      <Link
        href={aiUpdate.url}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-full text-xs"
        title={aiUpdate.source}
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        <span className="truncate">{aiUpdate.source}</span>
      </Link>
    </div>
  );
}

// ── Narrative signal card (food prices) ──────────────────────────────────────

const NARRATIVE_CONFIG = {
  deteriorating: { label: "Deteriorated", icon: <ChevronUp className="h-3.5 w-3.5" />,   bg: "bg-danger-100",  border: "border-danger-300",  text: "text-danger-700" },
  improving:     { label: "Improved",     icon: <ChevronDown className="h-3.5 w-3.5" />, bg: "bg-success-100", border: "border-success-300", text: "text-success-600" },
  stable:        { label: "Stable",       icon: <Minus className="h-3.5 w-3.5" />,       bg: "bg-ivory-50",    border: "border-ivory-200",   text: "text-ivory-700" },
};

function NarrativeSignalCard({ signal }: { signal: NarrativeSignal | null }) {
  if (!signal) {
    return (
      <div className="mt-3 flex flex-1 flex-col border border-dashed border-neutral-200 bg-neutral-50 p-3">
        <p className="text-xs italic text-neutral-400">Information not available</p>
      </div>
    );
  }
  const cfg = NARRATIVE_CONFIG[signal.direction];
  return (
    <div className={`mt-3 flex flex-1 flex-col border p-3 ${cfg.border} ${cfg.bg}`}>
      <div className={`mb-2 inline-flex items-center gap-1 text-xs font-medium ${cfg.text}`}>
        {cfg.icon}
        {cfg.label}
      </div>
      <p className="mb-2 text-xs leading-relaxed text-foreground">{signal.rationale}</p>
      <div className="mb-1 mt-auto flex items-center gap-1 text-xs text-neutral-500">
        <Calendar className="h-3 w-3" />
        {signal.date}
      </div>
      {signal.url ? (
        <Link
          href={signal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="max-w-full text-xs"
          title={signal.source}
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate">{signal.source}</span>
        </Link>
      ) : (
        <span className="truncate text-xs text-neutral-500" title={signal.source}>
          {signal.source}
        </span>
      )}
    </div>
  );
}

// ── Price chart ───────────────────────────────────────────────────────────────

const priceChartConfig = {
  price: {
    label: "WFP Official Data",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

function PriceChart({
  label,
  commodity,
  onExpand,
  narrativeSignal,
  useNarrative,
}: {
  label: string;
  commodity: CommodityData;
  onExpand: () => void;
  narrativeSignal?: NarrativeSignal | null;
  useNarrative?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex min-h-[20px] items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
      </div>
      <Card className="group relative gap-0 rounded-none py-3 shadow-none">
        <CardContent className="px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onExpand}
                className="absolute right-2 top-2 z-10 text-primary opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Maximize2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Expand chart</TooltipContent>
          </Tooltip>
          <div className="mb-1 min-h-[2rem] text-xs leading-4 text-neutral-400">
            WFP Official Data · {commodity.unit}
          </div>
          <ChartContainer config={priceChartConfig} className="h-[180px] w-full">
            <LineChart data={commodity.wfpPoints} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "var(--color-neutral-600)" }}
                interval={1}
                angle={-40}
                textAnchor="end"
                height={36}
              />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-neutral-600)" }} width={35} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${value} ${commodity.unit}`}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--color-price)", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "var(--color-price)", strokeWidth: 0 }}
                name="WFP Official Data"
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      {useNarrative
        ? <NarrativeSignalCard signal={narrativeSignal ?? null} />
        : <AiUpdateCard commodity={commodity} />}
    </div>
  );
}

// ── Commodity picker ───────────────────────────────────────────────────────────

function CommodityPicker({
  options,
  selected,
  onToggle,
}: {
  options: Array<{ key: string; label: string }>;
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="xs">
          <Plus />
          Add commodities
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.key}
            checked={selected.includes(opt.key)}
            onCheckedChange={() => onToggle(opt.key)}
            onSelect={(e) => e.preventDefault()}
          >
            {opt.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── News row ─────────────────────────────────────────────────────────────────

function NewsRow({ news, idx }: { news: NewsItem; idx: number }) {
  return (
    <div className={`${idx % 2 === 0 ? "bg-white" : "bg-neutral-50"} border-b border-neutral-200 p-4`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <Link
          href={`https://www.google.com/search?q=${encodeURIComponent(news.title + " " + news.source)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-sm font-semibold leading-snug text-foreground hover:text-primary"
        >
          {news.title}
        </Link>
        <ReliabilityBadge reliability={news.reliability} />
      </div>
      <p className="mb-3 text-xs leading-relaxed text-neutral-500">{news.content}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span className="font-medium text-primary">{news.source}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{news.date}</span>
        {news.dimensions.map((d) => (
          <Badge key={d} variant="secondary">
            <Tag />
            {signalLabels[d as keyof typeof signalLabels] || d}
          </Badge>
        ))}
        <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{news.country}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{news.region}</span>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type ExpandedChartSource = "food" | "energy" | "exchange";

const LEVEL_ORDER: SignalLevel[] = ["low", "moderate", "elevated", "high", "critical"];

function bumpLevel(level: SignalLevel, delta: number): SignalLevel {
  const idx = LEVEL_ORDER.indexOf(level);
  const next = Math.max(0, Math.min(LEVEL_ORDER.length - 1, idx + delta));
  return LEVEL_ORDER[next];
}

// Derive the same direction the Overview's change cell shows, so the AI
// banner colour and label stay in sync with the country/dimension cell.
type OverviewDirection = "deteriorated" | "maintained" | "improved" | "missing";

function deriveDirection(
  current: SignalLevel | null | undefined,
  reference: SignalLevel | null | undefined,
): OverviewDirection {
  if (!current || !reference) return "missing";
  const delta = LEVEL_ORDER.indexOf(current) - LEVEL_ORDER.indexOf(reference);
  if (delta > 0) return "deteriorated";
  if (delta < 0) return "improved";
  return "maintained";
}

function applyRegionToCommodity(commodity: CommodityData, multiplier: number): CommodityData {
  if (multiplier === 1) return commodity;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    ...commodity,
    wfpPoints: commodity.wfpPoints.map((p) => ({ ...p, price: round(p.price * multiplier) })),
    aiUpdate: commodity.aiUpdate
      ? { ...commodity.aiUpdate, value: round(commodity.aiUpdate.value * multiplier) }
      : null,
  };
}

function applyRegionToSummary(
  summary: KeySummary,
  countryName: string,
  region: string | null,
): KeySummary {
  if (!region) return summary;
  const adj = regionAdjustments[countryName]?.[region];
  if (!adj) return summary;
  return {
    ...summary,
    headline: `${summary.headline} — ${region}`,
    body: `${adj.summaryNote}\n\n${summary.body}`,
    alertLevel: bumpLevel(summary.alertLevel, adj.alertBump),
    sources: adj.sources ?? summary.sources,
  };
}

export function SignalDetail() {
  const { country, signal } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedChart, setExpandedChart] = useState<{ key: string; source: ExpandedChartSource } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  // Commodities shown under "Commodity Price Trends". Defaults to all 5;
  // the picker lets the user add/remove which commodities are displayed.
  const [selectedFoodCommodities, setSelectedFoodCommodities] = useState<string[]>(
    FOOD_PRICE_CHARTS.map((c) => c.key as string),
  );

  const toggleFoodCommodity = (key: string) =>
    setSelectedFoodCommodities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const visibleFoodCharts = FOOD_PRICE_CHARTS.filter((c) =>
    selectedFoodCommodities.includes(c.key as string),
  );

  // Reference period mirrors the Overview's "Compare current situation to"
  // control. It is seeded from the ?ref= query param the Overview passes
  // through, and kept in the URL so the comparison persists on refresh/back.
  const refParam = searchParams.get("ref") as ReferencePeriod | null;
  const refPeriod: ReferencePeriod =
    refParam === "lastMonth" || refParam === "threeMonthsAgo" ? refParam : "lastWeek";
  const setRefPeriod = (p: ReferencePeriod) => {
    const next = new URLSearchParams(searchParams);
    next.set("ref", p);
    setSearchParams(next, { replace: true });
  };

  const signalLabel = signalLabels[signal as keyof typeof signalLabels] || "Signal";
  const countryName = (country?.charAt(0).toUpperCase() ?? "") + (country?.slice(1) ?? "");

  const countryData = countries.find((c) => c.name.toLowerCase() === country?.toLowerCase());
  const signalWeeks = countryData?.signals[signal as keyof typeof countryData.signals];
  const currentWeekLevel = signalWeeks?.[4]?.level;
  const referenceLevel =
    refPeriod === "lastWeek"
      ? signalWeeks?.[3]?.level ?? null
      : historicalBaselines[countryName]?.[signal ?? ""]?.[refPeriod] ?? null;

  // Mirrors the Overview change cell (current vs selected reference period) so
  // banner colour and label stay in sync with the cell the user clicked from.
  const overviewDirection = deriveDirection(currentWeekLevel ?? null, referenceLevel);
  const directionToSummary: Record<OverviewDirection, KeySummary["direction"]> = {
    deteriorated: "deteriorating",
    improved: "improving",
    maintained: "stable",
    missing: "stable",
  };

  const summaryKey = `${country?.toLowerCase()}_${signal}`;
  const baseSummary = mockKeySummaries[summaryKey] || null;
  const keySummary: KeySummary | null = baseSummary
    ? { ...baseSummary, sources: baseSummary.sources ?? summarySources[summaryKey] }
    : null;

  const regions = countryRegions[countryName] || [];
  const regionMultiplier = selectedRegion
    ? regionAdjustments[countryName]?.[selectedRegion]?.priceMultiplier ?? 1
    : 1;

  const adjustedKeySummary: KeySummary | null =
    overviewDirection === "missing"
      ? {
          headline: "Missing information for this country and dimension",
          body: "Current or reference-period data is not available, so an overall assessment cannot be produced. Monitoring is active and this section will be populated as new signals are collected.",
          metrics: [],
          lastUpdated: keySummary?.lastUpdated ?? "—",
          alertLevel: "low",
          direction: "stable",
          confidence: 0,
        }
      : keySummary
        ? {
            ...applyRegionToSummary(keySummary, countryName, selectedRegion),
            direction: directionToSummary[overviewDirection],
          }
        : null;

  const dimensionNews = mockNewsData.filter((n) => {
    if (!n.dimensions.includes(signal || "")) return false;
    if (n.country !== countryName) return false;
    if (selectedRegion && !n.region.toLowerCase().includes(selectedRegion.toLowerCase())) return false;
    return true;
  });
  const otherDimensionNews = mockNewsData.filter(
    (n) => n.dimensions.includes(signal || "") && n.country !== countryName,
  );

  const getExpandedCommodity = (): CommodityData | null => {
    if (!expandedChart) return null;
    const base =
      expandedChart.source === "food" ? mockPriceData[expandedChart.key] :
      expandedChart.source === "energy" ? energyPriceData[expandedChart.key] :
      expandedChart.source === "exchange" ? exchangeRateData[expandedChart.key] : null;
    return base ? applyRegionToCommodity(base, regionMultiplier) : null;
  };

  const getExpandedLabel = (): string => {
    if (!expandedChart) return "";
    if (expandedChart.source === "food") return FOOD_PRICE_CHARTS.find((c) => c.key === expandedChart.key)?.label || "";
    if (expandedChart.source === "energy") return ENERGY_PRICE_CHARTS.find((c) => c.key === expandedChart.key)?.label || "";
    if (expandedChart.source === "exchange") return EXCHANGE_RATE_CHARTS.find((c) => c.key === expandedChart.key)?.label || "";
    return "";
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <WFPHeader title="Market Signals Dashboard" />

      <div className="flex-1 overflow-auto px-8 py-6">
        <Button variant="link" onClick={() => navigate("/")} className="mb-6 h-auto gap-2 p-0 text-sm">
          <ArrowLeft />
          Back to Overview
        </Button>

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="mb-1 text-2xl text-foreground">{countryName}</h1>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="inline-block bg-primary py-2 px-4 text-sm text-primary-foreground">
              {signalLabel}
            </div>
            <div
              className={`inline-flex items-center gap-1.5 border py-2 px-4 text-sm ${
                selectedRegion
                  ? "border-primary bg-primary-100 text-primary"
                  : "border-neutral-300 bg-neutral-50 text-neutral-600"
              }`}
            >
              {selectedRegion ? <MapPin className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
              {selectedRegion ? `Region: ${selectedRegion}` : "National view"}
            </div>
          </div>
        </div>

        {/* ── Reference period selector ────────────────────────────────────── */}
        <div className="mb-6">
          <ReferencePeriodSelector value={refPeriod} onChange={setRefPeriod} />
        </div>

        {/* ── Region selector ──────────────────────────────────────────────── */}
        {regions.length > 0 && (
          <RegionMap
            countryName={countryName}
            regions={regions}
            selectedRegion={selectedRegion}
            onSelect={setSelectedRegion}
          />
        )}

        {/* ── 1. AI OVERALL SIGNAL ─────────────────────────────────────────── */}
        <AiSignalBanner
          summary={
            adjustedKeySummary ?? {
              headline: "Insufficient data for AI assessment at this time",
              body: "The AI signal system does not yet have enough corroborating data points to produce a reliable assessment for this country and dimension. Monitoring is active and this section will be populated as new signals are collected.",
              metrics: [],
              lastUpdated: "2026-05-12",
              alertLevel: "low",
              direction: "stable",
              confidence: 0,
            }
          }
        />

        {/* ── 2. DIMENSION-SPECIFIC SUB-SIGNALS ───────────────────────────── */}
        {signal === "foodPrices" && (
          <SectionCard
            title="Commodity Price Trends"
            className="mb-8"
            action={
              <CommodityPicker
                options={FOOD_PRICE_CHARTS.map((c) => ({ key: c.key as string, label: c.label }))}
                selected={selectedFoodCommodities}
                onToggle={toggleFoodCommodity}
              />
            }
          >
            {visibleFoodCharts.length === 0 ? (
              <Empty className="border border-dashed border-neutral-300">
                <EmptyHeader>
                  <EmptyTitle>No commodities selected</EmptyTitle>
                  <EmptyDescription>
                    Use “Add commodities” to choose what to display.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {visibleFoodCharts.map((c) => (
                  <PriceChart
                    key={c.key}
                    label={c.label}
                    commodity={applyRegionToCommodity(mockPriceData[c.key], regionMultiplier)}
                    onExpand={() => setExpandedChart({ key: c.key, source: "food" })}
                    useNarrative
                    narrativeSignal={foodPriceNarrativeSignals[countryName]?.[c.key] ?? null}
                  />
                ))}
              </div>
            )}
            {/* WFP DataViz external link */}
            {(() => {
              const datavizUrls: Record<string, string> = {
                lebanon:   "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/lebanon/overview?current_page=1&country=lbn",
                syria:     "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/syrian-arab-republic/overview?current_page=1&country=syr",
                palestine: "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/state-of-palestine/overview?current_page=1&country=pse",
              };
              const url = datavizUrls[country?.toLowerCase() ?? ""];
              if (!url) return null;
              return (
                <Card className="mt-4 gap-0 rounded-md border-primary bg-primary-50 py-3 shadow-none">
                  <CardContent className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-neutral-700">
                        Explore full price data and trends on the <strong>WFP DataViz platform</strong> for {countryName}.
                      </span>
                    </div>
                    <Button asChild size="xs" className="ml-4 shrink-0">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        Open DataViz
                        <ExternalLink />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })()}
          </SectionCard>
        )}

        {signal === "energyPrices" && (
          <SectionCard
            title="Energy Price Trends"
            description="Blue line: WFP Official Data (12 weeks) · Yellow card: latest AI signal"
            className="mb-8"
          >
            <div className="grid grid-cols-4 gap-4">
              {ENERGY_PRICE_CHARTS.map((c) => (
                <PriceChart
                  key={c.key}
                  label={c.label}
                  commodity={applyRegionToCommodity(energyPriceData[c.key], regionMultiplier)}
                  onExpand={() => setExpandedChart({ key: c.key, source: "energy" })}
                />
              ))}
            </div>
          </SectionCard>
        )}

        {signal === "accessToMarkets" && (
          <StatusSignalGrid
            signals={accessToMarketsSignals}
            sectionTitle="Market Access Indicators"
            subtitle={selectedRegion
              ? `Status signals · Filtered to ${selectedRegion}`
              : "Status signals · AI-updated continuously"}
          />
        )}

        {signal === "foodAvailability" && (
          <StatusSignalGrid
            signals={foodAvailabilitySignals}
            sectionTitle="Food Availability Indicators"
            subtitle={selectedRegion
              ? `Status signals · Filtered to ${selectedRegion}`
              : "Status signals · AI-updated continuously"}
          />
        )}

        {signal === "cashLiquidity" && (
          <StatusSignalGrid
            signals={cashAvailabilitySignals}
            sectionTitle="Cash & Liquidity Indicators"
            subtitle={selectedRegion
              ? `Status signals · Filtered to ${selectedRegion}`
              : "Status signals · AI-updated continuously"}
          />
        )}

        {signal === "exchangeRates" && (
          <SectionCard
            title="Exchange Rate Trends"
            description="Blue line: WFP Official Data (12 weeks) · Yellow card: latest AI signal"
            className="mb-8"
          >
            <div className="grid grid-cols-2 gap-6">
              {EXCHANGE_RATE_CHARTS.map((c) => (
                <PriceChart
                  key={c.key}
                  label={c.label}
                  commodity={applyRegionToCommodity(exchangeRateData[c.key], regionMultiplier)}
                  onExpand={() => setExpandedChart({ key: c.key, source: "exchange" })}
                />
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── KEY POINTS: Commodity Price Trends summary ───────────────────── */}
        {signal === "foodPrices" && (() => {
          const countrySignals = foodPriceNarrativeSignals[countryName] ?? {};
          const points = FOOD_PRICE_CHARTS
            .map((c) => ({ ...c, signal: countrySignals[c.key] ?? null }))
            .filter((c) => c.signal !== null) as Array<{
              key: string;
              label: string;
              signal: { direction: string; rationale: string; source: string; date: string };
            }>;
          if (points.length === 0) return null;

          const directionStyle: Record<string, { dot: string; label: string }> = {
            deteriorating: { dot: "bg-danger-500",  label: "Deteriorating" },
            improving:     { dot: "bg-success-500", label: "Improving" },
            stable:        { dot: "bg-ivory-300",   label: "Stable" },
          };

          return (
            <SectionCard title="Key Points" className="mb-8">
              <ul className="space-y-2">
                {points.map((p) => {
                  const style = directionStyle[p.signal.direction] ?? directionStyle.stable;
                  return (
                    <li key={p.key} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                      <span>
                        <strong className="font-medium text-foreground">{p.label}</strong>{" "}
                        <span className="text-xs text-neutral-500">({style.label})</span> — {p.signal.rationale}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          );
        })()}

        {/* ── 3. NEWS & INTELLIGENCE (filtered by dimension) ───────────────── */}
        <SectionCard title="News & Intelligence" className="mb-8">
          {dimensionNews.length === 0 && otherDimensionNews.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No news items found</EmptyTitle>
                <EmptyDescription>No news items found for this dimension.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div>
              {dimensionNews.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {countryName}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-0">
                    {dimensionNews.map((news, idx) => (
                      <NewsRow key={news.id} news={news} idx={idx} />
                    ))}
                  </div>
                </div>
              )}
              {otherDimensionNews.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Regional context
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-0">
                    {otherDimensionNews.map((news, idx) => (
                      <NewsRow key={news.id} news={news} idx={idx} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Floating AI assistant button */}
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-30 shadow-lg"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-medium">AI Assistant</span>
        </Button>
      )}

      {/* Chatbot sidebar */}
      <MarketChatbot
        country={countryName}
        signal={signal || ""}
        signalLabel={signalLabel}
        isOpen={chatOpen}
        isExpanded={chatExpanded}
        onClose={() => { setChatOpen(false); setChatExpanded(false); }}
        onExpand={() => setChatExpanded(true)}
        onCollapse={() => setChatExpanded(false)}
      />

      {/* Expanded chart modal */}
      {expandedChart && getExpandedCommodity() && (
        <ExpandedChartModal
          title={getExpandedLabel()}
          commodity={getExpandedCommodity()!}
          onClose={() => setExpandedChart(null)}
        />
      )}
    </div>
  );
}
