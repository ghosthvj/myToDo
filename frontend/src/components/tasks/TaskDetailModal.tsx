import { createPortal } from 'react-dom';
import { X, Pencil, Calendar, Tag, Clock, CheckCircle2 } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import PriorityBadge from './PriorityBadge';
import { useToggleTask } from '../../hooks/useTasks';
import { toast } from 'sonner';
import type { Task } from '../../types';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
};

function formatDueDateFull(dueDate: string) {
  const date = new Date(dueDate);
  const base = format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  if (isToday(date)) return { label: `Hoy — ${base}`, color: 'text-orange-500' };
  if (isTomorrow(date)) return { label: `Mañana — ${base}`, color: 'text-yellow-500' };
  if (isPast(date)) return { label: `Atrasada: ${base}`, color: 'text-red-500' };
  return { label: base, color: 'text-gray-600 dark:text-gray-400' };
}

interface Props {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export default function TaskDetailModal({ open, task, onClose, onEdit }: Props) {
  const toggleTask = useToggleTask();

  if (!open || !task) return null;

  const tags = task.tags ? task.tags.split(',').filter(Boolean) : [];
  const isCompleted = task.status === 'COMPLETED';
  const dueDateInfo = task.dueDate ? formatDueDateFull(task.dueDate) : null;

  function handleToggle() {
    toggleTask.mutate(task!.id, {
      onSuccess: (updated) => {
        toast.success(updated.status === 'COMPLETED' ? '¡Tarea completada!' : 'Tarea reabierta');
        onClose();
      },
    });
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
              {STATUS_LABEL[task.status]}
            </p>
            <h3 className={`text-lg font-semibold leading-snug ${
              isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {task.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          {task.description ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sin descripción</p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-1 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            {/* Priority */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-20 flex-shrink-0">Prioridad</span>
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Due date */}
            {dueDateInfo && (
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-20 flex-shrink-0 pt-0.5">Vencimiento</span>
                <span className={`flex items-center gap-1.5 text-sm ${dueDateInfo.color}`}>
                  <Calendar size={13} />
                  <span className="capitalize">{dueDateInfo.label}</span>
                </span>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-20 flex-shrink-0 pt-0.5">Etiquetas</span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-20 flex-shrink-0">Creada</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={11} />
                {format(new Date(task.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
              </span>
            </div>

            {task.completedAt && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-20 flex-shrink-0">Completada</span>
                <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 size={11} />
                  {format(new Date(task.completedAt), "d MMM yyyy, HH:mm", { locale: es })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isCompleted
                ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
            }`}
          >
            <CheckCircle2 size={15} />
            {isCompleted ? 'Reabrir tarea' : 'Marcar completada'}
          </button>

          <button
            onClick={() => { onClose(); onEdit(task); }}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
