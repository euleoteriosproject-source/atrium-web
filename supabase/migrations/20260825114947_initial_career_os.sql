-- Career OS Vertical Slice 1.5 — PostgreSQL/Supabase production foundation.
-- Every exposed table is deny-by-default and scoped to auth.uid().
-- Domain IDs are text because the deterministic pipeline uses prefixed UUIDs.

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.career_profiles (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  location text not null default '',
  current_titles text[] not null default '{}',
  target_titles text[] not null default '{}',
  seniority text not null default 'UNKNOWN',
  languages jsonb not null default '[]',
  employment_preferences text[] not null default '{}',
  salary_goal numeric(14,2),
  currency char(3) not null default 'BRL',
  career_goals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id),
  unique(id,user_id)
);

create table public.skills (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  canonical_name text not null,
  created_at timestamptz not null default now(),
  unique(user_id,canonical_name),
  unique(id,user_id)
);

create table public.career_skills (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  career_profile_id text not null,
  skill_id text not null,
  level text not null,
  years numeric(4,1) not null default 0,
  evidence text[] not null default '{}',
  unique(career_profile_id,skill_id),
  constraint career_skills_profile_owner_fk
    foreign key (career_profile_id,user_id) references public.career_profiles(id,user_id) on delete cascade,
  constraint career_skills_skill_owner_fk
    foreign key (skill_id,user_id) references public.skills(id,user_id) on delete cascade
);

create table public.experiences (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  career_profile_id text not null,
  company text not null,
  role text not null,
  start_date date not null,
  end_date date,
  highlights text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint experiences_profile_owner_fk
    foreign key (career_profile_id,user_id) references public.career_profiles(id,user_id) on delete cascade
);

create table public.search_profiles (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  status text not null check(status in ('ACTIVE','PAUSED','ARCHIVED')),
  titles text[] not null default '{}',
  aliases text[] not null default '{}',
  seniorities text[] not null default '{}',
  technologies text[] not null default '{}',
  locations text[] not null default '{}',
  work_models text[] not null default '{}',
  contract_types text[] not null default '{}',
  minimum_salary numeric(14,2),
  currency char(3) not null default 'BRL',
  included_companies text[] not null default '{}',
  excluded_companies text[] not null default '{}',
  included_keywords text[] not null default '{}',
  excluded_keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id,user_id)
);

create table public.policies (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text not null,
  kind text not null check(kind in ('HARD_FILTER','SOFT_FILTER','CONDITIONAL_EXCEPTION')),
  effect text not null check(effect in ('ALLOW','REJECT','SCORE')),
  weight numeric(6,2) not null default 0,
  active boolean not null default true,
  priority integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id,user_id)
);

create table public.policy_conditions (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  policy_id text not null,
  field text not null,
  operator text not null check(operator in ('EQ','IN','GTE','LTE','CONTAINS')),
  value jsonb not null,
  position integer not null default 0,
  constraint policy_conditions_policy_owner_fk
    foreign key (policy_id,user_id) references public.policies(id,user_id) on delete cascade
);

create table public.jobs (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  company text not null,
  title text not null,
  description text not null,
  raw_location text not null,
  country text,
  state text,
  city text,
  work_model text not null,
  seniority text not null,
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  currency char(3),
  contract_type text not null,
  published_at timestamptz,
  skills text[] not null default '{}',
  mandatory_skills text[] not null default '{}',
  fingerprint text,
  created_at timestamptz not null default now(),
  normalized_at timestamptz not null default now(),
  unique(user_id,fingerprint),
  unique(id,user_id)
);

create table public.job_sources (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  job_id text not null,
  source text not null,
  source_url text not null,
  external_id text,
  imported_at timestamptz not null default now(),
  unique(user_id,source_url),
  constraint job_sources_job_owner_fk
    foreign key (job_id,user_id) references public.jobs(id,user_id) on delete cascade
);

create table public.job_validations (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  job_id text not null,
  status text not null,
  confidence integer not null check(confidence between 0 and 100),
  evidence text[] not null default '{}',
  source_url text not null,
  checked_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(user_id,job_id),
  constraint job_validations_job_owner_fk
    foreign key (job_id,user_id) references public.jobs(id,user_id) on delete cascade
);

