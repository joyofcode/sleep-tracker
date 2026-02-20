import { format, subDays } from 'date-fns';

interface Props {
  date: string;
  onCopyYesterday: () => void;
  onStartFresh: () => void;
}

export default function QuickActions({ date, onCopyYesterday, onStartFresh }: Props) {
  const yesterday = format(subDays(new Date(date + 'T12:00:00'), 1), 'MMM d');

  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        onClick={onCopyYesterday}
        className="flex-1 bg-surface-light text-sm text-gray-300 hover:text-white py-2 px-3 rounded-lg transition-colors"
      >
        📋 Copy from {yesterday}
      </button>
      <button
        onClick={onStartFresh}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        Start fresh
      </button>
    </div>
  );
}
