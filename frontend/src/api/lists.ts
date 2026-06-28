import client from './client';
import type { TaskList } from '../types';

export const listsApi = {
  getAll: () => client.get<TaskList[]>('/api/lists').then((r) => r.data),
  create: (data: { name: string; color: string; icon?: string; type?: string }) =>
    client.post<TaskList>('/api/lists', data).then((r) => r.data),
  update: (id: string, data: Partial<Pick<TaskList, 'name' | 'color' | 'icon' | 'sortOrder'>>) =>
    client.patch<TaskList>(`/api/lists/${id}`, data).then((r) => r.data),
  delete: (id: string) => client.delete(`/api/lists/${id}`),
};
