-- Cover composite tenant-aware foreign keys in the same column order used by
-- PostgreSQL referential actions. user_id-first indexes remain for RLS queries.
create index career_skills_profile_owner_fk_idx on public.career_skills(career_profile_id,user_id);
create index career_skills_skill_owner_fk_idx on public.career_skills(skill_id,user_id);
create index experiences_profile_owner_fk_idx on public.experiences(career_profile_id,user_id);
create index policy_conditions_policy_owner_fk_idx on public.policy_conditions(policy_id,user_id);
create index job_sources_job_owner_fk_idx on public.job_sources(job_id,user_id);
create index job_validations_job_owner_fk_idx on public.job_validations(job_id,user_id);
create index job_matches_job_owner_fk_idx on public.job_matches(job_id,user_id);
create index job_matches_search_owner_fk_idx on public.job_matches(search_profile_id,user_id);
create index job_scores_job_owner_fk_idx on public.job_scores(job_id,user_id);
create index job_decisions_job_owner_fk_idx on public.job_decisions(job_id,user_id);
create index agent_steps_run_owner_fk_idx on public.agent_steps(agent_run_id,user_id);

;
