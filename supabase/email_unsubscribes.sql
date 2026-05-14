-- Sixth Sense · email unsubscribes
-- Run in the Supabase SQL editor. Tracks users who opted out of all transactional
-- email. v1 has no granular preferences (daily vs weekly); both crons skip any
-- user whose id appears in this table. Future granularity can be added by
-- promoting this to an email_preferences table with daily_enabled / weekly_enabled
-- columns and migrating rows in.

create table if not exists email_unsubscribes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unsubscribed_at timestamptz not null default now()
);

alter table email_unsubscribes enable row level security;
-- No policies means anon/authenticated keys see nothing. The cron route uses
-- the service_role key (bypasses RLS) to read + write.
