import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Columns3, Plus, Trash2, Pencil, Sun, Moon } from 'lucide-react';
import AppIcon from '../ui/AppIcon';
import { useTaskLists, useDeleteList } from '../../hooks/useTaskLists';
import { useUIStore } from '../../store/uiStore';
import ListFormModal from '../lists/ListFormModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { toast } from 'sonner';
import type { TaskList } from '../../types';

export default function Sidebar() {
  const { sidebarOpen, closeSidebar, darkMode, toggleDarkMode } = useUIStore();
  const { data: lists = [] } = useTaskLists();
  const deleteList = useDeleteList();
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [deletingList, setDeletingList] = useState<TaskList | null>(null);

  // Auto-close on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) closeSidebar();
  }, [location.pathname]);

  function openCreateModal() {
    setEditingList(null);
    setModalOpen(true);
  }

  function handleDelete(list: TaskList, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingList(list);
  }

  function confirmDelete() {
    if (!deletingList) return;
    deleteList.mutate(deletingList.id, {
      onSuccess: () => {
        toast.success('Lista eliminada');
        setDeletingList(null);
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

  return (
    <>
      {/* Backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0',
          'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
          'flex flex-col overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:inset-auto md:z-auto md:translate-x-0 md:transition-none',
          !sidebarOpen ? 'md:hidden' : '',
        ].join(' ')}
      >
        <div className="px-4 py-5 border-b border-gray-100 dark:border-gray-700/60 flex items-center gap-2.5">
          <AppIcon size={28} />
          <h1 className="text-xl font-extrabold tracking-tight text-teal-700 dark:text-teal-400">ToDoIt</h1>
        </div>

        <nav className="p-3 space-y-1">
          <NavLink
            to="/board"
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-[3px] border-teal-500 dark:border-teal-400 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 pl-[9px] pr-3'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-300 px-3'
              }`
            }
          >
            <Columns3 size={16} />
            Tablón de pendientes
          </NavLink>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'border-l-[3px] border-teal-500 dark:border-teal-400 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 pl-[9px] pr-3'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-300 px-3'
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
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors border border-teal-200 dark:border-teal-800/60"
              title="Nueva lista"
            >
              <Plus size={12} />
              Nueva
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-1 space-y-0.5">
          {lists.map((list) => {
            const pending = list.tasks?.length ?? 0;
            return (
              <NavLink
                key={list.id}
                to={`/lists/${list.id}`}
                className={({ isActive }) =>
                  `group flex items-center gap-2 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'border-l-[3px] border-teal-500 dark:border-teal-400 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 pl-[9px] pr-3'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-300 px-3'
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
                    className="p-0.5 rounded hover:text-teal-600 transition-colors"
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
              className="w-full flex items-center justify-center gap-2 py-4 text-sm text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700 mt-1"
            >
              <Plus size={16} />
              Crear primera lista
            </button>
          )}
        </div>
        {/* Dark mode toggle — mobile only */}
        <div className="md:hidden px-3 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
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

      <ConfirmDialog
        open={!!deletingList}
        title="Eliminar lista"
        message={`¿Eliminar la lista "${deletingList?.name}" y todas sus tareas? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingList(null)}
      />
    </>
  );
}
