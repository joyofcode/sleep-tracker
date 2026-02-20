# Sleep Tracker

A personal sleep tracker that integrates with Oura Ring to track sleep data, habits, and supplements — with correlation insights.

## Setup

### 1. Install dependencies
```bash
cd sleep-tracker
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`
3. Copy your project URL and anon key

### 3. Get Oura API token
1. Go to [cloud.ouraring.com/personal-access-tokens](https://cloud.ouraring.com/personal-access-tokens)
2. Create a new Personal Access Token

### 4. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your actual values:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key
- `VITE_OURA_TOKEN` — Your Oura Personal Access Token

### 5. Run locally
```bash
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OURA_TOKEN`
4. Deploy!

## Features
- 🌙 **Daily Log** — Track habits, supplements, and subjective sleep metrics
- 🔄 **Oura Ring Sync** — Automatically pull sleep score, stages, and readiness
- 📊 **Insights** — Sleep score trends, stage breakdowns, and habit correlations
- 📋 **Copy from yesterday** — Quick-fill today's log from previous day
- ✏️ **Custom habits** — Add, edit, and remove tracked habits
