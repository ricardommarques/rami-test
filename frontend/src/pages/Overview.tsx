import { useState } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, Minus, Calendar, MapPin, Tag, Globe, HelpCircle } from "lucide-react";
import {
  countries,
  signalLabels,
  mockNewsData,
  historicalBaselines,
  type SignalLevel,
  type ReferencePeriod,
} from "@/data/mockData";
import { WFPHeader } from "@/components/WFPHeader";
import { SectionCard } from "@/components/SectionCard";
import { ReferencePeriodSelector } from "@/components/ReferencePeriodSelector";
import { ReliabilityBadge } from "@/components/ReliabilityBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ── helpers ──────────────────────────────────────────────────────────────────

const LEVEL_VALUE: Record<SignalLevel, number> = {
  low: 1, moderate: 2, elevated: 3, high: 4, critical: 5,
};

const LEVEL_LABEL: Record<SignalLevel, string> = {
  low: "Low", moderate: "Moderate", elevated: "Elevated", high: "High", critical: "Critical",
};

function getReferenceLevel(
  countryName: string,
  signalKey: string,
  weekData: { level: SignalLevel | null }[],
  period: ReferencePeriod,
): SignalLevel | null {
  if (period === "lastWeek") return weekData[3]?.level ?? null;
  return historicalBaselines[countryName]?.[signalKey]?.[period] ?? null;
}

type ChangeDirection = "improved" | "maintained" | "deteriorated" | "missing";

function getChange(current: SignalLevel | null, reference: SignalLevel | null): ChangeDirection {
  if (!current || !reference) return "missing";
  const delta = LEVEL_VALUE[current] - LEVEL_VALUE[reference];
  if (delta > 0) return "deteriorated";
  if (delta < 0) return "improved";
  return "maintained";
}

// ── sub-components ────────────────────────────────────────────────────────────

function ChangeCell({
  currentLevel,
  referenceLevel,
  onClick,
}: {
  currentLevel: SignalLevel | null;
  referenceLevel: SignalLevel | null;
  onClick: () => void;
}) {
  const direction = getChange(currentLevel, referenceLevel);

  const icon =
    direction === "deteriorated" ? (
      <TrendingUp className="h-3.5 w-3.5 text-danger-700" />
    ) : direction === "improved" ? (
      <TrendingDown className="h-3.5 w-3.5 text-success-600" />
    ) : direction === "missing" ? (
      <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
    ) : (
      <Minus className="h-3.5 w-3.5 text-ivory-700" />
    );

  const label =
    direction === "deteriorated" ? "Deteriorated" :
    direction === "improved"     ? "Improved" :
    direction === "missing"      ? "Missing Information" : "Stable";

  const labelColor =
    direction === "deteriorated" ? "text-danger-700" :
    direction === "improved"     ? "text-success-600" :
    direction === "missing"      ? "text-neutral-400" : "text-ivory-700";

  const bg =
    direction === "deteriorated" ? "bg-danger-100 border-danger-300 hover:bg-danger-200" :
    direction === "improved"     ? "bg-success-100 border-success-300 hover:bg-success-200" :
    direction === "missing"      ? "bg-neutral-100 border-neutral-300 hover:bg-neutral-200" :
                                   "bg-ivory-50 border-ivory-200 hover:bg-ivory-100";

  const tooltip =
    currentLevel && referenceLevel
      ? `Now: ${LEVEL_LABEL[currentLevel]} — Ref: ${LEVEL_LABEL[referenceLevel]}`
      : "Missing information";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          onClick={onClick}
          className={`h-auto w-full flex-col gap-1 rounded p-2 ${bg}`}
        >
          <div className="flex items-center gap-1">
            {icon}
            <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function NewsCard({ news }: { news: (typeof mockNewsData)[0] }) {
  return (
    <Card className="gap-0 rounded-none py-4 shadow-none">
      <CardContent className="flex flex-col gap-2 px-4">
        <div className="flex items-start justify-between gap-2">
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
        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">{news.content}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-neutral-100 pt-2 text-xs text-neutral-400">
          <span className="font-medium text-primary">{news.source}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {news.date}
          </span>
          {news.dimensions.map((d) => (
            <Badge key={d} variant="secondary">
              <Tag />
              {signalLabels[d as keyof typeof signalLabels] || d}
            </Badge>
          ))}
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {news.country}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {news.region}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function Overview() {
  const navigate = useNavigate();
  const [refPeriod, setRefPeriod] = useState<ReferencePeriod>("lastWeek");

  const signalKeys = Object.keys(signalLabels) as Array<keyof typeof signalLabels>;

  const handleCellClick = (country: string, signal: string) => {
    navigate(`/${country.toLowerCase()}/${signal}?ref=${refPeriod}`);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <WFPHeader title="Market Signals Dashboard" />

      <div className="flex-1 space-y-10 overflow-auto px-8 py-6">
        {/* ── Reference period selector ─────────────────────────────────── */}
        <ReferencePeriodSelector value={refPeriod} onChange={setRefPeriod} />

        {/* ── Change-indicator table ────────────────────────────────────── */}
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="w-48 px-4 font-normal text-primary-foreground">Dimension</TableHead>
              {countries.map((country) => (
                <TableHead key={country.name} className="px-6 text-center font-normal text-primary-foreground">
                  {country.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {signalKeys.map((signalKey, idx) => (
              <TableRow key={signalKey} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                  {signalLabels[signalKey]}
                </TableCell>
                {countries.map((country) => {
                  const weekData = country.signals[signalKey];
                  const currentLevel: SignalLevel | null = weekData[4]?.level ?? null;
                  const refLevel = getReferenceLevel(country.name, signalKey, weekData, refPeriod);
                  return (
                    <TableCell key={country.name} className="px-4 py-3">
                      <ChangeCell
                        currentLevel={currentLevel}
                        referenceLevel={refLevel}
                        onClick={() => handleCellClick(country.name, signalKey)}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* ── Latest news & intelligence ────────────────────────────────── */}
        <SectionCard title="Latest News & Intelligence">

          {countries.map((country) => {
            const countryNews = mockNewsData.filter((n) => n.country === country.name);
            if (countryNews.length === 0) return null;
            return (
              <div key={country.name} className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">{country.name}</h3>
                  <span className="text-xs text-neutral-400">
                    {countryNews.length} item{countryNews.length !== 1 ? "s" : ""}
                  </span>
                  <Separator className="flex-1" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {countryNews.map((news) => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* items not matched to any country */}
          {(() => {
            const countryNames = countries.map((c) => c.name);
            const unmatched = mockNewsData.filter((n) => !countryNames.includes(n.country));
            if (unmatched.length === 0) return null;
            return (
              <div className="mb-6">
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">Regional / Other</h3>
                  <Separator className="flex-1" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {unmatched.map((news) => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              </div>
            );
          })()}
        </SectionCard>
      </div>
    </div>
  );
}
