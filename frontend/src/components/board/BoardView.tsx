import { useState } from 'react';
import { Columns3, Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import { useTaskLists, useReorderLists } from '../../hooks/useTaskLists';
import ListFormModal from '../lists/ListFormModal';
import SortableBoardColumn from './SortableBoardColumn';
import type { TaskList } from '../../types';

export default function BoardView() {
  const { data: lists = [], isLoading } = useTaskLists();
  const reorderLists = useReorderLists();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeList, setActiveList] = useState<TaskList | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const list = lists.find((l) => l.id === event.active.id);
    if (list) setActiveList(list);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveList(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lists.findIndex((l) => l.id === active.id);
    const newIndex = lists.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lists, oldIndex, newIndex);

    qc.setQueryData(['lists'], reordered);
    reorderLists.mutate(reordered.map((l, i) => ({ id: l.id, sortOrder: i })));
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Columns3 size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-1">
            No hay listas creadas
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">
            Crea tu primera lista para organizar tus tareas
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            Crear primera lista
          </button>
        </div>
        <ListFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={lists.map((l) => l.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2 md:overflow-y-auto md:h-full">
          {lists.map((list) => (
            <SortableBoardColumn key={list.id} list={list} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {activeList && (
          <div className="rotate-1 opacity-90 shadow-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center gap-2"
            style={{ borderTopColor: activeList.color, borderTopWidth: '3px' }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeList.color }} />
            <span className="font-medium text-sm text-gray-800 dark:text-gray-100">{activeList.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
