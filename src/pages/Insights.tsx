import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getTrends, getCorrelations } from '../lib/insights';
import type { TrendPoint, CorrelationResult } from '../lib/insights';

export default function Insights() {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [t, c] = await Promise.all([getTrends(days), getCorrelations(90)]);
        setTrends(t);
        setCorrelations(c);
      } catch (err) {
        console.error('Failed to load insights:', err);
      }
      setLoading(false);
    })();
  }, [days]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-surface-card rounded-2xl p-5 h-48 animate-pulse" />
        <div className="bg-surface-card rounded-2xl p-5 h-48 animate-pulse" />
      </div>
    );
  }

  const formatDate = (d: string) => {
    const date = new Date(d + 'T12:00:00');
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2 justify-center">
        {[7, 14, 30, 60, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              days === d ? 'bg-primary text-white' : 'bg-surface-light text-gray-400 hover:text-white'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Sleep Score Trend */}
      <div className="bg-surface-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4">Sleep Score Trend</h3>
        {trends.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No sleep data yet. Sync your Oura ring!</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#888' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#252240', border: 'none', borderRadius: '8px' }}
                labelFormatter={formatDate}
              />
              <Line type="monotone" dataKey="sleepScore" stroke="#818cf8" strokeWidth={2} dot={false} name="Sleep Score" />
              <Line type="monotone" dataKey="readiness" stroke="#a78bfa" strokeWidth={2} dot={false} name="Readiness" />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sleep Stages Trend */}
      {trends.length > 0 && (
        <div className="bg-surface-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Sleep Stages</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: '#888' }} />
              <YAxis tick={{ fontSize: 10, fill: '#888' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#252240', border: 'none', borderRadius: '8px' }}
                labelFormatter={formatDate}
                formatter={(value: number) => [`${Math.round(value / 60)}h ${value % 60}m`]}
              />
              <Bar dataKey="deep" stackId="a" fill="#818cf8" name="Deep" />
              <Bar dataKey="rem" stackId="a" fill="#a78bfa" name="REM" />
              <Bar dataKey="light" stackId="a" fill="#c4b5fd" name="Light" />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Correlations */}
      <div className="bg-surface-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4">Habit Correlations</h3>
        {correlations.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Need more data to show correlations. Log habits daily for at least 2 weeks!
          </p>
        ) : (
          <div className="space-y-3">
            {correlations.map(c => (
              <div key={c.habit.id} className="flex items-center justify-between bg-surface-light rounded-xl px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{c.habit.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.samplesWith} nights with · {c.samplesWithout} without
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${c.scoreDiff > 0 ? 'text-green-400' : c.scoreDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {c.scoreDiff > 0 ? '+' : ''}{c.scoreDiff} score
                  </div>
                  <div className={`text-xs ${c.deepDiff > 0 ? 'text-green-400' : c.deepDiff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {c.deepDiff > 0 ? '+' : ''}{c.deepDiff}m deep
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
