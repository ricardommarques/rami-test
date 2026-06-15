import { type ReactNode } from "react";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { SectionCard } from "@/components/SectionCard";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { SituationTheme } from "@/data/mockData";

// Some dimensions (Market Access, Food Availability) are shown as a description
// of the current situation rather than a current-vs-reference comparison: one
// card per priority sub-theme, each holding key facts about current
// circumstances with a link back to the source so the user can verify them.
// Cards use the same square (`rounded-none`, `shadow-none`) treatment as the
// sibling status-grid dimensions to stay consistent with the WFP design kit.
function ThemeBlock({ theme }: { theme: SituationTheme }) {
  return (
    <Card className="gap-0 rounded-none py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-0">
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <h3 className="text-sm font-medium text-foreground">{theme.title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{theme.whatToDetect}</p>
        </div>

        {theme.facts.length > 0 ? (
          <ul className="divide-y divide-neutral-100">
            {theme.facts.map((fact, idx) => (
              <li key={idx} className="px-4 py-3">
                <p className="mb-2 text-sm leading-relaxed text-neutral-700">{fact.text}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                  <Link
                    href={fact.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs"
                    title={fact.source}
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span>{fact.source}</span>
                  </Link>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {fact.date}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-3 text-xs italic text-neutral-400">
            No key facts reported for this theme in the current period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface SituationPanelProps {
  themes: SituationTheme[];
  sectionTitle: string;
  subtitle?: string;
  region?: string | null;
  emptyMessage?: string;
  footer?: ReactNode;
}

export function SituationPanel({
  themes,
  sectionTitle,
  subtitle,
  region,
  emptyMessage = "No information available",
  footer,
}: SituationPanelProps) {
  return (
    <SectionCard title={sectionTitle} description={subtitle} className="mb-8">
      {region && (
        <div className="mb-4 inline-flex items-center gap-1.5 border border-primary bg-primary-100 px-3 py-1.5 text-xs text-primary">
          <MapPin className="h-3.5 w-3.5" />
          Showing situation for {region}
        </div>
      )}

      {themes.length === 0 ? (
        <Empty className="border border-dashed border-neutral-300">
          <EmptyHeader>
            <EmptyTitle>{emptyMessage}</EmptyTitle>
            <EmptyDescription>
              This section will be populated as new signals are collected.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {themes.map((theme) => (
            <ThemeBlock key={theme.id} theme={theme} />
          ))}
        </div>
      )}

      {footer}
    </SectionCard>
  );
}
