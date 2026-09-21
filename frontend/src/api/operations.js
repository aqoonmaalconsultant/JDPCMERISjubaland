import { useQuery } from '@tanstack/react-query';
import { api } from './client.js';

export function useOperationsDashboard() {
  return useQuery({
    queryKey: ['operations-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/operations');
      return data;
    }
  });
}
