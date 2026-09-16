create table if not exists ga_private.provider_credentials (
  platform text primary key check (platform in ('instagram','tiktok')),
  client_id text not null,
  client_secret text not null,
  configured_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
revoke all on ga_private.provider_credentials from public, anon, authenticated;;
