import { ArrowUpDown } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const SORT_OPTIONS = [
  { value: 'manualOrder', label: 'Orden manual' },
  { value: 'dueDate', label: 'Fecha de vencimiento' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'createdAt', label: 'Fecha de creación' },
  { value: 'title', label: 'Nombre (A-Z)' },
] as const;

export default function SortControls() {
  const { sortField, sortOrder, setSortField, setSortOrder } = useUIStore();

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown size={14} className="text-gray-400" />
      <select
        value={sortField}
        onChange={(e) => setSortField(e.target.value as typeof sortField)}
        className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
      </button>
    </div>
  );
}
