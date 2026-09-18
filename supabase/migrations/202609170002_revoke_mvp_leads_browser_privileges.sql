-- M6B.2 closure: restore the browser-role boundary if remote grants drifted.
-- RLS remains defense-in-depth; anon/authenticated must not hold table CRUD.

revoke all on table public.mvp_leads from public, anon, authenticated;
