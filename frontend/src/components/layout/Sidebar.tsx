import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Columns3, Plus, Trash2, Pencil } from 'lucide-react';
import { useTaskLists, useDeleteList } from '../../hooks/useTaskLists';
import { useUIStore } from '../../store/uiStore';
import ListFormModal from '../lists/ListFormModal';
import { toast } from 'sonner';
import type { TaskList } from '../../types';

export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const { data: lists = [] } = useTaskLists();
  const deleteList = useDeleteList();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);

  function openCreateModal() {
    setEditingList(null);
    setModalOpen(true);
  }

  function handleDelete(list: TaskList, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar la lista "${list.name}" y todas sus tareas?`)) return;
    deleteList.mutate(list.id, {
      onSuccess: () => {
        toast.success('Lista eliminada');
        navigate('/board');
      },
      onError: () => toast.error('Error al eliminar la lista'),
    });
  }

  function handleEdit(list: TaskList, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingList(list);
    setModalOpen(true);
  }

  if (!sidebarOpen) return null;

  return (
    <>
      <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">TodoApp</h1>
        </div>

        <nav className="p-3 space-y-1">
          <NavLink
            to="/board"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Columns3 size={16} />
            Tablón de pendientes
          </NavLink>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <LayoutDashboard size={16} />
            Estadísticas
          </NavLink>
        </nav>

        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Mis listas
            </span>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-800"
              title="Nueva lista"
            >
              <Plus size={12} />
              Nueva
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
          {lists.map((list) => {
            const pending = list.tasks?.length ?? 0;
            return (
              <NavLink
                key={list.id}
                to={`/lists/${list.id}`}
                className={({ isActive }) =>
                  `group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: list.color }}
                />
                <span className="flex-1 truncate">{list.name}</span>
                {pending > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:hidden">
                    {pending}
                  </span>
                )}
                <div className="hidden group-hover:flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleEdit(list, e)}
                    className="p-0.5 rounded hover:text-indigo-600 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(list, e)}
                    className="p-0.5 rounded hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </NavLink>
            );
          })}

          {lists.length === 0 && (
            <button
              type="button"
              onClick={openCreateModal}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700 mt-1"
            >
              <Plus size={16} />
              Crear primera lista
            </button>
          )}
        </div>
      </aside>

      <ListFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingList(null);
        }}
        editingList={editingList}
      />
    </>
  );
}
