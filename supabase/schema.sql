-- Sixth Sense · v1 schema
-- Run in the Supabase SQL editor after creating a new project.

-- Scenarios are content. Daily and weekly share a table with a `type` discriminator.
create table if not exists scenarios (
  id text primary key,
  type text not null check (type in ('daily', 'weekly')),
  scheduled_date date,
  iso_week text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists scenarios_daily_idx on scenarios (scheduled_date) where type = 'daily';
create index if not exists scenarios_weekly_idx on scenarios (iso_week) where type = 'weekly';

-- Takes are user submissions. anon_id is a UUID held in localStorage on the client.
-- No auth in v1; takes are write-once and not editable.
create table if not exists takes (
  id uuid primary key default gen_random_uuid(),
  anon_id uuid not null,
  scenario_id text not null references scenarios(id) on delete cascade,
  scenario_type text not null check (scenario_type in ('daily', 'weekly')),
  body jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists takes_scenario_idx on takes (scenario_id);
create index if not exists takes_anon_idx on takes (anon_id);

-- Public RLS: anyone can read scenarios, anyone can insert takes, no one can read other people's takes.
alter table scenarios enable row level security;
alter table takes enable row level security;

drop policy if exists "scenarios are public" on scenarios;
create policy "scenarios are public" on scenarios for select using (true);

drop policy if exists "anyone can insert a take" on takes;
create policy "anyone can insert a take" on takes for insert with check (true);

-- Note: we deliberately do NOT add a select policy on takes for v1.
-- Once peer-comparison ships, we'll add aggregate views or a public read with anonymization.

-- Auth attribution lives in supabase/auth_migration.sql. Run that after this
-- file to add takes.user_id, the anon→user link function, and per-user RLS.
