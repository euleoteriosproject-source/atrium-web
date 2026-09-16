import { deriveAutomationCalculator } from "./calculator";
import {
  listAnswer,
  selectionCount,
  stringAnswer,
  type DiagnosticState,
} from "./types";

export type EvidenceId =
  | "daily_process"
  | "recurrent_task"
  | "whatsapp_operation"
  | "spreadsheets"
  | "manual_transfer"
  | "multiple_people"
  | "monthly_effort"
  | "manual_follow_up"
  | "repeated_questions"
  | "disconnected_tools"
  | "key_person"
  | "site_not_generating"
  | "no_site"
  | "site_action_goal"
  | "manual_post_contact"
  | "high_text_volume"
  | "decision_impact"
  | "concrete_ai_task"
  | "reusable_knowledge"
  | "no_human_review"
  | "slow_response"
  | "manual_lead_record"
  | "weak_qualification"
  | "lost_context"
  | "manual_errors"
  | "clear_rules"
  | "manual_documents"
  | "operational_workaround"
  | "defined_process"
  | "cross_tool_lookup"
  | "self_service"
  | "client_documents"
  | "multiple_service_channels";

export type EvidenceItem = Readonly<{
  id: EvidenceId;
  label: string;
}>;

type EvidenceDefinition = Readonly<{
  applies: (state: DiagnosticState) => boolean;
  label: string | ((state: DiagnosticState) => string);
}>;

const hasAny = (state: DiagnosticState, id: string, values: string[]) =>
  values.includes(stringAnswer(state, id) ?? "");

const hasAnySelected = (state: DiagnosticState, id: string, values: string[]) =>
  listAnswer(state, id).some((value) => values.includes(value));

const yesOrSometimes = (state: DiagnosticState, id: string) =>
  hasAny(state, id, ["YES", "SOMETIMES"]);

function formatMonthlyEffort(state: DiagnosticState) {
  const hours = deriveAutomationCalculator(state)?.estimatedMonthlyHours ?? 0;
  const formatted = hours.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  const lowerBound = stringAnswer(state, "A004") === "OVER_TWO_HOURS";
  return `Aproximadamente ${formatted}${lowerBound ? "+" : ""} horas por mês`;
}

