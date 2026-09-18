import type { Goal } from "@/domain/diagnostic/types";

export type SolutionDefinition = Readonly<{
  slug: string;
  index: string;
  eyebrow: string;
  title: string;
  summary: string;
  problem: string;
  signs: readonly string[];
  situations: readonly string[];
  capabilities: readonly string[];
  smallerOption: Readonly<{
    title: string;
    description: string;
  }>;
  outcome: string;
  trust: Readonly<{
    title: string;
    description: string;
  }>;
  goal: Goal;
  cta: string;
}>;

export const solutions = [
  {
    slug: "sites-e-portais",
    index: "01",
    eyebrow: "Sites & Experiências Digitais",
    title: "Um site pode fazer mais do que apresentar sua empresa.",
    summary:
      "Criamos experiências digitais que explicam valor, organizam jornadas e conectam o interesse do visitante ao próximo passo da operação.",
    problem:
      "Quando a presença digital não representa a empresa, não orienta o visitante ou termina em um contato sem contexto, o site existe sem cumprir um papel comercial claro.",
    signs: [
      "O site quase não gera contatos ou pedidos úteis.",
      "A experiência no celular dificulta leitura e ação.",
      "A empresa mudou, mas o site ficou para trás.",
      "Cada novo contato exige descobrir todo o contexto novamente.",
    ],
    situations: [
      "Site institucional com uma proposta de valor mais clara",
      "Landing page conectada a uma campanha ou oferta",
      "Jornada de qualificação antes do atendimento",
      "Solicitação de orçamento, agendamento ou cadastro",
      "Portal simples para organizar uma interação recorrente",
    ],
    capabilities: [
      "Arquitetura de informação e conteúdo",
      "Experiência responsiva e acessível",
      "Formulários e jornadas guiadas",
      "Integração com processos de atendimento e vendas",
      "Performance, segurança e base técnica sustentável",
    ],
    smallerOption: {
      title: "Nem sempre é preciso reconstruir tudo.",
      description:
        "Às vezes, uma página bem desenhada, um fluxo de contato melhor ou uma integração pontual resolve a parte mais importante antes de um projeto maior.",
    },
    outcome:
      "Uma presença digital que aumenta clareza e confiança, captura contexto útil e conduz o visitante para uma ação coerente.",
    trust: {
      title: "Experiência precisa funcionar além da aparência.",
      description:
        "Tratamos acessibilidade, desempenho, privacidade e comportamento mobile como parte do produto — não como acabamento.",
    },
    goal: "WEBSITE",
    cta: "Diagnóstico gratuito",
  },
  {
    slug: "automacoes-e-integracoes",
    index: "02",
    eyebrow: "Automações & Integrações",
    title:
      "Se alguém faz a mesma coisa todos os dias, vale descobrir quanto disso precisa continuar manual.",
    summary:
      "Organizamos regras, eventos e conexões entre ferramentas para reduzir trabalho repetitivo sem retirar o humano das decisões que exigem contexto.",
    problem:
      "Pessoas acabam funcionando como ponte entre planilhas, mensagens e sistemas. O processo fica lento, sujeito a esquecimento e dependente de esforço que poderia ser aplicado em trabalho de maior valor.",
    signs: [
      "A mesma informação é digitada ou copiada mais de uma vez.",
      "Lembretes e acompanhamentos dependem da memória da equipe.",
      "Ferramentas do mesmo processo não compartilham dados.",
      "Relatórios e documentos seguem uma rotina previsível e manual.",
    ],
    situations: [
      "Formulário enviando dados organizados para um CRM",
      "Lead distribuído para o atendimento adequado",
      "Pedido ou status sincronizado com um ERP",
      "Documento gerado a partir de informações validadas",
      "Planilha consolidada em um painel operacional",
      "Sistema A mantendo o sistema B atualizado",
    ],
    capabilities: [
      "Mapeamento do processo e de suas exceções",
      "Automações baseadas em regras claras",
      "Integrações por API e webhooks",
      "Notificações e sincronização operacional",
      "Rastreabilidade e tratamento seguro de falhas",
    ],
    smallerOption: {
      title: "Automação não exige um sistema novo por padrão.",
      description:
        "Uma regra, um formulário ou a conexão entre duas ferramentas existentes pode remover o principal gargalo com menos custo e mudança operacional.",
    },
    outcome:
      "Menos transferência manual, menos etapas esquecidas e informação disponível onde a equipe realmente precisa trabalhar.",
    trust: {
      title: "Automatizar também exige limites.",
      description:
        "Fluxos importantes precisam de validação, rastreabilidade, tratamento de exceções e intervenção humana quando a consequência justifica.",
    },
    goal: "AUTOMATION",
    cta: "Diagnóstico gratuito",
  },
  {
    slug: "sistemas-sob-medida",
    index: "03",
    eyebrow: "Sistemas sob Medida",
    title: "Quando sua operação não cabe mais em uma planilha.",
    summary:
      "Transformamos processos reais em ferramentas proporcionais à operação, começando pelo menor produto que já organiza trabalho e gera aprendizado.",
    problem:
      "Planilhas, mensagens e ferramentas genéricas começam a exigir contornos demais. A equipe perde visão do fluxo, repete controles e depende de poucas pessoas para saber o que acontece.",
    signs: [
      "O processo já existe, mas está espalhado entre ferramentas.",
      "A operação precisa de regras ou etapas que soluções genéricas não atendem.",
      "Clientes, parceiros ou equipe precisam acompanhar solicitações.",
      "Gestores não conseguem enxergar o estado real do trabalho.",
    ],
    situations: [
      "Sistema interno para solicitações e atendimento",
      "Portal de cliente ou parceiro",
      "Fluxo de aprovação e acompanhamento",
      "Painel operacional com dados organizados",
      "MVP de um produto digital com hipótese clara",
    ],
    capabilities: [
      "Descoberta e modelagem do processo existente",
      "Definição do menor escopo utilizável",
      "Interfaces para equipe, cliente ou parceiro",
      "Regras de negócio, permissões e integrações",
      "Evolução baseada no uso real",
    ],
    smallerOption: {
      title: "Software sob medida não precisa começar grande.",
      description:
        "Se uma ferramenta existente, uma automação ou um fluxo mais simples resolver a prioridade, essa deve ser a primeira recomendação.",
    },
    outcome:
      "Um fluxo centralizado, compreensível e adequado à maneira como a empresa realmente opera — sem construir complexidade antes da hora.",
    trust: {
      title: "Processo antes de código.",
      description:
        "Construir a ferramenta errada apenas digitaliza confusão. Primeiro validamos usuários, regras, dados e responsabilidade sobre cada etapa.",
    },
    goal: "SOFTWARE",
    cta: "Diagnóstico gratuito",
  },
  {
    slug: "ia-aplicada",
    index: "04",
    eyebrow: "IA Aplicada",
    title: "IA só é interessante quando melhora alguma coisa.",
    summary:
      "Avaliamos inteligência artificial como uma ferramenta para interpretar linguagem, classificar informação e apoiar pessoas — sempre com finalidade e controles claros.",
    problem:
      "Equipes lidam com mensagens, documentos e conhecimento em volume difícil de organizar. Em alguns casos, regras convencionais não conseguem interpretar esse conteúdo; em outros, IA só adicionaria custo e imprevisibilidade.",
    signs: [
      "Existe volume recorrente de texto ou mensagens para interpretar.",
      "Solicitações precisam ser classificadas antes do atendimento.",
      "Conhecimento interno é consultado ou explicado repetidamente.",
      "Pessoas extraem as mesmas informações de documentos não estruturados.",
    ],
    situations: [
      "Triagem e classificação assistida de solicitações",
      "Extração controlada de informações de textos",
      "Apoio à consulta de conhecimento interno",
      "Qualificação assistida com revisão humana",
      "Pesquisa e síntese para apoiar uma decisão",
    ],
    capabilities: [
      "Avaliação de aplicabilidade e risco",
      "Provas de conceito com critério de sucesso",
      "Fluxos com revisão e escalonamento humano",
      "Limites, validação e rastreabilidade",
      "Integração com o processo existente",
    ],
    smallerOption: {
      title: "Nem todo problema é de IA.",
      description:
        "Quando regras, integrações ou automações convencionais resolvem com mais previsibilidade e menor custo, recomendamos começar por elas.",
    },
    outcome:
      "IA aplicada a uma tarefa específica, com contexto suficiente, supervisão proporcional ao risco e uma forma objetiva de avaliar utilidade.",
    trust: {
      title: "Responsabilidade faz parte da solução.",
      description:
        "Quanto maior a consequência de um erro, mais importantes se tornam revisão humana, limites de uso, privacidade e validação dos resultados.",
    },
    goal: "AI",
    cta: "Diagnóstico gratuito",
  },
] as const satisfies readonly SolutionDefinition[];

export function getSolution(slug: SolutionDefinition["slug"]) {
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) throw new Error(`Unknown solution: ${slug}`);
  return solution;
}
