import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistItemsApi } from '../api/checklistItems';

export function useChecklistItems(listId: string) {
  return useQuery({
    queryKey: ['checklist', listId],
    queryFn: () => checklistItemsApi.getAll(listId),
    enabled: !!listId,
  });
}

export function useCreateChecklistItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => checklistItemsApi.create(listId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', listId] }),
  });
}

export function useUpdateChecklistItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, ...data }: { itemId: string; text?: string; done?: boolean }) =>
      checklistItemsApi.update(listId, itemId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', listId] }),
  });
}

export function useDeleteChecklistItem(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => checklistItemsApi.delete(listId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', listId] }),
  });
}
