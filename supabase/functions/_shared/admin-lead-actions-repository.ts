import type { AdminLeadStatus } from "./admin-lead-types.ts";

export type AdminLeadActionDatabaseConfig = Readonly<{
  supabaseUrl: string;
  secretKey: string;
}>;

export type AdminLeadActionCommand =
  | Readonly<{
      action: "CHANGE_STATUS";
      publicCode: string;
      status: AdminLeadStatus;
    }>
  | Readonly<{ action: "RECORD_CONTACT"; publicCode: string }>
  | Readonly<{ action: "ADD_NOTE"; publicCode: string; note: string }>
  | Readonly<{
      action: "SET_FOLLOW_UP";
      publicCode: string;
      followUpAt: string;
    }>
  | Readonly<{ action: "CLEAR_FOLLOW_UP"; publicCode: string }>;

export type AdminLeadActionResult = Readonly<{
  publicCode: string;
  status: AdminLeadStatus;
  statusUpdatedAt: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
}>;

export class AdminLeadActionRepositoryError extends Error {
  constructor(readonly status: number) {
    super("ADMIN_ACTION_DATABASE_ERROR");
  }
}

export async function applyAdminLeadAction(
  command: AdminLeadActionCommand,
  actorUserId: string,
  config: AdminLeadActionDatabaseConfig,
  fetcher: typeof fetch = fetch,
): Promise<AdminLeadActionResult> {
  const response = await fetcher(
    `${config.supabaseUrl}/rest/v1/rpc/apply_mvp_lead_admin_action`,
    {
      method: "POST",
      headers: {
        apikey: config.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_public_code: command.publicCode,
        p_action: command.action,
        p_actor_user_id: actorUserId,
        p_status: command.action === "CHANGE_STATUS" ? command.status : null,
        p_note: command.action === "ADD_NOTE" ? command.note : null,
        p_follow_up_at:
          command.action === "SET_FOLLOW_UP" ? command.followUpAt : null,
      }),
    },
  );
  if (!response.ok) throw new AdminLeadActionRepositoryError(response.status);
  return (await response.json()) as AdminLeadActionResult;
}
