-- Sixth Sense · favorites migration
-- Adds a per-user "favorited" flag on takes so signed-in users can star reps
-- they want to revisit. Run AFTER auth_migration.sql.

alter table takes
  add column if not exists favorited boolean not null default false;

create index if not exists takes_favorited_idx
  on takes (user_id)
  where favorited;

-- Allow authenticated users to update favorited on their own takes.
-- The existing "users can claim their anon takes" policy only covers
-- the user_id is null → claim path; this one covers ongoing updates.
drop policy if exists "users can update their own takes" on takes;
create policy "users can update their own takes"
  on takes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
