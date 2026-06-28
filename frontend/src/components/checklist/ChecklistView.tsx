import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTaskLists } from '../../hooks/useTaskLists';
import {
  useChecklistItems,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from '../../hooks/useChecklistItems';
import { toast } from 'sonner';
import type { ChecklistItem } from '../../types';

interface Props {
  listId: string;
}

export default function ChecklistView({ listId }: Props) {
  const { data: lists = [] } = useTaskLists();
  const { data: items = [], isLoading } = useChecklistItems(listId);
  const createItem = useCreateChecklistItem(listId);
  const updateItem = useUpdateChecklistItem(listId);
  const deleteItem = useDeleteChecklistItem(listId);

  const [newText, setNewText] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editRef = useRef<HTMLInputElement>(null);

  const list = lists.find((l) => l.id === listId);
  const pending = items.filter((i) => !i.done);
  const completed = items.filter((i) => i.done);

  useEffect(() => {
    if (addingItem) inputRef.current?.focus();
  }, [addingItem]);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    createItem.mutate(text, {
      onSuccess: () => setNewText(''),
      onError: () => toast.error('Error al añadir elemento'),
    });
  }

  function handleToggle(item: ChecklistItem) {
    updateItem.mutate(
      { itemId: item.id, done: !item.done },
      { onError: () => toast.error('Error al actualizar') }
    );
  }

  function handleDelete(itemId: string) {
    deleteItem.mutate(itemId, {
      onError: () => toast.error('Error al eliminar'),
    });
  }

  function startEdit(item: ChecklistItem) {
    setEditingId(item.id);
    setEditText(item.text);
  }

  function submitEdit(item: ChecklistItem) {
    const text = editText.trim();
    if (!text || text === item.text) {
      setEditingId(null);
      return;
    }
    updateItem.mutate(
      { itemId: item.id, text },
      {
        onSuccess: () => setEditingId(null),
        onError: () => toast.error('Error al actualizar'),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Cargando...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: list?.color ?? '#0d9488' }}
        />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {list?.name ?? 'Lista'}
        </h1>
        <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">
          {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Pending items */}
      <div className="space-y-1">
        {pending.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            isEditing={editingId === item.id}
            editText={editText}
            editRef={editRef}
            onToggle={() => handleToggle(item)}
            onDelete={() => handleDelete(item.id)}
            onStartEdit={() => startEdit(item)}
            onEditChange={setEditText}
            onEditSubmit={() => submitEdit(item)}
            onEditBlur={() => submitEdit(item)}
          />
        ))}

        {/* Add item row */}
        {addingItem ? (
          <form onSubmit={handleAddSubmit} className="flex items-center gap-3 py-2 px-1">
            <span className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onBlur={() => {
                if (!newText.trim()) setAddingItem(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setAddingItem(false); setNewText(''); }
              }}
              placeholder="Nuevo elemento..."
              className="flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newText.trim()}
              className="text-xs text-teal-600 dark:text-teal-400 font-medium disabled:opacity-40"
            >
              Añadir
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAddingItem(true)}
            className="flex items-center gap-2 py-2 px-1 text-sm text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors w-full"
          >
            <Plus size={16} />
            Elemento de lista
          </button>
        )}
      </div>

      {/* Completed section */}
      {completed.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setCompletedOpen((o) => !o)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-2"
          >
            {completedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {completed.length} elemento{completed.length !== 1 ? 's' : ''} completado{completed.length !== 1 ? 's' : ''}
          </button>

          {completedOpen && (
            <div className="space-y-1">
              {completed.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  isEditing={false}
                  editText=""
                  editRef={null}
                  onToggle={() => handleToggle(item)}
                  onDelete={() => handleDelete(item.id)}
                  onStartEdit={() => {}}
                  onEditChange={() => {}}
                  onEditSubmit={() => {}}
                  onEditBlur={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  item: ChecklistItem;
  isEditing: boolean;
  editText: string;
  editRef: React.RefObject<HTMLInputElement | null> | null;
  onToggle: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onEditSubmit: () => void;
  onEditBlur: () => void;
}

function ChecklistRow({
  item,
  isEditing,
  editText,
  editRef,
  onToggle,
  onDelete,
  onStartEdit,
  onEditChange,
  onEditSubmit,
  onEditBlur,
}: RowProps) {
  return (
    <div className="group flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className={[
          'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
          item.done
            ? 'bg-teal-500 border-teal-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-teal-400',
        ].join(' ')}
        aria-label={item.done ? 'Marcar pendiente' : 'Marcar completado'}
      >
        {item.done && (
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1.5,6 4.5,9 10.5,3" />
          </svg>
        )}
      </button>

      {isEditing ? (
        <input
          ref={editRef}
          type="text"
          value={editText}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEditSubmit();
            if (e.key === 'Escape') onEditBlur();
          }}
          className="flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none"
        />
      ) : (
        <span
          onDoubleClick={item.done ? undefined : onStartEdit}
          className={[
            'flex-1 text-sm select-none',
            item.done
              ? 'line-through text-gray-400 dark:text-gray-500'
              : 'text-gray-800 dark:text-gray-200 cursor-text',
          ].join(' ')}
        >
          {item.text}
        </span>
      )}

      <button
        type="button"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 transition-all"
        aria-label="Eliminar"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
