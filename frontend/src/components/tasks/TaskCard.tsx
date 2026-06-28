import { useState } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import PriorityBadge, { PRIORITY_BORDER } from './PriorityBadge';
import { useToggleTask, useDeleteTask } from '../../hooks/useTasks';
import type { Task } from '../../types';

interface Props {
  task: Task;
  listId: string;
  onEdit: (task: Task) => void;
  draggable?: boolean;
}

function formatDueDate(dueDate: string) {
  const date = new Date(dueDate);
  if (isToday(date)) return { label: 'Hoy', color: 'text-orange-600' };
  if (isTomorrow(date)) return { label: 'Mañana', color: 'text-yellow-600' };
  if (isPast(date)) return { label: `Atrasada: ${format(date, 'd MMM', { locale: es })}`, color: 'text-red-600' };
  return { label: format(date, 'd MMM', { locale: es }), color: 'text-gray-500 dark:text-gray-400' };
}

export default function TaskCard({ task, listId, onEdit, draggable = false }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask(listId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tags = task.tags ? task.tags.split(',').filter(Boolean) : [];
  const isCompleted = task.status === 'COMPLETED';
  const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null;

  function handleToggle() {
    toggleTask.mutate(task.id, {
      onSuccess: (updated) => {
        toast.success(updated.status === 'COMPLETED' ? '¡Tarea completada!' : 'Tarea reabierta');
      },
    });
  }

  function handleDelete() {
    deleteTask.mutate(task.id, {
      onSuccess: () => toast.success('Tarea eliminada'),
    });
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow ${
        PRIORITY_BORDER[task.priority]
      } ${isCompleted ? 'opacity-60' : ''}`}
    >
      {draggable && (
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 touch-none"
        >
          <GripVertical size={16} />
        </div>
      )}

      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <PriorityBadge priority={task.priority} />

          {dueDateInfo && (
            <span className={`flex items-center gap-1 text-xs ${dueDateInfo.color}`}>
              <Calendar size={11} />
              {dueDateInfo.label}
            </span>
          )}

          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors"
          title="Editar"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar tarea"
        message={`¿Eliminar "${task.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={() => { setConfirmOpen(false); handleDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
}
