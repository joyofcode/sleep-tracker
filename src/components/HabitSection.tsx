import type { Habit, DailyLogMap, ToggleTimeValue, ToggleTimeDurationValue, ToggleQuantityTimeValue, DurationRatingValue } from '../types';
import { parseLogValue } from '../types';

interface Props {
  habits: Habit[];
  logs: DailyLogMap;
  onToggle: (habitId: string, value: string) => void;
}

function RatingInput({ value, onChange, max = 5 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
            n <= value
              ? 'bg-primary text-white'
              : 'bg-surface-light text-gray-400 hover:bg-surface-light/80'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ThreeLevelInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            value === opt
              ? 'bg-primary text-white'
              : 'bg-surface-light text-gray-400 hover:text-white'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-surface-light text-white text-sm rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

function NumberInput({ value, onChange, placeholder, className = '' }: {
  value: number | '';
  onChange: (v: number) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(parseInt(e.target.value) || 0)}
      placeholder={placeholder}
      className={`bg-surface-light text-white text-sm rounded-lg px-3 py-1.5 border-none outline-none focus:ring-2 focus:ring-primary w-20 ${className}`}
    />
  );
}

// Toggle + Time input (for Dinner, Dessert)
function ToggleTimeInput({ habit, raw, onSave }: { habit: Habit; raw: string; onSave: (v: string) => void }) {
  const val = parseLogValue<ToggleTimeValue>(raw, { enabled: false, time: '' });
  const update = (patch: Partial<ToggleTimeValue>) => onSave(JSON.stringify({ ...val, ...patch }));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => update({ enabled: !val.enabled })}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            val.enabled ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface-light text-gray-400 hover:text-white'
          }`}
        >
          {habit.name}
        </button>
        {val.enabled && (
          <TimeInput value={val.time} onChange={t => update({ time: t })} />
        )}
      </div>
    </div>
  );
}

// Toggle + Time + Duration (for Exercise, Sauna)
function ToggleTimeDurationInput({ habit, raw, onSave }: { habit: Habit; raw: string; onSave: (v: string) => void }) {
  const val = parseLogValue<ToggleTimeDurationValue>(raw, { enabled: false, time: '', duration: 0 });
  const update = (patch: Partial<ToggleTimeDurationValue>) => onSave(JSON.stringify({ ...val, ...patch }));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => update({ enabled: !val.enabled })}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            val.enabled ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface-light text-gray-400 hover:text-white'
          }`}
        >
          {habit.name}
        </button>
      </div>
      {val.enabled && (
        <div className="flex items-center gap-3 pl-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">at</span>
            <TimeInput value={val.time} onChange={t => update({ time: t })} />
          </div>
          <div className="flex items-center gap-1">
            <NumberInput value={val.duration || ''} onChange={d => update({ duration: d })} placeholder="min" />
            <span className="text-xs text-gray-500">min</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Toggle + Quantity + Time (for Alcohol)
function ToggleQuantityTimeInput({ habit, raw, onSave }: { habit: Habit; raw: string; onSave: (v: string) => void }) {
  const val = parseLogValue<ToggleQuantityTimeValue>(raw, { enabled: false, quantity: 0, time: '' });
  const update = (patch: Partial<ToggleQuantityTimeValue>) => onSave(JSON.stringify({ ...val, ...patch }));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => update({ enabled: !val.enabled })}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            val.enabled ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface-light text-gray-400 hover:text-white'
          }`}
        >
          {habit.name}
        </button>
      </div>
      {val.enabled && (
        <div className="flex items-center gap-3 pl-2">
          <div className="flex items-center gap-1">
            <NumberInput value={val.quantity || ''} onChange={q => update({ quantity: q })} placeholder="#" />
            <span className="text-xs text-gray-500">drinks</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">last at</span>
            <TimeInput value={val.time} onChange={t => update({ time: t })} />
          </div>
        </div>
      )}
    </div>
  );
}

// Duration + Rating (for Screen Time Before Sleep)
function DurationRatingInput({ habit, raw, onSave, max = 5 }: { habit: Habit; raw: string; onSave: (v: string) => void; max?: number }) {
  const val = parseLogValue<DurationRatingValue>(raw, { duration: 0, rating: 0 });
  const update = (patch: Partial<DurationRatingValue>) => onSave(JSON.stringify({ ...val, ...patch }));

  return (
    <div className="w-full space-y-2 py-1">
      <span className="text-sm text-gray-300">{habit.name}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <NumberInput value={val.duration || ''} onChange={d => update({ duration: d })} placeholder="min" />
          <span className="text-xs text-gray-500">min</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">intensity</span>
          <RatingInput value={val.rating} onChange={r => update({ rating: r })} max={max} />
        </div>
      </div>
    </div>
  );
}

export default function HabitSection({ habits, logs, onToggle }: Props) {
  const nightHabits = habits.filter(h => h.category === 'night');
  const morningHabits = habits.filter(h => h.category === 'morning');

  const renderHabit = (habit: Habit) => {
    const raw = logs[habit.id] ?? '';

    switch (habit.input_type) {
      case 'toggle': {
        const isOn = raw === 'true';
        return (
          <button
            key={habit.id}
            onClick={() => onToggle(habit.id, isOn ? 'false' : 'true')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isOn ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-surface-light text-gray-400 hover:text-white'
            }`}
          >
            {habit.name}
          </button>
        );
      }

      case 'toggle_time':
        return <ToggleTimeInput key={habit.id} habit={habit} raw={raw} onSave={v => onToggle(habit.id, v)} />;

      case 'toggle_time_duration':
        return <ToggleTimeDurationInput key={habit.id} habit={habit} raw={raw} onSave={v => onToggle(habit.id, v)} />;

      case 'toggle_quantity_time':
        return <ToggleQuantityTimeInput key={habit.id} habit={habit} raw={raw} onSave={v => onToggle(habit.id, v)} />;

      case 'duration_rating':
        return <DurationRatingInput key={habit.id} habit={habit} raw={raw} onSave={v => onToggle(habit.id, v)} max={habit.config?.max ?? 5} />;

      case 'rating': {
        const max = habit.config?.max ?? 5;
        return (
          <div key={habit.id} className="w-full flex items-center justify-between py-1">
            <span className="text-sm text-gray-300">{habit.name}</span>
            <RatingInput value={parseInt(raw) || 0} onChange={v => onToggle(habit.id, v.toString())} max={max} />
          </div>
        );
      }

      case 'rating_3level': {
        const options = habit.config?.options ?? ['Low', 'Medium', 'High'];
        return (
          <div key={habit.id} className="w-full flex items-center justify-between py-1">
            <span className="text-sm text-gray-300">{habit.name}</span>
            <ThreeLevelInput value={raw} onChange={v => onToggle(habit.id, v)} options={options} />
          </div>
        );
      }

      case 'time':
        return (
          <div key={habit.id} className="w-full flex items-center justify-between py-1">
            <span className="text-sm text-gray-300">{habit.name}</span>
            <TimeInput value={raw || ''} onChange={v => onToggle(habit.id, v)} />
          </div>
        );

      default:
        return null;
    }
  };

  const isCompound = (t: string) => ['toggle_time', 'toggle_time_duration', 'toggle_quantity_time', 'duration_rating'].includes(t);

  const renderCategory = (label: string, items: Habit[]) => {
    if (items.length === 0) return null;

    const simpleToggles = items.filter(h => h.input_type === 'toggle');
    const compoundItems = items.filter(h => isCompound(h.input_type));
    const otherItems = items.filter(h => !isCompound(h.input_type) && h.input_type !== 'toggle');

    return (
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </div>
        {simpleToggles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {simpleToggles.map(renderHabit)}
          </div>
        )}
        {compoundItems.length > 0 && (
          <div className="space-y-2 mb-3">
            {compoundItems.map(renderHabit)}
          </div>
        )}
        {otherItems.length > 0 && (
          <div className="space-y-1">
            {otherItems.map(renderHabit)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderCategory('Night', nightHabits)}
      {renderCategory('Morning', morningHabits)}
    </div>
  );
}
