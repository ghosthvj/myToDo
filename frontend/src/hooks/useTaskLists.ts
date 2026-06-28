import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '../api/lists';

export function useTaskLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: listsApi.getAll,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: listsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useUpdateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; color?: string; icon?: string }) =>
      listsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: listsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lists'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useReorderLists() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lists: { id: string; sortOrder: number }[]) =>
      Promise.all(lists.map(({ id, sortOrder }) => listsApi.update(id, { sortOrder }))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lists'] }),
  });
}
