create schema if not exists ga_private;
revoke all on schema ga_private from public;
grant usage on schema ga_private to anon, authenticated;

create table if not exists ga_private.config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
revoke all on ga_private.config from public, anon, authenticated;

insert into ga_private.config(key, value)
values ('dashboard_key_sha256', '2164b9396e0777d4a42a3543d28d8b6d278d9756e7d315ace1a4fe74dd833cb0')
on conflict (key) do update set value = excluded.value, updated_at = now();

create or replace function ga_private.dashboard_authorized()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from ga_private.config c
    where c.key = 'dashboard_key_sha256'
      and c.value = encode(
        extensions.digest(
          coalesce((current_setting('request.headers', true)::jsonb ->> 'x-growth-key'), ''),
          'sha256'
        ),
        'hex'
      )
  );
$$;
revoke all on function ga_private.dashboard_authorized() from public;
grant execute on function ga_private.dashboard_authorized() to anon, authenticated;

-- Read policies
create policy "ga_dashboard_read_signals" on public.ga_signals for select to anon using (ga_private.dashboard_authorized());
create policy "ga_dashboard_read_content" on public.ga_content_items for select to anon using (ga_private.dashboard_authorized());
create policy "ga_dashboard_read_metrics" on public.ga_post_metrics for select to anon using (ga_private.dashboard_authorized());
create policy "ga_dashboard_read_revenue" on public.ga_revenue_entries for select to anon using (ga_private.dashboard_authorized());
create policy "ga_dashboard_read_settings" on public.ga_app_settings for select to anon using (ga_private.dashboard_authorized());
create policy "ga_dashboard_read_runs" on public.ga_agent_runs for select to anon using (ga_private.dashboard_authorized());
create policy "ga_dashboard_read_learnings" on public.ga_learnings for select to anon using (ga_private.dashboard_authorized());

-- Controlled write policies
create policy "ga_dashboard_insert_signals" on public.ga_signals for insert to anon with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_update_signals" on public.ga_signals for update to anon using (ga_private.dashboard_authorized()) with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_insert_content" on public.ga_content_items for insert to anon with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_update_content" on public.ga_content_items for update to anon using (ga_private.dashboard_authorized()) with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_insert_metrics" on public.ga_post_metrics for insert to anon with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_insert_revenue" on public.ga_revenue_entries for insert to anon with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_insert_settings" on public.ga_app_settings for insert to anon with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_update_settings" on public.ga_app_settings for update to anon using (ga_private.dashboard_authorized()) with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_insert_runs" on public.ga_agent_runs for insert to anon with check (ga_private.dashboard_authorized());
create policy "ga_dashboard_insert_learnings" on public.ga_learnings for insert to anon with check (ga_private.dashboard_authorized());

-- Table privileges are still required in addition to RLS.
grant select, insert, update on public.ga_signals to anon;
grant select, insert, update on public.ga_content_items to anon;
grant select, insert on public.ga_post_metrics to anon;
grant select, insert on public.ga_revenue_entries to anon;
grant select, insert, update on public.ga_app_settings to anon;
grant select, insert on public.ga_agent_runs to anon;
grant select, insert on public.ga_learnings to anon;;
