import type { EvidenceId } from "./evidence";
import {
  listAnswer,
  selectionCount,
  stringAnswer,
  type DiagnosticState,
  type OpportunityDimension,
} from "./types";

export type InsightDefinition = Readonly<{
  id: string;
  dimension: OpportunityDimension;
  title: string;
  summary: string;
  whyItMatters: string;
  whatToEvaluate: string;
  evidenceIds: readonly EvidenceId[];
  priority: number;
  applies: (state: DiagnosticState) => boolean;
}>;

const answerIn = (state: DiagnosticState, id: string, values: string[]) =>
  values.includes(stringAnswer(state, id) ?? "");

const selectedAny = (state: DiagnosticState, id: string, values: string[]) =>
  listAnswer(state, id).some((value) => values.includes(value));

const yesOrSometimes = (state: DiagnosticState, id: string) =>
  answerIn(state, id, ["YES", "SOMETIMES"]);

export const insightLibrary: readonly InsightDefinition[] = [
  {
    id: "automation_manual_transfer",
    dimension: "automation",
    title: "Automatizar a transferência de informações",
    summary:
      "Há sinais de que a mesma informação percorre etapas manuais antes de chegar ao lugar certo.",
    whyItMatters:
      "Reduzir cópias e recadastros tende a diminuir retrabalho, atrasos e divergências entre fontes.",
    whatToEvaluate:
      "Mapear a origem, o destino, as regras e as exceções antes de automatizar o fluxo.",
    evidenceIds: [
      "manual_transfer",
      "daily_process",
      "multiple_people",
      "monthly_effort",
      "manual_errors",
    ],
    priority: 100,
    applies: (state) =>
      answerIn(state, "A001", ["COPY_REGISTER", "MOVE_DATA"]) ||
      answerIn(state, "A005", ["FREQUENTLY", "SOMETIMES"]) ||
      answerIn(state, "I002", ["FREQUENTLY", "SOMETIMES"]) ||
      yesOrSometimes(state, "D003"),
  },
  {
    id: "automation_repetitive_work",
    dimension: "automation",
    title: "Reduzir esforço em tarefas recorrentes",
    summary:
      "A rotina contém uma atividade repetitiva que merece ser medida e redesenhada antes de receber tecnologia.",
    whyItMatters:
      "Uma sequência frequente e previsível pode devolver tempo à equipe sem retirar o controle das exceções.",
    whatToEvaluate:
      "Documentar gatilhos, passos, responsáveis, volume e pontos em que uma decisão humana continua necessária.",
    evidenceIds: [
      "recurrent_task",
      "daily_process",
      "monthly_effort",
      "multiple_people",
      "clear_rules",
    ],
    priority: 80,
    applies: (state) =>
      Boolean(stringAnswer(state, "A001")) ||
      yesOrSometimes(state, "D005") ||
      yesOrSometimes(state, "D006"),
  },
  {
    id: "automation_key_person",
    dimension: "automation",
    title: "Transformar conhecimento individual em processo",
    summary:
      "Parte da operação depende de uma pessoa específica saber como conduzir o trabalho.",
    whyItMatters:
      "Tornar o fluxo explícito reduz gargalos e cria uma base mais segura para padronização ou automação.",
    whatToEvaluate:
      "Registrar decisões, exceções e critérios usados hoje pela pessoa que concentra esse conhecimento.",
    evidenceIds: ["key_person", "recurrent_task", "manual_errors"],
    priority: 70,
    applies: (state) =>
      answerIn(state, "A006", ["YES", "PARTLY"]) ||
      yesOrSometimes(state, "D008"),
  },
  {
    id: "integration_disconnected_tools",
    dimension: "integration",
    title: "Conectar ferramentas e reduzir pontes manuais",
    summary:
      "Dados importantes estão distribuídos entre ferramentas que exigem consulta ou transferência manual.",
    whyItMatters:
      "Uma integração bem delimitada pode preservar ferramentas úteis e reduzir inconsistência sem reconstruir toda a operação.",
    whatToEvaluate:
      "Definir quais dados precisam circular, em que direção, com qual frequência e qual sistema será a fonte confiável.",
    evidenceIds: [
      "disconnected_tools",
      "manual_transfer",
      "daily_process",
      "spreadsheets",
      "whatsapp_operation",
    ],
    priority: 100,
    applies: (state) =>
      selectionCount(state, "I001") >= 2 ||
      answerIn(state, "I002", ["FREQUENTLY", "SOMETIMES"]) ||
      stringAnswer(state, "SW001") === "MULTIPLE_SYSTEMS" ||
      yesOrSometimes(state, "D007") ||
      yesOrSometimes(state, "D010") ||
      (selectionCount(state, "Q005") >= 3 &&
        selectedAny(state, "Q005", ["SPREADSHEET", "WHATSAPP"])),
  },
  {
    id: "sales_follow_up",
    dimension: "sales",
    title: "Estruturar o acompanhamento de oportunidades",
    summary:
      "O avanço comercial depende de acompanhamento manual ou acontece sem uma cadência clara.",
    whyItMatters:
      "Visibilidade e próximos passos definidos reduzem oportunidades esquecidas sem tornar a conversa impessoal.",
    whatToEvaluate:
      "Organizar etapas, responsáveis, lembretes e critérios de passagem, mantendo intervenção humana nos contatos relevantes.",
    evidenceIds: [
      "manual_follow_up",
      "manual_lead_record",
      "slow_response",
      "whatsapp_operation",
    ],
    priority: 100,
    applies: (state) =>
      answerIn(state, "S004", ["PERSON_DEPENDENT", "ALMOST_NONE"]),
  },
  {
    id: "sales_response_and_qualification",
    dimension: "sales",
    title: "Acelerar resposta e qualificação comercial",
    summary:
      "Há espaço para organizar a entrada de contatos e antecipar as informações necessárias para uma boa conversa.",
    whyItMatters:
      "Uma resposta consistente e uma qualificação simples ajudam a equipe a priorizar sem prometer atendimento automático para todos os casos.",
    whatToEvaluate:
      "Revisar canais de entrada, dados mínimos, tempo de resposta e encaminhamento para cada tipo de oportunidade.",
    evidenceIds: [
      "slow_response",
      "weak_qualification",
      "manual_lead_record",
      "whatsapp_operation",
    ],
    priority: 90,
    applies: (state) =>
      answerIn(state, "S002", ["SAME_DAY", "OVER_DAY", "UNKNOWN"]) ||
      answerIn(state, "S003", ["PARTIAL", "NO"]),
  },
  {
    id: "sales_context_handoff",
    dimension: "sales",
    title: "Preservar contexto entre venda e atendimento",
    summary:
      "Informações reunidas durante a venda não chegam completas à próxima etapa da jornada.",
    whyItMatters:
      "Evitar que o cliente repita sua história melhora a continuidade e reduz trabalho de redescoberta.",
    whatToEvaluate:
      "Definir um registro mínimo compartilhado e o momento em que cada informação deve acompanhar o cliente.",
    evidenceIds: ["lost_context", "manual_lead_record", "disconnected_tools"],
    priority: 85,
    applies: (state) => answerIn(state, "S006", ["PARTIAL", "REDISCOVER"]),
  },
  {
    id: "sales_channel_organization",
    dimension: "sales",
    title: "Organizar a entrada de oportunidades",
    summary:
      "Os contatos chegam por canais úteis, mas o registro ainda pode ficar disperso na rotina.",
    whyItMatters:
      "Uma visão consistente da entrada comercial facilita resposta, acompanhamento e aprendizado sobre os canais.",
    whatToEvaluate:
      "Definir onde cada contato será registrado e quais dados mínimos precisam acompanhar a oportunidade.",
    evidenceIds: [
      "manual_lead_record",
      "whatsapp_operation",
      "spreadsheets",
      "slow_response",
    ],
    priority: 60,
    applies: (state) =>
      answerIn(state, "S001", [
        "SPREADSHEET",
        "WHATSAPP",
        "EMAIL",
        "NOWHERE",
      ]) || selectedAny(state, "Q004", ["WHATSAPP"]),
  },
  {
    id: "service_repeated_questions",
    dimension: "service",
    title: "Organizar respostas para demandas recorrentes",
    summary:
      "Clientes repetem perguntas que podem ser tratadas com uma base clara e um encaminhamento bem definido.",
    whyItMatters:
      "Resolver o que é previsível libera atenção para situações que realmente exigem contexto e julgamento.",
    whatToEvaluate:
      "Agrupar temas recorrentes, validar respostas e definir quando a conversa precisa passar para uma pessoa.",
    evidenceIds: [
      "repeated_questions",
      "whatsapp_operation",
      "multiple_service_channels",
      "self_service",
    ],
    priority: 100,
    applies: (state) =>
      answerIn(state, "C002", ["MANY", "SOME"]) ||
      stringAnswer(state, "A001") === "REPEATED_QUESTIONS" ||
      yesOrSometimes(state, "D004"),
  },
  {
    id: "service_preparation",
    dimension: "service",
    title: "Preparar o atendimento antes da conversa",
    summary:
      "A equipe precisa buscar informações ou receber documentos antes de conseguir conduzir parte dos atendimentos.",
    whyItMatters:
      "Coletar o contexto certo no início reduz espera e torna o atendimento mais consistente.",
    whatToEvaluate:
      "Definir informações mínimas, documentos e consultas necessárias para cada tipo de solicitação.",
    evidenceIds: [
      "cross_tool_lookup",
      "client_documents",
      "multiple_service_channels",
      "whatsapp_operation",
    ],
    priority: 90,
    applies: (state) =>
      answerIn(state, "C003", ["ALMOST_ALWAYS", "SOMETIMES"]) ||
      answerIn(state, "C004", ["FREQUENTLY", "SOMETIMES"]) ||
      answerIn(state, "C005", ["FREQUENTLY", "SOMETIMES"]),
  },
  {
    id: "service_channel_flow",
    dimension: "service",
    title: "Unificar a visão do atendimento",
    summary:
      "O atendimento atravessa vários canais e pode se beneficiar de um fluxo mais fácil de acompanhar.",
    whyItMatters:
      "Uma visão compartilhada reduz perda de contexto sem obrigar a empresa a abandonar canais que os clientes já usam.",
    whatToEvaluate:
      "Mapear canais, responsáveis, histórico necessário e regras de encaminhamento entre equipes.",
    evidenceIds: [
      "multiple_service_channels",
      "whatsapp_operation",
      "cross_tool_lookup",
      "lost_context",
    ],
    priority: 70,
    applies: (state) => selectionCount(state, "C001") >= 3,
  },
  {
    id: "digital_conversion_path",
    dimension: "digital",
    title: "Transformar o site em uma etapa útil da jornada",
    summary:
      "A presença digital ainda não sustenta com clareza a ação que a empresa espera do visitante.",
    whyItMatters:
      "Um site orientado à jornada pode gerar contexto e encaminhar oportunidades, em vez de funcionar apenas como apresentação.",
    whatToEvaluate:
      "Definir o público, a ação principal, as informações necessárias e o processo que começa depois do contato.",
    evidenceIds: [
      "site_not_generating",
      "site_action_goal",
      "manual_post_contact",
      "no_site",
    ],
    priority: 100,
    applies: (state) =>
      selectedAny(state, "W002", ["NO_CONTACTS", "UNKNOWN_RESULT"]) ||
      selectedAny(state, "W003", [
        "CONTACTS",
        "QUALIFY",
        "REQUESTS",
        "BOOKING",
        "QUOTE",
        "SELL",
        "CLIENT_AREA",
        "COLLECT",
      ]) ||
      answerIn(state, "W004", [
        "MANUAL",
        "SPREADSHEET",
        "WHATSAPP",
        "NO_PROCESS",
      ]),
  },
  {
    id: "digital_foundation",
    dimension: "digital",
    title: "Construir uma presença digital com objetivo claro",
    summary:
      "A empresa ainda não tem uma presença digital capaz de apoiar de forma consistente a jornada comercial.",
    whyItMatters:
      "Começar pelo objetivo evita investir em uma vitrine desconectada da operação e dos canais de atendimento.",
    whatToEvaluate:
      "Priorizar público, proposta, ação esperada e como cada contato seguirá dentro da empresa.",
    evidenceIds: ["no_site", "whatsapp_operation", "site_action_goal"],
    priority: 90,
    applies: (state) =>
      stringAnswer(state, "W001") === "NO" ||
      stringAnswer(state, "D009") === "NO_OR_NO_SITE",
  },
  {
    id: "software_operational_core",
    dimension: "software",
    title: "Avaliar um sistema para o núcleo da operação",
    summary:
      "Um processo importante é sustentado por recursos genéricos, fragmentados ou inteiramente manuais.",
    whyItMatters:
      "Um sistema sob medida só tende a valer o investimento quando consolida regras e rotinas que já são relevantes para o negócio.",
    whatToEvaluate:
      "Descrever usuários, etapas, permissões, exceções e o que as ferramentas atuais não conseguem resolver.",
    evidenceIds: [
      "operational_workaround",
      "defined_process",
      "spreadsheets",
      "whatsapp_operation",
      "disconnected_tools",
      "key_person",
    ],
    priority: 100,
    applies: (state) =>
      answerIn(state, "SW001", [
        "SPREADSHEET",
        "WHATSAPP",
        "MULTIPLE_SYSTEMS",
        "FULLY_MANUAL",
      ]) && answerIn(state, "SW004", ["CLEAR", "CHANGES"]),
  },
  {
    id: "software_process_visibility",
    dimension: "software",
    title: "Dar visibilidade a um processo operacional",
    summary:
      "A operação apresenta sinais de dependência de planilhas, sistemas separados ou conhecimento concentrado.",
    whyItMatters:
      "Centralizar apenas o que é essencial pode melhorar controle sem criar um sistema maior do que o problema.",
    whatToEvaluate:
      "Confirmar usuários, informações críticas e decisões que precisam ficar visíveis em um único fluxo.",
    evidenceIds: [
      "operational_workaround",
      "spreadsheets",
      "disconnected_tools",
      "key_person",
      "defined_process",
    ],
    priority: 70,
    applies: (state) =>
      stringAnswer(state, "SW001") === "SPREADSHEET" ||
      stringAnswer(state, "SW001") === "MULTIPLE_SYSTEMS" ||
      yesOrSometimes(state, "D007") ||
      yesOrSometimes(state, "D008"),
  },
  {
    id: "ai_knowledge_work",
    dimension: "ai",
    title: "Avaliar IA em uma tarefa de conhecimento delimitada",
    summary:
      "Existe uma tarefa concreta envolvendo texto, documentos ou conhecimento que pode ser testada de forma controlada.",
    whyItMatters:
      "Um recorte estreito permite medir qualidade e esforço antes de ampliar o uso de IA para decisões mais sensíveis.",
    whatToEvaluate:
      "Selecionar exemplos reais, critérios de qualidade, tratamento de dados e pontos obrigatórios de revisão humana.",
    evidenceIds: [
      "concrete_ai_task",
      "high_text_volume",
      "reusable_knowledge",
      "decision_impact",
      "no_human_review",
    ],
    priority: 100,
    applies: (state) =>
      listAnswer(state, "AI001").some((value) => value !== "UNKNOWN") &&
      (answerIn(state, "AI002", ["HIGH", "SOME"]) ||
        answerIn(state, "AI003", ["YES", "PARTIAL"])),
  },
] as const;

export function selectInsight(
  state: DiagnosticState,
  dimension: OpportunityDimension,
): InsightDefinition | undefined {
  return insightLibrary
    .filter(
      (insight) => insight.dimension === dimension && insight.applies(state),
    )
    .sort((left, right) => right.priority - left.priority)[0];
}
