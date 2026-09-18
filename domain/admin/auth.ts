export const ADMIN_SESSION_STORAGE_KEY = "atrium:admin-session:1";

export type AdminAuthConfig = Readonly<{
  supabaseUrl?: string;
  publishableKey?: string;
}>;

export type AdminSession = Readonly<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: Readonly<{ id: string; email: string | null }>;
}>;

export class AdminAuthError extends Error {
  constructor() {
    super(
      "Não foi possível entrar. Verifique suas credenciais e tente novamente.",
    );
    this.name = "AdminAuthError";
  }
}

type AuthPayload = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_at?: unknown;
  expires_in?: unknown;
  user?: { id?: unknown; email?: unknown };
};

function endpoint(config: AdminAuthConfig, path: string) {
  if (!config.supabaseUrl || !config.publishableKey) throw new AdminAuthError();
  return `${config.supabaseUrl.replace(/\/$/, "")}/auth/v1/${path}`;
}

function headers(config: AdminAuthConfig, accessToken?: string) {
  if (!config.publishableKey) throw new AdminAuthError();
  return {
    apikey: config.publishableKey,
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function parseSession(payload: AuthPayload): AdminSession | undefined {
  const accessToken = payload.access_token;
  const refreshToken = payload.refresh_token;
  const userId = payload.user?.id;
  const expiresAt =
    typeof payload.expires_at === "number"
      ? payload.expires_at
      : typeof payload.expires_in === "number"
        ? Math.floor(Date.now() / 1000) + payload.expires_in
        : undefined;
  if (
    typeof accessToken !== "string" ||
    typeof refreshToken !== "string" ||
    typeof userId !== "string" ||
    typeof expiresAt !== "number"
  ) {
    return undefined;
  }
  return {
    accessToken,
    refreshToken,
    expiresAt,
    user: {
      id: userId,
      email:
        typeof payload.user?.email === "string" ? payload.user.email : null,
    },
  };
}

export function saveAdminSession(session: AdminSession) {
  localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function loadAdminSession() {
  try {
    const value = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
    if (!value) return undefined;
    const input = JSON.parse(value) as Partial<AdminSession>;
    if (
      typeof input.accessToken !== "string" ||
      typeof input.refreshToken !== "string" ||
      typeof input.expiresAt !== "number" ||
      typeof input.user?.id !== "string"
    ) {
      clearAdminSession();
      return undefined;
    }
    return input as AdminSession;
  } catch {
    clearAdminSession();
    return undefined;
  }
}

export async function signInAdmin(
  email: string,
  password: string,
  config: AdminAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  try {
    const response = await fetcher(
      endpoint(config, "token?grant_type=password"),
      {
        method: "POST",
        headers: headers(config),
        body: JSON.stringify({ email, password }),
      },
    );
    if (!response.ok) throw new AdminAuthError();
    const session = parseSession((await response.json()) as AuthPayload);
    if (!session) throw new AdminAuthError();
    return session;
  } catch (error) {
    if (error instanceof AdminAuthError) throw error;
    throw new AdminAuthError();
  }
}

async function refreshAdminSession(
  session: AdminSession,
  config: AdminAuthConfig,
  fetcher: typeof fetch,
) {
  const response = await fetcher(
    endpoint(config, "token?grant_type=refresh_token"),
    {
      method: "POST",
      headers: headers(config),
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    },
  );
  if (!response.ok) return undefined;
  return parseSession((await response.json()) as AuthPayload);
}

async function sessionIsValid(
  session: AdminSession,
  config: AdminAuthConfig,
  fetcher: typeof fetch,
) {
  const response = await fetcher(endpoint(config, "user"), {
    headers: headers(config, session.accessToken),
  });
  return response.ok;
}

export async function restoreAdminSession(
  config: AdminAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  const stored = loadAdminSession();
  if (!stored) return undefined;
  try {
    const nearlyExpired =
      stored.expiresAt <= Math.floor(Date.now() / 1000) + 60;
    if (!nearlyExpired && (await sessionIsValid(stored, config, fetcher))) {
      return stored;
    }
    const refreshed = await refreshAdminSession(stored, config, fetcher);
    if (refreshed) {
      saveAdminSession(refreshed);
      return refreshed;
    }
  } catch {
    // Any restoration failure becomes an anonymous session.
  }
  clearAdminSession();
  return undefined;
}

export async function signOutAdmin(
  session: AdminSession | undefined,
  config: AdminAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  try {
    if (session) {
      await fetcher(endpoint(config, "logout"), {
        method: "POST",
        headers: headers(config, session.accessToken),
      });
    }
  } catch {
    // Local logout must remain available when the network is unavailable.
  } finally {
    clearAdminSession();
  }
}
