import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ReferencePeriod } from "@/data/mockData";

const REF_LABELS: Record<ReferencePeriod, string> = {
  lastWeek: "Last week",
  lastMonth: "Last month",
  threeMonthsAgo: "3 months ago",
};

interface ReferencePeriodSelectorProps {
  value: ReferencePeriod;
  onChange: (period: ReferencePeriod) => void;
}

export function ReferencePeriodSelector({ value, onChange }: ReferencePeriodSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-foreground">Compare current situation to:</span>
      <ToggleGroup
        type="single"
        variant="outline"
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v as ReferencePeriod);
        }}
      >
        {(Object.keys(REF_LABELS) as ReferencePeriod[]).map((p) => (
          <ToggleGroupItem
            key={p}
            value={p}
            className="px-4 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {REF_LABELS[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
