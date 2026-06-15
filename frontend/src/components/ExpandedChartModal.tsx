import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { CommodityData } from "@/data/mockData";

interface ExpandedChartModalProps {
  title: string;
  commodity: CommodityData;
  onClose: () => void;
}

const chartConfig = {
  price: {
    label: "WFP Official Data",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export function ExpandedChartModal({ title, commodity, onClose }: ExpandedChartModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-xs text-neutral-400">
            {commodity.officialSource === "Trading Economics" ? "Trading Economics" : "WFP Official Data"} — {commodity.unit}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <ChartContainer config={chartConfig} className="h-[500px] w-full">
            <LineChart data={commodity.wfpPoints} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
              <XAxis dataKey="date" tick={{ fontSize: 14, fill: "var(--color-neutral-600)" }} />
              <YAxis
                tick={{ fontSize: 14, fill: "var(--color-neutral-600)" }}
                unit={` ${commodity.unit.split("/")[0].trim()}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${value} ${commodity.unit}`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
                strokeWidth={4}
                dot={{ r: 6, fill: "var(--color-price)", strokeWidth: 0 }}
                activeDot={{ r: 8, fill: "var(--color-price)", strokeWidth: 0 }}
                name="WFP Official Data"
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
