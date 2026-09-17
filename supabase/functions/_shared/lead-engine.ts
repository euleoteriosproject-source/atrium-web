import { normalizeBrazilPhone } from "./brazil-phone.ts";
import {
  budgetRangeValues,
  isAllowedValue,
  leadEmailPattern,
  leadFieldLimits,
  timeframeValues,
  type BudgetRangeValue,
  type TimeframeValue,
} from "./lead-constraints.ts";

export const DIAGNOSTIC_VERSION = "1.0.0";

export const opportunityDimensions = [
  "digital",
  "sales",
  "service",
  "automation",
  "integration",
  "software",
  "ai",
] as const;

export const goals = [
  "SALES",
  "CONVERSION",
  "AUTOMATION",
  "SERVICE",
  "WEBSITE",
  "SOFTWARE",
  "INTEGRATION",
  "AI",
  "DISCOVERY",
] as const;

type OpportunityDimension = (typeof opportunityDimensions)[number];
type Goal = (typeof goals)[number];
type Timeframe = TimeframeValue;
type BudgetRange = BudgetRangeValue;
type Answer = string | string[] | number;
export type Scores = Record<OpportunityDimension, number>;

export type DiagnosticPayload = {
  version: string;
  startedAt: string;
  primaryGoal: Goal;
  additionalGoals: Goal[];
  segment?: string;
  companySize?: string;
  acquisitionChannels: string[];
  tools: string[];
  answers: Record<string, Answer>;
  calculator?: {
    people?: number;
    minutesPerDay?: number;
    daysPerWeek?: number;
    estimatedMonthlyHours?: number;
  };
  stage: "complete";
};

export type ValidatedLeadPayload = {
  submissionId: string;
  contact: {
    contactName: string;
    companyName: string;
    phone: string;
    email: string | null;
    timeframe: Timeframe | null;
    budgetRange: BudgetRange | null;
    consentContact: true;
  };
  diagnostic: DiagnosticPayload;
  attribution?: {
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    referrer?: string;
    landingPage?: string;
  };
  turnstileToken: string;
};

export type LeadTier = "A" | "B" | "C" | "D";

export type LeadScore = {
  total: number;
  tier: LeadTier;
  breakdown: {
    fit: number;
    pain: number;
    impact: number;
    urgency: number;
    budget: number;
    clarity: number;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function cleanString(value: unknown, min: number, max: number) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length >= min && normalized.length <= max
    ? normalized
    : undefined;
}

function optionalString(value: unknown, max: number) {
  if (value === null || value === undefined || value === "") return undefined;
  return cleanString(value, 1, max);
}

function normalizePhone(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length > leadFieldLimits.phone.serverInputMaximum
  ) {
    return undefined;
  }
  return normalizeBrazilPhone(value);
}

function validEmail(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const email = cleanString(value, 3, leadFieldLimits.email.maximum);
  return email && leadEmailPattern.test(email) ? email : undefined;
}

function validAnswer(value: unknown): value is Answer {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.length <= 1000;
  return (
    Array.isArray(value) &&
    value.length <= 20 &&
    value.every((item) => typeof item === "string" && item.length <= 200)
  );
}

function validStringArray(value: unknown, maxItems = 20): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= maxItems &&
    value.every((item) => typeof item === "string" && item.length <= 200)
  );
}

function validOptionalNumber(value: unknown) {
  return (
    value === undefined || (typeof value === "number" && Number.isFinite(value))
  );
}

