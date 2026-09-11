import { branchQuestions, universalQuestions } from "./questions";
import {
  emptyOpportunityScores,
  listAnswer,
  selectionCount,
  stringAnswer,
  type DiagnosticState,
  type OpportunityDimension,
} from "./types";

type Scores = Record<OpportunityDimension, number>;

function add(scores: Scores, dimension: OpportunityDimension, value: number) {
  scores[dimension] += value;
}

function includes(state: DiagnosticState, id: string, value: string) {
  return listAnswer(state, id).includes(value);
}

function scoreUniversal(state: DiagnosticState, scores: Scores) {
  switch (state.primaryGoal) {
    case "SALES":
      add(scores, "sales", 2);
      add(scores, "digital", 1);
      break;
    case "CONVERSION":
      add(scores, "sales", 3);
      add(scores, "service", 1);
      break;
    case "AUTOMATION":
      add(scores, "automation", 3);
      break;
    case "SERVICE":
      add(scores, "service", 3);
      break;
    case "WEBSITE":
      add(scores, "digital", 3);
      add(scores, "sales", 1);
      break;
    case "SOFTWARE":
      add(scores, "software", 3);
      break;
    case "INTEGRATION":
      add(scores, "integration", 3);
      add(scores, "automation", 1);
      break;
    case "AI":
      add(scores, "ai", 2);
      break;
    case "DISCOVERY":
    case undefined:
      break;
  }

  if (includes(state, "Q004", "WHATSAPP")) {
    add(scores, "service", 1);
    add(scores, "sales", 1);
  }
  if (includes(state, "Q004", "WEBSITE")) add(scores, "digital", 1);

  const tools = listAnswer(state, "Q005");
  if (tools.includes("WHATSAPP") && tools.includes("SPREADSHEET")) {
    add(scores, "automation", 1);
    add(scores, "integration", 1);
  }
  if (selectionCount(state, "Q005") >= 3) add(scores, "integration", 1);
}

function scoreAutomation(state: DiagnosticState, scores: Scores) {
  const task = stringAnswer(state, "A001");
  if (task) add(scores, "automation", 2);
  if (task === "MOVE_DATA") add(scores, "integration", 2);

  const frequency = stringAnswer(state, "A002");
  if (frequency === "WEEKLY") add(scores, "automation", 1);
  if (frequency === "DAILY") add(scores, "automation", 2);
  if (frequency === "MANY_DAILY") add(scores, "automation", 3);

  const transfer = stringAnswer(state, "A005");
  if (transfer === "FREQUENTLY") {
    add(scores, "automation", 2);
    add(scores, "integration", 3);
  }
  if (transfer === "SOMETIMES") {
    add(scores, "automation", 1);
    add(scores, "integration", 1);
  }

  const dependency = stringAnswer(state, "A006");
  if (dependency === "YES") {
    add(scores, "automation", 2);
    add(scores, "software", 1);
  }
  if (dependency === "PARTLY") add(scores, "automation", 1);

  const errors = stringAnswer(state, "A007");
  if (errors === "FREQUENTLY") add(scores, "automation", 3);
  if (errors === "SOMETIMES") add(scores, "automation", 1);
}

function scoreSales(state: DiagnosticState, scores: Scores) {
  const destination = stringAnswer(state, "S001");
  if (destination === "SPREADSHEET") {
    add(scores, "sales", 1);
    add(scores, "automation", 1);
  }
  if (destination === "WHATSAPP") {
    add(scores, "sales", 1);
    add(scores, "service", 1);
  }
  if (destination === "EMAIL") add(scores, "sales", 1);
  if (destination === "NOWHERE") {
    add(scores, "sales", 3);
    add(scores, "software", 1);
  }

  const response = stringAnswer(state, "S002");
  if (response === "SAME_DAY") add(scores, "sales", 1);
  if (response === "OVER_DAY") add(scores, "sales", 3);
  if (response === "UNKNOWN") add(scores, "sales", 2);

  const qualification = stringAnswer(state, "S003");
  if (qualification === "PARTIAL") add(scores, "sales", 1);
  if (qualification === "NO") {
    add(scores, "sales", 2);
    add(scores, "automation", 1);
  }

  const followUp = stringAnswer(state, "S004");
  if (followUp === "PERSON_DEPENDENT") {
    add(scores, "sales", 2);
    add(scores, "automation", 1);
  }
  if (followUp === "ALMOST_NONE") add(scores, "sales", 3);

  const visibility = stringAnswer(state, "S005");
  if (visibility === "PARTIAL") add(scores, "sales", 1);
  if (visibility === "NO") {
    add(scores, "sales", 2);
    add(scores, "software", 1);
  }

  const handoff = stringAnswer(state, "S006");
  if (handoff === "PARTIAL") {
    add(scores, "sales", 1);
    add(scores, "service", 1);
  }
  if (handoff === "REDISCOVER") {
    add(scores, "sales", 2);
    add(scores, "service", 2);
    add(scores, "automation", 1);
  }
}

