import type { Goal, QuestionDefinition, QuestionOption } from "./types";

const option = (value: string, label: string): QuestionOption => ({
  value,
  label,
});

export const goalOptions = [
  option("SALES", "Atrair mais clientes"),
  option("CONVERSION", "Converter mais oportunidades em vendas"),
  option("AUTOMATION", "Reduzir trabalho manual"),
  option("SERVICE", "Melhorar atendimento"),
  option("WEBSITE", "Criar ou melhorar meu site"),
  option("SOFTWARE", "Criar um sistema"),
  option("INTEGRATION", "Integrar ferramentas"),
  option("AI", "Usar inteligência artificial"),
  option("DISCOVERY", "Quero descobrir oportunidades"),
] as const satisfies readonly QuestionOption[];

export const universalQuestions = [
  {
    id: "Q001",
    kind: "multi",
    title: "O que você mais gostaria de melhorar hoje?",
    description:
      "Você pode marcar mais de uma opção. Selecione também qual delas é a prioridade agora.",
    options: goalOptions,
    minSelections: 1,
  },
  {
    id: "Q002",
    kind: "single",
    title: "Qual é o tipo do seu negócio?",
    options: [
      option("SERVICES", "Serviços"),
      option("REAL_ESTATE", "Imobiliário"),
      option("FINANCE", "Financeiro / Crédito"),
      option("EDUCATION", "Educação"),
      option("HEALTH", "Saúde"),
      option("COMMERCE", "Comércio"),
      option("INDUSTRY", "Indústria"),
      option("TECHNOLOGY", "Tecnologia"),
      option("INDEPENDENT", "Profissional liberal"),
      option("CONSTRUCTION", "Construção / Engenharia"),
      option("LOGISTICS", "Logística"),
      option("OTHER", "Outro"),
    ],
    otherOptionValue: "OTHER",
  },
  {
    id: "Q003",
    kind: "single",
    title: "Quantas pessoas trabalham na operação?",
    options: [
      option("ONE", "1"),
      option("TWO_TO_FIVE", "2–5"),
      option("SIX_TO_TWENTY", "6–20"),
      option("TWENTY_ONE_TO_FIFTY", "21–50"),
      option("FIFTY_ONE_PLUS", "51+"),
    ],
  },
  {
    id: "Q004",
    kind: "multi",
    title: "Como os clientes normalmente chegam até vocês?",
    description: "Marque todos os canais que fazem parte da rotina.",
    options: [
      option("WHATSAPP", "WhatsApp"),
      option("INSTAGRAM", "Instagram"),
      option("GOOGLE", "Google"),
      option("WEBSITE", "Site"),
      option("REFERRAL", "Indicação"),
      option("PHONE", "Telefone"),
      option("MARKETPLACE", "Marketplace"),
      option("SALES_TEAM", "Equipe comercial"),
      option("OTHER", "Outro"),
    ],
    minSelections: 1,
    otherOptionValue: "OTHER",
  },
  {
    id: "Q005",
    kind: "multi",
    title: "Quais ferramentas fazem parte da rotina?",
    description: "Marque todas as que são usadas com frequência.",
    options: [
      option("WHATSAPP", "WhatsApp"),
      option("SPREADSHEET", "Excel / Google Sheets"),
      option("EMAIL", "E-mail"),
      option("CRM", "CRM"),
      option("ERP", "ERP"),
      option("CUSTOM_SYSTEM", "Sistema próprio"),
      option("WORK_MANAGEMENT", "Trello / Notion / similares"),
      option("FORMS", "Google Forms / formulários"),
      option("OTHER", "Outro"),
    ],
    minSelections: 1,
    otherOptionValue: "OTHER",
  },
] as const satisfies readonly QuestionDefinition[];

