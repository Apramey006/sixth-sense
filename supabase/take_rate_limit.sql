-- Sixth Sense · take rate limit
-- Run in the Supabase SQL editor. Caps each anon_id at 20 take inserts per
-- hour. Anonymous and signed-in users share the same limit (signed-in still
-- has an anon_id assigned by lib/anonId.ts). Stops the easy abuse path of
-- "grab the anon key, spam takes."

create or replace function rate_limit_take_insert(p_anon uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
begin
  select count(*) into recent
  from takes
  where anon_id = p_anon
    and created_at > now() - interval '1 hour';
  return recent < 20;
end;
$$;

-- Replace the unconditional insert policy with one that checks the rate limit.
drop policy if exists "anyone can insert a take" on takes;
create policy "anyone can insert a take (rate limited)"
  on takes for insert
  with check (rate_limit_take_insert(anon_id));
