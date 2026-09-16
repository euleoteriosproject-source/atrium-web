-- Career OS Vertical Slice 3: server-only workflow access to the custom schema.
-- This does not change or disable RLS. Browser clients remain authenticated + user-scoped.

grant usage on schema career_os to service_role;
grant select, insert, update, delete on table
  career_os.users,
  career_os.career_profiles,
  career_os.skills,
  career_os.career_skills,
  career_os.experiences,
  career_os.search_profiles,
  career_os.policies,
  career_os.policy_conditions,
  career_os.jobs,
  career_os.job_sources,
  career_os.job_validations,
  career_os.job_matches,
  career_os.job_scores,
  career_os.job_decisions,
  career_os.agent_runs,
  career_os.agent_steps,
  career_os.company_sources,
  career_os.job_search_runs,
  career_os.job_source_runs,
  career_os.job_snapshots,
  career_os.automation_settings,
  career_os.daily_career_runs,
  career_os.job_delta_events,
  career_os.daily_briefs,
  career_os.notification_preferences,
  career_os.notifications,
  career_os.notification_deliveries
to service_role;
