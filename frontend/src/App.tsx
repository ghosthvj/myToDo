import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import ListPage from './pages/ListPage';
import BoardPage from './pages/BoardPage';
import DashboardPage from './pages/DashboardPage';
import { useUIStore } from './store/uiStore';

export default function App() {
  const { darkMode } = useUIStore();

  return (
    <>
      <Toaster
        position="bottom-right"
        richColors
        theme={darkMode ? 'dark' : 'light'}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/lists/:id" element={<ListPage />} />
          <Route path="/stats" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </>
  );
}
