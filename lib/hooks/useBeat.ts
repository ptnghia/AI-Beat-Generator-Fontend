import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { Beat } from '../types';

export function useBeat(id: string | undefined) {
  return useQuery<Beat>({
    queryKey: ['beat', id],
    queryFn: async () => {
      if (!id) throw new Error('Beat ID is required');
      const response = await api.get<Beat>(`/api/beats/${id}`);
      return response.data;
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
