import client from './client';
import type { Task, Priority, TaskStatus } from '../types';

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string | null;
  tags?: string[];
  status?: TaskStatus;
}

export interface GetTasksParams {
  sort?: 'manualOrder' | 'dueDate' | 'priority' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
  status?: TaskStatus;
}

export const tasksApi = {
  getByList: (listId: string, params?: GetTasksParams) =>
    client.get<Task[]>(`/api/lists/${listId}/tasks`, { params }).then((r) => r.data),
  create: (listId: string, data: CreateTaskData) =>
    client.post<Task>(`/api/lists/${listId}/tasks`, data).then((r) => r.data),
  update: (id: string, data: UpdateTaskData) =>
    client.patch<Task>(`/api/tasks/${id}`, data).then((r) => r.data),
  delete: (id: string) => client.delete(`/api/tasks/${id}`),
  toggle: (id: string) => client.patch<Task>(`/api/tasks/${id}/toggle`).then((r) => r.data),
  reorder: (tasks: { id: string; manualOrder: number }[]) =>
    client.post('/api/tasks/reorder', { tasks }).then((r) => r.data),
};
