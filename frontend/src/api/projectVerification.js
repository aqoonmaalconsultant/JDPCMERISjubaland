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

export function useVerificationStatistics() {
  return useQuery({
    queryKey: [
      'verification-statistics',
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          '/project-verification/statistics'
        );

      return data.data;
    },
  });
}

/*
|--------------------------------------------------------------------------
| Submitted Projects
|--------------------------------------------------------------------------
*/

export function useSubmittedProjects() {
  return useQuery({
    queryKey: [
      'submitted-projects',
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          '/project-verification'
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

export function useVerificationProject(id) {
  return useQuery({
    queryKey: [
      'verification-project',
      id,
    ],

    enabled: Boolean(id),

    queryFn: async () => {
      const { data } =
        await api.get(
          `/project-verification/${id}`
        );

      return data.data;
    },
  });
}

/*
|--------------------------------------------------------------------------
| Verify Project
|--------------------------------------------------------------------------
*/

export function useVerifyProject() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } =
        await api.post(
          `/project-verification/${id}/verify`
        );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['submitted-projects'],
      });

      queryClient.invalidateQueries({
        queryKey: ['verification-statistics'],
      });
    },

    onError: (error) => {
      console.error(
        'VERIFY ERROR:',
        error.response?.data || error
      );
    },
  });
}
/*
|--------------------------------------------------------------------------
| Return For Revision
|--------------------------------------------------------------------------
*/

export function useReturnProject() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      revisionReason,
    }) => {
      const { data } =
        await api.post(
          `/project-verification/${id}/return`,
          {
            revisionReason,
          }
        );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['submitted-projects'],
      });

      queryClient.invalidateQueries({
        queryKey: ['verification-statistics'],
      });
    },

    onError: (error) => {
      console.error(
        'RETURN ERROR:',
        error.response?.data || error
      );
    },
  });
}