import { useParams, Navigate } from 'react-router-dom';
import { useTaskLists } from '../hooks/useTaskLists';
import TaskListView from '../components/tasks/TaskListView';
import ChecklistView from '../components/checklist/ChecklistView';

export default function ListPage() {
  const { id } = useParams<{ id: string }>();
  const { data: lists = [] } = useTaskLists();

  if (!id) return <Navigate to="/board" replace />;

  const list = lists.find((l) => l.id === id);
  if (lists.length > 0 && !list) return <Navigate to="/board" replace />;

  if (list?.type === 'CHECKLIST') return <ChecklistView listId={id} />;
  return <TaskListView listId={id} />;
}
