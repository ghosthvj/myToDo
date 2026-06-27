import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus, ListTodo } from 'lucide-react';
import { useTasks, useReorderTasks } from '../../hooks/useTasks';
import { useUIStore } from '../../store/uiStore';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import type { Task } from '../../types';

interface Props {
  listId: string;
}

export default function TaskListView({ listId }: Props) {
  const { sortField, sortOrder } = useUIStore();
  const { data: tasks = [], isLoading } = useTasks(listId, { sort: sortField, order: sortOrder });
  const reorder = useReorderTasks(listId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const isDraggable = sortField === 'manualOrder';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);

    reorder.mutate(
      reordered.map((t, i) => ({ id: t.id, manualOrder: i }))
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}
        </span>
        <button
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Nueva tarea
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ListTodo size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No hay tareas aún</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Crea tu primera tarea con el botón de arriba
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    listId={listId}
                    draggable={isDraggable}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setModalOpen(true);
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <TaskFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        listId={listId}
        editingTask={editingTask}
      />
    </>
  );
}
