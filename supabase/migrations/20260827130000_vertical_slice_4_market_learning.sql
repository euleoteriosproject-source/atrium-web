-- Career OS Vertical Slice 4: deterministic market intelligence and learning.
-- Additive only. Existing Career OS data and unrelated public.ga_* objects are untouched.

alter table career_os.career_skills
  add column confidence text not null default 'MEDIUM'
    check (confidence in ('LOW','MEDIUM','HIGH')),
  add column evidence_type text not null default 'SELF_REPORTED'
    check (evidence_type in ('SELF_REPORTED','WORK_EXPERIENCE','CV_EVIDENCE','PROJECT_EVIDENCE','ASSESSMENT','INTERVIEW_FEEDBACK','STUDY_COMPLETION','MANUAL')),
  add column last_reviewed_at timestamptz;
create table career_os.requirement_taxonomy (
  id text primary key,
  canonical_name text not null unique,
  category text not null check (category in (
    'PROGRAMMING_LANGUAGE','FRAMEWORK','DATABASE','MESSAGING','CACHE','CLOUD','CONTAINER',
    'ORCHESTRATION','DEVOPS','CI_CD','OBSERVABILITY','ARCHITECTURE','TESTING','SECURITY',
    'DATA_ENGINEERING','AI_ML','AI_ENGINEERING','API','METHODOLOGY','DOMAIN',
    'LANGUAGE_PROFICIENCY','LEADERSHIP','EXPERIENCE','EDUCATION','WORK_AUTHORIZATION','OTHER'
  )),
  parent_id text references career_os.requirement_taxonomy(id) on delete set null,
  version text not null default 'v1',
  created_at timestamptz not null default now()
);
create table career_os.requirement_aliases (
  id text primary key,
  requirement_id text not null references career_os.requirement_taxonomy(id) on delete cascade,
  alias text not null,
  normalized_alias text not null unique,
  created_at timestamptz not null default now()
);
create table career_os.job_requirements (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  job_id text not null,
  requirement_id text not null references career_os.requirement_taxonomy(id),
  importance text not null check (importance in ('REQUIRED','PREFERRED','BONUS','IMPLIED','UNKNOWN')),
  evidence text not null,
  section_signal text,
  extractor_version text not null,
  description_hash text not null,
  extracted_at timestamptz not null default now(),
  unique (user_id,job_id,requirement_id),
  constraint job_requirements_job_owner_fk foreign key (job_id,user_id)
    references career_os.jobs(id,user_id) on delete cascade
);
create table career_os.market_snapshots (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  snapshot_date date not null,
  search_profile_id text,
  window_days integer not null check (window_days in (0,7,30,90)),
  job_count integer not null check (job_count >= 0),
  confidence text not null check (confidence in ('HIGH_CONFIDENCE','MEDIUM_CONFIDENCE','LOW_CONFIDENCE','INSUFFICIENT_DATA')),
  validation_states text[] not null default array['ACTIVE_CONFIRMED','ACTIVE_PROBABLE'],
  largest_company_share numeric(6,3) not null default 0,
  top3_companies_share numeric(6,3) not null default 0,
  concentration_warning boolean not null default false,
  dataset_metadata jsonb not null default '{}',
  calculation_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,snapshot_date,search_profile_id,window_days,calculation_version),
  constraint market_snapshots_profile_owner_fk foreign key (search_profile_id,user_id)
    references career_os.search_profiles(id,user_id) on delete cascade
);
create table career_os.market_requirement_stats (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  snapshot_id text not null,
  requirement_id text not null references career_os.requirement_taxonomy(id),
  job_count integer not null check (job_count >= 0),
  job_percentage numeric(6,3) not null check (job_percentage between 0 and 100),
  required_count integer not null default 0,
  required_percentage numeric(6,3) not null default 0,
  preferred_count integer not null default 0,
  preferred_percentage numeric(6,3) not null default 0,
  bonus_count integer not null default 0,
  profile_count integer not null default 0,
  job_ids text[] not null default '{}',
  companies text[] not null default '{}',
  evidence jsonb not null default '[]',
  trend_status text not null default 'INSUFFICIENT_DATA'
    check (trend_status in ('RISING','STABLE','FALLING','NEW_SIGNAL','INSUFFICIENT_DATA')),
  trend_delta_pp numeric(7,3),
  previous_percentage numeric(6,3),
  created_at timestamptz not null default now(),
  unique (user_id,snapshot_id,requirement_id),
  constraint market_stats_snapshot_owner_fk foreign key (snapshot_id,user_id)
    references career_os.market_snapshots(id,user_id) on delete cascade
);
create table career_os.career_skill_gaps (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  snapshot_id text not null,
  search_profile_id text,
  requirement_id text not null references career_os.requirement_taxonomy(id),
  skill_id text,
  gap_score integer not null check (gap_score between 0 and 100),
  gap_status text not null check (gap_status in ('NO_GAP','LOW','MEDIUM','HIGH','CRITICAL','UNKNOWN')),
  user_level text,
  user_confidence text,
  market_demand numeric(6,3) not null,
  importance_score numeric(6,3) not null,
  career_alignment numeric(6,3) not null,
  jobs_requiring_skill integer not null default 0,
  jobs_where_user_has_gap integer not null default 0,
  jobs_materially_affected integer not null default 0,
  current_match_average numeric(6,3),
  hypothetical_match_average numeric(6,3),
  calculation_version text not null,
  calculated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,snapshot_id,requirement_id),
  constraint career_skill_gaps_snapshot_owner_fk foreign key (snapshot_id,user_id)
    references career_os.market_snapshots(id,user_id) on delete cascade,
  constraint career_skill_gaps_profile_owner_fk foreign key (search_profile_id,user_id)
    references career_os.search_profiles(id,user_id) on delete cascade,
  constraint career_skill_gaps_skill_owner_fk foreign key (skill_id,user_id)
    references career_os.skills(id,user_id) on delete set null (skill_id)
);
create table career_os.learning_priorities (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  snapshot_id text not null,
  gap_id text not null,
  requirement_id text not null references career_os.requirement_taxonomy(id),
  priority_score integer not null check (priority_score between 0 and 100),
  priority_category text not null check (priority_category in ('CRITICAL','HIGH','MEDIUM','LOW','MAINTENANCE','NOT_RECOMMENDED')),
  effort text not null check (effort in ('LOW','MEDIUM','HIGH','VERY_HIGH','UNKNOWN')),
  breakdown jsonb not null,
  rationale text[] not null default '{}',
  calculation_version text not null,
  calculated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,snapshot_id,requirement_id),
  constraint learning_priorities_snapshot_owner_fk foreign key (snapshot_id,user_id)
    references career_os.market_snapshots(id,user_id) on delete cascade,
  constraint learning_priorities_gap_owner_fk foreign key (gap_id,user_id)
    references career_os.career_skill_gaps(id,user_id) on delete cascade
);
create table career_os.learning_resources (
  id text primary key,
  requirement_id text not null references career_os.requirement_taxonomy(id) on delete cascade,
  title text not null,
  provider text not null,
  url text not null unique,
  resource_type text not null check (resource_type in ('DOCUMENTATION','COURSE','TUTORIAL','BOOK','LAB','OTHER')),
  cost_type text not null check (cost_type in ('FREE','PAID','UNKNOWN')),
  status text not null check (status in ('ACTIVE','UNVERIFIED','BROKEN','ARCHIVED')),
  official boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table career_os.skill_curricula (
  id text primary key,
  requirement_id text not null references career_os.requirement_taxonomy(id) on delete cascade,
  title text not null,
  why text not null,
  version text not null default 'v1',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (requirement_id,version)
);
create table career_os.curriculum_items (
  id text primary key,
  curriculum_id text not null references career_os.skill_curricula(id) on delete cascade,
  resource_id text not null references career_os.learning_resources(id),
  position integer not null check (position > 0),
  objective text not null,
  unique (curriculum_id,position)
);
create table career_os.study_plans (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  requirement_id text not null references career_os.requirement_taxonomy(id),
  learning_priority_id text,
  title text not null,
  why text not null,
  status text not null check (status in ('ACTIVE','PAUSED','COMPLETED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,requirement_id,status),
  constraint study_plans_priority_owner_fk foreign key (learning_priority_id,user_id)
    references career_os.learning_priorities(id,user_id) on delete set null (learning_priority_id)
);
create table career_os.study_plan_items (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  study_plan_id text not null,
  curriculum_item_id text references career_os.curriculum_items(id),
  title text not null,
  resource_url text,
  position integer not null check (position > 0),
  status text not null check (status in ('NOT_STARTED','IN_PROGRESS','COMPLETED','SKIPPED')),
  completed_at timestamptz,
  evidence_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id,study_plan_id,position),
  constraint study_plan_items_plan_owner_fk foreign key (study_plan_id,user_id)
    references career_os.study_plans(id,user_id) on delete cascade
);
create index requirement_taxonomy_parent_idx on career_os.requirement_taxonomy(parent_id);
create index requirement_aliases_requirement_idx on career_os.requirement_aliases(requirement_id);
create index job_requirements_job_owner_idx on career_os.job_requirements(job_id,user_id);
create index market_snapshots_profile_owner_idx on career_os.market_snapshots(search_profile_id,user_id);
create index market_stats_snapshot_owner_idx on career_os.market_requirement_stats(snapshot_id,user_id);
create index career_skill_gaps_snapshot_owner_idx on career_os.career_skill_gaps(snapshot_id,user_id);
create index career_skill_gaps_profile_owner_idx on career_os.career_skill_gaps(search_profile_id,user_id);
create index career_skill_gaps_skill_owner_idx on career_os.career_skill_gaps(skill_id,user_id);
create index learning_priorities_snapshot_owner_idx on career_os.learning_priorities(snapshot_id,user_id);
create index learning_priorities_gap_owner_idx on career_os.learning_priorities(gap_id,user_id);
create index learning_resources_requirement_idx on career_os.learning_resources(requirement_id);
create index skill_curricula_requirement_idx on career_os.skill_curricula(requirement_id);
create index curriculum_items_curriculum_idx on career_os.curriculum_items(curriculum_id);
create index curriculum_items_resource_idx on career_os.curriculum_items(resource_id);
create index study_plans_priority_owner_idx on career_os.study_plans(learning_priority_id,user_id);
create index study_plan_items_plan_owner_idx on career_os.study_plan_items(study_plan_id,user_id);
create index study_plan_items_curriculum_item_idx on career_os.study_plan_items(curriculum_item_id);
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'job_requirements','market_snapshots','market_requirement_stats','career_skill_gaps',
    'learning_priorities','study_plans','study_plan_items'
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
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'requirement_taxonomy','requirement_aliases','learning_resources','skill_curricula','curriculum_items'
  ] loop
    execute format('alter table career_os.%I enable row level security', table_name);
    execute format('create policy %I on career_os.%I for select to authenticated using (true)', table_name || '_read_authenticated', table_name);
    execute format('revoke all on career_os.%I from anon,authenticated', table_name);
    execute format('grant select on career_os.%I to authenticated', table_name);
  end loop;
end $$;
grant select,insert,update,delete on table
  career_os.job_requirements,career_os.market_snapshots,career_os.market_requirement_stats,
  career_os.career_skill_gaps,career_os.learning_priorities,career_os.study_plans,
  career_os.study_plan_items
to service_role;
grant select,insert,update,delete on table
  career_os.requirement_taxonomy,career_os.requirement_aliases,career_os.learning_resources,
  career_os.skill_curricula,career_os.curriculum_items
to service_role;
insert into career_os.requirement_taxonomy (id,canonical_name,category) values
  ('req_java','Java','PROGRAMMING_LANGUAGE'),('req_python','Python','PROGRAMMING_LANGUAGE'),
  ('req_typescript','TypeScript','PROGRAMMING_LANGUAGE'),('req_spring_boot','Spring Boot','FRAMEWORK'),
  ('req_react','React','FRAMEWORK'),('req_nextjs','Next.js','FRAMEWORK'),
  ('req_postgresql','PostgreSQL','DATABASE'),('req_redis','Redis','CACHE'),
  ('req_kafka','Kafka','MESSAGING'),('req_rabbitmq','RabbitMQ','MESSAGING'),
  ('req_aws','AWS','CLOUD'),('req_docker','Docker','CONTAINER'),
  ('req_kubernetes','Kubernetes','ORCHESTRATION'),('req_terraform','Terraform','DEVOPS'),
  ('req_github_actions','GitHub Actions','CI_CD'),('req_observability','Observability','OBSERVABILITY'),
  ('req_microservices','Microservices','ARCHITECTURE'),('req_distributed_systems','Distributed Systems','ARCHITECTURE'),
  ('req_system_design','System Design','ARCHITECTURE'),('req_testing','Automated Testing','TESTING'),
  ('req_security','Application Security','SECURITY'),('req_data_engineering','Data Engineering','DATA_ENGINEERING'),
  ('req_machine_learning','Machine Learning','AI_ML'),('req_llm','LLM','AI_ENGINEERING'),
  ('req_ai_agents','AI Agents','AI_ENGINEERING'),('req_rest_api','REST API','API'),
  ('req_agile','Agile','METHODOLOGY'),('req_fintech','Fintech','DOMAIN'),
  ('req_payments','Payments','DOMAIN'),('req_ecommerce','E-commerce','DOMAIN'),
  ('req_healthcare','Healthcare','DOMAIN'),('req_english','English','LANGUAGE_PROFICIENCY'),
  ('req_portuguese','Portuguese','LANGUAGE_PROFICIENCY'),('req_spanish','Spanish','LANGUAGE_PROFICIENCY'),
  ('req_leadership','Technical Leadership','LEADERSHIP'),('req_degree','Higher Education','EDUCATION'),
  ('req_work_authorization','Work Authorization','WORK_AUTHORIZATION')
on conflict (id) do nothing;
insert into career_os.requirement_aliases (id,requirement_id,alias,normalized_alias) values
  ('alias_java','req_java','Java','java'),('alias_python','req_python','Python','python'),
  ('alias_ts','req_typescript','TypeScript','typescript'),('alias_spring','req_spring_boot','Spring','spring'),
  ('alias_springboot','req_spring_boot','SpringBoot','springboot'),('alias_spring_boot','req_spring_boot','Spring Boot','spring boot'),
  ('alias_postgres','req_postgresql','Postgres','postgres'),('alias_postgresql','req_postgresql','PostgreSQL','postgresql'),
  ('alias_k8s','req_kubernetes','K8s','k8s'),('alias_kubernetes','req_kubernetes','Kubernetes','kubernetes'),
  ('alias_aws','req_aws','AWS','aws'),('alias_docker','req_docker','Docker','docker'),
  ('alias_terraform','req_terraform','Terraform','terraform'),('alias_kafka','req_kafka','Kafka','kafka'),
  ('alias_rabbit','req_rabbitmq','RabbitMQ','rabbitmq'),('alias_redis','req_redis','Redis','redis'),
  ('alias_react','req_react','React','react'),('alias_next','req_nextjs','Next.js','next.js'),
  ('alias_microservices','req_microservices','Microservices','microservices'),
  ('alias_microservicos','req_microservices','Microsserviços','microsservicos'),
  ('alias_distributed','req_distributed_systems','Distributed systems','distributed systems'),
  ('alias_system_design','req_system_design','System Design','system design'),
  ('alias_observability','req_observability','Observability','observability'),
  ('alias_observabilidade','req_observability','Observabilidade','observabilidade'),
  ('alias_tests','req_testing','Automated testing','automated testing'),
  ('alias_security','req_security','Application security','application security'),
  ('alias_ml','req_machine_learning','Machine Learning','machine learning'),
  ('alias_llm','req_llm','LLM','llm'),('alias_agents','req_ai_agents','AI Agents','ai agents'),
  ('alias_rest','req_rest_api','REST API','rest api'),('alias_agile','req_agile','Agile','agile'),
  ('alias_fintech','req_fintech','Fintech','fintech'),('alias_payments','req_payments','Payments','payments'),
  ('alias_ecommerce','req_ecommerce','E-commerce','e-commerce'),('alias_healthcare','req_healthcare','Healthcare','healthcare'),
  ('alias_english','req_english','English','english'),('alias_ingles','req_english','Inglês','ingles'),
  ('alias_portuguese','req_portuguese','Portuguese','portuguese'),('alias_spanish','req_spanish','Spanish','spanish'),
  ('alias_leadership','req_leadership','Technical leadership','technical leadership'),
  ('alias_degree','req_degree','Bachelor degree','bachelor degree'),
  ('alias_authorization','req_work_authorization','Work authorization','work authorization')
on conflict (id) do nothing;
insert into career_os.learning_resources (id,requirement_id,title,provider,url,resource_type,cost_type,status,official,verified_at) values
  ('resource_java','req_java','Learn Java','Oracle / OpenJDK','https://dev.java/learn/','DOCUMENTATION','FREE','ACTIVE',true,now()),
  ('resource_spring','req_spring_boot','Spring Boot Reference','Spring','https://docs.spring.io/spring-boot/index.html','DOCUMENTATION','FREE','ACTIVE',true,now()),
  ('resource_postgresql','req_postgresql','PostgreSQL Tutorial','PostgreSQL Global Development Group','https://www.postgresql.org/docs/current/tutorial.html','TUTORIAL','FREE','ACTIVE',true,now()),
  ('resource_kubernetes','req_kubernetes','Kubernetes Tutorials','Cloud Native Computing Foundation','https://kubernetes.io/docs/tutorials/','TUTORIAL','FREE','ACTIVE',true,now()),
  ('resource_docker','req_docker','Docker Get Started','Docker','https://docs.docker.com/get-started/','TUTORIAL','FREE','ACTIVE',true,now()),
  ('resource_terraform','req_terraform','Terraform Tutorials','HashiCorp','https://developer.hashicorp.com/terraform/tutorials','TUTORIAL','FREE','ACTIVE',true,now())
on conflict (id) do nothing;
insert into career_os.skill_curricula (id,requirement_id,title,why) values
  ('curriculum_java','req_java','Java foundations and practice','Build evidence against current Java requirements.'),
  ('curriculum_spring','req_spring_boot','Spring Boot production foundations','Strengthen evidence for Spring Boot requirements.'),
  ('curriculum_postgresql','req_postgresql','PostgreSQL practical foundations','Strengthen database evidence used by current roles.'),
  ('curriculum_kubernetes','req_kubernetes','Kubernetes practical foundations','Build evidence for orchestration requirements.'),
  ('curriculum_docker','req_docker','Docker practical foundations','Build evidence for container requirements.'),
  ('curriculum_terraform','req_terraform','Terraform practical foundations','Build evidence for infrastructure-as-code requirements.')
on conflict (id) do nothing;
insert into career_os.curriculum_items (id,curriculum_id,resource_id,position,objective) values
  ('item_java_1','curriculum_java','resource_java',1,'Review the official language learning path and record practical evidence.'),
  ('item_spring_1','curriculum_spring','resource_spring',1,'Review the official Spring Boot reference and record practical evidence.'),
  ('item_postgresql_1','curriculum_postgresql','resource_postgresql',1,'Complete the official PostgreSQL tutorial and record practical evidence.'),
  ('item_kubernetes_1','curriculum_kubernetes','resource_kubernetes',1,'Complete an official Kubernetes tutorial and record practical evidence.'),
  ('item_docker_1','curriculum_docker','resource_docker',1,'Complete Docker Get Started and record practical evidence.'),
  ('item_terraform_1','curriculum_terraform','resource_terraform',1,'Complete an official Terraform tutorial and record practical evidence.')
on conflict (id) do nothing;
notify pgrst, 'reload schema';
