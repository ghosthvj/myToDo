import client from './client';
import type { ChecklistItem } from '../types';

export const checklistItemsApi = {
  getAll: (listId: string) =>
    client.get<ChecklistItem[]>(`/api/checklists/${listId}/items`).then((r) => r.data),
  create: (listId: string, text: string) =>
    client.post<ChecklistItem>(`/api/checklists/${listId}/items`, { text }).then((r) => r.data),
  update: (listId: string, itemId: string, data: Partial<Pick<ChecklistItem, 'text' | 'done'>>) =>
    client.patch<ChecklistItem>(`/api/checklists/${listId}/items/${itemId}`, data).then((r) => r.data),
  delete: (listId: string, itemId: string) =>
    client.delete(`/api/checklists/${listId}/items/${itemId}`),
};
