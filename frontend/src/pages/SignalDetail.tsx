import { useState, type ReactNode } from "react";
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
  marketAccessThemes,
  foodAvailabilityThemes,
  cashLiquidityThemes,
  mockNewsData,
  mockKeySummaries,
  countries,
  countryRegions,
  regionAdjustments,
  summarySources,
  historicalBaselines,
  type ReferencePeriod,
  foodPriceNarrativeSignals,
  foodPriceKeyPoints,
  energyPriceNarrativeSignals,
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
import { SituationPanel } from "@/components/SituationPanel";
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
  { key: "lng",         label: "LNG Price" },
  { key: "electricity", label: "Electricity (Generator)" },
];

const EXCHANGE_RATE_CHARTS: Array<{ key: string; label: string }> = [
  { key: "officialRate",    label: "Official Exchange Rate (LBP/USD)" },
  { key: "blackMarketRate", label: "Black Market Rate (LBP/USD)" },
  { key: "premium",         label: "Black Market Premium (% above official)" },
];

const DIRECTION_CONFIG = {
  deteriorating: { icon: <ChevronUp className="h-4 w-4" />,   label: "Deteriorated", color: "text-danger-700",  bg: "bg-danger-100" },
  stable:        { icon: <Minus className="h-4 w-4" />,       label: "Stable",       color: "text-ivory-700",   bg: "bg-ivory-50" },
  improving:     { icon: <ChevronDown className="h-4 w-4" />, label: "Improved",     color: "text-success-600", bg: "bg-success-100" },
};

// ── AI Overall Signal ────────────────────────────────────────────────────────

// Text colors follow the box style: light red box → dark red text, light
// yellow → dark yellow, light green → dark green, light grey → dark grey.
const BANNER_PALETTES = {
  neutral: { box: "bg-neutral-100 border-neutral-300", title: "text-neutral-800", body: "text-neutral-700", muted: "text-neutral-500" },
  danger:  { box: "bg-danger-100 border-danger-300",   title: "text-danger-800",  body: "text-danger-700",  muted: "text-danger-600" },
  success: { box: "bg-success-100 border-success-300", title: "text-success-800", body: "text-success-700", muted: "text-success-600" },
  ivory:   { box: "bg-ivory-50 border-ivory-200",      title: "text-ivory-800",   body: "text-ivory-700",   muted: "text-ivory-600" },
};

