import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import DateNav from '../components/DateNav';
import SleepScoreCard from '../components/SleepScoreCard';
import HabitSection from '../components/HabitSection';
import HabitManager from '../components/HabitManager';
import QuickActions from '../components/QuickActions';
import { getHabits, getDailyLogs, upsertDailyLog, copyLogsFromDate, clearLogsForDate } from '../lib/habits';
import { getSleepData, fetchAndStoreSleepData } from '../lib/oura';
import type { SleepData, Habit, DailyLogMap } from '../types';

export default function DailyLog() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sleepData, setSleepData] = useState<SleepData | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DailyLogMap>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sleep, habitList, dailyLogs] = await Promise.all([
        getSleepData(date),
        getHabits(),
        getDailyLogs(date),
      ]);
      setSleepData(sleep);
      setHabits(habitList);
      setLogs(dailyLogs);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    const data = await fetchAndStoreSleepData(date);
    if (data) setSleepData(data);
    setSyncing(false);
  };

  const handleToggle = async (habitId: string, value: string) => {
    // Optimistic update
    setLogs(prev => ({ ...prev, [habitId]: value }));
    try {
      await upsertDailyLog(date, habitId, value);
    } catch (err) {
      console.error('Failed to save log:', err);
      loadData(); // Revert on error
    }
  };

  const handleCopyYesterday = async () => {
    const yesterday = format(subDays(new Date(date + 'T12:00:00'), 1), 'yyyy-MM-dd');
    await copyLogsFromDate(yesterday, date);
    const updatedLogs = await getDailyLogs(date);
    setLogs(updatedLogs);
  };

  const handleStartFresh = async () => {
    await clearLogsForDate(date);
    setLogs({});
  };

  return (
    <div>
      <DateNav date={date} onChange={setDate} />

      <SleepScoreCard
        data={sleepData}
        loading={loading}
        onSync={handleSync}
        syncing={syncing}
      />

      <HabitManager habits={habits} onUpdate={loadData} />

      <QuickActions
        date={date}
        onCopyYesterday={handleCopyYesterday}
        onStartFresh={handleStartFresh}
      />

      <HabitSection
        habits={habits}
        logs={logs}
        onToggle={handleToggle}
      />
    </div>
  );
}