export const automationQuestions = [
  {
    id: "A001",
    kind: "single",
    title: "Qual dessas situações mais consome tempo hoje?",
    options: [
      option("COPY_REGISTER", "Copiar ou cadastrar informações"),
      option("UPDATE_SPREADSHEETS", "Atualizar planilhas"),
      option("REPEATED_QUESTIONS", "Responder perguntas repetidas"),
      option("GENERATE_DOCUMENTS", "Gerar documentos / propostas"),
      option("SEND_MESSAGES", "Enviar mensagens / lembretes"),
      option("CHECK_INFORMATION", "Conferir informações"),
      option("REPORTS", "Criar relatórios"),
      option("MOVE_DATA", "Mover dados entre ferramentas"),
      option("OTHER", "Outra tarefa repetitiva"),
    ],
    otherOptionValue: "OTHER",
  },
  {
    id: "A002",
    kind: "single",
    title: "Com que frequência isso acontece?",
    options: [
      option("MONTHLY", "Algumas vezes por mês"),
      option("WEEKLY", "Toda semana"),
      option("DAILY", "Todos os dias"),
      option("MANY_DAILY", "Várias vezes ao dia"),
    ],
  },
  {
    id: "A003",
    kind: "single",
    title: "Quantas pessoas participam desse processo?",
    options: [
      option("ONE", "1 pessoa"),
      option("TWO_TO_THREE", "2–3 pessoas"),
      option("FOUR_TO_SIX", "4–6 pessoas"),
      option("SEVEN_PLUS", "7+ pessoas"),
    ],
  },
  {
    id: "A004",
    kind: "single",
    title:
      "Quanto tempo aproximadamente cada pessoa dedica a isso em um dia em que a tarefa acontece?",
    options: [
      option("UNDER_15", "Menos de 15 min"),
      option("FIFTEEN_TO_THIRTY", "15–30 min"),
      option("THIRTY_TO_SIXTY", "30–60 min"),
      option("ONE_TO_TWO_HOURS", "1–2 h"),
      option("OVER_TWO_HOURS", "Mais de 2 h"),
    ],
  },
  {
    id: "A005",
    kind: "single",
    title: "As informações precisam ser copiadas de um lugar para outro?",
    options: [
      option("FREQUENTLY", "Sim, com frequência"),
      option("SOMETIMES", "Às vezes"),
      option("NO", "Não"),
    ],
  },
  {
    id: "A006",
    kind: "single",
    title:
      "Esse processo depende muito de uma pessoa específica saber como fazer?",
    options: [
      option("YES", "Sim"),
      option("PARTLY", "Em parte"),
      option("NO", "Não"),
    ],
  },
  {
    id: "A007",
    kind: "single",
    title: "Erros, esquecimentos ou retrabalho acontecem nesse processo?",
    options: [
      option("FREQUENTLY", "Com frequência"),
      option("SOMETIMES", "Às vezes"),
      option("RARELY", "Raramente / nunca"),
    ],
  },
] as const satisfies readonly QuestionDefinition[];

export const salesQuestions = [
  {
    id: "S001",
    kind: "single",
    title:
      "Quando alguém demonstra interesse, onde essa oportunidade fica registrada?",
    options: [
      option("CRM", "CRM"),
      option("SPREADSHEET", "Planilha"),
      option("WHATSAPP", "WhatsApp"),
      option("EMAIL", "E-mail"),
      option("CUSTOM_SYSTEM", "Sistema próprio"),
      option("NOWHERE", "Não existe um lugar definido"),
    ],
  },
  {
    id: "S002",
    kind: "single",
    title:
      "Quanto tempo normalmente leva para alguém responder um novo interessado?",
    options: [
      option("IMMEDIATE", "Quase imediato"),
      option("WITHIN_HOUR", "Até 1 hora"),
      option("SAME_DAY", "No mesmo dia"),
      option("OVER_DAY", "Pode levar mais de um dia"),
      option("UNKNOWN", "Não sabemos"),
    ],
  },
  {
    id: "S003",
    kind: "single",
    title:
      "Existe alguma qualificação antes de a oportunidade chegar ao vendedor ou responsável?",
    options: [
      option("STRUCTURED", "Sim, estruturada"),
      option("PARTIAL", "Parcialmente"),
      option("NO", "Não"),
    ],
  },
  {
    id: "S004",
    kind: "single",
    title:
      "O acompanhamento de quem ainda não decidiu acontece de forma estruturada?",
    options: [
      option("DEFINED", "Sim, com processo definido"),
      option("PERSON_DEPENDENT", "Depende de cada pessoa"),
      option("ALMOST_NONE", "Quase não fazemos"),
    ],
  },
  {
    id: "S005",
    kind: "single",
    title: "Vocês conseguem saber quantas oportunidades viram clientes?",
    options: [
      option("YES", "Sim"),
      option("PARTIAL", "Parcialmente"),
      option("NO", "Não"),
    ],
  },
  {
    id: "S006",
    kind: "single",
    title:
      "Quando alguém assume uma oportunidade, normalmente já recebe o contexto necessário?",
    options: [
      option("YES", "Sim"),
      option("PARTIAL", "Parte do contexto"),
      option("REDISCOVER", "Precisa descobrir quase tudo novamente"),
    ],
  },
] as const satisfies readonly QuestionDefinition[];

