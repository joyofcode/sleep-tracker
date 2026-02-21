export interface SleepData {
  id: string;
  date: string;
  sleep_score: number | null;
  readiness_score: number | null;
  total_sleep_minutes: number | null;
  deep_sleep_minutes: number | null;
  rem_sleep_minutes: number | null;
  light_sleep_minutes: number | null;
  awake_minutes: number | null;
  bedtime_start: string | null;
  bedtime_end: string | null;
  efficiency: number | null;
  latency_minutes: number | null;
  oura_raw_json: Record<string, unknown> | null;
  created_at: string;
}

export type InputType =
  | 'toggle'
  | 'toggle_time'
  | 'toggle_time_duration'
  | 'toggle_quantity_time'
  | 'duration_rating'
  | 'rating'
  | 'rating_3level'
  | 'time';

export interface HabitConfig {
  max?: number;           // for rating: max value (default 5)
  options?: string[];     // for rating_3level: e.g. ["Low", "Medium", "High"]
}

export interface Habit {
  id: string;
  name: string;
  category: 'night' | 'morning';
  input_type: InputType;
  config: HabitConfig | null;
  display_order: number;
  is_active: boolean;
}

// Compound value shapes stored as JSON in daily_logs.value
export interface ToggleTimeValue { enabled: boolean; time: string }
export interface ToggleTimeDurationValue { enabled: boolean; time: string; duration: number }
export interface ToggleQuantityTimeValue { enabled: boolean; quantity: number; time: string }
export interface DurationRatingValue { duration: number; rating: number }

export interface DailyLog {
  id: string;
  date: string;
  habit_id: string;
  value: string;
  created_at: string;
}

export type DailyLogMap = Record<string, string>;

// Helper to parse compound JSON values safely
export function parseLogValue<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Helper to check if a habit was "on" for correlation purposes
export function isHabitEnabled(inputType: InputType, raw: string): boolean {
  if (!raw) return false;
  switch (inputType) {
    case 'toggle':
      return raw === 'true';
    case 'toggle_time':
      return parseLogValue<ToggleTimeValue>(raw, { enabled: false, time: '' }).enabled;
    case 'toggle_time_duration':
      return parseLogValue<ToggleTimeDurationValue>(raw, { enabled: false, time: '', duration: 0 }).enabled;
    case 'toggle_quantity_time':
      return parseLogValue<ToggleQuantityTimeValue>(raw, { enabled: false, quantity: 0, time: '' }).enabled;
    default:
      return false;
  }
}
