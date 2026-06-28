import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks';
import { toast } from 'sonner';
import DatePicker from '../ui/DatePicker';
import type { Task, Priority } from '../../types';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  listId: string;
  editingTask?: Task | null;
}

export default function TaskFormModal({ open, onClose, listId, editingTask }: Props) {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const createTask = useCreateTask(listId);
  const updateTask = useUpdateTask();

  useEffect(() => {
    if (open) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || '');
        setPriority(editingTask.priority);
        setDueDate(editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '');
        setTagsInput(editingTask.tags || '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate(format(addDays(new Date(), 2), 'yyyy-MM-dd'));
        setTagsInput('');
      }
      setTitleError('');
    }
  }, [editingTask, open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('El título es obligatorio');
      return;
    }
    setTitleError('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingTask) {
      updateTask.mutate(
        {
          id: editingTask.id,
          title: title.trim(),
          description: description || undefined,
          priority,
          dueDate: dueDate || null,
          tags,
        },
        {
          onSuccess: () => {
            toast.success('Tarea actualizada');
            onClose();
          },
          onError: () => toast.error('Error al actualizar la tarea'),
        }
      );
    } else {
      createTask.mutate(
        {
          title: title.trim(),
          description: description || undefined,
          priority,
          dueDate: dueDate || undefined,
          tags,
        },
        {
          onSuccess: () => {
            toast.success('Tarea creada');
            onClose();
          },
          onError: () => toast.error('Error al crear la tarea'),
        }
      );
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full mx-4 p-6"
        style={{ maxWidth: '480px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
            {editingTask ? 'Editar tarea' : 'Nueva tarea'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
              placeholder="¿Qué necesitas hacer?"
              autoFocus
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                titleError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {titleError && <p className="text-xs text-red-500 mt-1">{titleError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles opcionales..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vencimiento
              </label>
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Etiquetas
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="trabajo, urgente, reunión..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1">Separa las etiquetas con comas</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {isPending ? 'Guardando...' : editingTask ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
