import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./client.js";

/*
|--------------------------------------------------------------------------
| Project Financials
|--------------------------------------------------------------------------
*/

export function useProjectFinancials(projectId) {
  return useQuery({
    queryKey: [
      "project-financials",
      projectId,
    ],

    enabled: Boolean(projectId),

    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/financials`
      );

      return data.data;
    },
  });
}

/*
|--------------------------------------------------------------------------
| Create Financial Transaction
|--------------------------------------------------------------------------
*/

export function useCreateFinancialTransaction(
  projectId
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        `/projects/${projectId}/financials`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-financials",
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
| Update Financial Transaction
|--------------------------------------------------------------------------
*/

export function useUpdateFinancialTransaction(
  projectId
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      payload,
    }) => {
      const { data } = await api.patch(
        `/projects/${projectId}/financials/${transactionId}`,
        payload
      );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-financials",
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
| Delete Financial Transaction
|--------------------------------------------------------------------------
*/

export function useDeleteFinancialTransaction(
  projectId
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const { data } = await api.delete(
        `/projects/${projectId}/financials/${transactionId}`
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-financials",
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