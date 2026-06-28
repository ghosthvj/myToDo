import { useUIStore } from '../../store/uiStore';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="h-screen overflow-hidden bg-[#fafaf8] dark:bg-[#111110] text-gray-900 dark:text-gray-100">
      <div className="max-w-[1200px] mx-auto h-full flex shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
