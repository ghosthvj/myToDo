import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, type CreateTaskData, type UpdateTaskData, type GetTasksParams } from '../api/tasks';

export function useTasks(listId: string, params?: GetTasksParams) {
  return useQuery({
    queryKey: ['tasks', listId, params],
    queryFn: () => tasksApi.getByList(listId, params),
    enabled: !!listId,
  });
}

export function useCreateTask(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(listId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', listId] });
      qc.invalidateQueries({ queryKey: ['lists'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateTaskData) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteTask(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', listId] });
      qc.invalidateQueries({ queryKey: ['lists'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.toggle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['lists'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useReorderTasks(listId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.reorder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', listId] }),
  });
}
