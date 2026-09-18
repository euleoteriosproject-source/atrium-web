"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearAdminSession,
  restoreAdminSession,
  saveAdminSession,
  signInAdmin,
  signOutAdmin,
  type AdminSession,
} from "@/domain/admin/auth";
import { verifyAdminAccess } from "@/domain/admin/client";
import { publicEnv } from "@/lib/env";

type AdminAuthContextValue = Readonly<{
  session?: AdminSession;
  checking: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  expire(): void;
}>;

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

const config = {
  supabaseUrl: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey: publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession>();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const restored = await restoreAdminSession(config);
      if (restored) {
        try {
          await verifyAdminAccess(restored.accessToken, config);
          if (active) setSession(restored);
        } catch {
          clearAdminSession();
        }
      }
      if (active) setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const authenticated = await signInAdmin(email, password, config);
    try {
      await verifyAdminAccess(authenticated.accessToken, config);
    } catch (error) {
      clearAdminSession();
      throw error;
    }
    saveAdminSession(authenticated);
    setSession(authenticated);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin(session, config);
    setSession(undefined);
  }, [session]);

  const expire = useCallback(() => {
    clearAdminSession();
    setSession(undefined);
  }, []);

  const value = useMemo(
    () => ({ session, checking, signIn, signOut, expire }),
    [session, checking, signIn, signOut, expire],
  );
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("AdminAuthProvider is required");
  return value;
}

export const adminApiConfig = config;
