import { supabase } from './supabase';
import type { SleepData } from '../types';

const OURA_API = 'https://api.ouraring.com/v2/usercollection';
const OURA_TOKEN = import.meta.env.VITE_OURA_TOKEN as string;

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
  total_sleep_duration: number;
  deep_sleep_duration: number;
  rem_sleep_duration: number;
  light_sleep_duration: number;
  type: string;
}

async function ouraFetch<T>(endpoint: string, params: Record<string, string>): Promise<T[]> {
  const url = new URL(`${OURA_API}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${OURA_TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`Oura API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? [];
}

export async function fetchAndStoreSleepData(date: string): Promise<SleepData | null> {
  try {
    const [sleepScores, readinessScores, sleepPeriods] = await Promise.all([
      ouraFetch<OuraSleepDoc>('daily_sleep', { start_date: date, end_date: date }),
      ouraFetch<OuraReadinessDoc>('daily_readiness', { start_date: date, end_date: date }),
      ouraFetch<OuraSleepPeriod>('sleep', { start_date: date, end_date: date }),
    ]);

    const sleepScore = sleepScores[0]?.score ?? null;
    const readinessScore = readinessScores[0]?.score ?? null;

    // Use the "long_sleep" period (main sleep), fall back to first
    const mainSleep = sleepPeriods.find(p => p.type === 'long_sleep') ?? sleepPeriods[0];

    const record = {
      date,
      sleep_score: sleepScore,
      readiness_score: readinessScore,
      total_sleep_minutes: mainSleep ? Math.round(mainSleep.total_sleep_duration / 60) : null,
      deep_sleep_minutes: mainSleep ? Math.round(mainSleep.deep_sleep_duration / 60) : null,
      rem_sleep_minutes: mainSleep ? Math.round(mainSleep.rem_sleep_duration / 60) : null,
      light_sleep_minutes: mainSleep ? Math.round(mainSleep.light_sleep_duration / 60) : null,
      oura_raw_json: { sleepScores, readinessScores, sleepPeriods },
    };

    const { data, error } = await supabase
      .from('sleep_data')
      .upsert(record, { onConflict: 'date' })
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
