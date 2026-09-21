import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { api } from './client.js';

function referenceName(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return (
    value.name ||
    value.organizationName ||
    ''
  );
}

function normalizeLocation(
  location = {}
) {
  return {
    region:
      referenceName(location.region),

    district:
      referenceName(
        location.district
      ),

    village:
      location.village || '',
  };
}

function normalizeRegistrationFee(
  registrationFee
) {
  if (!registrationFee) {
    return null;
  }

  return {
    amount:
      registrationFee.amount ??
      500,

    currency:
      registrationFee.currency ||
      'USD',

    revenueCode:
      registrationFee.revenueCode ||
      '',

    paymentRequired:
      registrationFee.paymentRequired ??
      true,

    paymentReference:
      registrationFee.paymentReference ||
      '',

    paymentDate:
      registrationFee.paymentDate ||
      null,

    paymentStatus:
      registrationFee.paymentStatus ||
      'Pending',

    exemptionReason:
      registrationFee.exemptionReason ||
      '',

    exemptedBy:
      registrationFee.exemptedBy ||
      null,

    exemptedAt:
      registrationFee.exemptedAt ||
      null,

    receiptFileName:
      registrationFee.receiptFileName ||
      '',

    receiptMimeType:
      registrationFee.receiptMimeType ||
      '',

    receiptStorageType:
      registrationFee.receiptStorageType ||
      '',

    receiptStorageKey:
      registrationFee.receiptStorageKey ||
      '',

    receiptUrl:
      registrationFee.receiptUrl ||
      '',

    receiptUploadedAt:
      registrationFee.receiptUploadedAt ||
      null,

    verifiedBy:
      registrationFee.verifiedBy ||
      null,

    verifiedAt:
      registrationFee.verifiedAt ||
      null,
  };
}

export function normalizeNGOApplication(
  application = {}
) {
  return {
    id:
      application._id,

    rawId:
      application._id,

    applicationNumber:
      application.applicationNumber ||
      'Not assigned',

    applicationType:
      application.applicationType ||
      'New Registration',

    organizationName:
      application.organizationName ||
      'Unnamed organization',

    organizationType:
      application.organizationType ||
      'Not specified',

    establishmentDate:
      application.establishmentDate ||
      null,

    registrationCountry:
      application.registrationCountry ||
      'Somalia',

    applicant: {
      fullName:
        application.applicant
          ?.fullName || '',

      email:
        application.applicant
          ?.email || '',

      phone:
        application.applicant
          ?.phone || '',

      address:
        application.applicant
          ?.address || '',

      passportNumber:
        application.applicant
          ?.passportNumber || '',
    },

    organizationContact: {
      email:
        application.organizationContact
          ?.email || '',

      phone:
        application.organizationContact
          ?.phone || '',

      address:
        application.organizationContact
          ?.address || '',

      website:
        application.organizationContact
          ?.website || '',
    },

    sectors:
      Array.isArray(
        application.sectors
      )
        ? application.sectors
        : [],

    activityAreas:
      Array.isArray(
        application.activityAreas
      )
        ? application.activityAreas
        : [],

    operationalLocations:
      Array.isArray(
        application.operationalLocations
      )
        ? application.operationalLocations.map(
            normalizeLocation
          )
        : [],

    supportingDocuments:
      Array.isArray(
        application.supportingDocuments
      )
        ? application.supportingDocuments.map(
            (document) => ({
              documentType:
                document.documentType ||
                '',

              label:
                document.label ||
                '',

              fileName:
                document.fileName ||
                '',

              mimeType:
                document.mimeType ||
                '',

              storageType:
                document.storageType ||
                '',

              storageKey:
                document.storageKey ||
                '',

              url:
                document.url ||
                '',

              uploadedAt:
                document.uploadedAt ||
                null,
            })
          )
        : [],

    registrationFee:
      normalizeRegistrationFee(
        application.registrationFee
      ),

    status:
      application.status ||
      'Draft',

    approvalStage:
      application.approvalStage ||
      'Draft',

    workflowHistory:
      Array.isArray(
        application.workflowHistory
      )
        ? application.workflowHistory
        : [],

    existingNGO:
      application.existingNGO ||
      null,

    previousRegistrationNumber:
      application.previousRegistrationNumber ||
      '',

    submittedAt:
      application.submittedAt ||
      null,

    reviewedAt:
      application.reviewedAt ||
      null,

    approvedAt:
      application.approvedAt ||
      null,

    rejectedAt:
      application.rejectedAt ||
      null,

    rejectionReason:
      application.rejectionReason ||
      '',

    createdAt:
      application.createdAt ||
      null,

    updatedAt:
      application.updatedAt ||
      null,

    source:
      application,
  };
}

