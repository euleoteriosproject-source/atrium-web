-- VS5 Performance Advisor remediation: covering indexes for new foreign keys.
-- Existing and unrelated public.ga_* objects remain untouched.

create index portfolio_projects_recommendation_owner_idx
  on career_os.portfolio_projects(recommendation_id,user_id);
create index portfolio_set_projects_set_owner_idx
  on career_os.portfolio_set_projects(portfolio_set_id,user_id);
create index portfolio_set_projects_recommendation_owner_idx
  on career_os.portfolio_set_projects(recommendation_id,user_id);
create index project_evidence_claims_project_owner_idx
  on career_os.project_evidence_claims(project_id,user_id);
create index project_evidence_claims_skill_owner_idx
  on career_os.project_evidence_claims(skill_id,user_id);
create index project_evidence_claims_requirement_idx
  on career_os.project_evidence_claims(requirement_id);
create index project_milestones_project_owner_idx
  on career_os.project_milestones(project_id,user_id);
create index project_recommendation_gaps_owner_idx
  on career_os.project_recommendation_gaps(recommendation_id,user_id);
create index project_recommendation_gaps_requirement_idx
  on career_os.project_recommendation_gaps(requirement_id);
create index project_recommendations_profile_owner_idx
  on career_os.project_recommendations(search_profile_id,user_id);
create index project_recommendations_template_idx
  on career_os.project_recommendations(template_id);
create index project_tasks_project_owner_idx
  on career_os.project_tasks(project_id,user_id);
create index project_tasks_milestone_owner_idx
  on career_os.project_tasks(milestone_id,user_id);
create index project_template_skills_requirement_idx
  on career_os.project_template_skills(requirement_id);