function parseDiagnostic(value: unknown): DiagnosticPayload | undefined {
  if (!isRecord(value)) return undefined;
  if (
    value.version !== DIAGNOSTIC_VERSION ||
    value.stage !== "complete" ||
    !isAllowedValue(value.primaryGoal, goals) ||
    !cleanString(value.startedAt, 1, 64) ||
    !validStringArray(value.additionalGoals, goals.length) ||
    !value.additionalGoals.every((goal) => isAllowedValue(goal, goals)) ||
    !validStringArray(value.acquisitionChannels) ||
    !validStringArray(value.tools) ||
    !isRecord(value.answers) ||
    Object.keys(value.answers).length > 100 ||
    !Object.values(value.answers).every(validAnswer)
  ) {
    return undefined;
  }

  let calculator: DiagnosticPayload["calculator"];
  if (value.calculator !== undefined) {
    if (
      !isRecord(value.calculator) ||
      !validOptionalNumber(value.calculator.people) ||
      !validOptionalNumber(value.calculator.minutesPerDay) ||
      !validOptionalNumber(value.calculator.daysPerWeek) ||
      !validOptionalNumber(value.calculator.estimatedMonthlyHours)
    ) {
      return undefined;
    }
    calculator = {
      people: value.calculator.people as number | undefined,
      minutesPerDay: value.calculator.minutesPerDay as number | undefined,
      daysPerWeek: value.calculator.daysPerWeek as number | undefined,
      estimatedMonthlyHours: value.calculator.estimatedMonthlyHours as
        number | undefined,
    };
  }

  return {
    version: DIAGNOSTIC_VERSION,
    startedAt: String(value.startedAt),
    primaryGoal: value.primaryGoal,
    additionalGoals: value.additionalGoals as Goal[],
    segment: optionalString(value.segment, 200),
    companySize: optionalString(value.companySize, 100),
    acquisitionChannels: value.acquisitionChannels,
    tools: value.tools,
    answers: value.answers as Record<string, Answer>,
    calculator,
    stage: "complete",
  };
}

export function validateLeadPayload(
  input: unknown,
): { success: true; data: ValidatedLeadPayload } | { success: false } {
  if (!isRecord(input) || !isRecord(input.contact)) return { success: false };
  if (
    typeof input.website !== "string" ||
    input.website.length > leadFieldLimits.honeypot.maximum
  ) {
    return { success: false };
  }

  const submissionId = cleanString(input.submissionId, 36, 36);
  const contactName = cleanString(
    input.contact.contactName,
    leadFieldLimits.contactName.minimum,
    leadFieldLimits.contactName.maximum,
  );
  const companyName = cleanString(
    input.contact.companyName,
    leadFieldLimits.companyName.minimum,
    leadFieldLimits.companyName.maximum,
  );
  const phone = normalizePhone(input.contact.phone);
  const email = validEmail(input.contact.email);
  const timeframe =
    input.contact.timeframe === null
      ? null
      : isAllowedValue(input.contact.timeframe, timeframeValues)
        ? input.contact.timeframe
        : undefined;
  const budgetRange =
    input.contact.budgetRange === null
      ? null
      : isAllowedValue(input.contact.budgetRange, budgetRangeValues)
        ? input.contact.budgetRange
        : undefined;
  const diagnostic = parseDiagnostic(input.diagnostic);
  const turnstileToken = cleanString(
    input.turnstileToken,
    1,
    leadFieldLimits.turnstileToken.maximum,
  );

  if (
    !submissionId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      submissionId,
    ) ||
    !contactName ||
    !companyName ||
    !phone ||
    email === undefined ||
    timeframe === undefined ||
    budgetRange === undefined ||
    input.contact.consentContact !== true ||
    !diagnostic ||
    !turnstileToken
  ) {
    return { success: false };
  }

  const attribution = isRecord(input.attribution)
    ? {
        source: optionalString(
          input.attribution.source,
          leadFieldLimits.attribution.source,
        ),
        utmSource: optionalString(
          input.attribution.utmSource,
          leadFieldLimits.attribution.utmSource,
        ),
        utmMedium: optionalString(
          input.attribution.utmMedium,
          leadFieldLimits.attribution.utmMedium,
        ),
        utmCampaign: optionalString(
          input.attribution.utmCampaign,
          leadFieldLimits.attribution.utmCampaign,
        ),
        utmContent: optionalString(
          input.attribution.utmContent,
          leadFieldLimits.attribution.utmContent,
        ),
        utmTerm: optionalString(
          input.attribution.utmTerm,
          leadFieldLimits.attribution.utmTerm,
        ),
        referrer: optionalString(
          input.attribution.referrer,
          leadFieldLimits.attribution.referrer,
        ),
        landingPage: optionalString(
          input.attribution.landingPage,
          leadFieldLimits.attribution.landingPage,
        ),
      }
    : undefined;

  return {
    success: true,
    data: {
      submissionId,
      contact: {
        contactName,
        companyName,
        phone,
        email,
        timeframe,
        budgetRange,
        consentContact: true,
      },
      diagnostic,
      attribution,
      turnstileToken,
    },
  };
}

