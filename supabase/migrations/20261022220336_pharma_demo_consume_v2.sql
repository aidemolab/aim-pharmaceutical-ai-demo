-- Per-IP (3/day) and global (100/day) limits for the pharma demo assistant.
-- Days roll over at 00:00 UTC. Returns 'ok', 'ip_limit' or 'global_limit'.
-- A request is only counted (both rows) when it is allowed.
create or replace function public.pharma_demo_consume_v2(p_bucket text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  d date := (now() at time zone 'utc')::date;
  ip_used integer;
  g integer;
begin
  if p_bucket is null or length(p_bucket) > 128 or p_bucket = 'global' then
    return 'ip_limit';
  end if;

  insert into public.pharma_demo_usage(bucket, bucket_day, requests)
  values (p_bucket, d, 0) on conflict do nothing;
  select requests into ip_used from public.pharma_demo_usage
   where bucket = p_bucket and bucket_day = d for update;
  if ip_used >= 3 then
    return 'ip_limit';
  end if;

  insert into public.pharma_demo_usage(bucket, bucket_day, requests)
  values ('global', d, 0) on conflict do nothing;
  update public.pharma_demo_usage set requests = requests + 1
   where bucket = 'global' and bucket_day = d and requests < 100
   returning requests into g;
  if g is null then
    return 'global_limit';
  end if;

  update public.pharma_demo_usage set requests = requests + 1
   where bucket = p_bucket and bucket_day = d;
  return 'ok';
end $$;

revoke all on function public.pharma_demo_consume_v2(text) from public, anon, authenticated;
grant execute on function public.pharma_demo_consume_v2(text) to service_role;
