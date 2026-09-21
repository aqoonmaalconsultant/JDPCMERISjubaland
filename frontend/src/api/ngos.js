import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  api,
} from './client.js';

function normalizeCertificate(
  certificate
) {
  if (!certificate) {
    return null;
  }

  if (
    typeof certificate ===
    'string'
  ) {
    return {
      id:
        certificate,

      certificateNumber:
        'Not generated',

      registrationNumber:
        null,

      registrationType:
        null,

      status:
        'Unknown',

      issueDate:
        null,

      expiryDate:
        null,

      verificationCode:
        null,

      verificationPath:
        null,

      certificateFile:
        null,

      generated:
        false,

      source:
        certificate,
    };
  }

  return {
    id:
      certificate._id ||
      certificate.id ||
      null,

    certificateNumber:
      certificate.certificateNumber ||
      'Not generated',

    registrationNumber:
      certificate.registrationNumber ||
      null,

    registrationType:
      certificate.registrationType ||
      null,

    status:
      certificate.status ||
      'Unknown',

    issueDate:
      certificate.issueDate ||
      null,

    expiryDate:
      certificate.expiryDate ||
      null,

    verificationCode:
      certificate.verificationCode ||
      null,

    verificationPath:
      certificate.verificationPath ||
      null,

    certificateFile:
      certificate.certificateFile ||
      null,

    generated:
      Boolean(
        certificate.certificateFile
          ?.storageKey
      ),

    source:
      certificate,
  };
}

export function normalizeNGO(
  ngo = {}
) {
  return {
    id:
      ngo._id,

    rawId:
      ngo._id,

    registrationNumber:
      ngo.registrationNumber ||
      'Not assigned',

    organizationName:
      ngo.organizationName ||
      'Unnamed NGO',

    organizationType:
      ngo.organizationType ||
      'Not specified',

    establishmentDate:
      ngo.establishmentDate ||
      null,

    contact:
      ngo.contact || {},

    sectors:
      Array.isArray(
        ngo.sectors
      )
        ? ngo.sectors
        : [],

    activityAreas:
      Array.isArray(
        ngo.activityAreas
      )
        ? ngo.activityAreas
        : [],

    registrationStatus:
      ngo.registrationStatus ||
      'Pending',

    complianceStatus:
      ngo.complianceStatus ||
      'Not Reviewed',

    visibility:
      ngo.visibility ||
      'Private',

    currentCertificate:
      normalizeCertificate(
        ngo.currentCertificate
      ),

    latestApplication:
      ngo.latestApplication ||
      null,

    partner:
      ngo.partner ||
      null,

    remarks:
      ngo.remarks ||
      '',

    createdAt:
      ngo.createdAt ||
      null,

    updatedAt:
      ngo.updatedAt ||
      null,

    source:
      ngo,
  };
}

export async function fetchNGOs(
  filters = {}
) {
  const {
    data,
  } =
    await api.get(
      '/ngos',
      {
        params:
          filters,
      }
    );

  return {
    total:
      data.total ??
      data.data?.length ??
      0,

    items:
      Array.isArray(
        data.data
      )
        ? data.data.map(
            normalizeNGO
          )
        : [],
  };
}

export async function fetchNGO(
  ngoId
) {
  if (!ngoId) {
    throw new Error(
      'NGO ID is required.'
    );
  }

  const {
    data,
  } =
    await api.get(
      `/ngos/${ngoId}`
    );

  return normalizeNGO(
    data.data
  );
}

export async function generateNGOCertificate(
  ngoId
) {
  if (!ngoId) {
    throw new Error(
      'NGO ID is required to generate the certificate.'
    );
  }

  const {
    data,
  } =
    await api.post(
      `/ngos/${ngoId}/certificate/generate`
    );

  return data;
}

export async function regenerateNGOCertificate(
  ngoId
) {
  if (!ngoId) {
    throw new Error(
      'NGO ID is required to regenerate the certificate.'
    );
  }

  const {
    data,
  } =
    await api.post(
      `/ngos/${ngoId}/certificate/regenerate`
    );

  return data;
}

export async function viewNGOCertificate(
  ngoId
) {
  if (!ngoId) {
    throw new Error(
      'NGO ID is required to view the certificate.'
    );
  }

  const response =
    await api.get(
      `/ngos/${ngoId}/certificate`,
      {
        responseType:
          'blob',
      }
    );

  return response.data;
}

export async function downloadNGOCertificate(
  ngoId
) {
  if (!ngoId) {
    throw new Error(
      'NGO ID is required to download the certificate.'
    );
  }

  return api.get(
    `/ngos/${ngoId}/certificate/download`,
    {
      responseType:
        'blob',
    }
  );
}

export async function openNGOCertificate(
  ngoId
) {
  const viewerWindow =
    window.open(
      '',
      '_blank'
    );

  try {
    const blob =
      await viewNGOCertificate(
        ngoId
      );

    const objectUrl =
      URL.createObjectURL(
        blob
      );

    if (
      viewerWindow
    ) {
      viewerWindow.location.href =
        objectUrl;
    } else {
      window.open(
        objectUrl,
        '_blank',
        'noopener,noreferrer'
      );
    }

    window.setTimeout(
      () => {
        URL.revokeObjectURL(
          objectUrl
        );
      },
      60_000
    );

    return true;
  } catch (error) {
    if (
      viewerWindow
    ) {
      viewerWindow.close();
    }

    throw error;
  }
}

export async function saveNGOCertificateDownload(
  ngoId,
  fallbackFileName = 'ngo-certificate.pdf'
) {
  const response =
    await downloadNGOCertificate(
      ngoId
    );

  const contentDisposition =
    response.headers?.[
      'content-disposition'
    ] ||
    '';

  const fileNameMatch =
    contentDisposition.match(
      /filename="?([^";]+)"?/i
    );

  const fileName =
    fileNameMatch?.[1] ||
    fallbackFileName;

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
    fileName;

  document.body.appendChild(
    anchor
  );

  anchor.click();
  anchor.remove();

  window.setTimeout(
    () => {
      URL.revokeObjectURL(
        objectUrl
      );
    },
    1_000
  );

  return true;
}

export function useNGOs(
  filters = {}
) {
  return useQuery({
    queryKey: [
      'ngos',
      filters,
    ],

    queryFn:
      () =>
        fetchNGOs(
          filters
        ),
  });
}

export function useNGO(
  ngoId,
  options = {}
) {
  return useQuery({
    queryKey: [
      'ngos',
      ngoId,
    ],

    queryFn:
      () =>
        fetchNGO(
          ngoId
        ),

    enabled:
      Boolean(
        ngoId
      ) &&
      (
        options.enabled ??
        true
      ),

    ...options,
  });
}

function useCertificateMutation(
  mutationFn
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess:
      async (
        _data,
        ngoId
      ) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [
              'ngos',
            ],
          }),

          queryClient.invalidateQueries({
            queryKey: [
              'ngos',
              ngoId,
            ],
          }),
        ]);
      },
  });
}

export function useGenerateNGOCertificate() {
  return useCertificateMutation(
    generateNGOCertificate
  );
}

export function useRegenerateNGOCertificate() {
  return useCertificateMutation(
    regenerateNGOCertificate
  );
}