const stringAnswer = (state: DiagnosticPayload, id: string) => {
  const answer = state.answers[id];
  return typeof answer === "string" ? answer : undefined;
};

const listAnswer = (state: DiagnosticPayload, id: string) => {
  const answer = state.answers[id];
  return Array.isArray(answer) ? answer : [];
};

const selectionCount = (state: DiagnosticPayload, id: string) =>
  listAnswer(state, id).filter((value) => value !== "OTHER").length +
  (listAnswer(state, id).includes("OTHER") && stringAnswer(state, `${id}_OTHER`)
    ? String(stringAnswer(state, `${id}_OTHER`))
        .split(",")
        .filter((value) => value.trim()).length
    : 0);

const emptyScores = (): Scores => ({
  digital: 0,
  sales: 0,
  service: 0,
  automation: 0,
  integration: 0,
  software: 0,
  ai: 0,
});

const add = (
  scores: Scores,
  dimension: OpportunityDimension,
  value: number,
) => {
  scores[dimension] += value;
};

const includes = (state: DiagnosticPayload, id: string, value: string) =>
  listAnswer(state, id).includes(value);

function scoreUniversal(state: DiagnosticPayload, scores: Scores) {
  const mapping: Partial<Record<Goal, Partial<Scores>>> = {
    SALES: { sales: 2, digital: 1 },
    CONVERSION: { sales: 3, service: 1 },
    AUTOMATION: { automation: 3 },
    SERVICE: { service: 3 },
    WEBSITE: { digital: 3, sales: 1 },
    SOFTWARE: { software: 3 },
    INTEGRATION: { integration: 3, automation: 1 },
    AI: { ai: 2 },
  };
  Object.entries(mapping[state.primaryGoal] ?? {}).forEach(
    ([dimension, value]) =>
      add(scores, dimension as OpportunityDimension, value ?? 0),
  );
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

function scoreAutomation(state: DiagnosticPayload, scores: Scores) {
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
  } else if (transfer === "SOMETIMES") {
    add(scores, "automation", 1);
    add(scores, "integration", 1);
  }
  const dependency = stringAnswer(state, "A006");
  if (dependency === "YES") {
    add(scores, "automation", 2);
    add(scores, "software", 1);
  } else if (dependency === "PARTLY") add(scores, "automation", 1);
  const errors = stringAnswer(state, "A007");
  if (errors === "FREQUENTLY") add(scores, "automation", 3);
  else if (errors === "SOMETIMES") add(scores, "automation", 1);
}

