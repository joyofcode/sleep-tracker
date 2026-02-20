import { supabase } from './supabase';
import type { SleepData, Habit, DailyLogMap } from '../types';
import { isHabitEnabled } from '../types';

export interface CorrelationResult {
  habit: Habit;
  avgScoreWith: number;
  avgScoreWithout: number;
  avgDeepWith: number;
  avgDeepWithout: number;
  samplesWith: number;
  samplesWithout: number;
  scoreDiff: number;
  deepDiff: number;
}

export interface TrendPoint {
  date: string;
  sleepScore: number | null;
  readiness: number | null;
  deep: number | null;
  rem: number | null;
  light: number | null;
  total: number | null;
}

export async function getTrends(days: number = 30): Promise<TrendPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('sleep_data')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date');

  if (error) throw error;

  return (data ?? []).map((d: SleepData) => ({
    date: d.date,
    sleepScore: d.sleep_score,
    readiness: d.readiness_score,
    deep: d.deep_sleep_minutes,
    rem: d.rem_sleep_minutes,
    light: d.light_sleep_minutes,
    total: d.total_sleep_minutes,
  }));
}

export async function getCorrelations(days: number = 90): Promise<CorrelationResult[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  // Fetch all sleep data, habits, and logs in the range
  const [sleepRes, habitsRes, logsRes] = await Promise.all([
    supabase.from('sleep_data').select('*').gte('date', startStr),
    supabase.from('habits').select('*').eq('is_active', true).in('input_type', ['toggle', 'toggle_time', 'toggle_time_duration', 'toggle_quantity_time']),
    supabase.from('daily_logs').select('*').gte('date', startStr),
  ]);

  const sleepByDate: Record<string, SleepData> = {};
  (sleepRes.data ?? []).forEach((s: SleepData) => { sleepByDate[s.date] = s; });

  const logsByDate: Record<string, DailyLogMap> = {};
  (logsRes.data ?? []).forEach((l: { date: string; habit_id: string; value: string }) => {
    if (!logsByDate[l.date]) logsByDate[l.date] = {};
    logsByDate[l.date][l.habit_id] = l.value;
  });

  const habits: Habit[] = habitsRes.data ?? [];
  const dates = Object.keys(sleepByDate);

  return habits.map(habit => {
    let scoreWith = 0, scoreWithout = 0;
    let deepWith = 0, deepWithout = 0;
    let countWith = 0, countWithout = 0;

    dates.forEach(date => {
      const sleep = sleepByDate[date];
      if (!sleep.sleep_score) return;

      const logValue = logsByDate[date]?.[habit.id];
      const isOn = isHabitEnabled(habit.input_type, logValue ?? '');

      if (isOn) {
        scoreWith += sleep.sleep_score;
        deepWith += sleep.deep_sleep_minutes ?? 0;
        countWith++;
      } else {
        scoreWithout += sleep.sleep_score;
        deepWithout += sleep.deep_sleep_minutes ?? 0;
        countWithout++;
      }
    });

    const avgScoreWith = countWith > 0 ? scoreWith / countWith : 0;
    const avgScoreWithout = countWithout > 0 ? scoreWithout / countWithout : 0;
    const avgDeepWith = countWith > 0 ? deepWith / countWith : 0;
    const avgDeepWithout = countWithout > 0 ? deepWithout / countWithout : 0;

    return {
      habit,
      avgScoreWith: Math.round(avgScoreWith),
      avgScoreWithout: Math.round(avgScoreWithout),
      avgDeepWith: Math.round(avgDeepWith),
      avgDeepWithout: Math.round(avgDeepWithout),
      samplesWith: countWith,
      samplesWithout: countWithout,
      scoreDiff: Math.round(avgScoreWith - avgScoreWithout),
      deepDiff: Math.round(avgDeepWith - avgDeepWithout),
    };
  }).filter(c => c.samplesWith >= 3 && c.samplesWithout >= 3)
    .sort((a, b) => Math.abs(b.scoreDiff) - Math.abs(a.scoreDiff));
}
