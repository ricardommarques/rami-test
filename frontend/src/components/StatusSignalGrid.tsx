import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { SectionCard } from "@/components/SectionCard";
import type { StatusSignal } from "@/data/mockData";

const STATUS_CONFIG: Record<StatusSignal["status"], { bg: string; border: string; dot: string; label: string }> = {
  good:     { bg: "bg-success-100", border: "border-success-300", dot: "bg-success-600", label: "Good" },
  moderate: { bg: "bg-ivory-50",    border: "border-ivory-200",   dot: "bg-ivory-400",   label: "Moderate" },
  poor:     { bg: "bg-warning-100", border: "border-warning-300", dot: "bg-warning-600", label: "Poor" },
  critical: { bg: "bg-danger-100",  border: "border-danger-300",  dot: "bg-danger-700",  label: "Critical" },
};

const STATUS_TEXT_COLOR: Record<StatusSignal["status"], string> = {
  good:     "text-success-600",
  moderate: "text-ivory-700",
  poor:     "text-warning-600",
  critical: "text-danger-700",
};

function TrendBadge({ trend }: { trend: StatusSignal["trend"] }) {
  if (trend === "improving") {
    return (
      <span className="flex items-center gap-1 text-xs text-success-600">
        <TrendingDown className="h-3.5 w-3.5" /> Improving
      </span>
    );
  }
  if (trend === "deteriorating") {
    return (
      <span className="flex items-center gap-1 text-xs text-danger-700">
        <TrendingUp className="h-3.5 w-3.5" /> Deteriorating
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-neutral-400">
      <Minus className="h-3.5 w-3.5" /> Stable
    </span>
  );
}

function SignalCard({ signal }: { signal: StatusSignal }) {
  const cfg = STATUS_CONFIG[signal.status];
  const textColor = STATUS_TEXT_COLOR[signal.status];
  const { aiUpdate } = signal;

  return (
    <Card className={`gap-0 rounded-none py-4 shadow-none ${cfg.bg} ${cfg.border}`}>
      <CardContent className="flex h-full flex-col px-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
            <span className="text-sm font-medium text-foreground">{signal.label}</span>
          </div>
          <TrendBadge trend={signal.trend} />
        </div>
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-2xl text-foreground">{signal.currentValue}</span>
          <span className={`text-xs font-medium uppercase tracking-wide ${textColor}`}>{cfg.label}</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-neutral-600">{signal.description}</p>
        {aiUpdate ? (
          <div className="mt-auto border border-neutral-200 bg-white/70 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
              <Cpu className="h-3 w-3" />
              Latest AI signal
            </div>
            <p className="mb-2 text-xs leading-relaxed text-foreground">{aiUpdate.observation}</p>
            <div className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
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
              <span className="truncate">{aiUpdate.source}</span>
            </Link>
          </div>
        ) : (
          <div className="mt-auto border border-dashed border-neutral-200 bg-neutral-50 p-3">
            <p className="text-xs italic text-neutral-400">No AI updates since last WFP collection</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusSignalGridProps {
  signals: StatusSignal[];
  sectionTitle: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function StatusSignalGrid({ signals, sectionTitle, subtitle, footer }: StatusSignalGridProps) {
  return (
    <SectionCard title={sectionTitle} description={subtitle} className="mb-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
      {footer}
    </SectionCard>
  );
}
