-- Growth Agent v0.2 isolated tables in atrium-dev
create extension if not exists pgcrypto;

create table if not exists public.ga_signals (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  title text not null,
  url text not null,
  source text not null,
  published_at timestamptz,
  raw_score numeric,
  opportunity_score integer not null default 0 check (opportunity_score between 0 and 100),
  pillar text,
  tags text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ga_content_items (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  signal_id uuid references public.ga_signals(id) on delete set null,
  status text not null default 'review' check (status in ('draft','review','approved','scheduled','published','discarded')),
  title text not null,
  pillar text,
  format text,
  source_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ga_post_metrics (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.ga_content_items(id) on delete cascade,
  platform text not null check (platform in ('TikTok','Instagram')),
  captured_at timestamptz not null default now(),
  views bigint not null default 0 check (views >= 0),
  likes bigint not null default 0 check (likes >= 0),
  comments bigint not null default 0 check (comments >= 0),
  shares bigint not null default 0 check (shares >= 0),
  saves bigint not null default 0 check (saves >= 0),
  followers_gained bigint not null default 0,
  clicks bigint not null default 0 check (clicks >= 0),
  revenue_brl numeric(12,2) not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ga_revenue_entries (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.ga_content_items(id) on delete set null,
  category text not null,
  description text not null,
  amount_brl numeric(12,2) not null check (amount_brl >= 0),
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ga_app_settings (
  id text primary key default 'default',
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.ga_agent_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null,
  status text not null check (status in ('running','success','error','skipped')),
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ga_learnings (
  id uuid primary key default gen_random_uuid(),
  key text,
  label text not null,
  insight text not null,
  confidence numeric(4,3) check (confidence between 0 and 1),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ga_signals_score_idx on public.ga_signals (opportunity_score desc, created_at desc);
create index if not exists ga_signals_pillar_idx on public.ga_signals (pillar, created_at desc);
create index if not exists ga_content_status_idx on public.ga_content_items (status, created_at desc);
create index if not exists ga_metrics_content_idx on public.ga_post_metrics (content_item_id, captured_at desc);
create index if not exists ga_revenue_date_idx on public.ga_revenue_entries (occurred_at desc);
create index if not exists ga_agent_runs_date_idx on public.ga_agent_runs (created_at desc);

create or replace function public.ga_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.ga_set_updated_at() from public;
revoke execute on function public.ga_set_updated_at() from anon;
revoke execute on function public.ga_set_updated_at() from authenticated;

drop trigger if exists ga_signals_set_updated_at on public.ga_signals;
create trigger ga_signals_set_updated_at before update on public.ga_signals for each row execute function public.ga_set_updated_at();
drop trigger if exists ga_content_set_updated_at on public.ga_content_items;
create trigger ga_content_set_updated_at before update on public.ga_content_items for each row execute function public.ga_set_updated_at();
drop trigger if exists ga_settings_set_updated_at on public.ga_app_settings;
create trigger ga_settings_set_updated_at before update on public.ga_app_settings for each row execute function public.ga_set_updated_at();

alter table public.ga_signals enable row level security;
alter table public.ga_content_items enable row level security;
alter table public.ga_post_metrics enable row level security;
alter table public.ga_revenue_entries enable row level security;
alter table public.ga_app_settings enable row level security;
alter table public.ga_agent_runs enable row level security;
alter table public.ga_learnings enable row level security;

revoke all on table public.ga_signals from anon, authenticated;
revoke all on table public.ga_content_items from anon, authenticated;
revoke all on table public.ga_post_metrics from anon, authenticated;
revoke all on table public.ga_revenue_entries from anon, authenticated;
revoke all on table public.ga_app_settings from anon, authenticated;
revoke all on table public.ga_agent_runs from anon, authenticated;
revoke all on table public.ga_learnings from anon, authenticated;;