export function useNGOApplications(
  filters = {}
) {
  return useQuery({
    queryKey: [
      'organization-applications',
      filters,
    ],

    queryFn: async () => {
      const params = {};

      if (filters.page) {
        params.page =
          filters.page;
      }

      if (filters.limit) {
        params.limit =
          filters.limit;
      }

      if (
        filters.search?.trim()
      ) {
        params.search =
          filters.search.trim();
      }

      if (
        filters.status &&
        filters.status !== 'all'
      ) {
        params.status =
          filters.status;
      }

      if (
        filters.approvalStage &&
        filters.approvalStage !==
          'all'
      ) {
        params.approvalStage =
          filters.approvalStage;
      }

      if (
        filters.applicationType &&
        filters.applicationType !==
          'all'
      ) {
        params.applicationType =
          filters.applicationType;
      }

      if (
        filters.organizationType &&
        filters.organizationType !==
          'all'
      ) {
        params.organizationType =
          filters.organizationType;
      }

      const { data } =
        await api.get(
          '/organization-applications',
          {
            params,
          }
        );

      return {
        total:
          data.total ??
          data.data?.length ??
          0,

        page:
          data.page ?? 1,

        pages:
          data.pages ?? 1,

        limit:
          data.limit ?? 20,

        items:
          Array.isArray(
            data.data
          )
            ? data.data.map(
                normalizeNGOApplication
              )
            : [],
      };
    },
  });
}


export function useOrganizationRegistrationDashboard() {
  return useQuery({
    queryKey: [
      'organization-registration-dashboard',
    ],

    queryFn: async () => {
      const { data } =
        await api.get(
          '/organization-applications/dashboard'
        );

      return (
        data.data || {
          applications: {},
          payments: {},
          registry: {},
          certificates: {},
          breakdowns: {},
        }
      );
    },
  });
}


export function useNGOApplication(
  applicationId,
  options = {}
) {
  return useQuery({
    queryKey: [
      'organization-application',
      applicationId,
    ],

    enabled:
      Boolean(
        applicationId
      ) &&
      options.enabled !== false,

    queryFn: async () => {
      const { data } =
        await api.get(
          `/organization-applications/${applicationId}`
        );

      return normalizeNGOApplication(
        data.data
      );
    },
  });
}

/*
 * Start Review
 *
 * Submitted / Submitted
 *          ↓
 * Under Review / Document Verification
 */
export function useStartNGOApplicationReview() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async (
        applicationId
      ) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/start-review`
          );

        return {
          message:
            data.message ||
            'Application review started successfully.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        applicationId
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            applicationId,
          ],
          result.application
        );

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              'organization-applications',
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              'ngos',
            ],
          }),
        ]);
      },
  });
}

/*
 * Complete Document Verification
 *
 * Under Review / Document Verification
 *                 ↓
 * Submit for Payment
 *   → Under Review / Awaiting Registration Fee
 *
 * OR
 *
 * Submit with Payment Exemption
 *   → Under Review / Director General Review
 */
export function useCompleteDocumentVerification() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async ({
        applicationId,
        paymentDecision,
        exemptionReason = '',
      }) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/complete-document-verification`,
            {
              paymentDecision,
              exemptionReason,
            }
          );

        return {
          message:
            data.message ||
            'Document verification completed successfully.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        variables
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            variables.applicationId,
          ],
          result.application
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              'organization-applications',
            ],
          }
        );
      },
  });
}

export function useReturnNGOApplicationForRevision() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async ({
        applicationId,
        reason,
      }) => {

        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/return-for-revision`,
            {
              reason,
            }
          );

        return {
          message:
            data.message ||
            'Application returned for revision successfully.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        variables
      ) => {

        queryClient.setQueryData(
          [
            'organization-application',
            variables.applicationId,
          ],
          result.application
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
                            'organization-applications',
            ],
          }
        );
      },
  });
}

/*
 * Load a protected organization supporting document.
 */
export async function getNGOApplicationDocument(
  applicationId,
  documentType
) {
  const response =
    await api.get(
      `/organization-applications/${applicationId}/documents/${documentType}`,
      {
        responseType: 'blob',
      }
    );

  return response.data;
}

export async function viewNGOApplicationDocument(
  applicationId,
  documentType
) {
  const blob =
    await getNGOApplicationDocument(
      applicationId,
      documentType
    );

  const objectUrl =
    URL.createObjectURL(blob);

  window.open(
    objectUrl,
    '_blank',
    'noopener,noreferrer'
  );

  window.setTimeout(
    () => {
      URL.revokeObjectURL(objectUrl);
    },
    60000
  );
}

export async function downloadNGOApplicationDocument(
  applicationId,
  documentType,
  fileName = 'supporting-document'
) {
  const response =
    await api.get(
      `/organization-applications/${applicationId}/documents/${documentType}`,
      {
        params: {
          download: 1,
        },

        responseType: 'blob',
      }
    );

  const objectUrl =
    URL.createObjectURL(
      response.data
    );

  const anchor =
    document.createElement('a');

  anchor.href =
    objectUrl;

  anchor.download =
    fileName ||
    'supporting-document';

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(objectUrl);
}

/*
 * Complete Registration / Compliance Review
 */
export function useCompleteRegistrationReview() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async (
        applicationId
      ) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/complete-registration-review`
          );

        return {
          message:
            data.message ||
            'Registration / Compliance Review completed successfully.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        applicationId
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            applicationId,
          ],
          result.application
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              'organization-applications',
            ],
          }
        );
      },
  });
}