function scoreService(state: DiagnosticState, scores: Scores) {
  if (selectionCount(state, "C001") >= 3) {
    add(scores, "service", 1);
    add(scores, "integration", 1);
  }

  const repeated = stringAnswer(state, "C002");
  if (repeated === "MANY") {
    add(scores, "service", 3);
    add(scores, "automation", 2);
  }
  if (repeated === "SOME") {
    add(scores, "service", 1);
    add(scores, "automation", 1);
  }

  const beforeService = stringAnswer(state, "C003");
  if (beforeService === "ALMOST_ALWAYS") {
    add(scores, "service", 3);
    add(scores, "automation", 2);
  }
  if (beforeService === "SOMETIMES") add(scores, "service", 1);

  const documents = stringAnswer(state, "C004");
  if (documents === "FREQUENTLY") {
    add(scores, "service", 2);
    add(scores, "software", 1);
  }
  if (documents === "SOMETIMES") add(scores, "service", 1);

  const systems = stringAnswer(state, "C005");
  if (systems === "FREQUENTLY") {
    add(scores, "service", 2);
    add(scores, "integration", 2);
  }
  if (systems === "SOMETIMES") {
    add(scores, "service", 1);
    add(scores, "integration", 1);
  }

  const selfService = stringAnswer(state, "C006");
  if (selfService === "YES") {
    add(scores, "service", 2);
    add(scores, "automation", 2);
  }
  if (selfService === "MAYBE") {
    add(scores, "service", 1);
    add(scores, "automation", 1);
  }
}

function scoreWebsite(state: DiagnosticState, scores: Scores) {
  if (stringAnswer(state, "W001") === "NO") add(scores, "digital", 2);

  const problems = listAnswer(state, "W002");
  if (problems.includes("NO_CONTACTS")) {
    add(scores, "digital", 2);
    add(scores, "sales", 1);
  }
  if (problems.includes("SLOW")) add(scores, "digital", 1);
  if (problems.includes("BAD_MOBILE")) add(scores, "digital", 1);
  if (problems.includes("NO_INTEGRATION")) {
    add(scores, "digital", 1);
    add(scores, "integration", 1);
  }
  if (problems.includes("UNKNOWN_RESULT")) {
    add(scores, "digital", 1);
    add(scores, "sales", 1);
  }

  const role = listAnswer(state, "W003");
  if (role.some((value) => ["QUALIFY", "COLLECT"].includes(value))) {
    add(scores, "digital", 1);
    add(scores, "sales", 1);
    add(scores, "automation", 1);
  }
  if (role.includes("CLIENT_AREA")) add(scores, "software", 1);
  if (role.some((value) => ["REQUESTS", "QUOTE", "BOOKING"].includes(value))) {
    add(scores, "digital", 1);
    add(scores, "software", 1);
  }

  const afterContact = stringAnswer(state, "W004");
  if (
    afterContact &&
    ["MANUAL", "SPREADSHEET", "WHATSAPP", "NO_PROCESS"].includes(afterContact)
  ) {
    add(scores, "sales", 1);
    add(scores, "automation", 1);
  }
  if (afterContact === "SPREADSHEET") add(scores, "integration", 1);
}

function scoreSoftware(state: DiagnosticState, scores: Scores) {
  const substitute = stringAnswer(state, "SW001");
  if (substitute === "SPREADSHEET") {
    add(scores, "software", 2);
    add(scores, "automation", 1);
  }
  if (substitute === "WHATSAPP") {
    add(scores, "software", 1);
    add(scores, "service", 1);
  }
  if (substitute === "MULTIPLE_SYSTEMS") {
    add(scores, "software", 2);
    add(scores, "integration", 2);
  }
  if (substitute === "FULLY_MANUAL") {
    add(scores, "software", 3);
    add(scores, "automation", 2);
  }

  const maturity = stringAnswer(state, "SW004");
  if (maturity === "CLEAR") add(scores, "software", 2);
  if (maturity === "CHANGES") add(scores, "software", 1);
}

