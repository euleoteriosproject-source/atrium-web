import {
  diagnosticStateSchema,
  type DiagnosticState,
} from "@/domain/diagnostic/types";

export const DIAGNOSTIC_SESSION_KEY = "atrium:diagnostic:1.0.0";

function browserStorage(): Storage | undefined {
  return typeof window === "undefined" ? undefined : window.sessionStorage;
}

export function loadDiagnosticSession(
  storage: Storage | undefined = browserStorage(),
): DiagnosticState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DIAGNOSTIC_SESSION_KEY);
    if (!raw) return null;
    const parsed = diagnosticStateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      storage.removeItem(DIAGNOSTIC_SESSION_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    storage.removeItem(DIAGNOSTIC_SESSION_KEY);
    return null;
  }
}

export function saveDiagnosticSession(
  state: DiagnosticState,
  storage: Storage | undefined = browserStorage(),
) {
  if (!storage) return;
  storage.setItem(DIAGNOSTIC_SESSION_KEY, JSON.stringify(state));
}

export function clearDiagnosticSession(
  storage: Storage | undefined = browserStorage(),
) {
  storage?.removeItem(DIAGNOSTIC_SESSION_KEY);
}
