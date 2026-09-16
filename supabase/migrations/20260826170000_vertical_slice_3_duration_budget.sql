-- Career OS Vertical Slice 3: explicit zero-cost duration budget.
-- Additive only; existing data and unrelated public.ga_* objects remain untouched.

alter table career_os.automation_settings
  add column max_duration_ms integer not null default 300000
  check (max_duration_ms between 60000 and 600000);
