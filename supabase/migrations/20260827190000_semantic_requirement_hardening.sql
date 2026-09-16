-- Career OS VS4.1: semantic separation of learnable skills, evidence, qualifications and constraints.
-- Additive and tenant-scoped. Historical market snapshots are preserved.

alter table career_os.career_profiles
  add column education jsonb not null default '[]'::jsonb,
  add column certifications jsonb not null default '[]'::jsonb;
alter table career_os.requirement_taxonomy
  add column nature text not null default 'UNKNOWN'
    check (nature in ('LEARNABLE_SKILL','EXPERIENCE_REQUIREMENT','DOMAIN_EXPERIENCE','LANGUAGE_REQUIREMENT','EDUCATION_REQUIREMENT','CERTIFICATION_REQUIREMENT','ELIGIBILITY_CONSTRAINT','WORK_MODEL_CONSTRAINT','LOCATION_CONSTRAINT','COMPENSATION_CONSTRAINT','BEHAVIORAL_REQUIREMENT','LEADERSHIP_REQUIREMENT','OTHER','UNKNOWN')),
  add column learning_eligibility text not null default 'UNKNOWN'
    check (learning_eligibility in ('ELIGIBLE','PARTIALLY_ELIGIBLE','NOT_ELIGIBLE','UNKNOWN')),
  add column nature_confidence text not null default 'LOW'
    check (nature_confidence in ('HIGH','MEDIUM','LOW')),
  add column project_evidence_eligibility text not null default 'UNKNOWN'
    check (project_evidence_eligibility in ('ELIGIBLE','PARTIAL','NOT_ELIGIBLE','UNKNOWN')),
  add column recommended_action text not null default 'UNKNOWN'
    check (recommended_action in ('STUDY','REVIEW_PROFILE','ADD_EVIDENCE','VERIFY_ELIGIBILITY','IMPROVE_LANGUAGE','CONSIDER_CERTIFICATION','POSITION_EXPERIENCE','NO_ACTION','UNKNOWN')),
  add column requirement_nature_version text not null default 'requirement-nature-v1';
update career_os.requirement_taxonomy set
  nature = 'LEARNABLE_SKILL', learning_eligibility = 'ELIGIBLE', nature_confidence = 'HIGH',
  project_evidence_eligibility = 'ELIGIBLE', recommended_action = 'STUDY',
  requirement_nature_version = 'requirement-nature-v1'
where category in ('PROGRAMMING_LANGUAGE','FRAMEWORK','DATABASE','MESSAGING','CACHE','CLOUD','CONTAINER','ORCHESTRATION','DEVOPS','CI_CD','OBSERVABILITY','ARCHITECTURE','TESTING','SECURITY','DATA_ENGINEERING','AI_ML','AI_ENGINEERING','API','METHODOLOGY');
update career_os.requirement_taxonomy set
  nature = 'DOMAIN_EXPERIENCE', learning_eligibility = 'PARTIALLY_ELIGIBLE', nature_confidence = 'HIGH',
  project_evidence_eligibility = 'PARTIAL', recommended_action = 'ADD_EVIDENCE'
where category = 'DOMAIN';
update career_os.requirement_taxonomy set
  nature = 'LANGUAGE_REQUIREMENT', learning_eligibility = 'ELIGIBLE', nature_confidence = 'HIGH',
  project_evidence_eligibility = 'NOT_ELIGIBLE', recommended_action = 'IMPROVE_LANGUAGE'
where category = 'LANGUAGE_PROFICIENCY';
update career_os.requirement_taxonomy set
  nature = 'LEADERSHIP_REQUIREMENT', learning_eligibility = 'NOT_ELIGIBLE', nature_confidence = 'HIGH',
  project_evidence_eligibility = 'PARTIAL', recommended_action = 'ADD_EVIDENCE'
where category = 'LEADERSHIP';
update career_os.requirement_taxonomy set
  nature = 'EXPERIENCE_REQUIREMENT', learning_eligibility = 'NOT_ELIGIBLE', nature_confidence = 'HIGH',
  project_evidence_eligibility = 'PARTIAL', recommended_action = 'POSITION_EXPERIENCE'
where category = 'EXPERIENCE';
update career_os.requirement_taxonomy set
  nature = 'EDUCATION_REQUIREMENT', learning_eligibility = 'NOT_ELIGIBLE', nature_confidence = 'HIGH',
  project_evidence_eligibility = 'NOT_ELIGIBLE', recommended_action = 'REVIEW_PROFILE'
where category = 'EDUCATION';
update career_os.requirement_taxonomy set
  nature = 'ELIGIBILITY_CONSTRAINT', learning_eligibility = 'NOT_ELIGIBLE', nature_confidence = 'HIGH',
  project_evidence_eligibility = 'NOT_ELIGIBLE', recommended_action = 'VERIFY_ELIGIBILITY'
where category = 'WORK_AUTHORIZATION';
alter table career_os.job_requirements
  add column nature text not null default 'UNKNOWN'
    check (nature in ('LEARNABLE_SKILL','EXPERIENCE_REQUIREMENT','DOMAIN_EXPERIENCE','LANGUAGE_REQUIREMENT','EDUCATION_REQUIREMENT','CERTIFICATION_REQUIREMENT','ELIGIBILITY_CONSTRAINT','WORK_MODEL_CONSTRAINT','LOCATION_CONSTRAINT','COMPENSATION_CONSTRAINT','BEHAVIORAL_REQUIREMENT','LEADERSHIP_REQUIREMENT','OTHER','UNKNOWN')),
  add column learning_eligibility text not null default 'UNKNOWN'
    check (learning_eligibility in ('ELIGIBLE','PARTIALLY_ELIGIBLE','NOT_ELIGIBLE','UNKNOWN')),
  add column nature_confidence text not null default 'LOW'
    check (nature_confidence in ('HIGH','MEDIUM','LOW')),
  add column minimum_years numeric(4,1) check (minimum_years is null or minimum_years between 0 and 80),
  add column requirement_nature_version text not null default 'requirement-nature-v1';
