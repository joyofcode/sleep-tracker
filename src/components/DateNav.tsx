import { format, addDays, subDays, isToday, parseISO } from 'date-fns';

interface Props {
  date: string;
  onChange: (date: string) => void;
}

export default function DateNav({ date, onChange }: Props) {
  const dateObj = parseISO(date + 'T12:00:00');
  const isTodayDate = isToday(dateObj);

  const label = isTodayDate ? 'Today' : format(dateObj, 'EEE, MMM d');

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <button
        onClick={() => onChange(format(subDays(dateObj, 1), 'yyyy-MM-dd'))}
        className="text-gray-400 hover:text-white transition-colors p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={() => onChange(format(new Date(), 'yyyy-MM-dd'))}
        className="text-base font-medium min-w-[140px] text-center hover:text-accent-deep transition-colors"
      >
        {label}
      </button>

      <button
        onClick={() => onChange(format(addDays(dateObj, 1), 'yyyy-MM-dd'))}
        className="text-gray-400 hover:text-white transition-colors p-1"
        disabled={isTodayDate}
      >
        <svg className={`w-5 h-5 ${isTodayDate ? 'opacity-30' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
