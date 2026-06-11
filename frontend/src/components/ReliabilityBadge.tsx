import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const RELIABILITY_VARIANTS: Record<string, "success" | "warning"> = {
  Verified: "success",
  Unverified: "warning",
};

const RELIABILITY_DESCRIPTIONS: Record<string, string> = {
  Verified:
    "Confirmed news outlets or institutional sources (e.g. major news agencies, UN agencies, government bodies).",
  Unverified: "Social media, blogs, personal posts, or other informal sources. Use with caution.",
};

export function ReliabilityBadge({ reliability }: { reliability: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={RELIABILITY_VARIANTS[reliability] ?? "secondary"} className="shrink-0 cursor-default">
          {reliability}
          <Info className="opacity-60" />
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end" className="max-w-64 leading-relaxed">
        <span className="mb-0.5 block font-semibold">{reliability} Source</span>
        {RELIABILITY_DESCRIPTIONS[reliability]}
      </TooltipContent>
    </Tooltip>
  );
}
