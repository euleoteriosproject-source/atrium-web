import { EvidenceChip } from "@/components/results/evidence-chip";
import {
  opportunityDimensionLabels,
  opportunityLevelLabels,
  type OpportunityResult,
} from "@/domain/diagnostic/results";
import { cn } from "@/lib/utils";

const levelStyles = {
  HIGH: "border-gold-500/45 bg-gold-300/18 text-navy-950",
  MODERATE: "border-navy-950/18 bg-white text-navy-800",
  LOW: "border-navy-950/10 bg-gray-bg text-gray-text",
} as const;

export function OpportunityCard({
  opportunity,
  index,
}: {
  opportunity: OpportunityResult;
  index: number;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className="grid gap-7 border-t border-navy-950/15 py-10 first:border-t-0 first:pt-0 sm:grid-cols-[5rem_1fr] sm:gap-9 sm:py-12">
      <p
        aria-hidden="true"
        className="font-serif text-h3 text-gold-500 sm:pt-1"
      >
        {number}
      </p>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-eyebrow font-bold tracking-[0.14em] text-navy-800 uppercase">
            {opportunityDimensionLabels[opportunity.dimension]}
          </p>
          <p
            className={cn(
              "border px-2.5 py-1 text-caption font-bold",
              levelStyles[opportunity.level],
            )}
          >
            {opportunityLevelLabels[opportunity.level]}
          </p>
        </div>

        <h2 className="mt-5 max-w-3xl text-h3 font-semibold">
          {opportunity.title}
        </h2>
        <p className="mt-4 max-w-3xl text-body-lg text-gray-text">
          {opportunity.summary}
        </p>

        <dl className="mt-8 grid gap-7 lg:grid-cols-2 lg:gap-10">
          <div>
            <dt className="text-caption font-bold tracking-wide text-navy-800 uppercase">
              Por que vale investigar
            </dt>
            <dd className="mt-2 text-body text-gray-text">
              {opportunity.whyItMatters}
            </dd>
          </div>
          <div>
            <dt className="text-caption font-bold tracking-wide text-navy-800 uppercase">
              O que avaliar primeiro
            </dt>
            <dd className="mt-2 text-body text-gray-text">
              {opportunity.whatToEvaluate}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <p className="text-caption font-bold tracking-wide text-navy-800 uppercase">
            Sinais considerados
          </p>
          <ul
            aria-label="Evidências desta oportunidade"
            className="mt-3 flex flex-wrap gap-2"
          >
            {opportunity.evidence.map((evidence) => (
              <EvidenceChip key={evidence.id} evidence={evidence} />
            ))}
          </ul>
        </div>

        {opportunity.caution ? (
          <aside
            aria-label="Ponto de atenção"
            className="mt-8 border-l-2 border-gold-500 bg-gold-300/12 px-5 py-4"
          >
            <p className="text-caption font-bold tracking-wide text-navy-950 uppercase">
              Ponto de atenção
            </p>
            <p className="mt-2 text-body-sm text-navy-800">
              {opportunity.caution}
            </p>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
