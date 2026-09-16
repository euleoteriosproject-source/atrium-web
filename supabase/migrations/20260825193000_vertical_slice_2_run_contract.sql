-- Align discovery run persistence with the VS2 domain contract.
-- Additive/forward-only for Career OS; unrelated public.ga_* objects are untouched.

alter table career_os.job_search_runs
  drop constraint job_search_runs_status_check;
update career_os.job_search_runs
set status = case status
  when 'SUCCEEDED' then 'SUCCESS'
  when 'PARTIAL' then 'PARTIAL_SUCCESS'
  else status
end;
alter table career_os.job_search_runs
  add constraint job_search_runs_status_check
  check (status in ('PENDING','RUNNING','PARTIAL_SUCCESS','SUCCESS','FAILED')),
  add column metrics jsonb not null default '{}';
alter table career_os.jobs
  add column remote_scope text check (remote_scope in ('BRAZIL','LATAM','US','EUROPE','ANYWHERE','UNKNOWN'));
notify pgrst, 'reload schema';