function AiSignalBanner({ summary }: { summary: KeySummary }) {
  const dir = DIRECTION_CONFIG[summary.direction];

  const palette =
    summary.confidence === 0              ? BANNER_PALETTES.neutral :
    summary.direction === "deteriorating" ? BANNER_PALETTES.danger :
    summary.direction === "improving"     ? BANNER_PALETTES.success :
                                            BANNER_PALETTES.ivory;

  return (
    <div className={`mb-8 rounded-md border p-5 ${palette.box}`}>
      {/* Header row */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className={`text-sm font-semibold uppercase tracking-wide ${palette.title}`}>Overview</h2>

        {summary.confidence !== 0 && (
          <span className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs ${dir.bg} ${dir.color}`}>
            {dir.icon}
            {dir.label}
          </span>
        )}
        <div className={`ml-auto flex items-center gap-1.5 text-xs ${palette.muted}`}>
          <span>Updated {summary.lastUpdated}</span>
        </div>
      </div>

      {/* Headline */}
      <h3 className={`mb-3 text-base leading-snug ${palette.title}`}>
        {summary.headline}
      </h3>

      {/* Body */}
      {summary.body.split("\n\n").map((para, i) => (
        <p key={i} className={`mb-3 text-sm leading-relaxed ${palette.body}`}>
          {para}
        </p>
      ))}

      {/* Sources */}
      {summary.confidence !== 0 && summary.sources && summary.sources.length > 0 && (
        <div className="mt-4 border-t border-neutral-alpha-200 pt-3">
          <div className={`mb-1.5 text-xs ${palette.muted}`}>Sources</div>
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

function NarrativeSignalCard({
  signal,
  commodity,
  refPeriod,
}: {
  signal: NarrativeSignal | null;
  commodity?: CommodityData;
  refPeriod?: ReferencePeriod;
}) {
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
      {commodity && refPeriod && (
        <PriceVariation commodity={commodity} refPeriod={refPeriod} className="mb-2" />
      )}
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

// ── WFP DataViz external link card ────────────────────────────────────────────

function WfpDataVizCard({ url, children }: { url: string; children: ReactNode }) {
  return (
    <Card className="mt-4 gap-0 rounded-md border-primary bg-primary-50 py-3 shadow-none">
      <CardContent className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm text-neutral-700">{children}</span>
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
}

// ── Price chart ───────────────────────────────────────────────────────────────

const priceChartConfig = {
  price: {
    label: "WFP Official Data",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

// Maps the "Compare current situation to" reference period onto how many weekly
// WFP points back it sits, so the price-variation readout matches that control.
const REF_PERIOD_LABEL: Record<ReferencePeriod, string> = {
  lastWeek: "last week",
  lastMonth: "last month",
  threeMonthsAgo: "3 months ago",
};
const REF_PERIOD_WEEKS_BACK: Record<ReferencePeriod, number> = {
  lastWeek: 1,
  lastMonth: 4,
  threeMonthsAgo: 12,
};

// Simplistic current-price + variation readout shown below the plot. The
// current price is the latest WFP point; the variation compares it to the
// point at the selected reference period.
function PriceVariation({
  commodity,
  refPeriod,
  className = "mt-3",
}: {
  commodity: CommodityData;
  refPeriod: ReferencePeriod;
  className?: string;
}) {
  const points = commodity.wfpPoints;
  if (points.length === 0) return null;
  const current = points[points.length - 1].price;
  const refIdx = Math.max(0, points.length - 1 - REF_PERIOD_WEEKS_BACK[refPeriod]);
  const reference = points[refIdx].price;
  const pct = reference !== 0 ? ((current - reference) / reference) * 100 : 0;
  const pctColor = pct > 0 ? "text-danger-600" : pct < 0 ? "text-success-600" : "text-neutral-500";
  return (
    <div className={`flex items-baseline justify-between ${className}`}>
      <span className="text-base font-semibold text-foreground">
        {current} {commodity.unit}
      </span>
      <span className="text-xs">
        <span className={pctColor}>
          {pct > 0 ? "+" : ""}{pct.toFixed(1)}%
        </span>
        <span className="text-neutral-400"> vs {REF_PERIOD_LABEL[refPeriod]}</span>
      </span>
    </div>
  );
}

// Card shown under exchange-rate charts: the current rate is the AI signal
// (latest AI-collected value), and the variation compares it to the WFP point
// at the reference period selected in "Compare current situation to".
function AiVariationCard({
  commodity,
  refPeriod,
}: {
  commodity: CommodityData;
  refPeriod: ReferencePeriod;
}) {
  const { aiUpdate, wfpPoints } = commodity;
  if (!aiUpdate) {
    return (
      <div className="mt-3 flex flex-1 flex-col border border-dashed border-neutral-200 bg-neutral-50 p-3">
        <p className="text-xs italic text-neutral-400">Data not available</p>
      </div>
    );
  }

  const refIdx = wfpPoints.length > 0
    ? Math.max(0, wfpPoints.length - 1 - REF_PERIOD_WEEKS_BACK[refPeriod])
    : -1;
  const reference = refIdx >= 0 ? wfpPoints[refIdx].price : null;
  const pct = reference && reference !== 0 ? ((aiUpdate.value - reference) / reference) * 100 : null;
  const pctColor = pct === null ? "text-neutral-500" : pct > 0 ? "text-danger-600" : pct < 0 ? "text-success-600" : "text-neutral-500";

  return (
    <div className="mt-3 flex flex-1 flex-col border border-ivory-200 bg-ivory-50 p-3">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-base font-semibold text-foreground">
          {aiUpdate.value.toLocaleString()} {aiUpdate.unit}
        </span>
        {pct !== null && (
          <span className="text-xs">
            <span className={pctColor}>{pct > 0 ? "+" : ""}{pct.toFixed(1)}%</span>
            <span className="text-neutral-400"> vs {REF_PERIOD_LABEL[refPeriod]}</span>
          </span>
        )}
      </div>
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

function PriceChart({
  label,
  commodity,
  onExpand,
  narrativeSignal,
  useNarrative,
  aiVariation,
  refPeriod,
}: {
  label: string;
  commodity: CommodityData;
  onExpand: () => void;
  narrativeSignal?: NarrativeSignal | null;
  useNarrative?: boolean;
  aiVariation?: boolean;
  refPeriod?: ReferencePeriod;
}) {
  const hasData = commodity.wfpPoints.length > 0;
  const sourceLabel =
    commodity.officialSource === "Trading Economics" ? "Trading Economics" : "WFP Official Data";
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex min-h-[20px] items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
      </div>
      <Card className="group relative gap-0 rounded-none py-3 shadow-none">
        <CardContent className="px-3">
          {hasData && (
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
          )}
          {hasData ? (
            <>
          <div className="mb-1 min-h-[2rem] text-xs leading-4 text-neutral-400">
            {sourceLabel} · {commodity.unit}
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
            </>
          ) : (
            <div className="flex h-[calc(180px+2rem)] flex-col items-center justify-center gap-2 text-center text-neutral-400">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Official Data Not Available</span>
            </div>
          )}
        </CardContent>
      </Card>
      {aiVariation && refPeriod
        ? <AiVariationCard commodity={commodity} refPeriod={refPeriod} />
        : useNarrative
        ? <NarrativeSignalCard signal={narrativeSignal ?? null} commodity={commodity} refPeriod={refPeriod} />
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
        {news.dimensions.map((d) => {
          const label = signalLabels[d as keyof typeof signalLabels] || d;
          const subTopic = news.subTopics?.[d];
          return (
            <Badge key={d} variant="secondary">
              <Tag />
              {subTopic ? `${label} · ${subTopic}` : label}
            </Badge>
          );
        })}
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
                <WfpDataVizCard url={url}>
                  Explore full price data and trends on the <strong>WFP DataViz platform</strong> for {countryName}.
                </WfpDataVizCard>
              );
            })()}
            {/* Key points summary */}
            {(foodPriceKeyPoints[countryName] ?? []).length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Key Points</h3>
                <ul className="list-disc space-y-2 pl-5">
                  {foodPriceKeyPoints[countryName].map((point, idx) => (
                    <li key={idx} className="text-sm text-neutral-700">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        )}

        {signal === "energyPrices" && (
          <SectionCard title="Energy Price Trends" className="mb-8">
            <div className="grid grid-cols-4 gap-4">
              {ENERGY_PRICE_CHARTS.map((c) => (
                <PriceChart
                  key={c.key}
                  label={c.label}
                  commodity={applyRegionToCommodity(energyPriceData[c.key], regionMultiplier)}
                  onExpand={() => setExpandedChart({ key: c.key, source: "energy" })}
                  useNarrative
                  refPeriod={refPeriod}
                  narrativeSignal={energyPriceNarrativeSignals[countryName]?.[c.key] ?? null}
                />
              ))}
            </div>
          </SectionCard>
        )}

        {signal === "accessToMarkets" && (
          <SituationPanel
            themes={marketAccessThemes[countryName] ?? []}
            sectionTitle="Market Access Indicators"
            emptyMessage="No market access information available"
            region={selectedRegion}
            footer={(() => {
              const mfiUrls: Record<string, string> = {
                lebanon:   "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/lebanon/market-functionality-index?current_page=1&country=lbn",
                syria:     "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/syrian-arab-republic/market-functionality-index?current_page=1&country=syr",
                palestine: "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/state-of-palestine/market-functionality-index?current_page=1&country=pse",
              };
              const url = mfiUrls[country?.toLowerCase() ?? ""];
              if (!url) return null;
              return (
                <WfpDataVizCard url={url}>
                  Explore <strong>Market Functionality Index</strong> page on the <strong>WFP DataViz platform</strong> for {countryName}.
                </WfpDataVizCard>
              );
            })()}
          />
        )}

        {signal === "foodAvailability" && (
          <SituationPanel
            themes={foodAvailabilityThemes[countryName] ?? []}
            sectionTitle="Food Availability Indicators"
            emptyMessage="No food availability information available"
            region={selectedRegion}
            footer={(() => {
              const mfiUrls: Record<string, string> = {
                lebanon:   "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/lebanon/market-functionality-index?current_page=1&country=lbn",
                syria:     "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/syrian-arab-republic/market-functionality-index?current_page=1&country=syr",
                palestine: "https://dataviz.vam.wfp.org/the-middle-east-and-northern-africa/state-of-palestine/market-functionality-index?current_page=1&country=pse",
              };
              const url = mfiUrls[country?.toLowerCase() ?? ""];
              if (!url) return null;
              return (
                <WfpDataVizCard url={url}>
                  Explore <strong>Market Functionality Index</strong> page on the <strong>WFP DataViz platform</strong> for {countryName}.
                </WfpDataVizCard>
              );
            })()}
          />
        )}

        {signal === "cashLiquidity" && (
          <SituationPanel
            themes={cashLiquidityThemes[countryName] ?? []}
            sectionTitle="Cash & Liquidity Indicators"
            emptyMessage="No cash & liquidity information available"
            region={selectedRegion}
          />
        )}

        {signal === "exchangeRates" && (
          <SectionCard
            title="Exchange Rate Trends"
            description="Blue line: WFP Official Data (12 weeks) · Yellow card: latest AI signal vs the selected reference period"
            className="mb-8"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {EXCHANGE_RATE_CHARTS.map((c) => {
                const series = exchangeRateData[c.key];
                if (!series) {
                  return (
                    <div key={c.key} className="flex h-full flex-col">
                      <div className="mb-2 flex min-h-[20px] items-center justify-between">
                        <h3 className="text-sm font-medium text-foreground">{c.label}</h3>
                      </div>
                      <Card className="gap-0 rounded-none py-3 shadow-none">
                        <CardContent className="flex h-[calc(180px+2rem)] flex-col items-center justify-center gap-2 px-3 text-center text-neutral-400">
                          <BarChart3 className="h-6 w-6" />
                          <span className="text-sm">Data not available</span>
                        </CardContent>
                      </Card>
                      <div className="mt-3 flex flex-1 flex-col border border-dashed border-neutral-200 bg-neutral-50 p-3">
                        <p className="text-xs italic text-neutral-400">Data not available</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <PriceChart
                    key={c.key}
                    label={c.label}
                    commodity={applyRegionToCommodity(series, regionMultiplier)}
                    onExpand={() => setExpandedChart({ key: c.key, source: "exchange" })}
                    aiVariation
                    refPeriod={refPeriod}
                  />
                );
              })}
            </div>
          </SectionCard>
        )}

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
