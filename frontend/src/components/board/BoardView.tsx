import { useState } from 'react';
import { Columns3, Plus } from 'lucide-react';
import { useTaskLists } from '../../hooks/useTaskLists';
import ListFormModal from '../lists/ListFormModal';
import BoardColumn from './BoardColumn';

export default function BoardView() {
  const { data: lists = [], isLoading } = useTaskLists();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="min-w-[280px] h-64 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
          />
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

        <ListFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2 md:overflow-y-auto md:h-full">
      {lists.map((list) => (
        <BoardColumn key={list.id} list={list} />
      ))}
    </div>
  );
}
