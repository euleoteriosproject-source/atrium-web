create extension if not exists pgcrypto with schema extensions;

create table public.mvp_leads (
  id uuid primary key default extensions.gen_random_uuid(),
  submission_id uuid not null unique,
  public_code text not null unique check (public_code ~ '^AT-[0-9]{2}-[A-Z0-9]{6}$'),
  created_at timestamptz not null default now(),

  contact_name text not null check (char_length(contact_name) between 2 and 100),
  company_name text not null check (char_length(company_name) between 2 and 120),
  phone text not null check (char_length(phone) between 10 and 32),
  email text,

  business_segment text,
  company_size text,
  primary_goal text not null,
  additional_goals jsonb not null default '[]'::jsonb check (jsonb_typeof(additional_goals) = 'array'),
  answers_json jsonb not null check (jsonb_typeof(answers_json) = 'object'),
  diagnostic_version text not null,

  opportunity_scores jsonb not null check (jsonb_typeof(opportunity_scores) = 'object'),
  top_opportunities jsonb not null check (jsonb_typeof(top_opportunities) = 'array'),
  ai_risk_score integer not null default 0 check (ai_risk_score >= 0),

  lead_score integer not null check (lead_score between 0 and 100),
  lead_tier text not null check (lead_tier in ('A', 'B', 'C', 'D')),
  timeframe text,
  budget_range text,

  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,

  status text not null default 'NEW' check (
    status in ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST')
  ),
  internal_notes text,

  consent_contact boolean not null check (consent_contact),
  consent_at timestamptz not null
);

alter table public.mvp_leads enable row level security;
alter table public.mvp_leads force row level security;

revoke all on table public.mvp_leads from anon, authenticated;
grant all on table public.mvp_leads to service_role;

create index mvp_leads_created_at_idx on public.mvp_leads (created_at desc);
create index mvp_leads_status_idx on public.mvp_leads (status);
create index mvp_leads_tier_idx on public.mvp_leads (lead_tier);

comment on table public.mvp_leads is
  'Leads consentidos recebidos exclusivamente pela Edge Function create-lead.';
