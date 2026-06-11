import { MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RegionInfo } from "@/data/mockData";

interface RegionMapProps {
  countryName: string;
  regions: RegionInfo[];
  selectedRegion: string | null; // null = national view
  onSelect: (region: string | null) => void;
}

export function RegionMap({ countryName, regions, selectedRegion, onSelect }: RegionMapProps) {
  return (
    <Card className="mb-6 gap-0 rounded-none py-4 shadow-none">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Geographic Scope · {countryName}
            </span>
          </div>
          <Button
            variant={selectedRegion === null ? "default" : "secondary"}
            size="xs"
            onClick={() => onSelect(null)}
          >
            <Globe />
            National view
          </Button>
        </div>
        <div className="grid max-w-md gap-2" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          {regions.map((r) => {
            const active = selectedRegion === r.name;
            return (
              <Button
                key={r.name}
                variant={active ? "default" : "outline"}
                onClick={() => onSelect(r.name)}
                style={{ gridColumn: r.col, gridRow: r.row }}
                className={`h-auto justify-start p-3 ${active ? "" : "bg-neutral-50 hover:border-primary hover:bg-primary-100"}`}
              >
                <MapPin className={active ? "opacity-90" : "text-neutral-400"} />
                <span className="text-sm font-medium">{r.name}</span>
              </Button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          {selectedRegion
            ? `Viewing signals and news filtered to ${selectedRegion}. Select another region or switch to National view to change scope.`
            : "Viewing country-wide signals. Click a region to filter signals and news to that area."}
        </p>
      </CardContent>
    </Card>
  );
}
