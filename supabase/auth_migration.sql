-- Sixth Sense · auth migration
-- Adds optional auth.user attribution to takes without breaking the
-- anonymous-first flow. Run this in the Supabase SQL editor AFTER schema.sql.
--
-- After running, also configure Authentication → URL Configuration → Redirect
-- URLs to include both:
--   http://localhost:3000/auth/callback
--   http://localhost:3941/auth/callback
--   https://sixth-sense.app/auth/callback
-- (and any preview deploy origins you care about).

-- 1. Add user_id (nullable — anon takes have no user).
alter table takes
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists takes_user_idx on takes (user_id);

-- 2. Server-side function to claim anon takes for the current auth user.
-- Called from the client immediately after first sign-in. Security definer
-- so it can update rows the client wouldn't otherwise be allowed to touch,
-- but scoped to the caller's auth.uid() and the supplied anon_id.
create or replace function public.link_anon_takes_to_user(anon uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
  uid uuid := auth.uid();
begin
  if uid is null then
    return 0;
  end if;

  update takes
     set user_id = uid
   where anon_id = anon
     and user_id is null;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.link_anon_takes_to_user(uuid) from public;
grant execute on function public.link_anon_takes_to_user(uuid) to authenticated;

-- 3. RLS: authenticated users can read their own takes (by user_id).
-- This unlocks a future /me page. Existing insert policy is unchanged.
drop policy if exists "users can read their own takes" on takes;
create policy "users can read their own takes"
  on takes for select
  to authenticated
  using (user_id = auth.uid());

-- 4. RLS: authenticated users can claim still-unclaimed anon takes via direct
-- update (fallback path if the RPC above isn't reachable). Only allows
-- setting user_id to your own uid, on rows that have no owner yet.
drop policy if exists "users can claim their anon takes" on takes;
create policy "users can claim their anon takes"
  on takes for update
  to authenticated
  using (user_id is null)
  with check (user_id = auth.uid());
