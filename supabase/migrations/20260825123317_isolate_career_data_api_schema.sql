-- atrium-dev intentionally keeps public out of PostgREST.
-- Expose only Career OS; existing public.ga_* tables remain inaccessible.
create schema career_os;

alter table public.users set schema career_os;
alter table public.career_profiles set schema career_os;
alter table public.skills set schema career_os;
alter table public.career_skills set schema career_os;
alter table public.experiences set schema career_os;
alter table public.search_profiles set schema career_os;
alter table public.policies set schema career_os;
alter table public.policy_conditions set schema career_os;
alter table public.jobs set schema career_os;
alter table public.job_sources set schema career_os;
alter table public.job_validations set schema career_os;
alter table public.job_matches set schema career_os;
alter table public.job_scores set schema career_os;
alter table public.job_decisions set schema career_os;
alter table public.agent_runs set schema career_os;
alter table public.agent_steps set schema career_os;

revoke all on schema career_os from public,anon;
grant usage on schema career_os to authenticated;

alter role authenticator set pgrst.db_schemas = 'career_os';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';

;
