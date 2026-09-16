-- Career OS VS5: deterministic project intelligence, portfolio optimization and project evidence.
-- Additive, tenant-scoped and zero-cost. It does not alter professional experience or public.ga_*.

create table career_os.project_templates (
  id text primary key,
  name text not null unique,
  category text not null check (category in ('BACKEND_PLATFORM','EVENT_DRIVEN_SYSTEM','CLOUD_PLATFORM','DATA_PIPELINE','AI_AGENT_SYSTEM','AI_RAG_SYSTEM','FINTECH_SYSTEM','OBSERVABILITY_PLATFORM','SECURITY_FOCUSED_BACKEND','DISTRIBUTED_SYSTEM','INTEGRATION_PLATFORM','OTHER')),
  description text not null,
  supported_evidence_types text[] not null default '{}',
  supported_domains text[] not null default '{}',
  minimum_complexity text not null check (minimum_complexity in ('BASIC','SOLID','ADVANCED','SENIOR','STAFF_LEVEL')),
  seniority_target text not null check (seniority_target in ('MID','SENIOR','STAFF')),
  default_architecture jsonb not null default '[]',
  estimated_effort text not null check (estimated_effort in ('LOW','MEDIUM','HIGH','VERY_HIGH')),
  estimated_runtime_cost text not null check (estimated_runtime_cost in ('FREE','FREE_TIER','PAID','UNKNOWN')),
  implementation_mode text not null check (implementation_mode in ('LOCAL_FIRST','FREE_CLOUD','HYBRID')),
  technology_justifications jsonb not null default '{}',
  failure_scenarios text[] not null default '{}',
  prerequisites text[] not null default '{}',
  differentiation integer not null check (differentiation between 0 and 100),
  interview_value integer not null check (interview_value between 0 and 100),
  active boolean not null default true,
  version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table career_os.project_template_skills (
  template_id text not null references career_os.project_templates(id) on delete cascade,
  requirement_id text not null references career_os.requirement_taxonomy(id) on delete cascade,
  coverage_type text not null check (coverage_type in ('SKILL','DOMAIN','EVIDENCE')),
  justification text not null,
  primary key (template_id,requirement_id)
);
create table career_os.project_recommendations (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  search_profile_id text,
  market_snapshot_id text not null,
  template_id text not null references career_os.project_templates(id),
  title text not null,
  summary text not null,
  roi_score integer not null check (roi_score between 0 and 100),
  roi_version text not null,
  effort text not null check (effort in ('LOW','MEDIUM','HIGH','VERY_HIGH')),
  market_confidence text not null check (market_confidence in ('HIGH_CONFIDENCE','MEDIUM_CONFIDENCE','LOW_CONFIDENCE','INSUFFICIENT_DATA')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  readiness text not null check (readiness in ('READY','NEEDS_FOUNDATION','NOT_RECOMMENDED')),
  status text not null check (status in ('RECOMMENDED','ACCEPTED','DISMISSED','ARCHIVED','STARTED','COMPLETED')),
  coverage jsonb not null,
  roi_breakdown jsonb not null,
  why text[] not null default '{}',
  warnings text[] not null default '{}',
  quality_score integer not null check (quality_score between 0 and 100),
  quality_level text not null check (quality_level in ('BASIC','SOLID','ADVANCED','SENIOR','STAFF_LEVEL')),
  architecture_coherence integer not null check (architecture_coherence between 0 and 100),
  supported_requirements jsonb not null default '[]',
  related_jobs jsonb not null default '[]',
  blueprint jsonb not null,
  scope_fingerprint text not null,
  calculation_version text not null default 'project-intelligence-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,scope_fingerprint),
  constraint project_recommendations_profile_owner_fk foreign key (search_profile_id,user_id) references career_os.search_profiles(id,user_id) on delete cascade,
  constraint project_recommendations_snapshot_owner_fk foreign key (market_snapshot_id,user_id) references career_os.market_snapshots(id,user_id) on delete cascade
);
create table career_os.project_recommendation_gaps (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  recommendation_id text not null,
  requirement_id text not null references career_os.requirement_taxonomy(id),
  coverage text not null check (coverage in ('FULL','PARTIAL')),
  created_at timestamptz not null default now(),
  unique (user_id,recommendation_id,requirement_id),
  constraint project_recommendation_gaps_owner_fk foreign key (recommendation_id,user_id) references career_os.project_recommendations(id,user_id) on delete cascade
);
create table career_os.portfolio_sets (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  strategy text not null check (strategy in ('OVERALL','IMMEDIATE_EMPLOYABILITY','AI_TRANSITION','BACKEND_PLATFORM')),
  roi_score integer not null check (roi_score between 0 and 100),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  overlap text not null check (overlap in ('LOW','MEDIUM','HIGH')),
  overlap_score integer not null check (overlap_score between 0 and 100),
  unique_gap_coverage integer not null check (unique_gap_coverage >= 0),
  unique_evidence_coverage integer not null check (unique_evidence_coverage >= 0),
  unique_market_coverage integer not null check (unique_market_coverage >= 0),
  calculation_version text not null,
  scope_fingerprint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,strategy,scope_fingerprint)
);
create table career_os.portfolio_set_projects (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  portfolio_set_id text not null,
  recommendation_id text not null,
  position integer not null check (position between 1 and 3),
  unique (user_id,portfolio_set_id,recommendation_id),
  unique (user_id,portfolio_set_id,position),
  constraint portfolio_set_projects_set_owner_fk foreign key (portfolio_set_id,user_id) references career_os.portfolio_sets(id,user_id) on delete cascade,
  constraint portfolio_set_projects_recommendation_owner_fk foreign key (recommendation_id,user_id) references career_os.project_recommendations(id,user_id) on delete cascade
);
create table career_os.portfolio_projects (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  recommendation_id text,
  title text not null,
  problem text not null,
  business_context text not null,
  architecture jsonb not null default '[]',
  stack text[] not null default '{}',
  status text not null check (status in ('PLANNED','IN_PROGRESS','BLOCKED','COMPLETED','ARCHIVED')),
  started_at timestamptz,
  completed_at timestamptz,
  repository_url text,
  deployment_url text,
  documentation_url text,
  blueprint jsonb not null,
  blueprint_version text not null default 'blueprint-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,recommendation_id),
  constraint portfolio_projects_recommendation_owner_fk foreign key (recommendation_id,user_id) references career_os.project_recommendations(id,user_id) on delete set null (recommendation_id)
);
create table career_os.project_milestones (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  project_id text not null,
  title text not null,
  position integer not null check (position > 0),
  status text not null check (status in ('TODO','IN_PROGRESS','DONE','SKIPPED')),
  unique (id,user_id),
  unique (user_id,project_id,position),
  constraint project_milestones_project_owner_fk foreign key (project_id,user_id) references career_os.portfolio_projects(id,user_id) on delete cascade
);
create table career_os.project_tasks (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  project_id text not null,
  milestone_id text not null,
  title text not null,
  position integer not null check (position > 0),
  status text not null check (status in ('TODO','IN_PROGRESS','DONE','SKIPPED')),
  unique (user_id,milestone_id,position),
  constraint project_tasks_project_owner_fk foreign key (project_id,user_id) references career_os.portfolio_projects(id,user_id) on delete cascade,
  constraint project_tasks_milestone_owner_fk foreign key (milestone_id,user_id) references career_os.project_milestones(id,user_id) on delete cascade
);
create table career_os.project_evidence_claims (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  project_id text not null,
  requirement_id text references career_os.requirement_taxonomy(id),
  skill_id text,
  evidence_type text not null check (evidence_type in ('TECHNOLOGY','ARCHITECTURE','SECURITY','OBSERVABILITY','TESTING','DEPLOYMENT','CI_CD','PERFORMANCE','SCALABILITY','FAILURE_HANDLING','DATA_MODELING','API_DESIGN','EVENT_DRIVEN','INFRASTRUCTURE_AS_CODE','CLOUD','AI_ENGINEERING','DOMAIN_KNOWLEDGE','DOCUMENTATION','TRADE_OFF_ANALYSIS')),
  evidence_origin text not null default 'PROJECT_EVIDENCE' check (evidence_origin = 'PROJECT_EVIDENCE'),
  claim text not null,
  proof_type text not null check (proof_type in ('CODE','TEST','DEPLOYMENT','DOCUMENTATION','ARCHITECTURE_DECISION','DEMO','METRIC','SCREENSHOT_REFERENCE','MANUAL_REVIEW')),
  proof_reference text,
  status text not null check (status in ('PLANNED','IMPLEMENTED','VERIFIED','REJECTED')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  depth text not null check (depth in ('BASIC','SOLID','ADVANCED')),
  builder_version text not null default 'evidence-builder-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,project_id,evidence_type,requirement_id),
  constraint project_evidence_project_owner_fk foreign key (project_id,user_id) references career_os.portfolio_projects(id,user_id) on delete cascade,
  constraint project_evidence_skill_owner_fk foreign key (skill_id,user_id) references career_os.skills(id,user_id) on delete set null (skill_id)
);
create index project_recommendations_user_status_idx on career_os.project_recommendations(user_id,status,roi_score desc);
create index project_recommendations_snapshot_idx on career_os.project_recommendations(market_snapshot_id,user_id);
create index portfolio_projects_user_status_idx on career_os.portfolio_projects(user_id,status,updated_at desc);
create index project_evidence_project_idx on career_os.project_evidence_claims(project_id,user_id,status);
alter table career_os.project_templates enable row level security;
alter table career_os.project_template_skills enable row level security;
create policy project_templates_authenticated_read on career_os.project_templates for select to authenticated using (true);
create policy project_template_skills_authenticated_read on career_os.project_template_skills for select to authenticated using (true);
revoke all on career_os.project_templates,career_os.project_template_skills from anon,authenticated;
grant select on career_os.project_templates,career_os.project_template_skills to authenticated;
grant all on career_os.project_templates,career_os.project_template_skills to service_role;
do $$
declare table_name text;
begin
  foreach table_name in array array['project_recommendations','project_recommendation_gaps','portfolio_sets','portfolio_set_projects','portfolio_projects','project_milestones','project_tasks','project_evidence_claims'] loop
    execute format('alter table career_os.%I enable row level security', table_name);
    execute format('create policy %I on career_os.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on career_os.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on career_os.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on career_os.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
    execute format('revoke all on career_os.%I from anon,authenticated', table_name);
    execute format('grant select,insert,update,delete on career_os.%I to authenticated,service_role', table_name);
  end loop;
end $$;
insert into career_os.project_templates (id,name,category,description,supported_evidence_types,supported_domains,minimum_complexity,seniority_target,default_architecture,estimated_effort,estimated_runtime_cost,implementation_mode,technology_justifications,failure_scenarios,prerequisites,differentiation,interview_value,active,version) values
('tpl_event_payment','Event-Driven Payment Platform','FINTECH_SYSTEM','Payment authorization and reconciliation with explicit consistency and audit controls.',array['TECHNOLOGY','ARCHITECTURE','EVENT_DRIVEN','FAILURE_HANDLING','SECURITY','OBSERVABILITY','TESTING','DATA_MODELING','API_DESIGN','DOMAIN_KNOWLEDGE','TRADE_OFF_ANALYSIS','DOCUMENTATION'],array['req_payments','req_fintech'],'SENIOR','SENIOR','["modular monolith with transactional outbox","asynchronous event processing","idempotent reconciliation worker","PostgreSQL ledger"]','HIGH','FREE','LOCAL_FIRST','{"Kafka":"event distribution and retries","PostgreSQL":"transactional ledger invariants","Docker":"zero-cost reproducibility"}',array['duplicate event','downstream timeout','poison message','partial reconciliation failure'],array['req_java'],94,96,true,'v1'),
('tpl_cloud_order','Cloud-Native Order Platform','CLOUD_PLATFORM','Operable order platform focused on infrastructure, delivery and resilience.',array['TECHNOLOGY','ARCHITECTURE','CLOUD','INFRASTRUCTURE_AS_CODE','CI_CD','DEPLOYMENT','OBSERVABILITY','SECURITY','TESTING','FAILURE_HANDLING','DOCUMENTATION','TRADE_OFF_ANALYSIS'],array['req_ecommerce'],'SENIOR','SENIOR','["modular order service","infrastructure modules","continuous delivery pipeline","service-level indicators"]','HIGH','FREE_TIER','HYBRID','{"Kubernetes":"health and recovery behavior","Terraform":"reproducible infrastructure","AWS":"documented cloud model with free/local path"}',array['database unavailable','deployment rollback','resource exhaustion','partial cloud outage'],array['req_docker'],88,92,true,'v1'),
('tpl_agent_ops','AI Agent Operations Platform','AI_AGENT_SYSTEM','Deterministic-first control plane for agent runs, permissions, budgets and evaluations.',array['AI_ENGINEERING','ARCHITECTURE','SECURITY','OBSERVABILITY','TESTING','FAILURE_HANDLING','API_DESIGN','DATA_MODELING','CI_CD','DOCUMENTATION','TRADE_OFF_ANALYSIS'],array[]::text[],'SENIOR','SENIOR','["agent run state machine","policy-guarded tool gateway","evaluation harness","budget and telemetry ledger"]','HIGH','FREE','LOCAL_FIRST','{"Python":"evaluation tooling","PostgreSQL":"auditable run state","LLM":"local or deterministic provider only"}',array['tool timeout','budget exceeded','invalid tool output','partial run recovery'],array['req_python'],93,93,true,'v1'),
('tpl_rag_service','RAG Knowledge Service','AI_RAG_SYSTEM','Knowledge retrieval with evaluation, citations, access control and failure-aware ingestion.',array['AI_ENGINEERING','ARCHITECTURE','DATA_MODELING','API_DESIGN','SECURITY','OBSERVABILITY','TESTING','PERFORMANCE','FAILURE_HANDLING','DOCUMENTATION','TRADE_OFF_ANALYSIS'],array[]::text[],'ADVANCED','SENIOR','["document ingestion pipeline","retrieval API","evaluation dataset","citation and authorization layer"]','HIGH','FREE','LOCAL_FIRST','{"Python":"document processing","LLM":"local or deterministic provider only","PostgreSQL":"documents and evaluation runs"}',array['stale index','retrieval miss','unauthorized document','ingestion retry'],array['req_python'],86,88,true,'v1'),
('tpl_observability','Observability-First Backend Platform','OBSERVABILITY_PLATFORM','Backend whose primary product is measurable reliability.',array['OBSERVABILITY','ARCHITECTURE','FAILURE_HANDLING','TESTING','PERFORMANCE','DEPLOYMENT','CI_CD','SECURITY','API_DESIGN','DOCUMENTATION','TRADE_OFF_ANALYSIS'],array[]::text[],'SENIOR','SENIOR','["instrumented modular backend","OpenTelemetry pipeline","SLO dashboard","failure injection harness"]','MEDIUM','FREE','LOCAL_FIRST','{"OpenTelemetry":"correlated telemetry","Docker":"local reproducibility","PostgreSQL":"dependency observability"}',array['latency regression','database pool exhaustion','dependency timeout','telemetry unavailable'],array['req_java'],91,94,true,'v1'),
('tpl_secure_gateway','Secure API Gateway Platform','SECURITY_FOCUSED_BACKEND','Policy-driven API edge with tenant isolation, rate limits and auditability.',array['SECURITY','ARCHITECTURE','API_DESIGN','TESTING','OBSERVABILITY','PERFORMANCE','SCALABILITY','FAILURE_HANDLING','DATA_MODELING','DOCUMENTATION','TRADE_OFF_ANALYSIS'],array[]::text[],'SENIOR','SENIOR','["policy decision point","tenant-aware gateway","token-bucket limiter","append-only audit log"]','MEDIUM','FREE','LOCAL_FIRST','{"Redis":"distributed rate limiting","PostgreSQL":"tenant policies and audit","TypeScript":"shared policy contracts"}',array['rate-limit store unavailable','token replay','tenant boundary attack','audit write failure'],array['req_rest_api'],90,93,true,'v1'),
('tpl_distributed_processing','Distributed Processing Platform','DISTRIBUTED_SYSTEM','Partitioned processing with leases, idempotency, backpressure and recovery.',array['ARCHITECTURE','EVENT_DRIVEN','SCALABILITY','PERFORMANCE','FAILURE_HANDLING','OBSERVABILITY','TESTING','DEPLOYMENT','INFRASTRUCTURE_AS_CODE','DOCUMENTATION','TRADE_OFF_ANALYSIS'],array[]::text[],'STAFF_LEVEL','STAFF','["partitioned work queue","lease coordinator","idempotent workers","backpressure control"]','VERY_HIGH','FREE','LOCAL_FIRST','{"Kafka":"ordering and backpressure","Redis":"short-lived leases","Kubernetes":"evidence-based worker scaling"}',array['worker crash after side effect','split ownership','poison message','coordinator unavailable'],array['req_java','req_system_design'],97,98,true,'v1');
insert into career_os.project_template_skills (template_id,requirement_id,coverage_type,justification)
select template_id, requirement_id,
  case when requirement_id in ('req_payments','req_fintech','req_ecommerce') then 'DOMAIN' else 'SKILL' end,
  'The template produces reviewable project evidence for this requirement.'
from (values
  ('tpl_event_payment',array['req_java','req_spring_boot','req_postgresql','req_kafka','req_testing','req_observability','req_security','req_system_design','req_distributed_systems','req_payments','req_fintech']),
  ('tpl_cloud_order',array['req_java','req_spring_boot','req_postgresql','req_docker','req_kubernetes','req_terraform','req_github_actions','req_aws','req_observability','req_testing','req_security','req_system_design','req_ecommerce']),
  ('tpl_agent_ops',array['req_python','req_typescript','req_ai_agents','req_llm','req_postgresql','req_observability','req_security','req_testing','req_system_design','req_github_actions']),
  ('tpl_rag_service',array['req_python','req_llm','req_machine_learning','req_postgresql','req_rest_api','req_security','req_testing','req_observability','req_data_engineering','req_system_design']),
  ('tpl_observability',array['req_java','req_spring_boot','req_postgresql','req_observability','req_testing','req_docker','req_github_actions','req_system_design','req_security','req_rest_api']),
  ('tpl_secure_gateway',array['req_typescript','req_nextjs','req_rest_api','req_security','req_redis','req_postgresql','req_testing','req_observability','req_docker','req_system_design']),
  ('tpl_distributed_processing',array['req_java','req_kafka','req_redis','req_postgresql','req_distributed_systems','req_system_design','req_observability','req_testing','req_docker','req_kubernetes','req_terraform'])
) mappings(template_id,requirements)
cross join lateral unnest(mappings.requirements) requirement_id;
notify pgrst, 'reload schema';