function scoreIntegration(state: DiagnosticState, scores: Scores) {
  if (selectionCount(state, "I001") >= 2) add(scores, "integration", 2);

  const bridge = stringAnswer(state, "I002");
  if (bridge === "FREQUENTLY") {
    add(scores, "integration", 3);
    add(scores, "automation", 2);
  }
  if (bridge === "SOMETIMES") {
    add(scores, "integration", 1);
    add(scores, "automation", 1);
  }

  const frequency = stringAnswer(state, "I004");
  if (frequency === "WEEKLY") add(scores, "integration", 1);
  if (frequency === "DAILY") add(scores, "integration", 2);
  if (frequency === "MANY_DAILY") add(scores, "integration", 3);
}

function scoreAi(state: DiagnosticState, scores: Scores) {
  const tasks = listAnswer(state, "AI001");
  if (tasks.some((task) => task !== "UNKNOWN")) add(scores, "ai", 1);

  const volume = stringAnswer(state, "AI002");
  if (volume === "HIGH") add(scores, "ai", 3);
  if (volume === "SOME") add(scores, "ai", 1);
  if (volume === "NO") add(scores, "ai", -1);

  const knowledge = stringAnswer(state, "AI003");
  if (knowledge === "YES") add(scores, "ai", 2);
  if (knowledge === "PARTIAL") add(scores, "ai", 1);

  if (stringAnswer(state, "AI005") === "YES") add(scores, "ai", 1);
}

function scoreDiscovery(state: DiagnosticState, scores: Scores) {
  if (stringAnswer(state, "D001") === "YES") {
    add(scores, "automation", 1);
    add(scores, "software", 1);
  }
  if (stringAnswer(state, "D002") === "YES") {
    add(scores, "service", 1);
    add(scores, "sales", 1);
  }
  if (stringAnswer(state, "D003") === "YES") {
    add(scores, "automation", 2);
    add(scores, "integration", 2);
  }
  if (stringAnswer(state, "D004") === "YES") {
    add(scores, "service", 2);
    add(scores, "automation", 1);
  }
  if (stringAnswer(state, "D005") === "YES") add(scores, "automation", 2);
  if (stringAnswer(state, "D006") === "YES") add(scores, "automation", 2);
  if (stringAnswer(state, "D007") === "YES") {
    add(scores, "integration", 2);
    add(scores, "software", 1);
  }
  if (stringAnswer(state, "D008") === "YES") {
    add(scores, "automation", 1);
    add(scores, "software", 1);
  }
  const digital = stringAnswer(state, "D009");
  if (digital === "PARTIAL") {
    add(scores, "digital", 1);
    add(scores, "sales", 1);
  }
  if (digital === "NO_OR_NO_SITE") {
    add(scores, "digital", 2);
    add(scores, "sales", 1);
  }
  if (stringAnswer(state, "D010") === "YES") add(scores, "integration", 3);
}

const branchScorers = {
  SALES: scoreSales,
  CONVERSION: scoreSales,
  AUTOMATION: scoreAutomation,
  SERVICE: scoreService,
  WEBSITE: scoreWebsite,
  SOFTWARE: scoreSoftware,
  INTEGRATION: scoreIntegration,
  AI: scoreAi,
  DISCOVERY: scoreDiscovery,
} as const;

export function calculateOpportunityScores(state: DiagnosticState): Scores {
  const scores = emptyOpportunityScores();
  scoreUniversal(state, scores);

  if (state.primaryGoal) branchScorers[state.primaryGoal](state, scores);
  return scores;
}

export function calculateAiRiskScore(state: DiagnosticState): number {
  if (state.primaryGoal !== "AI") return 0;
  const consequence = stringAnswer(state, "AI004");
  if (consequence === "HIGH") return 3;
  if (consequence === "SOME") return 2;
  return 0;
}

export function answeredDiagnosticQuestionCount(
  state: DiagnosticState,
): number {
  if (!state.primaryGoal) return 0;
  const activeIds = new Set([
    ...universalQuestions.map(({ id }) => id),
    ...branchQuestions[state.primaryGoal].map(({ id }) => id),
  ]);
  return Object.entries(state.answers).filter(
    ([id, answer]) =>
      activeIds.has(id) &&
      (typeof answer === "number" ||
        (typeof answer === "string" && answer.trim().length > 0) ||
        (Array.isArray(answer) && answer.length > 0)),
  ).length;
}