const evidenceDefinitions: Record<EvidenceId, EvidenceDefinition> = {
  daily_process: {
    applies: (state) =>
      hasAny(state, "A002", ["DAILY", "MANY_DAILY"]) ||
      hasAny(state, "I004", ["DAILY", "MANY_DAILY"]) ||
      stringAnswer(state, "D001") === "YES",
    label: "Processo presente na rotina diária",
  },
  recurrent_task: {
    applies: (state) =>
      Boolean(stringAnswer(state, "A001")) ||
      yesOrSometimes(state, "D005") ||
      yesOrSometimes(state, "D006"),
    label: "Tarefa recorrente identificada",
  },
  whatsapp_operation: {
    applies: (state) =>
      hasAnySelected(state, "Q004", ["WHATSAPP"]) ||
      hasAnySelected(state, "Q005", ["WHATSAPP"]) ||
      hasAnySelected(state, "C001", ["WHATSAPP"]) ||
      stringAnswer(state, "S001") === "WHATSAPP" ||
      stringAnswer(state, "W004") === "WHATSAPP" ||
      stringAnswer(state, "SW001") === "WHATSAPP" ||
      yesOrSometimes(state, "D002"),
    label: "WhatsApp faz parte da operação",
  },
  spreadsheets: {
    applies: (state) =>
      hasAnySelected(state, "Q005", ["SPREADSHEET"]) ||
      stringAnswer(state, "S001") === "SPREADSHEET" ||
      stringAnswer(state, "W004") === "SPREADSHEET" ||
      stringAnswer(state, "SW001") === "SPREADSHEET" ||
      yesOrSometimes(state, "D001"),
    label: "Planilhas sustentam parte do processo",
  },
  manual_transfer: {
    applies: (state) =>
      hasAny(state, "A001", ["COPY_REGISTER", "MOVE_DATA"]) ||
      hasAny(state, "A005", ["FREQUENTLY", "SOMETIMES"]) ||
      hasAny(state, "I002", ["FREQUENTLY", "SOMETIMES"]) ||
      yesOrSometimes(state, "D003"),
    label: "Informações são copiadas manualmente",
  },
  multiple_people: {
    applies: (state) => {
      const answer = stringAnswer(state, "A003");
      const people = deriveAutomationCalculator(state)?.people;
      return Boolean((answer && answer !== "ONE") || (people && people > 1));
    },
    label: "Mais de uma pessoa participa",
  },
  monthly_effort: {
    applies: (state) =>
      (deriveAutomationCalculator(state)?.estimatedMonthlyHours ?? 0) > 0,
    label: formatMonthlyEffort,
  },
  manual_follow_up: {
    applies: (state) =>
      hasAny(state, "S004", ["PERSON_DEPENDENT", "ALMOST_NONE"]),
    label: "Follow-up depende de ação manual",
  },
  repeated_questions: {
    applies: (state) =>
      stringAnswer(state, "A001") === "REPEATED_QUESTIONS" ||
      hasAny(state, "C002", ["MANY", "SOME"]) ||
      yesOrSometimes(state, "D004"),
    label: "Perguntas recorrentes foram relatadas",
  },
  disconnected_tools: {
    applies: (state) =>
      selectionCount(state, "I001") >= 2 ||
      hasAny(state, "I002", ["FREQUENTLY", "SOMETIMES"]) ||
      selectionCount(state, "Q005") >= 3 ||
      stringAnswer(state, "SW001") === "MULTIPLE_SYSTEMS" ||
      yesOrSometimes(state, "D007") ||
      yesOrSometimes(state, "D010"),
    label: "Informações estão distribuídas entre ferramentas",
  },
  key_person: {
    applies: (state) =>
      hasAny(state, "A006", ["YES", "PARTLY"]) || yesOrSometimes(state, "D008"),
    label: "Processo depende de conhecimento individual",
  },
  site_not_generating: {
    applies: (state) =>
      hasAnySelected(state, "W002", ["NO_CONTACTS", "UNKNOWN_RESULT"]) ||
      stringAnswer(state, "D009") === "PARTIAL",
    label: "Site gera pouco resultado ou não é mensurado",
  },
  no_site: {
    applies: (state) =>
      stringAnswer(state, "W001") === "NO" ||
      stringAnswer(state, "D009") === "NO_OR_NO_SITE",
    label: "Presença digital ainda não cobre essa necessidade",
  },
  site_action_goal: {
    applies: (state) =>
      hasAnySelected(state, "W003", [
        "CONTACTS",
        "QUALIFY",
        "REQUESTS",
        "BOOKING",
        "QUOTE",
        "SELL",
        "CLIENT_AREA",
        "COLLECT",
      ]),
    label: "Site precisa apoiar uma ação de negócio",
  },
  manual_post_contact: {
    applies: (state) =>
      hasAny(state, "W004", [
        "MANUAL",
        "SPREADSHEET",
        "WHATSAPP",
        "NO_PROCESS",
      ]),
    label: "Contato recebido segue por processo manual",
  },
  high_text_volume: {
    applies: (state) => stringAnswer(state, "AI002") === "HIGH",
    label: "Existe alto volume de texto ou documentos",
  },
  decision_impact: {
    applies: (state) => hasAny(state, "AI004", ["HIGH", "SOME"]),
    label: "Erros podem afetar decisões relevantes",
  },
  concrete_ai_task: {
    applies: (state) =>
      listAnswer(state, "AI001").some((value) => value !== "UNKNOWN"),
    label: "Há uma tarefa concreta para avaliar",
  },
  reusable_knowledge: {
    applies: (state) => hasAny(state, "AI003", ["YES", "PARTIAL"]),
    label: "Existem exemplos ou conhecimento reutilizável",
  },
  no_human_review: {
    applies: (state) => stringAnswer(state, "AI005") === "NO",
    label: "Não há revisão humana prevista",
  },
  slow_response: {
    applies: (state) =>
      hasAny(state, "S002", ["SAME_DAY", "OVER_DAY", "UNKNOWN"]),
    label: "Resposta comercial pode demorar",
  },
  manual_lead_record: {
    applies: (state) =>
      hasAny(state, "S001", ["SPREADSHEET", "WHATSAPP", "EMAIL", "NOWHERE"]),
    label: "Registro de oportunidades é manual ou disperso",
  },
  weak_qualification: {
    applies: (state) => hasAny(state, "S003", ["PARTIAL", "NO"]),
    label: "Qualificação ainda não está totalmente estruturada",
  },
  lost_context: {
    applies: (state) => hasAny(state, "S006", ["PARTIAL", "REDISCOVER"]),
    label: "Contexto se perde entre venda e atendimento",
  },
  manual_errors: {
    applies: (state) => hasAny(state, "A007", ["FREQUENTLY", "SOMETIMES"]),
    label: "Há erros, esquecimentos ou retrabalho",
  },
  clear_rules: {
    applies: (state) => yesOrSometimes(state, "D006"),
    label: "A tarefa segue regras reconhecíveis",
  },
  manual_documents: {
    applies: (state) =>
      stringAnswer(state, "A001") === "GENERATE_DOCUMENTS" ||
      yesOrSometimes(state, "D005"),
    label: "Documentos ou relatórios são produzidos manualmente",
  },
  operational_workaround: {
    applies: (state) =>
      hasAny(state, "SW001", [
        "SPREADSHEET",
        "WHATSAPP",
        "PAPER_DOCUMENTS",
        "GENERIC_SYSTEM",
        "MULTIPLE_SYSTEMS",
        "FULLY_MANUAL",
      ]),
    label: (state) => {
      const labels: Record<string, string> = {
        SPREADSHEET: "Planilhas substituem parte do sistema",
        WHATSAPP: "Processos são conduzidos pelo WhatsApp",
        PAPER_DOCUMENTS: "Papel e documentos sustentam o processo",
        GENERIC_SYSTEM: "Uma ferramenta genérica sustenta o processo",
        MULTIPLE_SYSTEMS: "Vários sistemas separados sustentam o processo",
        FULLY_MANUAL: "O processo é conduzido manualmente",
      };
      return labels[stringAnswer(state, "SW001") ?? ""];
    },
  },
  defined_process: {
    applies: (state) => hasAny(state, "SW004", ["CLEAR", "CHANGES"]),
    label: "O processo já pode ser descrito",
  },
  cross_tool_lookup: {
    applies: (state) => hasAny(state, "C005", ["FREQUENTLY", "SOMETIMES"]),
    label: "Atendimento exige consulta a outros sistemas",
  },
  self_service: {
    applies: (state) => hasAny(state, "C006", ["YES", "MAYBE"]),
    label: "Há demanda por autoatendimento",
  },
  client_documents: {
    applies: (state) => hasAny(state, "C004", ["FREQUENTLY", "SOMETIMES"]),
    label: "Clientes enviam documentos ou informações",
  },
  multiple_service_channels: {
    applies: (state) => selectionCount(state, "C001") >= 3,
    label: "Atendimento acontece em vários canais",
  },
};

export const evidenceIds = Object.freeze(
  Object.keys(evidenceDefinitions) as EvidenceId[],
);

export function collectEvidence(
  state: DiagnosticState,
  evidenceIds: readonly EvidenceId[],
  limit = 4,
): EvidenceItem[] {
  return evidenceIds
    .filter((id, index) => evidenceIds.indexOf(id) === index)
    .filter((id) => evidenceDefinitions[id].applies(state))
    .slice(0, limit)
    .map((id) => {
      const label = evidenceDefinitions[id].label;
      return {
        id,
        label: typeof label === "function" ? label(state) : label,
      };
    });
}