function scoreSales(state: DiagnosticPayload, scores: Scores) {
  const destination = stringAnswer(state, "S001");
  if (destination === "SPREADSHEET") {
    add(scores, "sales", 1);
    add(scores, "automation", 1);
  } else if (destination === "WHATSAPP") {
    add(scores, "sales", 1);
    add(scores, "service", 1);
  } else if (destination === "EMAIL") add(scores, "sales", 1);
  else if (destination === "NOWHERE") {
    add(scores, "sales", 3);
    add(scores, "software", 1);
  }
  const response = stringAnswer(state, "S002");
  if (response === "SAME_DAY") add(scores, "sales", 1);
  else if (response === "OVER_DAY") add(scores, "sales", 3);
  else if (response === "UNKNOWN") add(scores, "sales", 2);
  const qualification = stringAnswer(state, "S003");
  if (qualification === "PARTIAL") add(scores, "sales", 1);
  else if (qualification === "NO") {
    add(scores, "sales", 2);
    add(scores, "automation", 1);
  }
  const followUp = stringAnswer(state, "S004");
  if (followUp === "PERSON_DEPENDENT") {
    add(scores, "sales", 2);
    add(scores, "automation", 1);
  } else if (followUp === "ALMOST_NONE") add(scores, "sales", 3);
  const visibility = stringAnswer(state, "S005");
  if (visibility === "PARTIAL") add(scores, "sales", 1);
  else if (visibility === "NO") {
    add(scores, "sales", 2);
    add(scores, "software", 1);
  }
  const handoff = stringAnswer(state, "S006");
  if (handoff === "PARTIAL") {
    add(scores, "sales", 1);
    add(scores, "service", 1);
  } else if (handoff === "REDISCOVER") {
    add(scores, "sales", 2);
    add(scores, "service", 2);
    add(scores, "automation", 1);
  }
}

function scoreService(state: DiagnosticPayload, scores: Scores) {
  if (selectionCount(state, "C001") >= 3) {
    add(scores, "service", 1);
    add(scores, "integration", 1);
  }
  const repeated = stringAnswer(state, "C002");
  if (repeated === "MANY") {
    add(scores, "service", 3);
    add(scores, "automation", 2);
  } else if (repeated === "SOME") {
    add(scores, "service", 1);
    add(scores, "automation", 1);
  }
  const before = stringAnswer(state, "C003");
  if (before === "ALMOST_ALWAYS") {
    add(scores, "service", 3);
    add(scores, "automation", 2);
  } else if (before === "SOMETIMES") add(scores, "service", 1);
  const documents = stringAnswer(state, "C004");
  if (documents === "FREQUENTLY") {
    add(scores, "service", 2);
    add(scores, "software", 1);
  } else if (documents === "SOMETIMES") add(scores, "service", 1);
  const systems = stringAnswer(state, "C005");
  if (systems === "FREQUENTLY") {
    add(scores, "service", 2);
    add(scores, "integration", 2);
  } else if (systems === "SOMETIMES") {
    add(scores, "service", 1);
    add(scores, "integration", 1);
  }
  const selfService = stringAnswer(state, "C006");
  if (selfService === "YES") {
    add(scores, "service", 2);
    add(scores, "automation", 2);
  } else if (selfService === "MAYBE") {
    add(scores, "service", 1);
    add(scores, "automation", 1);
  }
}

function scoreWebsite(state: DiagnosticPayload, scores: Scores) {
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
  const after = stringAnswer(state, "W004");
  if (
    after &&
    ["MANUAL", "SPREADSHEET", "WHATSAPP", "NO_PROCESS"].includes(after)
  ) {
    add(scores, "sales", 1);
    add(scores, "automation", 1);
  }
  if (after === "SPREADSHEET") add(scores, "integration", 1);
}

function scoreSoftware(state: DiagnosticPayload, scores: Scores) {
  const substitute = stringAnswer(state, "SW001");
  if (substitute === "SPREADSHEET") {
    add(scores, "software", 2);
    add(scores, "automation", 1);
  } else if (substitute === "WHATSAPP") {
    add(scores, "software", 1);
    add(scores, "service", 1);
  } else if (substitute === "MULTIPLE_SYSTEMS") {
    add(scores, "software", 2);
    add(scores, "integration", 2);
  } else if (substitute === "FULLY_MANUAL") {
    add(scores, "software", 3);
    add(scores, "automation", 2);
  }
  const maturity = stringAnswer(state, "SW004");
  if (maturity === "CLEAR") add(scores, "software", 2);
  else if (maturity === "CHANGES") add(scores, "software", 1);
}

