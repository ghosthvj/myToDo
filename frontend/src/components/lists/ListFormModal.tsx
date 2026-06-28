import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckSquare, LayoutList } from 'lucide-react';
import { useCreateList, useUpdateList } from '../../hooks/useTaskLists';
import { toast } from 'sonner';
import type { TaskList, ListType } from '../../types';

const PRESET_COLORS = [
  '#0d9488', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
];

interface Props {
  open: boolean;
  onClose: () => void;
  editingList?: TaskList | null;
}

export default function ListFormModal({ open, onClose, editingList }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [listType, setListType] = useState<ListType>('TASK');
  const [nameError, setNameError] = useState('');
  const createList = useCreateList();
  const updateList = useUpdateList();

  useEffect(() => {
    if (open) {
      if (editingList) {
        setName(editingList.name);
        setColor(editingList.color);
        setListType(editingList.type ?? 'TASK');
      } else {
        setName('');
        setColor('#0d9488');
        setListType('TASK');
      }
      setNameError('');
    }
  }, [editingList, open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      return;
    }
    setNameError('');

    if (editingList) {
      updateList.mutate(
        { id: editingList.id, name: name.trim(), color },
        {
          onSuccess: () => {
            toast.success('Lista actualizada');
            onClose();
          },
          onError: () => toast.error('Error al actualizar la lista'),
        }
      );
    } else {
      createList.mutate(
        { name: name.trim(), color, type: listType },
        {
          onSuccess: () => {
            toast.success('Lista creada');
            onClose();
          },
          onError: () => toast.error('Error al crear la lista'),
        }
      );
    }
  }

  const isPending = createList.isPending || updateList.isPending;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full mx-4 p-6"
        style={{ maxWidth: '400px' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
            {editingList ? 'Editar lista' : 'Nueva lista'}
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
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder="Ej: Trabajo, Personal..."
              autoFocus
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                nameError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </div>

          {!editingList && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setListType('TASK')}
                  className={[
                    'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-colors',
                    listType === 'TASK'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300',
                  ].join(' ')}
                >
                  <LayoutList size={20} />
                  Lista de tareas
                </button>
                <button
                  type="button"
                  onClick={() => setListType('CHECKLIST')}
                  className={[
                    'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-medium transition-colors',
                    listType === 'CHECKLIST'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300',
                  ].join(' ')}
                >
                  <CheckSquare size={20} />
                  Lista simple
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: color }}
            >
              {isPending ? 'Guardando...' : editingList ? 'Guardar' : 'Crear lista'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
