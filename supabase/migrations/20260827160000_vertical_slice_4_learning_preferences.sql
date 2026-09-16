-- Complete VS4 user learning controls and structured, evidence-based curricula.

create table career_os.learning_preferences (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  requirement_id text not null references career_os.requirement_taxonomy(id) on delete cascade,
  preference text not null default 'NORMAL'
    check (preference in ('FOCUS','NORMAL','DEPRIORITIZE','IGNORE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id,requirement_id)
);
alter table career_os.learning_priorities
  add column user_preference text not null default 'NORMAL'
    check (user_preference in ('FOCUS','NORMAL','DEPRIORITIZE','IGNORE'));
alter table career_os.skill_curricula
  add column target_level text,
  add column prerequisites text[] not null default '{}',
  add column topics text[] not null default '{}',
  add column hands_on_objectives text[] not null default '{}',
  add column interview_objectives text[] not null default '{}',
  add column definition_of_done text[] not null default '{}';
alter table career_os.learning_resources
  drop constraint if exists learning_resources_resource_type_check;
alter table career_os.learning_resources
  add constraint learning_resources_resource_type_check check (resource_type in (
    'OFFICIAL_DOC','COURSE','VIDEO','ARTICLE','LAB','BOOK','REPOSITORY','EXERCISE',
    'DOCUMENTATION','TUTORIAL','OTHER'
  ));
alter table career_os.study_plan_items
  drop constraint if exists study_plan_items_status_check;
alter table career_os.study_plan_items
  add constraint study_plan_items_status_check
    check (status in ('NOT_STARTED','IN_PROGRESS','DONE','COMPLETED','SKIPPED'));
insert into career_os.requirement_taxonomy (id,canonical_name,category) values
  ('req_professional_experience','Professional Experience','EXPERIENCE')
on conflict (id) do nothing;
insert into career_os.requirement_aliases (id,requirement_id,alias,normalized_alias) values
  ('alias_years_experience','req_professional_experience','Years of experience','years of experience'),
  ('alias_years_experience_short','req_professional_experience','Years experience','years experience'),
  ('alias_anos_experiencia','req_professional_experience','Anos de experiência','anos de experiencia')
on conflict (id) do nothing;
update career_os.learning_resources
set resource_type = 'OFFICIAL_DOC'
where resource_type = 'DOCUMENTATION' and official = true;
create index learning_preferences_requirement_idx
  on career_os.learning_preferences(requirement_id);
alter table career_os.learning_preferences enable row level security;
create policy learning_preferences_select_own on career_os.learning_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy learning_preferences_insert_own on career_os.learning_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy learning_preferences_update_own on career_os.learning_preferences
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy learning_preferences_delete_own on career_os.learning_preferences
  for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on career_os.learning_preferences from anon,authenticated;
grant select,insert,update,delete on career_os.learning_preferences to authenticated,service_role;
update career_os.skill_curricula set
  target_level = 'SOLID',
  prerequisites = array['Basic container concepts','Command-line fundamentals'],
  topics = array['Pods and workloads','Services and networking','Configuration and health checks','Debugging'],
  hands_on_objectives = array['Deploy a service','Configure readiness and liveness probes','Expose it with a Service','Diagnose a failing Pod'],
  interview_objectives = array['Explain Pod versus Deployment','Discuss rollout and scaling trade-offs','Diagnose an unhealthy workload scenario'],
  definition_of_done = array['A service is deployed and reachable','Health checks are configured','A failing workload is diagnosed with recorded evidence']
where id = 'curriculum_kubernetes';
update career_os.skill_curricula set
  target_level = 'SOLID',
  prerequisites = array['Cloud infrastructure fundamentals','Command-line fundamentals'],
  topics = array['Providers and resources','State','Planning and applying changes','Modules and safe workflows'],
  hands_on_objectives = array['Define reproducible infrastructure','Inspect a plan before apply','Refactor configuration into a module','Document state safety'],
  interview_objectives = array['Explain state and locking','Discuss modules and dependency graphs','Review a risky infrastructure change'],
  definition_of_done = array['Infrastructure can be planned reproducibly','State risks are explained','A reusable module and change evidence are recorded']
where id = 'curriculum_terraform';
update career_os.skill_curricula set
  target_level = 'ADVANCED',
  topics = array['Language fundamentals','Collections and streams','Concurrency','Testing and diagnostics'],
  hands_on_objectives = array['Implement and test a small service component','Diagnose a runtime issue'],
  interview_objectives = array['Explain concurrency trade-offs','Reason about collections and runtime behavior'],
  definition_of_done = array['Implementation and tests are recorded','Technical trade-offs can be explained']
where id = 'curriculum_java';
update career_os.skill_curricula set
  target_level = 'SOLID', topics = array['SQL fundamentals','Indexes','Transactions','Query plans'],
  hands_on_objectives = array['Model and query a dataset','Inspect and improve a query plan'],
  interview_objectives = array['Explain transaction isolation','Discuss index trade-offs'],
  definition_of_done = array['Queries and plans are recorded','Transaction and index choices can be explained']
where id = 'curriculum_postgresql';
update career_os.skill_curricula set
  target_level = 'SOLID', topics = array['Images','Containers','Networks','Build and runtime security'],
  hands_on_objectives = array['Build and run a reproducible image','Diagnose a container networking issue'],
  interview_objectives = array['Explain image layers','Discuss container isolation and networking'],
  definition_of_done = array['A reproducible image is recorded','Runtime trade-offs can be explained']
where id = 'curriculum_docker';
update career_os.skill_curricula set
  target_level = 'ADVANCED', topics = array['Configuration','Data access','Web applications','Production operations'],
  hands_on_objectives = array['Build and test a small Spring Boot service','Add health and configuration controls'],
  interview_objectives = array['Explain dependency injection','Discuss transaction and service-boundary trade-offs'],
  definition_of_done = array['A tested service and evidence are recorded','Production trade-offs can be explained']
where id = 'curriculum_spring';
notify pgrst, 'reload schema';
