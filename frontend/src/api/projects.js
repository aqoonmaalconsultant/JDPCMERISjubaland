import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./client.js";

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export function useProjectStatistics() {
  return useQuery({
    queryKey: ["projects-statistics"],

    queryFn: async () => {
      const { data } = await api.get(
        "/projects/statistics"
      );

      return data.data;
    },
  });
}

/*
|--------------------------------------------------------------------------
| Projects
|--------------------------------------------------------------------------
*/

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],

    queryFn: async () => {
      const { data } =
        await api.get("/projects");

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Single Project
|--------------------------------------------------------------------------
*/

export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],

    enabled: Boolean(id),

    queryFn: async () => {
      const { data } =
        await api.get(
          `/projects/${id}`
        );

      return data.data;
    },
  });
}
/*
|--------------------------------------------------------------------------
| Update Project
|--------------------------------------------------------------------------
*/

export function useUpdateProject() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }) => {
      const { data } =
        await api.patch(
          `/projects/${id}`,
          values
        );

      return data.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "project",
          variables.id,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "projects-statistics",
        ],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Reference Data
|--------------------------------------------------------------------------
*/

export function useReferenceData(type) {
  return useQuery({
    queryKey: [
      "reference",
      type,
    ],

    enabled: Boolean(type),

    queryFn: async () => {
      const { data } =
        await api.get(
          `/reference/${type}`
        );

      return data.data || [];
    },
  });
}