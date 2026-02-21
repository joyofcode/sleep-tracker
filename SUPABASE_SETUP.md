# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or sign up free)
2. Click **"New Project"**
3. Pick a name (e.g., `sleep-tracker`), set a database password, and choose a region close to you
4. Click **Create new project** — wait ~1 minute for it to spin up

## 2. Run the Migration SQL

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase/migration.sql` from this project in a text editor, copy the entire contents, and paste it into the SQL Editor
4. Click **Run** — this creates the 3 tables and seeds your 20 default habits

### What the migration creates

| Table | Purpose |
|-------|---------|
| `sleep_data` | Stores Oura Ring sleep scores, readiness, and sleep stage durations |
| `habits` | Configurable list of habits/supplements with compound input types and a `config` jsonb column |
| `daily_logs` | Daily entries linking a date + habit to a value (simple string or JSON for compound types) |

It also enables Row Level Security with permissive policies (single-user app).

### Supported input types

| Input Type | Example Habit | Value stored in `daily_logs.value` |
|------------|---------------|-------------------------------------|
| `toggle` | Magnesium Glycinate | `"true"` / `"false"` |
| `toggle_time` | Dinner | `{"enabled":true,"time":"19:30"}` |
| `toggle_time_duration` | Strength Training | `{"enabled":true,"time":"18:00","duration":45}` |
| `toggle_quantity_time` | Alcohol | `{"enabled":true,"quantity":2,"time":"21:00"}` |
| `duration_rating` | Screen Time Before Sleep | `{"duration":30,"rating":3}` |
| `rating` | Sleep Quality (1-10) | `"7"` (config: `{"max":10}`) |
| `rating_3level` | Night Wakings | `"Low"` / `"Medium"` / `"High"` |
| `time` | Earliest Wake Up | `"05:30"` |

### Seeded habits (20 total)

**Night (15):** Magnesium Glycinate, Lithium Orotate, Berberine, Glycine (toggles) · Strength Training, Cardio, HIIT, Sauna (toggle+time+duration) · Dinner, Dessert (toggle+time) · Warm Shower, Breathing Exercise (toggles) · Alcohol (toggle+quantity+time) · Screen Time (duration+rating) · Stress/Anxiety (rating 1-5)

**Morning (5):** Earliest Wake Up (time) · Eyes Stuck Feeling (toggle) · Night Wakings (low/med/high) · Sleep Quality (rating 1-10) · Energy Level (rating 1-10)

## 3. Get Your Credentials

1. Go to **Project Settings** → **API** (left sidebar)
2. Copy these two values:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public key** (under "Project API keys") → this is your `VITE_SUPABASE_ANON_KEY`

## 4. Update Your `.env`

Create a `.env` file in the project root (`sleep-tracker/.env`):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
VITE_OURA_TOKEN=your-oura-token
```

> **Note:** For the Oura token, go to [cloud.ouraring.com/personal-access-tokens](https://cloud.ouraring.com/personal-access-tokens) and create a Personal Access Token.

## 5. Verify

Run `npm run dev` and open the app. If everything is connected, the Daily Log page should load without errors and you should see your seeded habits.