/*
 * Verify Registration Fee Payment
 */
export function useVerifyOrganizationApplicationPayment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async (
        applicationId
      ) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/verify-payment`
          );

        return {
          message:
            data.message ||
            'Registration fee payment verified successfully.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        applicationId
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            applicationId,
          ],
          result.application
        );

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              'organization-applications',
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              'ngos',
            ],
          }),
        ]);
      },
  });
}

/*
 * Reject Registration Fee Payment Proof
 */
export function useRejectNGOApplicationPayment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async ({
        applicationId,
        reason,
      }) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/reject-payment`,
            {
              reason,
            }
          );

        return {
          message:
            data.message ||
            'Payment proof rejected successfully.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        variables
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            variables.applicationId,
          ],
          result.application
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              'organization-applications',
            ],
          }
        );
      },
  });
}

export async function getNGOApplicationPaymentReceipt(
  applicationId
) {
  const response =
    await api.get(
      `/organization-applications/${applicationId}/payment-receipt`,
      {
        responseType:
          'blob',
      }
    );

  return response.data;
}

export async function viewNGOApplicationPaymentReceipt(
  applicationId
) {
  const blob =
    await getNGOApplicationPaymentReceipt(
      applicationId
    );

  const objectUrl =
    URL.createObjectURL(
      blob
    );

  window.open(
    objectUrl,
    '_blank',
    'noopener,noreferrer'
  );

  window.setTimeout(
    () => {
      URL.revokeObjectURL(
        objectUrl
      );
    },
    60000
  );
}

export async function downloadNGOApplicationPaymentReceipt(
  applicationId,
  fileName =
    'payment-receipt'
) {
  const response =
    await api.get(
      `/organization-applications/${applicationId}/payment-receipt`,
      {
        params: {
          download: 1,
        },

        responseType:
          'blob',
      }
    );

  const objectUrl =
    URL.createObjectURL(
      response.data
    );

  const anchor =
    document.createElement(
      'a'
    );

  anchor.href =
    objectUrl;

  anchor.download =
    fileName ||
    'payment-receipt';

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(
    objectUrl
  );
}

/*
 * Director General Final Approval
 */
export function useApproveNGOApplicationByDirectorGeneral() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async (
        applicationId
      ) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/director-general-approve`
          );

        return {
          message:
            data.message ||
            'Organization registration approved successfully by the Director General.',

          organization:
            data.data?.organization ||
            data.data?.existingNGO ||
            null,

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        applicationId
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            applicationId,
          ],
          result.application
        );

        await queryClient.invalidateQueries(
          {
            queryKey: [
              'organization-applications',
            ],
          }
        );
      },
  });
}

export function useRejectNGOApplicationByDirectorGeneral() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async ({
        applicationId,
        reason,
      }) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/director-general-reject`,
            {
              reason,
            }
          );

        return {
          message:
            data.message ||
            'Organization registration rejected by the Director General.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        variables
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            variables.applicationId,
          ],
          result.application
        );

        await queryClient.invalidateQueries({
          queryKey: [
            'organization-applications',
          ],
        });
      },
  });
}

export function useVerifyNGOPayment() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async ({
        applicationId,
        paymentReference,
      }) => {
        const { data } =
          await api.patch(
            `/organization-applications/${applicationId}/verify-payment`,
            {
              paymentReference,
            }
          );

        return {
          message:
            data.message ||
            'Registration fee payment verified successfully.',

          application:
            normalizeNGOApplication(
              data.data
            ),
        };
      },

    onSuccess:
      async (
        result,
        variables
      ) => {
        queryClient.setQueryData(
          [
            'organization-application',
            variables.applicationId,
          ],
          result.application
        );

        await queryClient.invalidateQueries({
          queryKey: [
            'organization-applications',
          ],
        });
      },
  });
}

export function useDownloadNGOCertificate() {
  return {
    download:
      async (
        ngoId
      ) => {
        const response =
          await api.get(
            `/ngos/${ngoId}/certificate/download`,
            {
              responseType:
                'blob',
            }
          );

        const blob =
          new Blob(
            [
              response.data,
            ],
            {
              type:
                'application/pdf',
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            'a'
          );

        link.href =
          url;

        link.download =
          'NGO-Registration-Certificate.pdf';

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );
      },
  };
}

export function useGenerateNGOCertificate() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async (
        ngoId
      ) => {
        const { data } =
          await api.post(
            `/ngos/${ngoId}/certificate/generate`
          );

        return data;
      },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'ngo-applications',
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'ngos',
        ],
      });
    },
  });
}

export function useRegenerateNGOCertificate() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      async (
        ngoId
      ) => {
        const { data } =
          await api.post(
            `/ngos/${ngoId}/certificate/regenerate`
          );

        return data;
      },

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey: [
            'ngo-applications',
          ],
        });

        await queryClient.invalidateQueries({
          queryKey: [
            'ngos',
          ],
        });
      },
  });
}
