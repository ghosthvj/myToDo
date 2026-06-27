import client from './client';
import type { GlobalStats, ListStats } from '../types';

export const statsApi = {
  getGlobal: () => client.get<GlobalStats>('/api/stats').then((r) => r.data),
  getByList: (listId: string) =>
    client.get<ListStats>(`/api/stats/lists/${listId}`).then((r) => r.data),
};
