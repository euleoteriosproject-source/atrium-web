const journey = [
  ["01", "Intenção", "O que a pessoa precisa"],
  ["02", "Contexto", "Informação relevante"],
  ["03", "Organização", "Fluxo e regras claras"],
  ["04", "Atendimento", "Humano mais preparado"],
] as const;

export function HeroOperationalFlow() {
  return (
    <figure
      className="relative mx-auto w-full max-w-xl lg:translate-y-8"
      aria-labelledby="hero-flow-caption"
    >
      <div className="absolute -inset-6 rounded-full bg-brand-cyan/8 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.25rem] border border-offwhite/14 bg-navy-800/50 p-5 shadow-[0_36px_90px_rgb(0_0_0_/_0.25)] backdrop-blur-sm sm:p-7">
        <div
          aria-hidden="true"
          className="flow-grid absolute inset-0 opacity-20"
        />
        <div className="relative flex items-center justify-between border-b border-offwhite/12 pb-5">
          <span className="text-eyebrow font-bold tracking-[0.14em] text-accent-on-dark uppercase">
            Jornada operacional
          </span>
          <span className="flex items-center gap-2 text-caption text-offwhite/50">
            <span className="flow-pulse relative block size-1.5 rounded-full bg-accent-on-dark" />
            contexto em movimento
          </span>
        </div>
        <ol className="relative mt-3">
          {journey.map(([index, title, description], itemIndex) => (
            <li
              key={title}
              className="group grid grid-cols-[2.5rem_1fr] gap-3 border-b border-offwhite/10 py-5 last:border-b-0 sm:grid-cols-[3rem_0.8fr_1fr] sm:items-center"
            >
              <span className="text-caption font-bold text-accent-on-dark/75">
                {index}
              </span>
              <span className="text-body font-semibold text-offwhite">
                {title}
              </span>
              <span className="col-start-2 text-body-sm text-offwhite/55 sm:col-start-auto">
                {description}
              </span>
              {itemIndex < journey.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.15rem] mt-12 h-5 w-px bg-brand-cyan/45 sm:left-[1.4rem]"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <figcaption id="hero-flow-caption" className="sr-only">
        Jornada que transforma intenção em contexto, organização e atendimento
        humano mais preparado.
      </figcaption>
    </figure>
  );
}

const comparison = [
  {
    label: "Antes",
    title: "Contexto fragmentado",
    items: ["Perguntas repetidas", "Trabalho manual", "Informação dispersa"],
    className: "bg-surface-warm",
  },
  {
    label: "Atrium",
    title: "Estrutura proporcional",
    items: ["Jornada clara", "Fluxo e regras", "Tecnologia na medida"],
    className: "bg-surface-cyan",
  },
  {
    label: "Depois",
    title: "Atendimento preparado",
    items: [
      "Contexto organizado",
      "Menos repetição",
      "Humano no momento certo",
    ],
    className: "bg-navy-950 text-offwhite",
  },
] as const;

export function OperationComparison() {
  return (
    <div className="relative grid overflow-hidden rounded-[1rem] border border-navy-950/10 shadow-[var(--shadow-project)] lg:grid-cols-3">
      {comparison.map((stage, index) => (
        <article
          key={stage.label}
          className={`${stage.className} relative min-h-80 p-7 sm:p-9`}
        >
          <div className="flex items-center justify-between gap-4">
            <p
              className={`text-eyebrow font-bold tracking-[0.14em] uppercase ${
                index === 2 ? "text-accent-on-dark" : "text-brand-blue-deep"
              }`}
            >
              {stage.label}
            </p>
            <span
              className={index === 2 ? "text-offwhite/35" : "text-navy-950/25"}
            >
              0{index + 1}
            </span>
          </div>
          <h3 className="mt-12 max-w-xs font-serif text-h3">{stage.title}</h3>
          <ul
            className={`mt-8 space-y-3 text-body-sm ${index === 2 ? "text-offwhite/68" : "text-gray-text"}`}
          >
            {stage.items.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={
                    index === 2 ? "text-accent-on-dark" : "text-brand-blue"
                  }
                >
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
          {index < comparison.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute right-5 bottom-5 z-10 flex size-9 items-center justify-center rounded-full border border-navy-950/15 bg-white text-navy-950 lg:top-1/2 lg:-right-[1.15rem] lg:bottom-auto lg:-translate-y-1/2"
            >
              →
            </span>
          ) : null}
        </article>
      ))}
    </div>
  );
}
