export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  tasks?: { id: string }[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  tags: string;
  manualOrder: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: number;
}

export interface GlobalStats extends ListStats {
  dueSoon: number;
  overdue: number;
  byList: {
    id: string;
    name: string;
    color: string;
    total: number;
    completed: number;
    pending: number;
  }[];
  byPriority: { priority: string; count: number }[];
  activity: { date: string; count: number }[];
}
