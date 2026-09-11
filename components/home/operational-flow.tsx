const fragmentedInputs = ["WhatsApp", "Planilha", "E-mail"] as const;

export function HeroOperationalFlow() {
  return (
    <figure
      className="relative mx-auto w-full max-w-xl"
      aria-labelledby="hero-flow-caption"
    >
      <div className="absolute inset-8 rounded-full bg-gold-300/8 blur-3xl" />
      <div className="relative min-h-105 overflow-hidden rounded-card border border-offwhite/15 bg-navy-800/60 p-5 shadow-[0_28px_80px_rgb(0_0_0_/_0.2)] sm:min-h-120 sm:p-8">
        <div
          aria-hidden="true"
          className="flow-grid absolute inset-0 opacity-30"
        />
        <div className="relative grid h-full min-h-95 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:min-h-104 sm:gap-6">
          <div className="space-y-4">
            {fragmentedInputs.map((input, index) => (
              <div
                key={input}
                className="flow-node motion-section rounded-control border border-offwhite/15 bg-navy-950/65 px-3 py-3 text-caption font-semibold text-offwhite/75 transition-[border-color,transform] sm:px-4 sm:text-body-sm"
                style={{ animationDelay: `${index * 400}ms` }}
              >
                {input}
              </div>
            ))}
          </div>

          <div aria-hidden="true" className="relative h-56 w-10 sm:w-16">
            <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-gold-500/45" />
            <span className="flow-pulse absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full bg-gold-300" />
          </div>

          <div className="relative">
            <div className="rounded-card border border-gold-300/35 bg-offwhite p-4 text-navy-950 sm:p-6">
              <span className="block text-caption font-bold tracking-[0.14em] text-gray-text uppercase">
                Fluxo organizado
              </span>
              <span className="mt-3 block font-serif text-h4">
                Informação chega ao lugar certo.
              </span>
              <div className="mt-6 space-y-2" aria-hidden="true">
                <span className="block h-1.5 w-full rounded-full bg-navy-950/15" />
                <span className="block h-1.5 w-4/5 rounded-full bg-gold-500/55" />
                <span className="block h-1.5 w-3/5 rounded-full bg-navy-950/15" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption id="hero-flow-caption" className="sr-only">
        Representação de entradas fragmentadas sendo organizadas em um fluxo de
        informação claro.
      </figcaption>
    </figure>
  );
}

const beforeFlow = [
  "Cliente",
  "WhatsApp",
  "Pessoa",
  "Planilha",
  "Pessoa",
  "E-mail",
  "Sistema",
  "Outra pessoa",
] as const;

const betterFlow = [
  "Cliente",
  "Jornada digital",
  "Regras + automação",
  "Integrações",
  "Informação organizada",
  "Humano quando necessário",
] as const;

function FlowSequence({
  label,
  items,
  better = false,
}: {
  label: string;
  items: readonly string[];
  better?: boolean;
}) {
  return (
    <div className={better ? "bg-navy-950 text-offwhite" : "bg-white"}>
      <p
        className={`border-b px-5 py-4 text-eyebrow font-bold tracking-[0.14em] uppercase sm:px-7 ${
          better
            ? "border-offwhite/15 text-gold-300"
            : "border-navy-950/10 text-gray-text"
        }`}
      >
        {label}
      </p>
      <ol className="flex flex-col p-5 sm:p-7">
        {items.map((item, index) => (
          <li
            key={`${label}-${item}-${index}`}
            className="flex min-h-12 items-center gap-3"
          >
            <span
              aria-hidden="true"
              className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-caption ${
                better
                  ? "border-gold-300/45 text-gold-300"
                  : "border-navy-950/20 text-gray-text"
              }`}
            >
              {index + 1}
            </span>
            <span className="text-body-sm font-semibold">{item}</span>
            {index < items.length - 1 ? (
              <span
                aria-hidden="true"
                className={`ml-auto text-body-lg ${
                  better ? "text-gold-300" : "text-navy-950/55"
                }`}
              >
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function OperationComparison() {
  return (
    <div className="grid overflow-hidden rounded-card border border-navy-950/12 shadow-card md:grid-cols-2">
      <FlowSequence label="Hoje" items={beforeFlow} />
      <FlowSequence label="Uma operação melhor" items={betterFlow} better />
    </div>
  );
}
