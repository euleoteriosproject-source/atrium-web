const fragmentedInputs = ["WhatsApp", "Planilha", "E-mail"] as const;

export function HeroOperationalFlow() {
  return (
    <figure className="hero-flow relative mx-auto w-full max-w-2xl" aria-labelledby="hero-flow-caption">
      <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgb(39_200_245_/_0.15),transparent_62%)] blur-2xl" />
      <div className="relative min-h-96 overflow-hidden rounded-[1.125rem] border border-offwhite/16 bg-navy-800/78 p-5 shadow-[var(--shadow-feature)] sm:min-h-105 sm:p-7">
        <div aria-hidden="true" className="flow-grid absolute inset-0 opacity-24" />
        <div className="relative flex items-center justify-between gap-4 border-b border-offwhite/12 pb-4">
          <span className="text-eyebrow font-bold tracking-[0.14em] text-accent-on-dark uppercase">Informação organizada</span>
          <span className="text-caption text-offwhite/48">do contato ao contexto</span>
        </div>
        <div className="relative mt-6 grid min-h-64 grid-cols-[0.85fr_2.75rem_1.15fr] items-center gap-3 sm:grid-cols-[0.78fr_4rem_1.22fr] sm:gap-5">
          <div className="space-y-3">
            {fragmentedInputs.map((input, index) => (
              <div
                key={input}
                className="flow-node motion-section rounded-xl border border-offwhite/16 bg-navy-950/76 px-3 py-3 text-caption font-semibold text-offwhite/78 shadow-[var(--shadow-soft)] transition-[border-color,transform] sm:px-4 sm:py-4 sm:text-body-sm"
                style={{ animationDelay: `${index * 400}ms` }}
              >
                {input}
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="relative h-52">
            <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-brand-cyan/58" />
            <span className="flow-pulse absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full bg-accent-on-dark shadow-[0_0_0_5px_rgb(39_200_245_/_0.12)]" />
            <span className="absolute top-1/2 -right-0.5 size-2 -translate-y-1/2 rotate-45 border-t border-r border-brand-cyan" />
          </div>
          <div className="rounded-[1rem] border border-brand-cyan/34 bg-offwhite p-4 text-navy-950 shadow-[var(--shadow-raised)] sm:p-6">
            <span className="block text-caption font-bold tracking-[0.14em] text-brand-blue-deep uppercase">Fluxo organizado</span>
            <span className="mt-3 block font-serif text-h4 font-semibold">Informação chega ao lugar certo.</span>
            <div className="mt-6 space-y-2.5" aria-hidden="true">
              <span className="block h-1.5 w-full rounded-full bg-navy-950/14" />
              <span className="block h-1.5 w-4/5 rounded-full bg-brand-blue/62" />
              <span className="block h-1.5 w-3/5 rounded-full bg-navy-950/14" />
            </div>
          </div>
        </div>
      </div>
      <figcaption id="hero-flow-caption" className="sr-only">WhatsApp, planilha e e-mail convergem em um fluxo organizado para que a informação chegue ao lugar certo.</figcaption>
    </figure>
  );
}

const comparison = [
  { label: "Antes", title: "Contexto fragmentado", items: ["Perguntas repetidas", "Trabalho manual", "Informação dispersa"], className: "bg-surface-warm" },
  { label: "Atrium", title: "Estrutura proporcional", items: ["Jornada clara", "Fluxo e regras", "Tecnologia na medida"], className: "bg-surface-cyan" },
  { label: "Depois", title: "Atendimento preparado", items: ["Contexto organizado", "Menos repetição", "Humano no momento certo"], className: "bg-navy-950 text-offwhite" },
] as const;

export function OperationComparison() {
  return (
    <div className="relative grid gap-4 lg:grid-cols-3">
      {comparison.map((stage, index) => (
        <article key={stage.label} className={`${stage.className} relative min-h-80 rounded-[1rem] border border-navy-950/10 p-7 shadow-[var(--shadow-raised)] sm:p-9`}>
          <div className="flex items-center justify-between gap-4"><p className={`text-eyebrow font-bold tracking-[0.14em] uppercase ${index === 2 ? "text-accent-on-dark" : "text-brand-blue-deep"}`}>{stage.label}</p><span className={index === 2 ? "text-offwhite/35" : "text-navy-950/25"}>0{index + 1}</span></div>
          <h3 className="mt-12 max-w-xs font-serif text-h3">{stage.title}</h3>
          <ul className={`mt-8 space-y-3 text-body-sm ${index === 2 ? "text-offwhite/68" : "text-gray-text"}`}>
            {stage.items.map((item) => <li key={item} className="flex items-center gap-3"><span aria-hidden="true" className={index === 2 ? "text-accent-on-dark" : "text-brand-blue"}>—</span>{item}</li>)}
          </ul>
          {index < comparison.length - 1 ? <span aria-hidden="true" className="absolute -bottom-7 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border border-navy-950/12 bg-white text-navy-950 shadow-[var(--shadow-soft)] lg:top-1/2 lg:-right-7 lg:bottom-auto lg:left-auto lg:translate-x-0 lg:-translate-y-1/2">→</span> : null}
        </article>
      ))}
    </div>
  );
}
