import { supabase } from './supabase';
import type { SleepData } from '../types';

interface OuraSleepDoc {
  day: string;
  score: number;
  contributors: Record<string, number>;
  timestamp: string;
}

interface OuraReadinessDoc {
  day: string;
  score: number;
  contributors: Record<string, number>;
  timestamp: string;
}

interface OuraSleepPeriod {
  day: string;
  bedtime_start: string;
  bedtime_end: string;
  total_sleep_duration: number;
  deep_sleep_duration: number;
  rem_sleep_duration: number;
  light_sleep_duration: number;
  awake_time: number;
  efficiency: number;
  latency: number;
  type: string;
}

// Calls our Vercel serverless proxy at /api/oura to avoid CORS issues
async function ouraFetch<T>(endpoint: string, params: Record<string, string>): Promise<T[]> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`/api/oura?${searchParams.toString()}`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Oura proxy error: ${res.status} ${body.error ?? res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? [];
}

export async function fetchAndStoreSleepData(date: string): Promise<SleepData | null> {
  try {
    // Oura sleep periods may be indexed by the day you woke up;
    // query a 2-day window to ensure we catch the right period
    const prevDate = new Date(date + 'T12:00:00');
    prevDate.setDate(prevDate.getDate() - 1);
    const prevStr = prevDate.toISOString().split('T')[0];

    const [sleepScores, readinessScores, sleepPeriods] = await Promise.all([
      ouraFetch<OuraSleepDoc>('daily_sleep', { start_date: date, end_date: date }),
      ouraFetch<OuraReadinessDoc>('daily_readiness', { start_date: date, end_date: date }),
      ouraFetch<OuraSleepPeriod>('sleep', { start_date: prevStr, end_date: date }),
    ]);

    const sleepScore = sleepScores[0]?.score ?? null;
    const readinessScore = readinessScores[0]?.score ?? null;

    // Pick the best matching sleep period:
    // 1. Exact date match, 2. Previous day (last night's sleep), 3. Any long_sleep
    const exactMatch = sleepPeriods.filter(p => p.day === date);
    const prevMatch = sleepPeriods.filter(p => p.day === prevStr);
    const candidates = exactMatch.length > 0 ? exactMatch : prevMatch.length > 0 ? prevMatch : sleepPeriods;
    const mainSleep = candidates.find(p => p.type === 'long_sleep') ?? candidates[0];
    console.log('Oura sync:', { date, periodsTotal: sleepPeriods.length, days: sleepPeriods.map(p => p.day), usedDay: mainSleep?.day });

    const record = {
      date,
      sleep_score: sleepScore,
      readiness_score: readinessScore,
      total_sleep_minutes: mainSleep ? Math.round(mainSleep.total_sleep_duration / 60) : null,
      deep_sleep_minutes: mainSleep ? Math.round(mainSleep.deep_sleep_duration / 60) : null,
      rem_sleep_minutes: mainSleep ? Math.round(mainSleep.rem_sleep_duration / 60) : null,
      light_sleep_minutes: mainSleep ? Math.round(mainSleep.light_sleep_duration / 60) : null,
      awake_minutes: mainSleep ? Math.round(mainSleep.awake_time / 60) : null,
      bedtime_start: mainSleep?.bedtime_start ?? null,
      bedtime_end: mainSleep?.bedtime_end ?? null,
      efficiency: mainSleep?.efficiency ?? null,
      latency_minutes: mainSleep ? Math.round(mainSleep.latency / 60) : null,
      oura_raw_json: { sleepScores, readinessScores, sleepPeriods: candidates },
    };

    // Delete existing record first to ensure clean upsert of all fields
    await supabase.from('sleep_data').delete().eq('date', date);

    const { data, error } = await supabase
      .from('sleep_data')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to fetch Oura data:', err);
    return null;
  }
}

export async function getSleepData(date: string): Promise<SleepData | null> {
  const { data } = await supabase
    .from('sleep_data')
    .select('*')
    .eq('date', date)
    .single();

  return data;
}
