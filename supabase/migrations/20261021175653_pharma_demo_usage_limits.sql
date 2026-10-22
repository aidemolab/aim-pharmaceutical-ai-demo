create table if not exists public.pharma_demo_usage (
  bucket text not null,
  bucket_day date not null default (now() at time zone 'utc')::date,
  requests integer not null default 0,
  primary key (bucket,bucket_day)
);
alter table public.pharma_demo_usage enable row level security;
revoke all on public.pharma_demo_usage from anon, authenticated;
create or replace function public.pharma_demo_consume(p_bucket text)
returns boolean language plpgsql security definer set search_path=public
as $$
declare n integer; g integer;
begin
  if length(p_bucket)>128 or p_bucket is null then return false; end if;
  insert into public.pharma_demo_usage(bucket,bucket_day,requests) values ('global',(now() at time zone 'utc')::date,0) on conflict do nothing;
  update public.pharma_demo_usage set requests=requests+1 where bucket='global' and bucket_day=(now() at time zone 'utc')::date and requests < 100 returning requests into g;
  if g is null then return false; end if;
  insert into public.pharma_demo_usage(bucket,bucket_day,requests) values (p_bucket,(now() at time zone 'utc')::date,0) on conflict do nothing;
  update public.pharma_demo_usage set requests=requests+1 where bucket=p_bucket and bucket_day=(now() at time zone 'utc')::date and requests < 5 returning requests into n;
  if n is null then raise exception 'demo_limit_reached' using errcode='P0001'; end if;
  return true;
end $$;
revoke all on function public.pharma_demo_consume(text) from public, anon, authenticated;
grant execute on function public.pharma_demo_consume(text) to service_role;
