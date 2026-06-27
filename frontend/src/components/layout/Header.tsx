import { useLocation, useParams } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useTaskLists } from '../../hooks/useTaskLists';
import SortControls from '../tasks/SortControls';

export default function Header() {
  const { toggleSidebar, toggleDarkMode, darkMode } = useUIStore();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { data: lists = [] } = useTaskLists();

  const isListView = location.pathname.startsWith('/lists/');
  const currentList = lists.find((l) => l.id === id);

  function getTitle() {
    if (location.pathname === '/board') return 'Tablón de pendientes';
    if (location.pathname === '/stats') return 'Estadísticas';
    if (currentList) return currentList.name;
    return 'TodoApp';
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          {currentList && (
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentList.color }}
            />
          )}
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">{getTitle()}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isListView && <SortControls />}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Cambiar tema"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
