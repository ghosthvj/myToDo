import { create } from 'zustand';

type SortField = 'manualOrder' | 'dueDate' | 'priority' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  sortField: SortField;
  sortOrder: SortOrder;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  sortField: 'manualOrder',
  sortOrder: 'asc',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return { darkMode: next };
    }),
  setSortField: (sortField) => set({ sortField }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
}));
