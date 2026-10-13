import { founderSignals } from "@/content/founder";

type FounderSignalsProps = {
  tone?: "light" | "dark";
};

export function FounderSignals({ tone = "light" }: FounderSignalsProps) {
  const isDark = tone === "dark";

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {founderSignals.map(([term, description], index) => (
        <div
          key={term}
          className={`relative min-h-32 overflow-hidden rounded-[0.875rem] border p-5 shadow-[var(--shadow-soft)] sm:p-6 ${
            isDark
              ? "border-offwhite/14 bg-offwhite/[0.055]"
              : index === 0
                ? "border-brand-blue/22 bg-surface-mist"
                : "border-navy-950/10 bg-surface-raised"
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 w-1 ${
              index === 0 ? "bg-brand-cyan" : "bg-brand-blue/55"
            }`}
          />
          <dt
            className={`text-h4 font-bold ${
              isDark ? "text-offwhite" : "text-navy-950"
            }`}
          >
            {term}
          </dt>
          <dd
            className={`mt-2 text-body-sm ${
              isDark ? "text-offwhite/62" : "text-gray-text"
            }`}
          >
            {description}
          </dd>
        </div>
      ))}
    </dl>
  );
}
