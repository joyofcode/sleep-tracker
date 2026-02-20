import { useState } from 'react';
import type { Habit, InputType } from '../types';
import { addHabit, updateHabit, deleteHabit } from '../lib/habits';

interface Props {
  habits: Habit[];
  onUpdate: () => void;
}

const INPUT_TYPE_OPTIONS: { value: InputType; label: string }[] = [
  { value: 'toggle', label: 'Toggle (yes/no)' },
  { value: 'toggle_time', label: 'Toggle + Time' },
  { value: 'toggle_time_duration', label: 'Toggle + Time + Duration' },
  { value: 'toggle_quantity_time', label: 'Toggle + Quantity + Time' },
  { value: 'duration_rating', label: 'Duration + Rating' },
  { value: 'rating', label: 'Rating (1-N)' },
  { value: 'rating_3level', label: 'Rating (Low/Med/High)' },
  { value: 'time', label: 'Time picker' },
];

export default function HabitManager({ habits, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'night' | 'morning'>('night');
  const [newType, setNewType] = useState<InputType>('toggle');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const maxOrder = habits
      .filter(h => h.category === newCategory)
      .reduce((max, h) => Math.max(max, h.display_order), 0);

    // Default config based on type
    let config = null;
    if (newType === 'rating') config = { max: 5 };
    if (newType === 'duration_rating') config = { max: 5 };
    if (newType === 'rating_3level') config = { options: ['Low', 'Medium', 'High'] };

    await addHabit({
      name: newName.trim(),
      category: newCategory,
      input_type: newType,
      config,
      display_order: maxOrder + 1,
      is_active: true,
    });
    setNewName('');
    setIsAdding(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteHabit(id);
    onUpdate();
  };

  const handleRename = async (id: string, name: string) => {
    await updateHabit(id, { name });
    onUpdate();
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Habits & Supplements</h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsEditing(!isEditing); setIsAdding(false); }}
            className="text-xs text-accent-deep hover:text-white transition-colors"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={() => { setIsAdding(!isAdding); setIsEditing(false); }}
            className="text-xs text-accent-deep hover:text-white transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Add new habit form */}
      {isAdding && (
        <div className="bg-surface-light rounded-xl p-3 mb-3 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Habit name..."
            className="w-full bg-surface text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as 'night' | 'morning')}
              className="bg-surface text-white text-sm rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="night">Night</option>
              <option value="morning">Morning</option>
            </select>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as InputType)}
              className="bg-surface text-white text-sm rounded-lg px-3 py-1.5 outline-none flex-1"
            >
              {INPUT_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="bg-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Edit mode - list habits with delete/rename */}
      {isEditing && (
        <div className="bg-surface-light rounded-xl p-3 mb-3 space-y-1">
          {habits.map(habit => (
            <div key={habit.id} className="flex items-center justify-between py-1.5">
              <input
                type="text"
                defaultValue={habit.name}
                onBlur={e => {
                  if (e.target.value !== habit.name) {
                    handleRename(habit.id, e.target.value);
                  }
                }}
                className="bg-transparent text-white text-sm flex-1 outline-none focus:ring-1 focus:ring-primary rounded px-1"
              />
              <span className="text-xs text-gray-600 mx-2">{habit.input_type}</span>
              <button
                onClick={() => handleDelete(habit.id)}
                className="text-red-400 hover:text-red-300 text-xs ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
