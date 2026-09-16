-- Career OS VS4: cover requirement foreign keys reported by the Supabase
-- Performance Advisor. Additive only; no pre-existing objects are changed.

create index job_requirements_requirement_idx
  on career_os.job_requirements(requirement_id);
create index market_requirement_stats_requirement_idx
  on career_os.market_requirement_stats(requirement_id);
create index career_skill_gaps_requirement_idx
  on career_os.career_skill_gaps(requirement_id);
create index learning_priorities_requirement_idx
  on career_os.learning_priorities(requirement_id);
create index study_plans_requirement_idx
  on career_os.study_plans(requirement_id);
