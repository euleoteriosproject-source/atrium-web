const organizationLayers = ["Regras", "Dados", "Fluxo"] as const;

export function HeroOperationalFlow() {
  return (
    <figure className="hero-flow relative mx-auto w-full max-w-2xl" aria-labelledby="hero-flow-caption">
      <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgb(39_200_245_/_0.14),transparent_62%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.125rem] border border-offwhite/15 bg-navy-800/72 p-4 shadow-[var(--shadow-feature)] sm:p-6">
        <div aria-hidden="true" className="flow-grid absolute inset-0 opacity-20" />
        <div className="relative flex items-center justify-between gap-4 border-b border-offwhite/12 pb-4">
          <span className="text-eyebrow font-bold tracking-[0.14em] text-accent-on-dark uppercase">Jornada operacional</span>
          <span className="flex items-center gap-2 text-caption text-offwhite/55"><span className="size-1.5 rounded-full bg-accent-on-dark shadow-[0_0_0_4px_rgb(39_200_245_/_0.12)]" />contexto em movimento</span>
        </div>
        <div className="relative mt-5 grid gap-4 sm:grid-cols-[0.72fr_1.28fr] sm:items-center">
          <div className="grid gap-3">
            <div className="flow-surface rounded-xl border border-offwhite/14 bg-navy-950/72 p-4">
              <span className="text-caption font-bold text-accent-on-dark">01</span>
              <p className="mt-2 font-semibold text-offwhite">Intenção</p>
              <p className="mt-1 text-caption text-offwhite/55">O que a pessoa precisa</p>
            </div>
            <div className="flow-surface rounded-xl border border-offwhite/14 bg-navy-950/72 p-4">
              <span className="text-caption font-bold text-accent-on-dark">02</span>
              <p className="mt-2 font-semibold text-offwhite">Contexto</p>
              <p className="mt-1 text-caption text-offwhite/55">Informação relevante</p>
            </div>
          </div>
          <div className="relative">
            <span aria-hidden="true" className="absolute top-1/2 -left-4 hidden h-px w-4 bg-brand-cyan/60 sm:block" />
            <div className="rounded-[0.95rem] border border-brand-cyan/35 bg-offwhite p-5 text-navy-950 shadow-[var(--shadow-raised)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><span className="text-caption font-bold text-brand-blue-deep">03</span><p className="mt-2 font-serif text-h4 font-semibold">Organização Atrium</p></div>
                <span aria-hidden="true" className="flow-signal mt-1 size-2 rounded-full bg-brand-cyan shadow-[0_0_0_5px_rgb(39_200_245_/_0.16)]" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {organizationLayers.map((layer) => <span key={layer} className="rounded-lg border border-navy-950/10 bg-surface-cloud px-2 py-2.5 text-center text-caption font-semibold text-navy-800">{layer}</span>)}
              </div>
            </div>
            <div className="relative mx-auto h-6 w-px bg-brand-cyan/60"><span aria-hidden="true" className="absolute -bottom-0.5 -left-[3px] size-2 rotate-45 border-r border-b border-brand-cyan" /></div>
            <div className="rounded-xl border border-brand-cyan/28 bg-navy-950/86 p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/14 text-caption font-bold text-accent-on-dark">04</span><div><p className="font-semibold text-offwhite">Atendimento</p><p className="mt-0.5 text-caption text-offwhite/55">Humano mais preparado</p></div></div>
            </div>
          </div>
        </div>
      </div>
      <figcaption id="hero-flow-caption" className="sr-only">Jornada que transforma intenção em contexto, passa pela organização de regras, dados e fluxo, e prepara o atendimento humano.</figcaption>
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