create table public.job_matches (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  job_id text not null,
  search_profile_id text,
  score integer not null check(score between 0 and 100),
  dimensions jsonb not null,
  strong_skills text[] not null default '{}',
  partial_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  evidence text[] not null default '{}',
  critic_risks text[] not null default '{}',
  blocking_risks text[] not null default '{}',
  confidence_adjustment integer not null default 0,
  policy_result jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id,job_id),
  constraint job_matches_job_owner_fk
    foreign key (job_id,user_id) references public.jobs(id,user_id) on delete cascade,
  constraint job_matches_search_owner_fk
    foreign key (search_profile_id,user_id) references public.search_profiles(id,user_id)
    on delete set null (search_profile_id)
);

create table public.job_scores (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  job_id text not null,
  score integer not null check(score between 0 and 100),
  recommendation text not null,
  breakdown jsonb not null,
  rationale text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(user_id,job_id),
  constraint job_scores_job_owner_fk
    foreign key (job_id,user_id) references public.jobs(id,user_id) on delete cascade
);

create table public.job_decisions (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  job_id text not null,
  decision text not null check(decision in ('SAVE','INTERESTED','SKIP')),
  created_at timestamptz not null default now(),
  constraint job_decisions_job_owner_fk
    foreign key (job_id,user_id) references public.jobs(id,user_id) on delete cascade
);

create table public.agent_runs (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null,
  status text not null,
  input jsonb not null default '{}',
  output jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text,
  unique(id,user_id)
);

create table public.agent_steps (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  agent_run_id text not null,
  agent text not null,
  status text not null,
  evidence jsonb not null default '[]',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text,
  constraint agent_steps_run_owner_fk
    foreign key (agent_run_id,user_id) references public.agent_runs(id,user_id) on delete cascade
);

-- Ownership, FK and common ordering indexes.
create index career_skills_user_profile_idx on public.career_skills(user_id,career_profile_id);
create index career_skills_user_skill_idx on public.career_skills(user_id,skill_id);
create index experiences_user_profile_idx on public.experiences(user_id,career_profile_id);
create index search_profiles_user_status_idx on public.search_profiles(user_id,status);
create index policies_user_active_idx on public.policies(user_id,active);
create index policy_conditions_user_policy_idx on public.policy_conditions(user_id,policy_id);
create index jobs_user_created_idx on public.jobs(user_id,created_at desc);
create index job_sources_user_job_idx on public.job_sources(user_id,job_id);
create index job_validations_user_job_checked_idx on public.job_validations(user_id,job_id,checked_at desc);
create index job_matches_user_search_idx on public.job_matches(user_id,search_profile_id);
create index job_scores_user_score_idx on public.job_scores(user_id,score desc);
create index job_decisions_user_job_created_idx on public.job_decisions(user_id,job_id,created_at desc);
create index agent_runs_user_started_idx on public.agent_runs(user_id,started_at desc);
create index agent_steps_user_run_idx on public.agent_steps(user_id,agent_run_id);

alter table public.users enable row level security;
create policy users_select_own on public.users
  for select to authenticated using ((select auth.uid()) = id);
create policy users_insert_own on public.users
  for insert to authenticated with check ((select auth.uid()) = id);
create policy users_update_own on public.users
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy users_delete_own on public.users
  for delete to authenticated using ((select auth.uid()) = id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'career_profiles','skills','career_skills','experiences','search_profiles',
    'policies','policy_conditions','jobs','job_sources','job_validations',
    'job_matches','job_scores','job_decisions','agent_runs','agent_steps'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_select_own', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',
      table_name || '_insert_own', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name || '_update_own', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_delete_own', table_name
    );
  end loop;
end
$$;

revoke all on table
  public.users,public.career_profiles,public.skills,public.career_skills,
  public.experiences,public.search_profiles,public.policies,public.policy_conditions,
  public.jobs,public.job_sources,public.job_validations,public.job_matches,
  public.job_scores,public.job_decisions,public.agent_runs,public.agent_steps
from anon,authenticated;

grant select,insert,update,delete on table
  public.users,public.career_profiles,public.skills,public.career_skills,
  public.experiences,public.search_profiles,public.policies,public.policy_conditions,
  public.jobs,public.job_sources,public.job_validations,public.job_matches,
  public.job_scores,public.job_decisions,public.agent_runs,public.agent_steps
to authenticated;

;
