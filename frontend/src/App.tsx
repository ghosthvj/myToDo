import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ListPage from './pages/ListPage';
import BoardPage from './pages/BoardPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/board" replace />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/lists/:id" element={<ListPage />} />
        <Route path="/stats" element={<DashboardPage />} />
      </Routes>
    </Layout>
  );
}