export const serviceQuestions = [
  {
    id: "C001",
    kind: "multi",
    title: "Onde os clientes mais entram em contato?",
    options: [
      option("WHATSAPP", "WhatsApp"),
      option("EMAIL", "E-mail"),
      option("PHONE", "Telefone"),
      option("INSTAGRAM", "Instagram"),
      option("WEBSITE", "Site"),
      option("PORTAL", "Portal / sistema"),
      option("OTHER", "Outro"),
    ],
    minSelections: 1,
    otherOptionValue: "OTHER",
  },
  {
    id: "C002",
    kind: "single",
    title: "Existem perguntas que sua equipe responde repetidamente?",
    options: [
      option("MANY", "Sim, muitas"),
      option("SOME", "Algumas"),
      option("FEW", "Poucas / não"),
    ],
  },
  {
    id: "C003",
    kind: "single",
    title:
      "Antes de atender de verdade, sua equipe precisa fazer várias perguntas para entender o contexto?",
    options: [
      option("ALMOST_ALWAYS", "Sim, quase sempre"),
      option("SOMETIMES", "Às vezes"),
      option("NO", "Não"),
    ],
  },
  {
    id: "C004",
    kind: "single",
    title:
      "O cliente precisa enviar informações ou documentos antes de o atendimento continuar?",
    options: [
      option("FREQUENTLY", "Com frequência"),
      option("SOMETIMES", "Às vezes"),
      option("NO", "Não"),
    ],
  },
  {
    id: "C005",
    kind: "single",
    title:
      "Durante o atendimento, a equipe precisa consultar outra ferramenta para responder?",
    options: [
      option("FREQUENTLY", "Com frequência"),
      option("SOMETIMES", "Às vezes"),
      option("NO", "Não"),
    ],
  },
  {
    id: "C006",
    kind: "single",
    title:
      "Parte das solicitações poderia ser resolvida sem intervenção humana se as regras e informações estivessem organizadas?",
    options: [
      option("YES", "Sim"),
      option("MAYBE", "Talvez"),
      option("NO_OR_UNKNOWN", "Não / não sei"),
    ],
  },
] as const satisfies readonly QuestionDefinition[];

export const websiteQuestions = [
  {
    id: "W001",
    kind: "single",
    title: "Sua empresa já possui site?",
    options: [
      option("YES", "Sim"),
      option("NO", "Não"),
      option("IN_PROGRESS", "Está sendo criado"),
    ],
  },
  {
    id: "W002",
    kind: "multi",
    title: "O que mais incomoda no site atual?",
    options: [
      option("NO_CONTACTS", "Não gera contatos"),
      option("VISUAL", "Visual não representa a empresa"),
      option("HARD_TO_UPDATE", "Difícil atualizar"),
      option("SLOW", "É lento"),
      option("BAD_MOBILE", "Ruim no celular"),
      option("NOT_FOUND", "Não aparece bem nas buscas"),
      option("NO_INTEGRATION", "Não integra com nenhum processo"),
      option("UNKNOWN_RESULT", "Não sabemos se gera resultado"),
      option("OTHER", "Outro"),
    ],
    minSelections: 1,
    otherOptionValue: "OTHER",
    condition: { questionId: "W001", includes: "YES" },
  },
  {
    id: "W003",
    kind: "multi",
    title: "O que você gostaria que o site fizesse pelo negócio?",
    options: [
      option("PRESENT", "Apresentar melhor a empresa"),
      option("CONTACTS", "Gerar contatos"),
      option("QUALIFY", "Qualificar oportunidades"),
      option("REQUESTS", "Receber pedidos/solicitações"),
      option("BOOKING", "Permitir agendamento"),
      option("QUOTE", "Gerar orçamento"),
      option("SELL", "Vender"),
      option("CLIENT_AREA", "Ter área do cliente"),
      option("COLLECT", "Coletar informações"),
      option("OTHER", "Outro"),
    ],
    minSelections: 1,
    otherOptionValue: "OTHER",
  },
  {
    id: "W004",
    kind: "single",
    title:
      "Depois que alguém entra em contato pelo site ou por outro canal, o que acontece?",
    options: [
      option("STRUCTURED", "Processo estruturado"),
      option("MANUAL", "Alguém responde manualmente e conduz"),
      option("SPREADSHEET", "Vai para uma planilha"),
      option("WHATSAPP", "Vai para WhatsApp"),
      option("NO_PROCESS", "Não existe processo definido"),
    ],
  },
] as const satisfies readonly QuestionDefinition[];

