import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  organizationApi,
} from './organizationClient.js';

/*
 * Institution Portal reference data.
 *
 * Uses organizationApi instead of the
 * internal staff API client.
 */
export function useInstitutionReferenceData(
  resource,
  options = {}
) {
  return useQuery({
    queryKey: [
      'institution-reference',
      resource,
    ],

    queryFn: async () => {
      const { data } =
        await organizationApi.get(
          `/reference/${resource}`
        );

      return data.data;
    },

    enabled:
      Boolean(resource) &&
      (options.enabled ??
        true),
  });
}

/*
 * List project applications belonging
 * to the logged-in institution.
 */
export function useInstitutionProjectApplications() {
  return useQuery({
    queryKey: [
      'institution-project-applications',
    ],

    queryFn: async () => {
      const { data } =
        await organizationApi.get(
          '/institution-portal/project-applications'
        );

      return data.data || [];
    },
  });
}

/*
 * Get one project application.
 */
export function useInstitutionProjectApplication(
  applicationId
) {
  return useQuery({
    queryKey: [
      'institution-project-application',
      applicationId,
    ],

    queryFn: async () => {
      const { data } =
        await organizationApi.get(
          `/institution-portal/project-applications/${applicationId}`
        );

      return data.data;
    },

    enabled:
      Boolean(applicationId),
  });
}

/*
 * Create a new Draft.
 */
export function useCreateInstitutionProjectDraft() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      payload
    ) => {
      const { data } =
        await organizationApi.post(
          '/institution-portal/project-applications',
          payload
        );

      return data.data;
    },

    onSuccess: async (
      application
    ) => {
      await queryClient.invalidateQueries(
        {
          queryKey: [
            'institution-project-applications',
          ],
        }
      );

      if (
        application?._id
      ) {
        queryClient.setQueryData(
          [
            'institution-project-application',
            application._id,
          ],
          application
        );
      }
    },
  });
}

/*
 * Save/update an existing Draft.
 */
export function useSaveInstitutionProjectDraft() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }) => {
      const { data } =
        await organizationApi.put(
          `/institution-portal/project-applications/${id}`,
          payload
        );

      return data.data;
    },

    onSuccess: async (
      application
    ) => {
      await queryClient.invalidateQueries(
        {
          queryKey: [
            'institution-project-applications',
          ],
        }
      );

      if (
        application?._id
      ) {
        queryClient.setQueryData(
          [
            'institution-project-application',
            application._id,
          ],
          application
        );
      }
    },
  });
}
export function useSubmitInstitutionProjectApplication() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      applicationId
    ) => {
      const { data } =
        await organizationApi.post(
          `/institution-portal/project-applications/${applicationId}/submit`
        );

      return data.data;
    },

    onSuccess: async (
      application
    ) => {
      await queryClient.invalidateQueries(
        {
          queryKey: [
            'institution-project-applications',
          ],
        }
      );

      if (
        application?._id
      ) {
        queryClient.setQueryData(
          [
            'institution-project-application',
            application._id,
          ],
          application
        );
      }
    },
  });
}