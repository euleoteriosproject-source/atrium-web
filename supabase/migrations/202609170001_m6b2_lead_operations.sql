-- M6B.2 additive lead operations. Applied migrations remain immutable.

alter table public.mvp_leads
  add column if not exists status_updated_at timestamptz,
  add column if not exists whatsapp_handoff_at timestamptz,
  add column if not exists last_contact_at timestamptz,
  add column if not exists next_follow_up_at timestamptz;

-- Existing status values are preserved. created_at is the only truthful baseline
-- available for the initial status timestamp of pre-M6B.2 rows.
update public.mvp_leads
set status_updated_at = created_at
where status_updated_at is null;

alter table public.mvp_leads
  alter column status_updated_at set default now(),
  alter column status_updated_at set not null;

create table public.mvp_lead_activities (
  id uuid primary key default extensions.gen_random_uuid(),
  lead_id uuid not null references public.mvp_leads(id) on delete restrict,
  activity_type text not null check (
    activity_type in (
      'LEAD_CREATED',
      'WHATSAPP_HANDOFF',
      'STATUS_CHANGED',
      'CONTACT_RECORDED',
      'NOTE_ADDED',
      'FOLLOW_UP_SET',
      'FOLLOW_UP_CLEARED'
    )
  ),
  created_at timestamptz not null default now(),
  actor_user_id uuid,
  from_status text check (
    from_status is null or from_status in (
      'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'
    )
  ),
  to_status text check (
    to_status is null or to_status in (
      'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'
    )
  ),
  note text check (
    note is null or (
      note = trim(note)
      and char_length(note) between 2 and 2000
      and position('<' in note) = 0
      and position('>' in note) = 0
    )
  ),
  follow_up_at timestamptz,
  metadata jsonb check (
    metadata is null or (
      jsonb_typeof(metadata) = 'object'
      and octet_length(metadata::text) <= 2048
    )
  ),
  constraint mvp_lead_activities_shape_check check (
    (
      activity_type in ('LEAD_CREATED', 'WHATSAPP_HANDOFF')
      and actor_user_id is null
      and from_status is null
      and to_status is null
      and note is null
      and follow_up_at is null
      and metadata is null
    ) or (
      activity_type = 'STATUS_CHANGED'
      and actor_user_id is not null
      and from_status is not null
      and to_status is not null
      and from_status <> to_status
      and note is null
      and follow_up_at is null
      and metadata is null
    ) or (
      activity_type = 'CONTACT_RECORDED'
      and actor_user_id is not null
      and from_status is null
      and to_status is null
      and note is null
      and follow_up_at is null
      and metadata is null
    ) or (
      activity_type = 'NOTE_ADDED'
      and actor_user_id is not null
      and from_status is null
      and to_status is null
      and note is not null
      and follow_up_at is null
      and metadata is null
    ) or (
      activity_type = 'FOLLOW_UP_SET'
      and actor_user_id is not null
      and from_status is null
      and to_status is null
      and note is null
      and follow_up_at is not null
      and metadata is null
    ) or (
      activity_type = 'FOLLOW_UP_CLEARED'
      and actor_user_id is not null
      and from_status is null
      and to_status is null
      and note is null
      and metadata is null
    )
  )
);

alter table public.mvp_lead_activities enable row level security;
alter table public.mvp_lead_activities force row level security;

revoke all on table public.mvp_lead_activities from public, anon, authenticated;
revoke update, delete, truncate on table public.mvp_lead_activities from service_role;
grant select, insert on table public.mvp_lead_activities to service_role;

create index mvp_lead_activities_lead_created_at_idx
  on public.mvp_lead_activities (lead_id, created_at desc);

create unique index mvp_lead_activities_created_once_idx
  on public.mvp_lead_activities (lead_id)
  where activity_type = 'LEAD_CREATED';

create unique index mvp_lead_activities_handoff_once_idx
  on public.mvp_lead_activities (lead_id)
  where activity_type = 'WHATSAPP_HANDOFF';

