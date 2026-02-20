import type { SleepData } from '../types';

interface Props {
  data: SleepData | null;
  loading: boolean;
  onSync: () => void;
  syncing: boolean;
}

function formatMinutes(mins: number | null): string {
  if (mins === null) return '--';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-gray-500';
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreLabel(score: number | null): string {
  if (score === null) return 'No Data';
  if (score >= 85) return 'Optimal';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Poor';
}

export default function SleepScoreCard({ data, loading, onSync, syncing }: Props) {
  if (loading) {
    return (
      <div className="bg-surface-card rounded-2xl p-5 mb-6 animate-pulse">
        <div className="h-20 bg-surface-light rounded" />
      </div>
    );
  }

  const total = data?.total_sleep_minutes ?? null;
  const deep = data?.deep_sleep_minutes ?? null;
  const rem = data?.rem_sleep_minutes ?? null;
  const light = data?.light_sleep_minutes ?? null;
  const score = data?.sleep_score ?? null;

  const stageTotal = (deep ?? 0) + (rem ?? 0) + (light ?? 0);

  return (
    <div className="bg-surface-card rounded-2xl p-5 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className={`text-3xl font-bold ${scoreColor(score)}`}>
              {score ?? '--'}
            </span>
            <div>
              <div className="text-sm font-medium">
                Sleep Score – {scoreLabel(score)}
              </div>
              <div className="text-xs text-gray-400">
                {formatMinutes(total)} total · Readiness {data?.readiness_score ?? '--'}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onSync}
          disabled={syncing}
          className="text-xs text-accent-deep hover:text-white transition-colors disabled:opacity-50"
          title="Sync from Oura Ring"
        >
          {syncing ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          )}
        </button>
      </div>

      {/* Sleep stages bar */}
      {stageTotal > 0 && (
        <div className="mt-4">
          <div className="flex rounded-full overflow-hidden h-3 mb-2">
            {deep !== null && deep > 0 && (
              <div className="stage-deep" style={{ width: `${(deep / stageTotal) * 100}%` }} />
            )}
            {rem !== null && rem > 0 && (
              <div className="stage-rem" style={{ width: `${(rem / stageTotal) * 100}%` }} />
            )}
            {light !== null && light > 0 && (
              <div className="stage-light" style={{ width: `${(light / stageTotal) * 100}%` }} />
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full stage-deep inline-block" />
              Deep {formatMinutes(deep)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full stage-rem inline-block" />
              REM {formatMinutes(rem)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full stage-light inline-block" />
              Light {formatMinutes(light)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
