-- ================================================
-- GymBro — Supabase SQL schema
-- Paste this into the Supabase SQL Editor and run.
-- ================================================

-- 1. Users (gym partners)
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default 'bg-lime-400',
  weight numeric not null default 0,
  height numeric not null default 0,
  body_fat numeric not null default 0,
  created_at timestamptz not null default now()
);

-- 2. Exercises
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,
  icon_name text not null default 'Dumbbell',
  days int[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 3. Exercise logs (sets performed)
create table logs (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  weight numeric not null,
  reps int not null,
  date timestamptz not null default now()
);

-- 4. Biometric logs (weight tracking over time)
create table biometric_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  weight numeric not null,
  date timestamptz not null default now()
);

-- 5. App-level settings (single row)
create table settings (
  id int primary key default 1 check (id = 1),
  units text not null default 'kg',
  routine_days int not null default 3,
  active_user_id uuid references users(id)
);

-- Indexes for common queries
create index idx_logs_user on logs(user_id);
create index idx_logs_exercise on logs(exercise_id);
create index idx_biometric_user on biometric_logs(user_id);

-- Enable Row Level Security (open for now — tighten later with auth)
alter table users enable row level security;
alter table exercises enable row level security;
alter table logs enable row level security;
alter table biometric_logs enable row level security;
alter table settings enable row level security;

-- Allow anonymous access with the anon key (remove once you add auth)
create policy "Allow all for anon" on users for all using (true) with check (true);
create policy "Allow all for anon" on exercises for all using (true) with check (true);
create policy "Allow all for anon" on logs for all using (true) with check (true);
create policy "Allow all for anon" on biometric_logs for all using (true) with check (true);
create policy "Allow all for anon" on settings for all using (true) with check (true);

-- Seed the two default users
insert into users (id, name, color, weight, height, body_fat) values
  ('00000000-0000-0000-0000-000000000001', 'You',  'bg-lime-400', 80, 180, 15),
  ('00000000-0000-0000-0000-000000000002', 'Bro',  'bg-blue-400', 85, 185, 14);

-- Seed default exercises
insert into exercises (name, muscle_group, icon_name, days) values
  ('Bench Press',       'Chest',     'Dumbbell',       '{1}'),
  ('Squat',             'Legs',      'Activity',       '{2}'),
  ('Deadlift',          'Back',      'Dumbbell',       '{2}'),
  ('Overhead Press',    'Shoulders', 'ArrowUpCircle',  '{1}'),
  ('Barbell Row',       'Back',      'Dumbbell',       '{3}'),
  ('Pull-ups',          'Back',      'ArrowUp',        '{3}'),
  ('Bicep Curls',       'Arms',      'Dumbbell',       '{3}'),
  ('Tricep Dips',       'Arms',      'ArrowDown',      '{1}'),
  ('Leg Press',         'Legs',      'Activity',       '{2}'),
  ('Lateral Raises',    'Shoulders', 'MoveHorizontal', '{1,3}'),
  ('Romanian Deadlift', 'Legs',      'Dumbbell',       '{2}'),
  ('Plank',             'Core',      'Minus',          '{1,2,3}');

-- Seed the settings row
insert into settings (units, routine_days, active_user_id) values
  ('kg', 3, '00000000-0000-0000-0000-000000000001');