export const softwareQuestions = [
  {
    id: "SW001",
    kind: "single",
    title: "O que vocês usam hoje no lugar desse sistema?",
    options: [
      option("SPREADSHEET", "Planilhas"),
      option("WHATSAPP", "Processos no WhatsApp"),
      option("PAPER_DOCUMENTS", "Papel / documentos"),
      option("GENERIC_SYSTEM", "Ferramenta genérica"),
      option("MULTIPLE_SYSTEMS", "Vários sistemas separados"),
      option("FULLY_MANUAL", "Processo completamente manual"),
      option("OTHER", "Outro"),
    ],
    otherOptionValue: "OTHER",
  },
  {
    id: "SW002",
    kind: "multi",
    title: "Quem usaria esse sistema?",
    options: [
      option("INTERNAL", "Equipe interna"),
      option("CLIENTS", "Clientes"),
      option("PARTNERS", "Parceiros"),
      option("MANAGERS", "Gestores"),
    ],
    minSelections: 1,
  },
  {
    id: "SW003",
    kind: "text",
    title: "Qual processo esse sistema deveria organizar ou facilitar?",
    description:
      "Opcional. Não inclua senhas, dados pessoais, informações financeiras ou outros dados sensíveis.",
    optional: true,
    maxLength: 600,
  },
  {
    id: "SW004",
    kind: "single",
    title:
      "Esse processo já existe e funciona hoje, mesmo que de forma manual?",
    options: [
      option("CLEAR", "Sim, está claro"),
      option("CHANGES", "Existe, mas muda bastante"),
      option("IDEA", "Ainda é mais uma ideia do que um processo"),
    ],
  },
] as const satisfies readonly QuestionDefinition[];

export const integrationQuestions = [
  {
    id: "I001",
    kind: "multi",
    title: "Quais ferramentas precisam conversar?",
    description: "Selecione pelo menos duas ferramentas.",
    options: [
      option("WHATSAPP", "WhatsApp"),
      option("SPREADSHEET", "Excel / Google Sheets"),
      option("EMAIL", "E-mail"),
      option("CRM", "CRM"),
      option("ERP", "ERP"),
      option("CUSTOM_SYSTEM", "Sistema próprio"),
      option("WORK_MANAGEMENT", "Trello / Notion / similares"),
      option("FORMS", "Google Forms / formulários"),
      option("OTHER", "Outra ferramenta"),
    ],
    minSelections: 2,
    otherOptionValue: "OTHER",
    otherInputLabel: "Informe uma ou mais ferramentas, separadas por vírgula",
  },
  {
    id: "I002",
    kind: "single",
    title: "Hoje alguém faz manualmente a ponte entre essas ferramentas?",
    options: [
      option("FREQUENTLY", "Sim, com frequência"),
      option("SOMETIMES", "Às vezes"),
      option("NO", "Não"),
    ],
  },
  {
    id: "I003",
    kind: "single",
    title: "Que tipo de informação precisa passar de um lugar para outro?",
    options: [
      option("LEADS_CUSTOMERS", "Leads / clientes"),
      option("ORDERS", "Pedidos"),
      option("PAYMENTS", "Pagamentos / status"),
      option("DOCUMENTS", "Documentos / registros"),
      option("STOCK", "Estoque / produtos"),
      option("TASKS", "Tarefas"),
      option("REPORTS", "Relatórios"),
      option("OTHER", "Outro"),
    ],
    otherOptionValue: "OTHER",
  },
  {
    id: "I004",
    kind: "single",
    title: "Com que frequência essa troca acontece?",
    options: [
      option("MONTHLY", "Algumas vezes por mês"),
      option("WEEKLY", "Toda semana"),
      option("DAILY", "Diariamente"),
      option("MANY_DAILY", "Muitas vezes por dia"),
    ],
  },
] as const satisfies readonly QuestionDefinition[];

