-- Sixth Sense · retroactive migration
-- Lets users do reps they missed (the archive) while keeping the streak honest.
-- Run AFTER favorites_migration.sql.
--
--   target_date — the day (daily) or Monday of the ISO week (weekly) the rep is
--                 FOR, independent of when it was filed. Lets /me date a rep by
--                 the moment it covers, not the moment it was caught up on.
--   retroactive — true when the rep was filed after its target date passed
--                 (i.e. done from the archive rather than live).

alter table takes
  add column if not exists target_date date,
  add column if not exists retroactive boolean not null default false;

-- Query reps for a given day/week regardless of when they were filed.
create index if not exists takes_target_date_idx on takes (target_date);

-- No RLS change needed: target_date and retroactive are set at INSERT time,
-- which the existing "anyone can insert a take" policy already permits.
