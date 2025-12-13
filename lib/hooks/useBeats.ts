import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import type { Beat } from '../types';

export interface BeatsParams {
  page?: number;
  limit?: number;
  genre?: string;
  mood?: string;
  bpmMin?: number;
  bpmMax?: number;
  musicalKey?: string;
  sort?: 'newest' | 'oldest' | 'bpm_asc' | 'bpm_desc' | 'price_asc' | 'price_desc';
  search?: string;
}

export interface BeatsResponse {
  beats: Beat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiBeatsResponse {
  data: Beat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useBeats(
  params: BeatsParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery<BeatsResponse>({
    queryKey: ['beats', params],
    queryFn: async () => {
      const response = await api.get<ApiBeatsResponse>('/api/beats', { params });
      // Transform API response to match expected format
      return {
        beats: response.data.data,
        pagination: response.data.pagination,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}
