-- M6B.2 closure: NEW -> CONTACTED represents a real recorded human contact.
-- RECORD_CONTACT changes status and last_contact_at in the same atomic update.

create or replace function public.enforce_mvp_lead_contacted_semantics()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if old.status = 'NEW'
    and new.status = 'CONTACTED'
    and new.last_contact_at is not distinct from old.last_contact_at then
    raise exception 'CONTACT_REQUIRES_RECORD_CONTACT';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_mvp_lead_contacted_semantics()
  from public, anon, authenticated, service_role;

create trigger mvp_leads_enforce_contacted_semantics
before update of status, last_contact_at on public.mvp_leads
for each row execute function public.enforce_mvp_lead_contacted_semantics();

-- Rollback:
-- drop trigger if exists mvp_leads_enforce_contacted_semantics on public.mvp_leads;
-- drop function if exists public.enforce_mvp_lead_contacted_semantics();
