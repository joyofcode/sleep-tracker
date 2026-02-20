import { supabase } from './supabase';
import type { Habit, DailyLogMap } from '../types';

export async function getHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data ?? [];
}

export async function getDailyLogs(date: string): Promise<DailyLogMap> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('habit_id, value')
    .eq('date', date);

  if (error) throw error;

  const map: DailyLogMap = {};
  data?.forEach(row => {
    map[row.habit_id] = row.value;
  });
  return map;
}

export async function upsertDailyLog(date: string, habitId: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .upsert(
      { date, habit_id: habitId, value },
      { onConflict: 'date,habit_id' }
    );

  if (error) throw error;
}

export async function copyLogsFromDate(sourceDate: string, targetDate: string): Promise<void> {
  const sourceLogs = await getDailyLogs(sourceDate);

  const rows = Object.entries(sourceLogs).map(([habit_id, value]) => ({
    date: targetDate,
    habit_id,
    value,
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from('daily_logs')
      .upsert(rows, { onConflict: 'date,habit_id' });

    if (error) throw error;
  }
}

export async function clearLogsForDate(date: string): Promise<void> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('date', date);

  if (error) throw error;
}

export async function addHabit(habit: Omit<Habit, 'id'>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}
