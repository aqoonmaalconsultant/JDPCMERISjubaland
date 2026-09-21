import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from './client.js';

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export function useFinalRegistrationStatistics() {
  return useQuery({
    queryKey: [
      'final-registration-statistics',
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          '/final-registration/statistics'
        );

      return data.data;
    },
  });
}

/*
|--------------------------------------------------------------------------
| Verified Projects
|--------------------------------------------------------------------------
*/

export function useVerifiedProjects() {
  return useQuery({
    queryKey: [
      'verified-projects',
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          '/final-registration'
        );

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Single Project
|--------------------------------------------------------------------------
*/

export function useFinalRegistrationProject(
  id
) {
  return useQuery({
    queryKey: [
      'final-registration-project',
      id,
    ],

    enabled: Boolean(id),

    queryFn: async () => {
      const { data } =
        await api.get(
          `/final-registration/${id}`
        );

      return data.data;
    },
  });
}

/*
|--------------------------------------------------------------------------
| Register Project
|--------------------------------------------------------------------------
*/

export function useRegisterProject() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } =
        await api.post(
          `/final-registration/${id}/register`
        );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'verified-projects',
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'final-registration-statistics',
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'submitted-projects',
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'verification-statistics',
        ],
      });
    },
  });
}