function scoreIntegration(state: DiagnosticPayload, scores: Scores) {
  if (selectionCount(state, "I001") >= 2) add(scores, "integration", 2);
  const bridge = stringAnswer(state, "I002");
  if (bridge === "FREQUENTLY") {
    add(scores, "integration", 3);
    add(scores, "automation", 2);
  } else if (bridge === "SOMETIMES") {
    add(scores, "integration", 1);
    add(scores, "automation", 1);
  }
  const frequency = stringAnswer(state, "I004");
  if (frequency === "WEEKLY") add(scores, "integration", 1);
  else if (frequency === "DAILY") add(scores, "integration", 2);
  else if (frequency === "MANY_DAILY") add(scores, "integration", 3);
}

function scoreAi(state: DiagnosticPayload, scores: Scores) {
  if (listAnswer(state, "AI001").some((task) => task !== "UNKNOWN"))
    add(scores, "ai", 1);
  const volume = stringAnswer(state, "AI002");
  if (volume === "HIGH") add(scores, "ai", 3);
  else if (volume === "SOME") add(scores, "ai", 1);
  else if (volume === "NO") add(scores, "ai", -1);
  const knowledge = stringAnswer(state, "AI003");
  if (knowledge === "YES") add(scores, "ai", 2);
  else if (knowledge === "PARTIAL") add(scores, "ai", 1);
  if (stringAnswer(state, "AI005") === "YES") add(scores, "ai", 1);
}

function scoreDiscovery(state: DiagnosticPayload, scores: Scores) {
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
  if (stringAnswer(state, "D009") === "PARTIAL") {
    add(scores, "digital", 1);
    add(scores, "sales", 1);
  } else if (stringAnswer(state, "D009") === "NO_OR_NO_SITE") {
    add(scores, "digital", 2);
    add(scores, "sales", 1);
  }
  if (stringAnswer(state, "D010") === "YES") add(scores, "integration", 3);
}

export function calculateOpportunityScores(state: DiagnosticPayload): Scores {
  const scores = emptyScores();
  scoreUniversal(state, scores);
  const scorers: Record<
    Goal,
    (state: DiagnosticPayload, scores: Scores) => void
  > = {
    SALES: scoreSales,
    CONVERSION: scoreSales,
    AUTOMATION: scoreAutomation,
    SERVICE: scoreService,
    WEBSITE: scoreWebsite,
    SOFTWARE: scoreSoftware,
    INTEGRATION: scoreIntegration,
    AI: scoreAi,
    DISCOVERY: scoreDiscovery,
  };
  scorers[state.primaryGoal](state, scores);
  return scores;
}

export function calculateAiRiskScore(state: DiagnosticPayload) {
  if (state.primaryGoal !== "AI") return 0;
  if (stringAnswer(state, "AI004") === "HIGH") return 3;
  if (stringAnswer(state, "AI004") === "SOME") return 2;
  return 0;
}

export function rankTopOpportunities(state: DiagnosticPayload, scores: Scores) {
  const adjusted = { ...scores };
  const risk = calculateAiRiskScore(state);
  if (risk >= 3 && stringAnswer(state, "AI005") === "NO") adjusted.ai -= 3;
  if (scores.automation >= 7 && scores.ai < 5) adjusted.ai -= 1;
  const order: OpportunityDimension[] = [
    "automation",
    "integration",
    "sales",
    "service",
    "digital",
    "software",
    "ai",
  ];
  const primary: Partial<Record<Goal, OpportunityDimension>> = {
    SALES: "sales",
    CONVERSION: "sales",
    AUTOMATION: "automation",
    SERVICE: "service",
    WEBSITE: "digital",
    SOFTWARE: "software",
    INTEGRATION: "integration",
    AI: "ai",
  };
  return order
    .map((dimension, index) => ({
      dimension,
      score: adjusted[dimension],
      index,
    }))
    .filter(({ score }) => score >= 4)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftPrimary = left.dimension === primary[state.primaryGoal] ? 1 : 0;
      const rightPrimary =
        right.dimension === primary[state.primaryGoal] ? 1 : 0;
      return rightPrimary - leftPrimary || left.index - right.index;
    })
    .slice(0, 3)
    .map(({ dimension, score }) => ({
      dimension,
      level: score >= 7 ? "HIGH" : "MODERATE",
    }));
}

