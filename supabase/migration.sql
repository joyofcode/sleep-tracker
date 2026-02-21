-- Supabase SQL migration: Run this in the Supabase SQL Editor

-- Sleep data from Oura Ring
CREATE TABLE IF NOT EXISTS sleep_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date UNIQUE NOT NULL,
  sleep_score int,
  readiness_score int,
  total_sleep_minutes int,
  deep_sleep_minutes int,
  rem_sleep_minutes int,
  light_sleep_minutes int,
  awake_minutes int,
  bedtime_start timestamptz,
  bedtime_end timestamptz,
  efficiency int,
  latency_minutes int,
  oura_raw_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- Configurable habits/supplements
-- input_type: toggle, toggle_time, toggle_time_duration, toggle_quantity_time,
--             duration_rating, rating, rating_3level, time
-- config: jsonb for type-specific settings (e.g. {"max": 10}, {"options": ["Low","Medium","High"]})
CREATE TABLE IF NOT EXISTS habits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('night', 'morning')),
  input_type text NOT NULL CHECK (input_type IN (
    'toggle', 'toggle_time', 'toggle_time_duration', 'toggle_quantity_time',
    'duration_rating', 'rating', 'rating_3level', 'time'
  )),
  config jsonb DEFAULT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);

-- Daily habit log entries
-- value stores: "true"/"false" for toggles, numbers for ratings,
--   or JSON for compound types (e.g. {"enabled":true,"time":"18:00","duration":45})
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (date, habit_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sleep_data_date ON sleep_data(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_habit ON daily_logs(habit_id);

-- Permissive RLS (single-user app)
ALTER TABLE sleep_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on sleep_data" ON sleep_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on habits" ON habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_logs" ON daily_logs FOR ALL USING (true) WITH CHECK (true);

-- Seed default habits
INSERT INTO habits (name, category, input_type, config, display_order) VALUES
  -- Night: Supplements (simple toggles)
  ('Magnesium Glycinate',       'night', 'toggle',                NULL, 1),
  ('Lithium Orotate',           'night', 'toggle',                NULL, 2),
  ('Berberine',                 'night', 'toggle',                NULL, 3),
  ('Glycine',                   'night', 'toggle',                NULL, 4),
  -- Night: Exercise (toggle + time + duration)
  ('Strength Training',         'night', 'toggle_time_duration',  NULL, 5),
  ('Cardio',                    'night', 'toggle_time_duration',  NULL, 6),
  ('HIIT',                      'night', 'toggle_time_duration',  NULL, 7),
  ('Sauna',                     'night', 'toggle_time_duration',  NULL, 8),
  -- Night: Food (toggle + time)
  ('Dinner',                    'night', 'toggle_time',           NULL, 9),
  ('Dessert',                   'night', 'toggle_time',           NULL, 10),
  -- Night: Routine (simple toggles)
  ('Warm Shower Before Sleep',  'night', 'toggle',                NULL, 11),
  ('Breathing Exercise',        'night', 'toggle',                NULL, 12),
  -- Night: Alcohol (toggle + quantity + last drink time)
  ('Alcohol',                   'night', 'toggle_quantity_time',  NULL, 13),
  -- Night: Screen time (duration in min + intensity rating 1-5)
  ('Screen Time Before Sleep',  'night', 'duration_rating',       '{"max": 5}', 14),
  -- Night: Stress (rating 1-5)
  ('Stress/Anxiety Level',      'night', 'rating',                '{"max": 5}', 15),
  -- Morning
  ('Earliest Wake Up',          'morning', 'time',                NULL, 1),
  ('Eyes Stuck Feeling',        'morning', 'toggle',              NULL, 2),
  ('Night Wakings',             'morning', 'rating_3level',       '{"options": ["Low", "Medium", "High"]}', 3),
  ('Sleep Quality',             'morning', 'rating',              '{"max": 10}', 4),
  ('Energy Level',              'morning', 'rating',              '{"max": 10}', 5);
