-- VS6 performance-advisor remediation: cover direct user ownership foreign keys.
create index resume_claims_user_idx on career_os.resume_claims(user_id);
create index application_stage_events_user_idx on career_os.application_stage_events(user_id);
create index application_feedback_user_idx on career_os.application_feedback(user_id);
create index interview_preparation_items_user_idx on career_os.interview_preparation_items(user_id);
notify pgrst, 'reload schema';
