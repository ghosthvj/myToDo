import { create } from 'zustand';

type SortField = 'manualOrder' | 'dueDate' | 'priority' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleDarkMode: () => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
}

const savedDark = localStorage.getItem('darkMode') === 'true';
if (savedDark) document.documentElement.classList.add('dark');

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: window.innerWidth >= 768,
  darkMode: savedDark,
  sortField: 'manualOrder',
  sortOrder: 'asc',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      return { darkMode: next };
    }),
  setSortField: (sortField) => set({ sortField }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
}));
