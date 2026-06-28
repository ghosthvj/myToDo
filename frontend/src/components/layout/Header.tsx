import { useLocation, useParams } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useTaskLists } from '../../hooks/useTaskLists';
import SortControls from '../tasks/SortControls';

export default function Header() {
  const { toggleSidebar, toggleDarkMode, darkMode, sidebarOpen } = useUIStore();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { data: lists = [] } = useTaskLists();

  const isListView = location.pathname.startsWith('/lists/');
  const currentList = lists.find((l) => l.id === id);

  function getTitle() {
    if (location.pathname.startsWith('/board')) return 'Pendientes';
    if (location.pathname === '/stats') return 'Estadísticas';
    if (isListView) return currentList?.name ?? '';
    return 'ToDoIt';
  }

  return (
    <header className="h-14 flex items-center gap-2 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
        {currentList && (
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: currentList.color }} />
        )}
        {/* Show brand name with icon only when sidebar is hidden */}
        {!sidebarOpen && !isListView && location.pathname !== '/board' && location.pathname !== '/stats' && (
          <span className="font-bold text-indigo-600 dark:text-indigo-400">ToDoIt</span>
        )}
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{getTitle()}</h2>
      </div>

      {isListView && (
        <div className="flex-1 flex justify-end">
          <SortControls />
        </div>
      )}

      {!isListView && <div className="flex-1" />}

      <button
        onClick={toggleDarkMode}
        className="hidden md:flex p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        title="Cambiar tema"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
