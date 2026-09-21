import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./client.js";

/*
|--------------------------------------------------------------------------
| Project Indicators
|--------------------------------------------------------------------------
*/

export function useProjectIndicators(projectId) {
  return useQuery({
    queryKey: [
      "project-indicators",
      projectId,
    ],

    enabled: Boolean(projectId),

    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/indicators`
      );

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Create Indicator
|--------------------------------------------------------------------------
*/

export function useCreateIndicator(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        `/projects/${projectId}/indicators`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-indicators",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Update Indicator
|--------------------------------------------------------------------------
*/

export function useUpdateIndicator(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      indicatorId,
      payload,
    }) => {
      const { data } = await api.patch(
        `/projects/${projectId}/indicators/${indicatorId}`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-indicators",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Delete Indicator
|--------------------------------------------------------------------------
*/

export function useDeleteIndicator(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (indicatorId) => {
      const { data } = await api.delete(
        `/projects/${projectId}/indicators/${indicatorId}`
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-indicators",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}