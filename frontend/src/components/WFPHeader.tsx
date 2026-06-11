interface WFPHeaderProps {
  title?: string;
}

export function WFPHeader({ title }: WFPHeaderProps) {
  return (
    <header className="flex-shrink-0">
      {title && (
        <div className="bg-primary py-3 px-6 text-primary-foreground">
          <h1 className="text-xl font-normal">RAMI — Rapid Access to Market Insights</h1>
        </div>
      )}
    </header>
  );
}
