import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./client.js";

/*
|--------------------------------------------------------------------------
| Project Monitoring
|--------------------------------------------------------------------------
*/

export function useProjectMonitoring(projectId) {
  return useQuery({
    queryKey: [
      "project-monitoring",
      projectId,
    ],

    enabled: Boolean(projectId),

    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/monitoring`
      );

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Create Monitoring Report
|--------------------------------------------------------------------------
*/

export function useCreateMonitoringReport(
  projectId
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        `/projects/${projectId}/monitoring`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-monitoring",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      queryClient.invalidateQueries({
        queryKey: ["executive-dashboard"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Update Monitoring Report
|--------------------------------------------------------------------------
*/

export function useUpdateMonitoringReport(
  projectId
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      payload,
    }) => {
      const { data } = await api.patch(
        `/projects/${projectId}/monitoring/${reportId}`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-monitoring",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      queryClient.invalidateQueries({
        queryKey: ["executive-dashboard"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Delete Monitoring Report
|--------------------------------------------------------------------------
*/

export function useDeleteMonitoringReport(
  projectId
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId) => {
      const { data } = await api.delete(
        `/projects/${projectId}/monitoring/${reportId}`
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-monitoring",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      queryClient.invalidateQueries({
        queryKey: ["executive-dashboard"],
      });
    },
  });
}