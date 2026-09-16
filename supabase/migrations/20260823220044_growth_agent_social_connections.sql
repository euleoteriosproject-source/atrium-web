create table if not exists public.ga_social_connections (
  platform text primary key check (platform in ('instagram','tiktok')),
  status text not null default 'needs_setup' check (status in ('needs_setup','ready_to_connect','connecting','connected','expired','error','disconnected')),
  account_username text,
  external_account_id text,
  scopes text[] not null default '{}',
  connected_at timestamptz,
  token_expires_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.ga_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.ga_content_items(id) on delete cascade,
  platform text not null check (platform in ('instagram','tiktok')),
  scheduled_at timestamptz not null,
  status text not null default 'queued' check (status in ('queued','blocked','processing','published','failed','cancelled')),
  external_post_id text,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (content_item_id, platform, scheduled_at)
);

create table if not exists ga_private.social_tokens (
  platform text primary key check (platform in ('instagram','tiktok')),
  access_token text,
  refresh_token text,
  open_id text,
  external_account_id text,
  token_expires_at timestamptz,
  refresh_expires_at timestamptz,
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists ga_private.oauth_states (
  state text primary key,
  platform text not null check (platform in ('instagram','tiktok')),
  redirect_after text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

revoke all on public.ga_social_connections from anon, authenticated;
revoke all on public.ga_publish_jobs from anon, authenticated;
revoke all on ga_private.social_tokens from public, anon, authenticated;
revoke all on ga_private.oauth_states from public, anon, authenticated;

alter table public.ga_social_connections enable row level security;
alter table public.ga_publish_jobs enable row level security;

create index if not exists ga_publish_jobs_status_idx on public.ga_publish_jobs(status, scheduled_at);
create index if not exists ga_publish_jobs_content_idx on public.ga_publish_jobs(content_item_id);

insert into public.ga_social_connections(platform,status,account_username,metadata)
values
  ('instagram','needs_setup','@modoatalho',jsonb_build_object('label','Instagram','account_type','creator')),
  ('tiktok','needs_setup','@modoatalho',jsonb_build_object('label','TikTok','account_type','personal_creator'))
on conflict (platform) do update set account_username=excluded.account_username, metadata=public.ga_social_connections.metadata || excluded.metadata, updated_at=now();

insert into public.ga_app_settings(id,value)
values ('social_connection_ui', jsonb_build_object(
  'show_topbar_icons', true,
  'show_connections_screen', true,
  'connection_flow', 'oauth',
  'approval_to_publish', true,
  'publish_requires_connected_network', true
))
on conflict (id) do update set value=excluded.value, updated_at=now();;