const clamp = (value: number, maximum: number) =>
  Math.max(0, Math.min(maximum, Math.round(value)));

export function leadTierFor(total: number): LeadTier {
  if (total >= 75) return "A";
  if (total >= 55) return "B";
  if (total >= 35) return "C";
  return "D";
}

export function calculateLeadScore(
  diagnostic: DiagnosticPayload,
  timeframe: Timeframe | null,
  budgetRange: BudgetRange | null,
): LeadScore {
  const scores = calculateOpportunityScores(diagnostic);
  const sizeFit =
    {
      ONE: 4,
      TWO_TO_FIVE: 8,
      SIX_TO_TWENTY: 10,
      TWENTY_ONE_TO_FIFTY: 9,
      FIFTY_ONE_PLUS: 6,
    }[diagnostic.companySize ?? ""] ?? 0;
  const bestOpportunity = Math.max(...Object.values(scores));
  const opportunityFit =
    bestOpportunity >= 7 ? 5 : bestOpportunity >= 4 ? 3 : 0;
  const offerFit = diagnostic.primaryGoal === "DISCOVERY" ? 2 : 5;
  const complexityPenalty =
    (calculateAiRiskScore(diagnostic) >= 3 ? 2 : 0) +
    (stringAnswer(diagnostic, "SW004") === "IDEA" ? 2 : 0);
  const fit = clamp(
    sizeFit + opportunityFit + offerFit - complexityPenalty,
    20,
  );

  const moderateDimensions = opportunityDimensions.filter(
    (dimension) => scores[dimension] >= 4,
  ).length;
  const highDimensions = opportunityDimensions.filter(
    (dimension) => scores[dimension] >= 7,
  ).length;
  const fragilitySignals = [
    ["A005", ["FREQUENTLY", "SOMETIMES"]],
    ["A006", ["YES", "PARTLY"]],
    ["A007", ["FREQUENTLY", "SOMETIMES"]],
    ["S004", ["PERSON_DEPENDENT", "ALMOST_NONE"]],
    ["S006", ["PARTIAL", "REDISCOVER"]],
    ["C002", ["MANY", "SOME"]],
    ["C005", ["FREQUENTLY", "SOMETIMES"]],
    ["I002", ["FREQUENTLY", "SOMETIMES"]],
    ["D003", ["YES"]],
    ["D007", ["YES"]],
  ].filter(([id, values]) =>
    (values as string[]).includes(stringAnswer(diagnostic, id as string) ?? ""),
  ).length;
  const pain = clamp(
    moderateDimensions * 3 + highDimensions * 2 + fragilitySignals * 2,
    20,
  );

  const frequency =
    {
      MONTHLY: 1,
      WEEKLY: 4,
      DAILY: 7,
      MANY_DAILY: 9,
    }[
      stringAnswer(diagnostic, "A002") ?? stringAnswer(diagnostic, "I004") ?? ""
    ] ?? 0;
  const people =
    {
      ONE: 1,
      TWO_TO_THREE: 3,
      FOUR_TO_SIX: 6,
      SEVEN_PLUS: 8,
    }[stringAnswer(diagnostic, "A003") ?? ""] ?? 0;
  const monthlyHours = diagnostic.calculator?.estimatedMonthlyHours ?? 0;
  const hours =
    monthlyHours >= 80
      ? 8
      : monthlyHours >= 40
        ? 6
        : monthlyHours >= 15
          ? 4
          : monthlyHours > 0
            ? 2
            : 0;
  const customerImpact =
    ["OVER_DAY", "UNKNOWN"].includes(stringAnswer(diagnostic, "S002") ?? "") ||
    ["MANY", "SOME"].includes(stringAnswer(diagnostic, "C002") ?? "") ||
    ["NO_CONTACTS", "UNKNOWN_RESULT"].some((value) =>
      listAnswer(diagnostic, "W002").includes(value),
    )
      ? 3
      : 0;
  const impact = clamp(frequency + people + hours + customerImpact, 20);

  const urgency = timeframe
    ? {
        NOW: 15,
        ONE_TO_THREE_MONTHS: 12,
        THREE_TO_SIX_MONTHS: 7,
        EXPLORING: 2,
      }[timeframe]
    : 0;
  const budget = budgetRange
    ? {
        UNDERSTANDING: 5,
        UP_TO_3000: 3,
        FROM_3000_TO_7500: 8,
        FROM_7500_TO_15000: 12,
        FROM_15000_TO_30000: 15,
        ABOVE_30000: 15,
      }[budgetRange]
    : 5;

  const answerCount = Object.values(diagnostic.answers).filter(
    (answer) =>
      typeof answer === "number" ||
      (typeof answer === "string" && answer.trim()) ||
      (Array.isArray(answer) && answer.length > 0),
  ).length;
  const concrete = Boolean(
    stringAnswer(diagnostic, "A001") ||
    stringAnswer(diagnostic, "SW003")?.trim() ||
    listAnswer(diagnostic, "I003").length ||
    listAnswer(diagnostic, "AI001").some((value) => value !== "UNKNOWN"),
  );
  const clarity = clamp(
    2 +
      2 +
      (answerCount >= 10
        ? 4
        : answerCount >= 7
          ? 3
          : answerCount >= 4
            ? 2
            : 0) +
      (concrete ? 2 : 0) -
      (stringAnswer(diagnostic, "SW004") === "IDEA" ? 2 : 0),
    10,
  );

  const breakdown = { fit, pain, impact, urgency, budget, clarity };
  const total = clamp(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    100,
  );
  return { total, tier: leadTierFor(total), breakdown };
}

