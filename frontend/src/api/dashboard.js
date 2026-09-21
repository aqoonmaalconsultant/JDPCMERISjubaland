import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useExecutiveDashboard() {
  return useQuery({
    queryKey: ['executive-dashboard'],

    queryFn: async () => {
      const { data } = await api.get('/dashboard');

      return data.data;
    },

    staleTime: 1000 * 60 * 5,

    refetchOnWindowFocus: false,
  });
}