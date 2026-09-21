import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';

export function useNotifications(limit = 20, filters = {}, options = {}) {
  return useQuery({
    queryKey: ['notifications', limit, filters],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { limit, ...filters } });
      return data;
    },
    enabled: options.enabled ?? true,
    refetchInterval: 60000
  });
}

export function useSendNotificationDigest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/notifications/digest');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}