update career_os.job_requirements jr set
  nature = rt.nature, learning_eligibility = rt.learning_eligibility,
  nature_confidence = rt.nature_confidence, requirement_nature_version = rt.requirement_nature_version
from career_os.requirement_taxonomy rt where rt.id = jr.requirement_id;
create table career_os.career_readiness_items (
  id text primary key,
  user_id uuid not null references career_os.users(id) on delete cascade,
  snapshot_id text not null,
  search_profile_id text,
  requirement_id text not null references career_os.requirement_taxonomy(id),
  nature text not null check (nature in ('LEARNABLE_SKILL','EXPERIENCE_REQUIREMENT','DOMAIN_EXPERIENCE','LANGUAGE_REQUIREMENT','EDUCATION_REQUIREMENT','CERTIFICATION_REQUIREMENT','ELIGIBILITY_CONSTRAINT','WORK_MODEL_CONSTRAINT','LOCATION_CONSTRAINT','COMPENSATION_CONSTRAINT','BEHAVIORAL_REQUIREMENT','LEADERSHIP_REQUIREMENT','OTHER','UNKNOWN')),
  kind text not null check (kind in ('CAREER_CONSTRAINT','EXPERIENCE_GAP','DOMAIN_EXPERIENCE_GAP','QUALIFICATION_GAP','EVIDENCE_GAP')),
  status text not null check (status in ('SATISFIED','UNSATISFIED','NOT_APPLICABLE','STRONG_EVIDENCE','PARTIAL_EVIDENCE','WEAK_EVIDENCE','NO_EVIDENCE','PROVEN','PARTIAL','MISSING','EVIDENCE_GAP','SUFFICIENT','UNKNOWN')),
  impact text not null check (impact in ('BLOCKING','HIGH','MEDIUM','LOW','UNKNOWN')),
  affected_jobs integer not null default 0 check (affected_jobs >= 0),
  required_value text,
  candidate_value text,
  recommended_action text not null check (recommended_action in ('STUDY','REVIEW_PROFILE','ADD_EVIDENCE','VERIFY_ELIGIBILITY','IMPROVE_LANGUAGE','CONSIDER_CERTIFICATION','POSITION_EXPERIENCE','NO_ACTION','UNKNOWN')),
  project_evidence_eligibility text not null check (project_evidence_eligibility in ('ELIGIBLE','PARTIAL','NOT_ELIGIBLE','UNKNOWN')),
  explanation text not null,
  evidence text[] not null default '{}',
  calculation_version text not null,
  calculated_at timestamptz not null default now(),
  unique (id,user_id),
  unique (user_id,snapshot_id,kind,requirement_id),
  constraint career_readiness_snapshot_owner_fk foreign key (snapshot_id,user_id)
    references career_os.market_snapshots(id,user_id) on delete cascade,
  constraint career_readiness_profile_owner_fk foreign key (search_profile_id,user_id)
    references career_os.search_profiles(id,user_id) on delete cascade
);
create index career_readiness_snapshot_owner_idx on career_os.career_readiness_items(snapshot_id,user_id);
create index career_readiness_profile_owner_idx on career_os.career_readiness_items(search_profile_id,user_id);
create index career_readiness_requirement_idx on career_os.career_readiness_items(requirement_id);
alter table career_os.career_readiness_items enable row level security;
create policy career_readiness_items_select_own on career_os.career_readiness_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy career_readiness_items_insert_own on career_os.career_readiness_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy career_readiness_items_update_own on career_os.career_readiness_items
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy career_readiness_items_delete_own on career_os.career_readiness_items
  for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on career_os.career_readiness_items from anon,authenticated;
grant select,insert,update,delete on career_os.career_readiness_items to authenticated,service_role;
create or replace function career_os.assert_learnable_requirement()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare taxonomy_row career_os.requirement_taxonomy%rowtype;
begin
  select * into taxonomy_row from career_os.requirement_taxonomy where id = new.requirement_id;
  if taxonomy_row.id is null or taxonomy_row.nature <> 'LEARNABLE_SKILL' or taxonomy_row.learning_eligibility <> 'ELIGIBLE' then
    raise exception using errcode = '23514', message = 'STUDY_PLAN_NOT_ELIGIBLE';
  end if;
  return new;
end;
$$;
create trigger career_skill_gaps_require_learnable
before insert or update of requirement_id on career_os.career_skill_gaps
for each row execute function career_os.assert_learnable_requirement();
create trigger learning_priorities_require_learnable
before insert or update of requirement_id on career_os.learning_priorities
for each row execute function career_os.assert_learnable_requirement();
create trigger study_plans_require_learnable
before insert or update of requirement_id on career_os.study_plans
for each row execute function career_os.assert_learnable_requirement();
alter table career_os.study_plans drop constraint if exists study_plans_user_id_requirement_id_status_key;
create unique index study_plans_one_active_requirement_idx
  on career_os.study_plans(user_id,requirement_id) where status = 'ACTIVE';
update career_os.study_plans sp set status = 'ARCHIVED', updated_at = now()
from career_os.requirement_taxonomy rt
where rt.id = sp.requirement_id and sp.status = 'ACTIVE'
  and (rt.nature <> 'LEARNABLE_SKILL' or rt.learning_eligibility <> 'ELIGIBLE');
notify pgrst, 'reload schema';