export const aiQuestions = [
  {
    id: "AI001",
    kind: "multi",
    title: "O que você espera que a inteligência artificial ajude a fazer?",
    options: [
      option("SERVICE_SUPPORT", "Atender ou apoiar atendimento"),
      option("ANSWER_QUESTIONS", "Responder perguntas"),
      option("ANALYZE_DOCUMENTS", "Ler/analisar documentos"),
      option("RESEARCH", "Pesquisar informações"),
      option("CONTENT", "Produzir conteúdo"),
      option("CLASSIFY", "Classificar solicitações"),
      option("QUALIFY", "Qualificar oportunidades"),
      option("STAFF_SUPPORT", "Auxiliar funcionários"),
      option("EXTRACT", "Extrair informações de textos/documentos"),
      option("DECISIONS", "Apoiar decisões"),
      option("UNKNOWN", "Ainda não sei"),
    ],
    minSelections: 1,
  },
  {
    id: "AI002",
    kind: "single",
    title:
      "Existe um volume relevante de texto, mensagens ou documentos que alguém precisa ler ou interpretar hoje?",
    options: [
      option("HIGH", "Sim, alto volume"),
      option("SOME", "Sim, algum volume"),
      option("NO", "Não"),
    ],
  },
  {
    id: "AI003",
    kind: "single",
    title:
      "Existe conhecimento interno que a equipe consulta ou explica repetidamente?",
    options: [
      option("YES", "Sim"),
      option("PARTIAL", "Em parte"),
      option("NO", "Não"),
    ],
  },
  {
    id: "AI004",
    kind: "single",
    title:
      "Uma resposta errada poderia causar impacto financeiro, jurídico, de segurança ou operacional relevante?",
    options: [
      option("HIGH", "Sim, alto impacto"),
      option("SOME", "Pode causar algum impacto"),
      option("LOW", "Baixo impacto"),
    ],
  },
  {
    id: "AI005",
    kind: "single",
    title:
      "Seria possível manter uma pessoa revisando ou assumindo os casos importantes?",
    options: [
      option("YES", "Sim"),
      option("SOMETIMES", "Em alguns casos"),
      option("NO", "Não"),
    ],
  },
] as const satisfies readonly QuestionDefinition[];

const discoveryQuestion = (
  id: string,
  title: string,
  options: readonly QuestionOption[] = [
    option("YES", "Sim"),
    option("SOMETIMES", "Às vezes"),
    option("NO", "Não"),
  ],
): QuestionDefinition => ({ id, kind: "single", title, options });

export const discoveryQuestions = [
  discoveryQuestion(
    "D001",
    "Sua equipe usa planilhas diariamente para controlar processos importantes?",
  ),
  discoveryQuestion(
    "D002",
    "WhatsApp faz parte de algum processo importante do negócio?",
  ),
  discoveryQuestion(
    "D003",
    "A mesma informação é digitada ou copiada mais de uma vez?",
  ),
  discoveryQuestion(
    "D004",
    "Clientes fazem frequentemente as mesmas perguntas?",
  ),
  discoveryQuestion(
    "D005",
    "Sua equipe cria documentos, propostas ou relatórios manualmente com frequência?",
  ),
  discoveryQuestion(
    "D006",
    "Existem tarefas recorrentes que seguem regras relativamente claras?",
  ),
  discoveryQuestion(
    "D007",
    "Informações importantes ficam espalhadas entre mensagens, planilhas e sistemas?",
  ),
  discoveryQuestion(
    "D008",
    "Algum processo depende demais de uma única pessoa saber o que fazer?",
  ),
  discoveryQuestion(
    "D009",
    "Seu site gera oportunidades que vocês conseguem acompanhar?",
    [
      option("YES", "Sim"),
      option("PARTIAL", "Parcialmente"),
      option("NO_OR_NO_SITE", "Não / não temos site"),
    ],
  ),
  discoveryQuestion(
    "D010",
    "Existem ferramentas que deveriam conversar, mas hoje não conversam?",
  ),
] as const satisfies readonly QuestionDefinition[];

export const branchQuestions: Record<Goal, readonly QuestionDefinition[]> = {
  SALES: salesQuestions,
  CONVERSION: salesQuestions,
  AUTOMATION: automationQuestions,
  SERVICE: serviceQuestions,
  WEBSITE: websiteQuestions,
  SOFTWARE: softwareQuestions,
  INTEGRATION: integrationQuestions,
  AI: aiQuestions,
  DISCOVERY: discoveryQuestions,
};

export const allQuestions = [
  ...universalQuestions,
  ...automationQuestions,
  ...salesQuestions,
  ...serviceQuestions,
  ...websiteQuestions,
  ...softwareQuestions,
  ...integrationQuestions,
  ...aiQuestions,
  ...discoveryQuestions,
] as const;

export function getQuestion(
  questionId: string,
): QuestionDefinition | undefined {
  return allQuestions.find((question) => question.id === questionId);
}
