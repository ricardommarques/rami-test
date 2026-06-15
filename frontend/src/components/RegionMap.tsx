import { MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COUNTRY_MAPS } from "@/components/mapShapes";
import type { RegionInfo } from "@/data/mockData";

interface RegionMapProps {
  countryName: string;
  regions: RegionInfo[];
  selectedRegion: string | null; // null = national view
  onSelect: (region: string | null) => void;
}

// Interactive country map: the outline is a real (projected) silhouette and each
// region is a band clipped to that outline, so selecting a region highlights its
// area on the actual country shape. Kept in sync with the buttons below.
function CountryMap({
  countryName,
  selectedRegion,
  onSelect,
}: {
  countryName: string;
  selectedRegion: string | null;
  onSelect: (region: string | null) => void;
}) {
  const shape = COUNTRY_MAPS[countryName];
  if (!shape) return null;

  // Render unselected regions first so the selected region's fill and border
  // sit on top.
  const entries = Object.entries(shape.regions).sort(
    ([a], [b]) => Number(a === selectedRegion) - Number(b === selectedRegion),
  );

  return (
    <svg
      viewBox={shape.viewBox}
      role="img"
      aria-label={`Region map of ${countryName}`}
      className="h-auto w-full max-w-[150px]"
    >
      {entries.map(([name, d]) => {
        const active = selectedRegion === name;
        return (
          <path
            key={name}
            d={d}
            fillRule="evenodd"
            strokeWidth={active ? 1 : 0.6}
            strokeLinejoin="round"
            onClick={() => onSelect(name)}
            className={`cursor-pointer transition-colors ${
              active
                ? "fill-primary stroke-white"
                : "fill-neutral-200 stroke-neutral-400 hover:fill-primary-100"
            }`}
          >
            <title>{name}</title>
          </path>
        );
      })}
    </svg>
  );
}

export function RegionMap({ countryName, regions, selectedRegion, onSelect }: RegionMapProps) {
  const hasMap = Boolean(COUNTRY_MAPS[countryName]);

  return (
    <Card className="mb-6 gap-0 rounded-none py-4 shadow-none">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Geographic Scope · {countryName}
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {hasMap && (
            <div className="flex shrink-0 justify-center">
              <CountryMap
                countryName={countryName}
                selectedRegion={selectedRegion}
                onSelect={onSelect}
              />
            </div>
          )}

          <div>
            <div className="grid max-w-xl grid-cols-3 gap-2">
              {(() => {
                const active = selectedRegion === null;
                return (
                  <Button
                    variant={active ? "default" : "outline"}
                    onClick={() => onSelect(null)}
                    className={`h-auto w-full justify-start p-3 ${active ? "" : "bg-neutral-50 hover:border-primary hover:bg-primary-100"}`}
                  >
                    <Globe className={active ? "opacity-90" : "text-neutral-400"} />
                    <span className="text-sm font-medium">National view</span>
                  </Button>
                );
              })()}
              {regions.map((r) => {
                const active = selectedRegion === r.name;
                return (
                  <Button
                    key={r.name}
                    variant={active ? "default" : "outline"}
                    onClick={() => onSelect(r.name)}
                    className={`h-auto w-full justify-start p-3 ${active ? "" : "bg-neutral-50 hover:border-primary hover:bg-primary-100"}`}
                  >
                    <MapPin className={active ? "opacity-90" : "text-neutral-400"} />
                    <span className="text-sm font-medium">{r.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
