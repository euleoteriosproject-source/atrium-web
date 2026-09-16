-- Career OS VS6: application readiness, evidence-safe resumes, CRM and interview preparation.
-- Additive, deterministic, tenant-scoped and zero-cost. No auto apply and no public.ga_* changes.

create table career_os.canonical_resumes (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  version text not null,
  status text not null check (status in ('ACTIVE','ARCHIVED')),
  content jsonb not null,
  source_profile_updated_at timestamptz not null,
  intelligence_version text not null default 'resume-intelligence-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,version)
);
create table career_os.application_readiness_snapshots (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  opportunity_id text not null,
  job_id text not null,
  job_title text not null,
  company text not null,
  opportunity_score integer not null check (opportunity_score between 0 and 100),
  readiness_score integer not null check (readiness_score between 0 and 100),
  status text not null check (status in ('READY_TO_APPLY','APPLY_WITH_PREPARATION','PREPARE_FIRST','LOW_PRIORITY','BLOCKED','UNKNOWN')),
  recommendation text not null check (recommendation in ('APPLY_NOW','PREPARE_AND_APPLY','SAVE_FOR_LATER','SKIP','BLOCKED')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  market_representativeness text not null check (market_representativeness in ('REPRESENTATIVE','MODERATE','LIMITED','INSUFFICIENT')),
  representativeness_reason text not null,
  coverage jsonb not null,
  dimensions jsonb not null,
  resolutions jsonb not null default '[]',
  blockers text[] not null default '{}',
  warnings text[] not null default '{}',
  why_apply text[] not null default '{}',
  why_not_yet text[] not null default '{}',
  resume_evidence_coverage integer not null check (resume_evidence_coverage between 0 and 100),
  calculation_version text not null default 'application-readiness-v1',
  evidence_resolver_version text not null default 'evidence-resolver-v1',
  input_fingerprint text not null,
  calculated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,job_id,input_fingerprint),
  constraint application_readiness_job_owner_fk foreign key (job_id,user_id) references career_os.jobs(id,user_id) on delete cascade
);
create table career_os.tailored_resumes (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  canonical_resume_id text not null,
  opportunity_id text not null,
  job_id text not null,
  status text not null check (status in ('DRAFT','REVIEW_REQUIRED','APPROVED','USED','ARCHIVED')),
  version text not null,
  source_canonical_resume_version text not null,
  truth_policy_version text not null default 'resume-truth-policy-v1',
  content jsonb not null,
  evidence_coverage integer not null check (evidence_coverage between 0 and 100),
  diff text[] not null default '{}',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  used_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,job_id,version),
  constraint tailored_resume_canonical_owner_fk foreign key (canonical_resume_id,user_id) references career_os.canonical_resumes(id,user_id) on delete restrict,
  constraint tailored_resume_job_owner_fk foreign key (job_id,user_id) references career_os.jobs(id,user_id) on delete cascade
);
create table career_os.resume_claims (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  resume_id text not null,
  section text not null check (section in ('SUMMARY','EXPERIENCE','PROJECTS','SKILLS','EDUCATION','CERTIFICATIONS','LANGUAGES')),
  claim text not null,
  evidence_ids text[] not null default '{}',
  source_type text not null check (source_type in ('WORK_EXPERIENCE','PROJECT_EVIDENCE','CV_EVIDENCE','ASSESSMENT','INTERVIEW_FEEDBACK','STUDY_COMPLETION','CERTIFICATION','EDUCATION','LANGUAGE_EVIDENCE','SELF_REPORTED','MANUAL','UNKNOWN')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  truth_status text not null check (truth_status in ('ALLOWED','ALLOWED_WITH_REVIEW','BLOCKED')),
  truth_reason text not null,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (id,user_id),
  constraint resume_claims_resume_owner_fk foreign key (resume_id,user_id) references career_os.tailored_resumes(id,user_id) on delete cascade
);
create table career_os.applications (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  opportunity_id text not null,
  job_id text not null,
  job_title text not null,
  company text not null,
  current_stage text not null check (current_stage in ('PREPARING','APPLIED','RECRUITER_CONTACT','SCREENING','INTERVIEW','TECHNICAL_INTERVIEW','SYSTEM_DESIGN','FINAL_INTERVIEW','OFFER','REJECTED','WITHDRAWN','CLOSED')),
  applied_at timestamptz,
  resume_version_id text,
  readiness_snapshot_id text not null,
  source text not null default 'USER' check (source = 'USER'),
  notes text not null default '',
  apply_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,job_id),
  constraint applications_job_owner_fk foreign key (job_id,user_id) references career_os.jobs(id,user_id) on delete restrict,
  constraint applications_resume_owner_fk foreign key (resume_version_id,user_id) references career_os.tailored_resumes(id,user_id) on delete restrict,
  constraint applications_readiness_owner_fk foreign key (readiness_snapshot_id,user_id) references career_os.application_readiness_snapshots(id,user_id) on delete restrict
);
create table career_os.application_stage_events (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  application_id text not null,
  from_stage text check (from_stage is null or from_stage in ('PREPARING','APPLIED','RECRUITER_CONTACT','SCREENING','INTERVIEW','TECHNICAL_INTERVIEW','SYSTEM_DESIGN','FINAL_INTERVIEW','OFFER','REJECTED','WITHDRAWN','CLOSED')),
  to_stage text not null check (to_stage in ('PREPARING','APPLIED','RECRUITER_CONTACT','SCREENING','INTERVIEW','TECHNICAL_INTERVIEW','SYSTEM_DESIGN','FINAL_INTERVIEW','OFFER','REJECTED','WITHDRAWN','CLOSED')),
  occurred_at timestamptz not null,
  notes text,
  source text not null check (source in ('USER','SYSTEM')),
  created_at timestamptz not null default now(),
  unique (id,user_id),
  constraint application_stage_events_owner_fk foreign key (application_id,user_id) references career_os.applications(id,user_id) on delete cascade
);
create table career_os.application_snapshots (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  application_id text not null,
  job_snapshot jsonb not null,
  resume_snapshot jsonb not null,
  readiness_snapshot jsonb not null,
  evidence_snapshot jsonb not null,
  opportunity_score integer not null check (opportunity_score between 0 and 100),
  application_url text,
  applied_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,application_id),
  constraint application_snapshots_owner_fk foreign key (application_id,user_id) references career_os.applications(id,user_id) on delete cascade
);
create table career_os.application_feedback (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  application_id text not null,
  source text not null check (source in ('USER','RECRUITER','INTERVIEW','OUTCOME')),
  type text not null check (type in ('SKILL','EXPERIENCE','COMMUNICATION','SYSTEM_DESIGN','LANGUAGE','DOMAIN','PROCESS','OTHER')),
  content text not null,
  evidence_status text not null default 'REVIEW_REQUIRED' check (evidence_status in ('REVIEW_REQUIRED','ACCEPTED','REJECTED')),
  created_at timestamptz not null default now(),
  unique (id,user_id),
  constraint application_feedback_owner_fk foreign key (application_id,user_id) references career_os.applications(id,user_id) on delete cascade
);
create table career_os.application_outcomes (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  application_id text not null,
  type text not null check (type in ('OFFER','REJECTED','WITHDRAWN','NO_RESPONSE','POSITION_CLOSED','OTHER')),
  rejection_reason text not null default 'UNKNOWN' check (rejection_reason in ('TECHNICAL','EXPERIENCE','LANGUAGE','CULTURE','COMPENSATION','LOCATION','UNKNOWN')),
  notes text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,application_id),
  constraint application_outcomes_owner_fk foreign key (application_id,user_id) references career_os.applications(id,user_id) on delete cascade
);
create table career_os.interview_question_templates (
  id text primary key,
  category text not null,
  seniority text not null check (seniority in ('ANY','MID','SENIOR','STAFF')),
  question_type text not null check (question_type in ('CONCEPT','TRADE_OFF','SCENARIO','DEBUGGING','SYSTEM_DESIGN','EXPERIENCE','BEHAVIORAL','PROJECT')),
  question text not null,
  evaluation_signals text[] not null default '{}',
  active boolean not null default true,
  version text not null,
  created_at timestamptz not null default now()
);
create table career_os.interview_preparation_plans (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  application_id text not null,
  job_id text not null,
  risk_score integer not null check (risk_score between 0 and 100),
  risk_level text not null check (risk_level in ('LOW','MEDIUM','HIGH','CRITICAL','UNKNOWN')),
  risks jsonb not null default '[]',
  status text not null check (status in ('ACTIVE','COMPLETED','ARCHIVED')),
  version text not null default 'interview-risk-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,application_id,version),
  constraint interview_plans_application_owner_fk foreign key (application_id,user_id) references career_os.applications(id,user_id) on delete cascade,
  constraint interview_plans_job_owner_fk foreign key (job_id,user_id) references career_os.jobs(id,user_id) on delete cascade
);
create table career_os.interview_preparation_items (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  plan_id text not null,
  requirement_id text,
  topic text not null,
  area text not null check (area in ('TECHNICAL_CONCEPT','SYSTEM_DESIGN','ARCHITECTURE','BEHAVIORAL','EXPERIENCE_STORY','PROJECT_STORY','DOMAIN','LANGUAGE')),
  risk text not null check (risk in ('LOW','MEDIUM','HIGH','CRITICAL','UNKNOWN')),
  priority integer not null check (priority between 0 and 100),
  why text not null,
  evidence_to_review text[] not null default '{}',
  question_types text[] not null default '{}',
  questions text[] not null default '{}',
  practice_status text not null check (practice_status in ('NOT_STARTED','PRACTICING','READY','NEEDS_WORK')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  constraint interview_items_plan_owner_fk foreign key (plan_id,user_id) references career_os.interview_preparation_plans(id,user_id) on delete cascade
);
create table career_os.application_stories (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  application_id text not null,
  kind text not null check (kind in ('EXPERIENCE','PROJECT')),
  source_id text not null,
  title text not null,
  situation text not null,
  task text not null,
  action text not null,
  result text not null,
  evidence_ids text[] not null default '{}',
  truth_status text not null check (truth_status in ('ALLOWED','ALLOWED_WITH_REVIEW','BLOCKED')),
  created_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,application_id,kind,source_id),
  constraint application_stories_owner_fk foreign key (application_id,user_id) references career_os.applications(id,user_id) on delete cascade
);
create index canonical_resumes_user_status_idx on career_os.canonical_resumes(user_id,status,updated_at desc);
create index readiness_user_opportunity_idx on career_os.application_readiness_snapshots(user_id,opportunity_id,calculated_at desc);
create index readiness_job_owner_idx on career_os.application_readiness_snapshots(job_id,user_id);
create index tailored_resumes_user_status_idx on career_os.tailored_resumes(user_id,status,updated_at desc);
create index tailored_resumes_canonical_owner_idx on career_os.tailored_resumes(canonical_resume_id,user_id);
create index tailored_resumes_job_owner_idx on career_os.tailored_resumes(job_id,user_id);
create index resume_claims_resume_owner_idx on career_os.resume_claims(resume_id,user_id,position);
create index applications_user_stage_idx on career_os.applications(user_id,current_stage,updated_at desc);
create index applications_job_owner_idx on career_os.applications(job_id,user_id);
create index applications_resume_owner_idx on career_os.applications(resume_version_id,user_id);
create index applications_readiness_owner_idx on career_os.applications(readiness_snapshot_id,user_id);
create index application_stage_events_owner_idx on career_os.application_stage_events(application_id,user_id,occurred_at);
create index application_snapshots_owner_idx on career_os.application_snapshots(application_id,user_id);
create index application_feedback_owner_idx on career_os.application_feedback(application_id,user_id,created_at desc);
create index application_outcomes_owner_idx on career_os.application_outcomes(application_id,user_id);
create index interview_plans_application_owner_idx on career_os.interview_preparation_plans(application_id,user_id);
create index interview_plans_job_owner_idx on career_os.interview_preparation_plans(job_id,user_id);
create index interview_items_plan_owner_idx on career_os.interview_preparation_items(plan_id,user_id,priority desc);
create index interview_items_requirement_idx on career_os.interview_preparation_items(requirement_id);
create index application_stories_owner_idx on career_os.application_stories(application_id,user_id);
alter table career_os.interview_question_templates enable row level security;
create policy interview_questions_authenticated_read on career_os.interview_question_templates for select to authenticated using (true);
revoke all on career_os.interview_question_templates from anon,authenticated;
grant select on career_os.interview_question_templates to authenticated;
grant all on career_os.interview_question_templates to service_role;
do $$
declare table_name text;
begin
  foreach table_name in array array['canonical_resumes','application_readiness_snapshots','tailored_resumes','resume_claims','applications','application_feedback','application_outcomes','interview_preparation_plans','interview_preparation_items','application_stories'] loop
    execute format('alter table career_os.%I enable row level security', table_name);
    execute format('create policy %I on career_os.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on career_os.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on career_os.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on career_os.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
    execute format('revoke all on career_os.%I from anon,authenticated', table_name);
    execute format('grant select,insert,update,delete on career_os.%I to authenticated,service_role', table_name);
  end loop;
end $$;
do $$
declare table_name text;
begin
  foreach table_name in array array['application_stage_events','application_snapshots'] loop
    execute format('alter table career_os.%I enable row level security', table_name);
    execute format('create policy %I on career_os.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on career_os.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('revoke all on career_os.%I from anon,authenticated', table_name);
    execute format('grant select,insert on career_os.%I to authenticated', table_name);
    execute format('grant all on career_os.%I to service_role', table_name);
  end loop;
end $$;
insert into career_os.interview_question_templates (id,category,seniority,question_type,question,evaluation_signals,active,version) values
('iq_concept','TECHNICAL','ANY','CONCEPT','Explain the core concepts behind {topic} and when you would not use it.',array['correct fundamentals','clear boundaries','no unsupported claim'],true,'v1'),
('iq_tradeoff','TECHNICAL','SENIOR','TRADE_OFF','Which trade-offs would you evaluate before adopting {topic} in production?',array['alternatives','operational cost','failure modes'],true,'v1'),
('iq_scenario','TECHNICAL','ANY','SCENARIO','A production workflow using {topic} is degrading. How would you investigate it?',array['hypothesis order','observability','safe mitigation'],true,'v1'),
('iq_debugging','TECHNICAL','ANY','DEBUGGING','Describe a deterministic debugging plan for a failure involving {topic}.',array['reproduction','instrumentation','verification'],true,'v1'),
('iq_system_design','ARCHITECTURE','SENIOR','SYSTEM_DESIGN','Design a reliable service where {topic} is a material requirement. State assumptions and failure handling.',array['requirements','trade-offs','security','operability'],true,'v1'),
('iq_experience','EVIDENCE','ANY','EXPERIENCE','Which verified work evidence best demonstrates {topic}, and what was your exact contribution?',array['specific ownership','traceable evidence','no project/work conflation'],true,'v1'),
('iq_project','EVIDENCE','ANY','PROJECT','Which verified project evidence demonstrates {topic}, and which limitation remains?',array['project clearly labeled','proof reference','honest limitations'],true,'v1'),
('iq_behavioral','BEHAVIORAL','ANY','BEHAVIORAL','Tell a factual story about a difficult decision related to {topic}. What evidence supports the outcome?',array['situation','action','supported result'],true,'v1');
notify pgrst, 'reload schema';
