-- M5.1 additive hardening. Existing rows are intentionally not rewritten.
-- NOT VALID allows the constraints to be added before the explicit validation
-- below. Existing data was audited before this migration was finalized.

alter table public.mvp_leads
  add constraint mvp_leads_contact_name_m51_check
    check (char_length(trim(contact_name)) between 2 and 80) not valid,
  add constraint mvp_leads_company_name_m51_check
    check (char_length(trim(company_name)) between 2 and 120) not valid,
  add constraint mvp_leads_phone_m51_check
    check (phone ~ '^55[0-9]{10,11}$') not valid,
  add constraint mvp_leads_email_m51_check
    check (email is null or char_length(email) <= 254) not valid;

alter table public.mvp_leads
  validate constraint mvp_leads_contact_name_m51_check;

alter table public.mvp_leads
  validate constraint mvp_leads_company_name_m51_check;

alter table public.mvp_leads
  validate constraint mvp_leads_phone_m51_check;

alter table public.mvp_leads
  validate constraint mvp_leads_email_m51_check;

-- Safe audit used before running this migration. This query exposes no contact
-- PII beyond the already public support code.
--
-- select public_code,
--   array_remove(array[
--     case when char_length(trim(contact_name)) not between 2 and 80 then 'contact_name' end,
--     case when char_length(trim(company_name)) not between 2 and 120 then 'company_name' end,
--     case when phone !~ '^55[0-9]{10,11}$' then 'phone' end,
--     case when email is not null and char_length(email) > 254 then 'email' end
--   ], null) as incompatible_fields
-- from public.mvp_leads
-- where char_length(trim(contact_name)) not between 2 and 80
--    or char_length(trim(company_name)) not between 2 and 120
--    or phone !~ '^55[0-9]{10,11}$'
--    or (email is not null and char_length(email) > 254);

-- Rollback, if required:
-- alter table public.mvp_leads
--   drop constraint if exists mvp_leads_contact_name_m51_check,
--   drop constraint if exists mvp_leads_company_name_m51_check,
--   drop constraint if exists mvp_leads_phone_m51_check,
--   drop constraint if exists mvp_leads_email_m51_check;
