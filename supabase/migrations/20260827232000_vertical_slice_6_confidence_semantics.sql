-- VS6: persist recommendation confidence separately from readiness confidence and market representativeness.
alter table career_os.application_readiness_snapshots
  add column recommendation_confidence text not null default 'LOW'
  check (recommendation_confidence in ('HIGH','MEDIUM','LOW'));
notify pgrst, 'reload schema';
