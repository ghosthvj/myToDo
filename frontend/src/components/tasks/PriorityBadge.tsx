import type { Priority } from '../../types';

const CONFIG: Record<Priority, { label: string; className: string }> = {
  LOW: { label: 'Baja', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  MEDIUM: { label: 'Media', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
  URGENT: { label: 'Urgente', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
};

export const PRIORITY_BORDER: Record<Priority, string> = {
  LOW: 'border-l-gray-300',
  MEDIUM: 'border-l-blue-500',
  HIGH: 'border-l-orange-500',
  URGENT: 'border-l-red-500',
};

interface Props {
  priority: Priority;
}

export default function PriorityBadge({ priority }: Props) {
  const cfg = CONFIG[priority];
  return (
    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
