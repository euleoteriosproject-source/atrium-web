-- Career OS Vertical Slice 2: tenant-owned job source registry, search runs and snapshots.
-- Additive only; existing VS1.5 data and unrelated public.ga_* objects are untouched.

create table career_os.company_sources (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  company text not null,
  source_type text not null check (source_type in ('GREENHOUSE','LEVER','COMPANY_CAREERS')),
  external_identifier text,
  career_url text,
  enabled boolean not null default true,
  priority integer not null default 50 check (priority between 0 and 100),
  cost_type text not null default 'FREE' check (cost_type in ('FREE','FREE_TIER','PAID','UNKNOWN')),
  last_status text,
  last_run_at timestamptz,
  last_jobs_found integer not null default 0 check (last_jobs_found >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,source_type,external_identifier),
  check (
    (source_type in ('GREENHOUSE','LEVER') and external_identifier is not null and career_url is null)
    or (source_type = 'COMPANY_CAREERS' and career_url is not null)
  )
);
create table career_os.job_search_runs (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  search_profile_id text not null,
  agent_run_id text,
  status text not null check (status in ('RUNNING','SUCCEEDED','PARTIAL','FAILED')),
  discovered integer not null default 0,
  normalized integer not null default 0,
  duplicates integer not null default 0,
  persisted integer not null default 0,
  rejected integer not null default 0,
  errors jsonb not null default '[]',
  warnings jsonb not null default '[]',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (id,user_id),
  constraint job_search_runs_profile_owner_fk foreign key (search_profile_id,user_id)
    references career_os.search_profiles(id,user_id) on delete cascade,
  constraint job_search_runs_agent_owner_fk foreign key (agent_run_id,user_id)
    references career_os.agent_runs(id,user_id) on delete set null (agent_run_id)
);
create table career_os.job_source_runs (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  job_search_run_id text not null,
  company_source_id text,
  source_type text not null check (source_type in ('GREENHOUSE','LEVER','COMPANY_CAREERS')),
  status text not null check (status in ('SUCCESS','EMPTY','FAILED','TIMEOUT','RATE_LIMITED','COST_BLOCKED','SECURITY_BLOCKED','UNSUPPORTED')),
  jobs_found integer not null default 0 check (jobs_found >= 0),
  error_code text,
  warnings jsonb not null default '[]',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint job_source_runs_search_owner_fk foreign key (job_search_run_id,user_id)
    references career_os.job_search_runs(id,user_id) on delete cascade,
  constraint job_source_runs_company_owner_fk foreign key (company_source_id,user_id)
    references career_os.company_sources(id,user_id) on delete set null (company_source_id)
);
create table career_os.job_snapshots (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  job_id text not null,
  checked_at timestamptz not null,
  status text not null,
  title text not null,
  location text not null,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  description_hash text not null,
  apply_available boolean not null default false,
  validation_confidence integer not null check (validation_confidence between 0 and 100),
  changes jsonb not null default '[]',
  created_at timestamptz not null default now(),
  constraint job_snapshots_job_owner_fk foreign key (job_id,user_id)
    references career_os.jobs(id,user_id) on delete cascade
);
alter table career_os.jobs
  add column lifecycle_status text not null default 'ACTIVE_UNVERIFIED',
  add column canonical_url text,
  add column description_hash text,
  add column location_confidence integer check (location_confidence between 0 and 100),
  add column salary_period text,
  add column salary_source text,
  add column salary_confidence integer check (salary_confidence between 0 and 100),
  add column last_validated_at timestamptz;
alter table career_os.job_sources
  add column source_type text not null default 'MANUAL',
  add column company_source_id text,
  add column is_canonical boolean not null default false,
  add column official_status text not null default 'UNVERIFIED',
  add column raw_metadata jsonb not null default '{}',
  add constraint job_sources_company_owner_fk foreign key (company_source_id,user_id)
    references career_os.company_sources(id,user_id) on delete set null (company_source_id);
create index company_sources_user_enabled_priority_idx on career_os.company_sources(user_id,enabled,priority desc);
create index job_search_runs_user_started_idx on career_os.job_search_runs(user_id,started_at desc);
create index job_search_runs_profile_owner_fk_idx on career_os.job_search_runs(search_profile_id,user_id);
create index job_search_runs_agent_owner_fk_idx on career_os.job_search_runs(agent_run_id,user_id);
create index job_source_runs_user_search_idx on career_os.job_source_runs(user_id,job_search_run_id);
create index job_source_runs_search_owner_fk_idx on career_os.job_source_runs(job_search_run_id,user_id);
create index job_source_runs_company_owner_fk_idx on career_os.job_source_runs(company_source_id,user_id);
create index job_snapshots_user_job_checked_idx on career_os.job_snapshots(user_id,job_id,checked_at desc);
create index job_snapshots_job_owner_fk_idx on career_os.job_snapshots(job_id,user_id);
create index job_sources_company_owner_fk_idx on career_os.job_sources(company_source_id,user_id);
create index jobs_user_lifecycle_idx on career_os.jobs(user_id,lifecycle_status,created_at desc);
do $$
declare table_name text;
begin
  foreach table_name in array array['company_sources','job_search_runs','job_source_runs','job_snapshots'] loop
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
