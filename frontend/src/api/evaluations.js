import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./client.js";

/*
|--------------------------------------------------------------------------
| Project Evaluations
|--------------------------------------------------------------------------
*/

export function useProjectEvaluations(projectId) {
  return useQuery({
    queryKey: [
      "project-evaluations",
      projectId,
    ],

    enabled: Boolean(projectId),

    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/evaluations`
      );

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Create Evaluation
|--------------------------------------------------------------------------
*/

export function useCreateEvaluation(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        `/projects/${projectId}/evaluations`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-evaluations",
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
| Update Evaluation
|--------------------------------------------------------------------------
*/

export function useUpdateEvaluation(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evaluationId,
      payload,
    }) => {
      const { data } = await api.patch(
        `/projects/${projectId}/evaluations/${evaluationId}`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-evaluations",
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
| Delete Evaluation
|--------------------------------------------------------------------------
*/

export function useDeleteEvaluation(projectId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evaluationId) => {
      const { data } = await api.delete(
        `/projects/${projectId}/evaluations/${evaluationId}`
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-evaluations",
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