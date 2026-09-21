import {
  useQuery,
} from '@tanstack/react-query';

import { api } from './client.js';

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

export function useRegisteredProjectStatistics() {
  return useQuery({
    queryKey: [
      'registered-project-statistics',
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          '/registered-projects/statistics'
        );

      return data.data;
    },
  });
}

/*
|--------------------------------------------------------------------------
| Registered Projects
|--------------------------------------------------------------------------
*/

export function useRegisteredProjects() {
  return useQuery({
    queryKey: [
      'registered-projects',
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          '/registered-projects'
        );

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Single Registered Project
|--------------------------------------------------------------------------
*/

export function useRegisteredProject(id) {
  return useQuery({
    queryKey: [
      'registered-project',
      id,
    ],

    enabled: Boolean(id),

    queryFn: async () => {
      const { data } =
        await api.get(
          `/registered-projects/${id}`
        );

      return data.data;
    },
  });
}