-- VS4.1 contextual hardening: distinguish AWS certification from the learnable AWS skill.

insert into career_os.requirement_taxonomy (
  id, canonical_name, category, nature, learning_eligibility, nature_confidence,
  project_evidence_eligibility, recommended_action, requirement_nature_version
) values (
  'req_aws_certification', 'AWS Solutions Architect Certification', 'CLOUD',
  'CERTIFICATION_REQUIREMENT', 'PARTIALLY_ELIGIBLE', 'HIGH',
  'NOT_ELIGIBLE', 'CONSIDER_CERTIFICATION', 'requirement-nature-v1'
) on conflict (id) do update set
  canonical_name = excluded.canonical_name,
  category = excluded.category,
  nature = excluded.nature,
  learning_eligibility = excluded.learning_eligibility,
  nature_confidence = excluded.nature_confidence,
  project_evidence_eligibility = excluded.project_evidence_eligibility,
  recommended_action = excluded.recommended_action,
  requirement_nature_version = excluded.requirement_nature_version;
insert into career_os.requirement_aliases (id, requirement_id, alias, normalized_alias) values
  ('alias_aws_solutions_architect_certification','req_aws_certification','AWS Solutions Architect certification','aws solutions architect certification'),
  ('alias_aws_certification','req_aws_certification','AWS certification','aws certification')
on conflict (id) do nothing;
notify pgrst, 'reload schema';
