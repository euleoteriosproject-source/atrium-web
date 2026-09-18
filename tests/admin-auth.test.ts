import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_SESSION_STORAGE_KEY,
  loadAdminSession,
  restoreAdminSession,
  saveAdminSession,
  signInAdmin,
  signOutAdmin,
  type AdminSession,
} from "@/domain/admin/auth";

const config = {
  supabaseUrl: "https://project.supabase.co",
  publishableKey: "sb_publishable_test",
};

const session: AdminSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresAt: 4_000_000_000,
  user: {
    id: "10000000-0000-4000-8000-000000000001",
    email: "admin@example.com",
  },
};

describe("admin authentication client", () => {
  beforeEach(() => localStorage.clear());

  it("authenticates with email/password without persisting the password", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        access_token: session.accessToken,
        refresh_token: session.refreshToken,
        expires_at: session.expiresAt,
        user: session.user,
      }),
    );

    const result = await signInAdmin(
      "admin@example.com",
      "private-password",
      config,
      fetcher,
    );
    expect(result).toEqual(session);
    expect(fetcher).toHaveBeenCalledWith(
      "https://project.supabase.co/auth/v1/token?grant_type=password",
      expect.objectContaining({ method: "POST" }),
    );
    expect(localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)).toBeNull();
  });

  it("returns a generic error for invalid credentials", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({}, { status: 400 }));
    await expect(
      signInAdmin("admin@example.com", "wrong", config, fetcher),
    ).rejects.toThrow(/Não foi possível entrar/);
  });

  it("restores a valid saved session after server validation", async () => {
    saveAdminSession(session);
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ id: session.user.id }));
    await expect(restoreAdminSession(config, fetcher)).resolves.toEqual(
      session,
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://project.supabase.co/auth/v1/user",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      }),
    );
  });

  it("refreshes an expired session during restoration", async () => {
    saveAdminSession({ ...session, expiresAt: 1 });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_at: 4_100_000_000,
        user: session.user,
      }),
    );
    await expect(restoreAdminSession(config, fetcher)).resolves.toMatchObject({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://project.supabase.co/auth/v1/token?grant_type=refresh_token",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("clears an invalid saved session", async () => {
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "invalid-json");
    await expect(restoreAdminSession(config)).resolves.toBeUndefined();
    expect(loadAdminSession()).toBeUndefined();
  });

  it("clears local state on logout even when the network fails", async () => {
    saveAdminSession(session);
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("network unavailable"));
    await expect(
      signOutAdmin(session, config, fetcher),
    ).resolves.toBeUndefined();
    expect(loadAdminSession()).toBeUndefined();
  });
});
