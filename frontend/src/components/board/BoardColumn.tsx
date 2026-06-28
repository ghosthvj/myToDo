import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
import { GripVertical } from 'lucide-react';
import { useTasks, useReorderTasks } from '../../hooks/useTasks';
import TaskCard from '../tasks/TaskCard';
import TaskFormModal from '../tasks/TaskFormModal';
import type { Task, TaskList } from '../../types';

interface Props {
  list: TaskList;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}

export default function BoardColumn({ list, dragHandleProps }: Props) {
  const { data: tasks = [], isLoading } = useTasks(list.id, { status: 'PENDING', sort: 'manualOrder', order: 'asc' });
  const reorder = useReorderTasks(list.id);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
          {tasks.length}
        </span>
      </div>

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
