import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "./client.js";

/*
|--------------------------------------------------------------------------
| Document Search
|--------------------------------------------------------------------------
*/

export function useDocumentSearch(filters = {}) {
  return useQuery({
    queryKey: ["documents", filters],

    queryFn: async () => {
      const { data } = await api.get(
        "/documents",
        {
          params: filters,
        }
      );

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Project Documents
|--------------------------------------------------------------------------
*/

export function useProjectDocuments(projectId) {
  return useQuery({
    queryKey: [
      "project-documents",
      projectId,
    ],

    enabled: Boolean(projectId),

    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/documents`
      );

      return data.data || [];
    },
  });
}

/*
|--------------------------------------------------------------------------
| Upload Project Document
|--------------------------------------------------------------------------
*/

export function useUploadProjectDocument(
  projectId
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      category,
      file,
    }) => {
      const formData =
        new FormData();

      formData.append("title", title);
      formData.append(
        "category",
        category
      );
      formData.append("file", file);

      const { data } =
        await api.post(
          `/projects/${projectId}/documents`,
          formData
        );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-documents",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Update Project Document
|--------------------------------------------------------------------------
*/

export function useUpdateProjectDocument(
  projectId
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      payload,
    }) => {
      const { data } =
        await api.patch(
          `/projects/${projectId}/documents/${documentId}`,
          payload
        );

      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-documents",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Delete Project Document
|--------------------------------------------------------------------------
*/

export function useDeleteProjectDocument(
  projectId
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      documentId
    ) => {
      const { data } =
        await api.delete(
          `/projects/${projectId}/documents/${documentId}`
        );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "project-documents",
          projectId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| Download / Open Project Document
|--------------------------------------------------------------------------
*/

export async function openProjectDocument(
  projectId,
  documentId,
  fileName = "document"
) {
  const { data } = await api.get(
    `/projects/${projectId}/documents/${documentId}/download`,
    {
      responseType: "blob",
    }
  );

  const url =
    URL.createObjectURL(data);

  const link =
    document.createElement("a");

  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.download = fileName;

  document.body.appendChild(link);

  link.click();
  link.remove();

  setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

/*
|--------------------------------------------------------------------------
| Export Document Search CSV
|--------------------------------------------------------------------------
*/

export async function downloadDocumentSearchCsv(
  filters = {}
) {
  const { data } = await api.get(
    "/documents/export.csv",
    {
      params: filters,
      responseType: "blob",
    }
  );

  const url =
    URL.createObjectURL(data);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    "jdpcmeris-document-search.csv";

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}