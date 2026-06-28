import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { GripVertical, Plus } from 'lucide-react';
import { useTasks, useReorderTasks } from '../../hooks/useTasks';
import {
  useChecklistItems,
  useCreateChecklistItem,
  useUpdateChecklistItem,
} from '../../hooks/useChecklistItems';
import TaskCard from '../tasks/TaskCard';
import TaskFormModal from '../tasks/TaskFormModal';
import { toast } from 'sonner';
import type { Task, TaskList } from '../../types';

interface Props {
  list: TaskList;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export default function BoardColumn({ list, dragHandleProps }: Props) {
  if (list.type === 'CHECKLIST') {
    return <ChecklistBoardColumn list={list} dragHandleProps={dragHandleProps} />;
  }
  return <TaskBoardColumn list={list} dragHandleProps={dragHandleProps} />;
}

function ColumnHeader({ list, count, dragHandleProps }: { list: TaskList; count: number; dragHandleProps?: React.HTMLAttributes<HTMLButtonElement> }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-xl"
      style={{ borderTopColor: list.color, borderTopWidth: '3px' }}
    >
      <div className="flex items-center gap-2">
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 transition-colors touch-none"
          >
            <GripVertical size={15} />
          </button>
        )}
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: list.color }} />
        <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{list.name}</span>
      </div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
        {count}
      </span>
    </div>
  );
}

function ChecklistBoardColumn({ list, dragHandleProps }: Props) {
  const { data: items = [], isLoading } = useChecklistItems(list.id);
  const createItem = useCreateChecklistItem(list.id);
  const updateItem = useUpdateChecklistItem(list.id);
  const [newText, setNewText] = useState('');
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (adding) inputRef.current?.focus(); }, [adding]);

  const pending = items.filter((i) => !i.done);
  const completed = items.filter((i) => i.done);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    createItem.mutate(text, {
      onSuccess: () => setNewText(''),
      onError: () => toast.error('Error al añadir elemento'),
    });
  }

  function handleToggle(itemId: string, done: boolean) {
    updateItem.mutate({ itemId, done: !done }, { onError: () => toast.error('Error al actualizar') });
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 w-full">
      <ColumnHeader list={list} count={pending.length} dragHandleProps={dragHandleProps} />

      <div className="p-3 space-y-0.5">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse mb-1" />
          ))
        ) : (
          <>
            {pending.map((item) => (
              <label key={item.id} className="flex items-center gap-3 px-1 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer group">
                <span
                  onClick={() => handleToggle(item.id, item.done)}
                  className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0 flex items-center justify-center hover:border-teal-400 transition-colors cursor-pointer"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">{item.text}</span>
              </label>
            ))}

            {completed.length > 0 && (
              <div className="pt-1">
                {completed.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 px-1 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 cursor-pointer opacity-60">
                    <span
                      onClick={() => handleToggle(item.id, item.done)}
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center bg-teal-500 border-teal-500 text-white cursor-pointer"
                    >
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1.5,6 4.5,9 10.5,3" />
                      </svg>
                    </span>
                    <span className="text-sm line-through text-gray-400 dark:text-gray-500 flex-1">{item.text}</span>
                  </label>
                ))}
              </div>
            )}

            {adding ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 px-1 py-1.5">
                <span className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onBlur={() => { if (!newText.trim()) setAdding(false); }}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setAdding(false); setNewText(''); } }}
                  placeholder="Nuevo elemento..."
                  className="flex-1 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex items-center gap-2 px-1 py-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors w-full"
              >
                <Plus size={14} />
                Elemento de lista
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskBoardColumn({ list, dragHandleProps }: Props) {
  const { data: tasks = [], isLoading } = useTasks(list.id, { status: 'PENDING', sort: 'manualOrder', order: 'asc' });
  const reorder = useReorderTasks(list.id);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);

    reorder.mutate(reordered.map((t, i) => ({ id: t.id, manualOrder: i })));
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 w-full">
      <ColumnHeader list={list} count={tasks.length} dragHandleProps={dragHandleProps} />

      <div className="p-3 space-y-2">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))
        ) : tasks.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
            Sin tareas pendientes
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    listId={list.id}
                    draggable
                    onEdit={(t) => { setEditingTask(t); setModalOpen(true); }}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
            <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
              {activeTask && (
                <div className="rotate-1 opacity-95 shadow-2xl">
                  <TaskCard task={activeTask} listId={list.id} draggable={false} onEdit={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <TaskFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        listId={list.id}
        editingTask={editingTask}
      />
    </div>
  );
}
