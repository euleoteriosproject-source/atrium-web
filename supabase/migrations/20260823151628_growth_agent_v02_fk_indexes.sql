create index if not exists ga_content_signal_idx on public.ga_content_items(signal_id);
create index if not exists ga_revenue_content_idx on public.ga_revenue_entries(content_item_id);;