create index mvp_leads_next_follow_up_idx
  on public.mvp_leads (next_follow_up_at)
  where next_follow_up_at is not null;

create index mvp_leads_whatsapp_handoff_idx
  on public.mvp_leads (whatsapp_handoff_at)
  where whatsapp_handoff_at is not null;

-- Existing rows receive only the factual creation event. No other historical
-- action is inferred. The partial unique index keeps the backfill idempotent.
insert into public.mvp_lead_activities (
  lead_id,
  activity_type,
  created_at
)
select
  lead.id,
  'LEAD_CREATED',
  lead.created_at
from public.mvp_leads as lead
on conflict (lead_id) where activity_type = 'LEAD_CREATED' do nothing;

create or replace function public.record_mvp_lead_created_activity()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  insert into public.mvp_lead_activities (
    lead_id,
    activity_type,
    created_at
  ) values (
    new.id,
    'LEAD_CREATED',
    new.created_at
  );
  return new;
end;
$$;

revoke all on function public.record_mvp_lead_created_activity()
  from public, anon, authenticated, service_role;

create trigger mvp_leads_record_created_activity
after insert on public.mvp_leads
for each row execute function public.record_mvp_lead_created_activity();

create or replace function public.track_mvp_lead_handoff(
  p_submission_id uuid,
  p_public_code text
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_lead_id uuid;
  v_handoff_at timestamptz;
  v_now timestamptz := clock_timestamp();
begin
  select id, whatsapp_handoff_at
  into v_lead_id, v_handoff_at
  from public.mvp_leads
  where submission_id = p_submission_id
    and public_code = p_public_code
  for update;

  if not found then
    return false;
  end if;

  if v_handoff_at is null then
    update public.mvp_leads
    set whatsapp_handoff_at = v_now
    where id = v_lead_id;

    insert into public.mvp_lead_activities (
      lead_id,
      activity_type,
      created_at
    ) values (
      v_lead_id,
      'WHATSAPP_HANDOFF',
      v_now
    );
  end if;

  return true;
end;
$$;

revoke all on function public.track_mvp_lead_handoff(uuid, text) from public, anon, authenticated;
grant execute on function public.track_mvp_lead_handoff(uuid, text) to service_role;

create or replace function public.apply_mvp_lead_admin_action(
  p_public_code text,
  p_action text,
  p_actor_user_id uuid,
  p_status text default null,
  p_note text default null,
  p_follow_up_at timestamptz default null
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_lead public.mvp_leads%rowtype;
  v_now timestamptz := clock_timestamp();
  v_note text;
begin
  if p_actor_user_id is null then
    raise exception 'INVALID_ACTOR';
  end if;

  select * into v_lead
  from public.mvp_leads
  where public_code = p_public_code
  for update;

  if not found then
    raise exception 'LEAD_NOT_FOUND';
  end if;

  case p_action
    when 'CHANGE_STATUS' then
      if p_status is null or p_status not in (
        'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'
      ) then
        raise exception 'INVALID_STATUS';
      end if;
      if p_status = v_lead.status then
        raise exception 'STATUS_UNCHANGED';
      end if;

      update public.mvp_leads
      set status = p_status,
          status_updated_at = v_now
      where id = v_lead.id;

      insert into public.mvp_lead_activities (
        lead_id, activity_type, created_at, actor_user_id, from_status, to_status
      ) values (
        v_lead.id, 'STATUS_CHANGED', v_now, p_actor_user_id, v_lead.status, p_status
      );

      v_lead.status := p_status;
      v_lead.status_updated_at := v_now;

    when 'RECORD_CONTACT' then
      update public.mvp_leads
      set last_contact_at = v_now,
          status = case when status = 'NEW' then 'CONTACTED' else status end,
          status_updated_at = case when status = 'NEW' then v_now else status_updated_at end
      where id = v_lead.id;

      if v_lead.status = 'NEW' then
        insert into public.mvp_lead_activities (
          lead_id, activity_type, created_at, actor_user_id, from_status, to_status
        ) values (
          v_lead.id, 'STATUS_CHANGED', v_now, p_actor_user_id, 'NEW', 'CONTACTED'
        );
        v_lead.status := 'CONTACTED';
        v_lead.status_updated_at := v_now;
      end if;

      insert into public.mvp_lead_activities (
        lead_id, activity_type, created_at, actor_user_id
      ) values (
        v_lead.id, 'CONTACT_RECORDED', v_now, p_actor_user_id
      );
      v_lead.last_contact_at := v_now;

    when 'ADD_NOTE' then
      v_note := trim(p_note);
      if v_note is null
        or char_length(v_note) not between 2 and 2000
        or position('<' in v_note) > 0
        or position('>' in v_note) > 0 then
        raise exception 'INVALID_NOTE';
      end if;

      insert into public.mvp_lead_activities (
        lead_id, activity_type, created_at, actor_user_id, note
      ) values (
        v_lead.id, 'NOTE_ADDED', v_now, p_actor_user_id, v_note
      );

    when 'SET_FOLLOW_UP' then
      if p_follow_up_at is null or p_follow_up_at <= v_now then
        raise exception 'INVALID_FOLLOW_UP';
      end if;

      update public.mvp_leads
      set next_follow_up_at = p_follow_up_at
      where id = v_lead.id;

      insert into public.mvp_lead_activities (
        lead_id, activity_type, created_at, actor_user_id, follow_up_at
      ) values (
        v_lead.id, 'FOLLOW_UP_SET', v_now, p_actor_user_id, p_follow_up_at
      );
      v_lead.next_follow_up_at := p_follow_up_at;

    when 'CLEAR_FOLLOW_UP' then
      if v_lead.next_follow_up_at is null then
        raise exception 'FOLLOW_UP_UNCHANGED';
      end if;

      update public.mvp_leads
      set next_follow_up_at = null
      where id = v_lead.id;

      insert into public.mvp_lead_activities (
        lead_id, activity_type, created_at, actor_user_id, follow_up_at
      ) values (
        v_lead.id, 'FOLLOW_UP_CLEARED', v_now, p_actor_user_id, v_lead.next_follow_up_at
      );
      v_lead.next_follow_up_at := null;

    else
      raise exception 'INVALID_ACTION';
  end case;

  return jsonb_build_object(
    'publicCode', v_lead.public_code,
    'status', v_lead.status,
    'statusUpdatedAt', v_lead.status_updated_at,
    'lastContactAt', v_lead.last_contact_at,
    'nextFollowUpAt', v_lead.next_follow_up_at
  );
end;
$$;

revoke all on function public.apply_mvp_lead_admin_action(text, text, uuid, text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.apply_mvp_lead_admin_action(text, text, uuid, text, text, timestamptz)
  to service_role;

comment on table public.mvp_lead_activities is
  'HistÃ³rico append-only das operaÃ§Ãµes dos leads do Atrium Web MVP.';

-- DESTRUCTIVE ROLLBACK: dropping the activity table and operational columns
-- permanently removes the M6B.2 timeline and timestamps. Never run this block
-- blindly. Export/backup the data and confirm that no deployed runtime or
-- operational workflow depends on it before executing any statement below.
-- drop trigger if exists mvp_leads_record_created_activity on public.mvp_leads;
-- drop function if exists public.record_mvp_lead_created_activity();
-- drop function if exists public.track_mvp_lead_handoff(uuid, text);
-- drop function if exists public.apply_mvp_lead_admin_action(text, text, uuid, text, text, timestamptz);
-- drop table if exists public.mvp_lead_activities;
-- alter table public.mvp_leads
--   drop column if exists status_updated_at,
--   drop column if exists whatsapp_handoff_at,
--   drop column if exists last_contact_at,
--   drop column if exists next_follow_up_at;