export function buildLeadRecord(
  payload: ValidatedLeadPayload,
  publicCode: string,
) {
  const scores = calculateOpportunityScores(payload.diagnostic);
  const aiRiskScore = calculateAiRiskScore(payload.diagnostic);
  const leadScore = calculateLeadScore(
    payload.diagnostic,
    payload.contact.timeframe,
    payload.contact.budgetRange,
  );
  const attribution = payload.attribution;
  return {
    submission_id: payload.submissionId,
    public_code: publicCode,
    contact_name: payload.contact.contactName,
    company_name: payload.contact.companyName,
    phone: payload.contact.phone,
    email: payload.contact.email,
    business_segment: payload.diagnostic.segment ?? null,
    company_size: payload.diagnostic.companySize ?? null,
    primary_goal: payload.diagnostic.primaryGoal,
    additional_goals: payload.diagnostic.additionalGoals,
    answers_json: payload.diagnostic.answers,
    diagnostic_version: payload.diagnostic.version,
    opportunity_scores: scores,
    top_opportunities: rankTopOpportunities(payload.diagnostic, scores),
    ai_risk_score: aiRiskScore,
    lead_score: leadScore.total,
    lead_tier: leadScore.tier,
    timeframe: payload.contact.timeframe,
    budget_range: payload.contact.budgetRange,
    source: attribution?.source ?? null,
    utm_source: attribution?.utmSource ?? null,
    utm_medium: attribution?.utmMedium ?? null,
    utm_campaign: attribution?.utmCampaign ?? null,
    utm_content: attribution?.utmContent ?? null,
    utm_term: attribution?.utmTerm ?? null,
    referrer: attribution?.referrer ?? null,
    landing_page: attribution?.landingPage ?? null,
    status: "NEW",
    internal_notes: null,
    consent_contact: true,
    consent_at: new Date().toISOString(),
  };
}
