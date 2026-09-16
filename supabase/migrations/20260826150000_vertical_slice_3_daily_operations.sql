-- Career OS Vertical Slice 3: durable daily operations, deltas, briefs and notifications.
-- Additive only. Existing Career OS data and unrelated public.ga_* objects are untouched.

create table career_os.automation_settings (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  daily_automation_enabled boolean not null default false,
  timezone text not null default 'America/Sao_Paulo',
  daily_brief_enabled boolean not null default true,
  email_enabled boolean not null default false,
  email_address text,
  send_empty_brief boolean not null default false,
  quiet_hours_start time,
  quiet_hours_end time,
  score_threshold integer not null default 85 check (score_threshold between 0 and 100),
  technical_match_threshold integer not null default 75 check (technical_match_threshold between 0 and 100),
  max_brief_jobs integer not null default 5 check (max_brief_jobs between 1 and 10),
  max_active_profiles integer not null default 5 check (max_active_profiles between 1 and 10),
  max_source_requests integer not null default 20 check (max_source_requests between 1 and 50),
  max_jobs_per_source integer not null default 25 check (max_jobs_per_source between 1 and 50),
  max_revalidations integer not null default 25 check (max_revalidations between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (id,user_id)
);
create table career_os.daily_career_runs (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  local_date date not null,
  timezone text not null,
  origin text not null check (origin in ('CRON','MANUAL','SYSTEM')),
  idempotency_key text not null,
  status text not null check (status in ('PENDING','RUNNING','SUCCESS','PARTIAL_SUCCESS','FAILED','SKIPPED_DISABLED','SKIPPED_QUOTA')),
  current_step text,
  workflow_run_id text,
  agent_run_id text,
  context jsonb not null default '{}',
  metrics jsonb not null default '{}',
  errors jsonb not null default '[]',
  warnings jsonb not null default '[]',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id,idempotency_key),
  unique (id,user_id),
  constraint daily_career_runs_agent_owner_fk foreign key (agent_run_id,user_id)
    references career_os.agent_runs(id,user_id) on delete set null (agent_run_id)
);
create table career_os.job_delta_events (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  daily_run_id text not null,
  job_id text not null,
  event_type text not null check (event_type in (
    'NEW','UPDATED','PRIORITY_INCREASED','PRIORITY_DECREASED','CLOSED','REOPENED',
    'VALIDATION_INCREASED','VALIDATION_DECREASED','SALARY_CHANGED','LOCATION_CHANGED','WORK_MODEL_CHANGED'
  )),
  event_version text not null,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now(),
  unique (user_id,job_id,event_type,event_version),
  constraint job_delta_events_run_owner_fk foreign key (daily_run_id,user_id)
    references career_os.daily_career_runs(id,user_id) on delete cascade,
  constraint job_delta_events_job_owner_fk foreign key (job_id,user_id)
    references career_os.jobs(id,user_id) on delete cascade
);
create table career_os.daily_briefs (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  daily_run_id text not null,
  local_date date not null,
  title text not null,
  summary text not null,
  content jsonb not null,
  job_ids text[] not null default '{}',
  remaining_jobs integer not null default 0 check (remaining_jobs >= 0),
  created_at timestamptz not null default now(),
  unique (user_id,daily_run_id),
  unique (id,user_id),
  constraint daily_briefs_run_owner_fk foreign key (daily_run_id,user_id)
    references career_os.daily_career_runs(id,user_id) on delete cascade
);
create table career_os.notification_preferences (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  apply_now_enabled boolean not null default true,
  high_priority_enabled boolean not null default true,
  priority_increase_enabled boolean not null default true,
  closed_job_enabled boolean not null default true,
  reopened_job_enabled boolean not null default true,
  daily_digest_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (id,user_id)
);
create table career_os.notifications (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  daily_run_id text,
  job_id text,
  brief_id text,
  type text not null,
  level text not null check (level in ('CRITICAL','HIGH','NORMAL','DIGEST')),
  title text not null,
  message text not null,
  href text,
  dedupe_key text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id,dedupe_key),
  unique (id,user_id),
  constraint notifications_run_owner_fk foreign key (daily_run_id,user_id)
    references career_os.daily_career_runs(id,user_id) on delete cascade,
  constraint notifications_job_owner_fk foreign key (job_id,user_id)
    references career_os.jobs(id,user_id) on delete cascade,
  constraint notifications_brief_owner_fk foreign key (brief_id,user_id)
    references career_os.daily_briefs(id,user_id) on delete cascade
);
create table career_os.notification_deliveries (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  daily_run_id text,
  notification_id text,
  brief_id text,
  channel text not null check (channel in ('IN_APP','EMAIL')),
  provider text not null,
  status text not null check (status in ('PENDING','SENT','SKIPPED','FAILED','BLOCKED_QUOTA','NOT_CONFIGURED')),
  idempotency_key text not null,
  recipient text,
  provider_message_id text,
  error_code text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id,idempotency_key),
  constraint notification_deliveries_run_owner_fk foreign key (daily_run_id,user_id)
    references career_os.daily_career_runs(id,user_id) on delete cascade,
  constraint notification_deliveries_notification_owner_fk foreign key (notification_id,user_id)
    references career_os.notifications(id,user_id) on delete cascade,
  constraint notification_deliveries_brief_owner_fk foreign key (brief_id,user_id)
    references career_os.daily_briefs(id,user_id) on delete cascade
);
create index automation_settings_enabled_idx on career_os.automation_settings(daily_automation_enabled,user_id);
create index daily_career_runs_user_date_idx on career_os.daily_career_runs(user_id,local_date desc,created_at desc);
create index daily_career_runs_agent_owner_fk_idx on career_os.daily_career_runs(agent_run_id,user_id);
create index job_delta_events_user_run_idx on career_os.job_delta_events(user_id,daily_run_id,created_at);
create index job_delta_events_run_owner_fk_idx on career_os.job_delta_events(daily_run_id,user_id);
create index job_delta_events_job_owner_fk_idx on career_os.job_delta_events(job_id,user_id);
create index daily_briefs_user_date_idx on career_os.daily_briefs(user_id,local_date desc);
create index daily_briefs_run_owner_fk_idx on career_os.daily_briefs(daily_run_id,user_id);
create index notifications_user_unread_idx on career_os.notifications(user_id,read_at,created_at desc);
create index notifications_run_owner_fk_idx on career_os.notifications(daily_run_id,user_id);
create index notifications_job_owner_fk_idx on career_os.notifications(job_id,user_id);
create index notifications_brief_owner_fk_idx on career_os.notifications(brief_id,user_id);
create index notification_deliveries_user_channel_created_idx on career_os.notification_deliveries(user_id,channel,created_at desc);
create index notification_deliveries_run_owner_fk_idx on career_os.notification_deliveries(daily_run_id,user_id);
create index notification_deliveries_notification_owner_fk_idx on career_os.notification_deliveries(notification_id,user_id);
create index notification_deliveries_brief_owner_fk_idx on career_os.notification_deliveries(brief_id,user_id);
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'automation_settings','daily_career_runs','job_delta_events','daily_briefs',
    'notification_preferences','notifications','notification_deliveries'
  ] loop
    execute format('alter table career_os.%I enable row level security', table_name);
    execute format('create policy %I on career_os.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on career_os.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on career_os.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on career_os.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
    execute format('revoke all on career_os.%I from anon,authenticated', table_name);
    execute format('grant select,insert,update,delete on career_os.%I to authenticated', table_name);
  end loop;
end $$;
notify pgrst, 'reload schema';
