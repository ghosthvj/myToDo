import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats';

export function useGlobalStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getGlobal,
  });
}
