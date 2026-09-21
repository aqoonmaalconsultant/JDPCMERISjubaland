import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import {
  createR2Client,
  getStorageConfig,
} from '../config/storage.js';

function safeFileName(fileName) {
  return String(
    fileName || 'file'
  ).replace(
    /[^a-zA-Z0-9._-]/g,
    '-'
  );
}

function currentDateFolder() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function buildProjectObjectKey(
  projectId,
  fileName
) {
  return [
    'projects',
    projectId,
    currentDateFolder(),
    `${randomUUID()}-${safeFileName(
      fileName
    )}`,
  ].join('/');
}

function buildOrganizationApplicationObjectKey(
  applicationNumber,
  documentType,
  fileName
) {
  const safeApplicationNumber =
    safeFileName(
      applicationNumber
    );

  const safeDocumentType =
    safeFileName(
      documentType
    );

  return [
    'organization-applications',
    safeApplicationNumber,
    safeDocumentType,
    currentDateFolder(),
    `${randomUUID()}-${safeFileName(
      fileName
    )}`,
  ].join('/');
}

function buildOrganizationPaymentReceiptObjectKey(
  applicationNumber,
  fileName
) {
  const safeApplicationNumber =
    safeFileName(
      applicationNumber
    );

  return [
    'organization-applications',
    safeApplicationNumber,
    'payment-receipts',
    currentDateFolder(),
    `${randomUUID()}-${safeFileName(
      fileName
    )}`,
  ].join('/');
}

/*
 * Generated NGO registration certificate key.
 *
 * Stored separately from application documents
 * and payment receipts.
 *
 * Example:
 *
 * organization-certificates/
 *   00001/
 *     2026-07-31/
 *       <uuid>-CERT-2026-000001.pdf
 */
function buildNGOCertificateObjectKey(
  registrationNumber,
  fileName
) {
  const safeRegistrationNumber =
    safeFileName(
      registrationNumber
    );

  return [
    'organization-certificates',
    safeRegistrationNumber,
    currentDateFolder(),
    `${randomUUID()}-${safeFileName(
      fileName
    )}`,
  ].join('/');
}

async function storeFile({
  key,
  file,
}) {
  const config =
    getStorageConfig();

  if (
    config.provider ===
    'cloudflare-r2'
  ) {
    if (
      !config.isCloudflareReady
    ) {
      throw new Error(
        'Cloudflare R2 storage is selected but credentials are incomplete'
      );
    }

    const r2 =
      createR2Client();

    await r2.send(
      new PutObjectCommand({
        Bucket:
          config.cloudflare
            .bucket,

        Key:
          key,

        Body:
          file.buffer,

        ContentType:
          file.mimetype,

        Metadata: {
          originalName:
            file.originalname,
        },
      })
    );

    return {
      storageType:
        'cloud',

      fileName:
        file.originalname,

      mimeType:
        file.mimetype,

      key,

      url:
        config.cloudflare
          .publicBaseUrl
          ? `${config.cloudflare.publicBaseUrl}/${key}`
          : key,
    };
  }

  const destination =
    path.join(
      process.cwd(),
      config.localUploadDir,
      key
    );

  await fs.mkdir(
    path.dirname(
      destination
    ),
    {
      recursive: true,
    }
  );

  await fs.writeFile(
    destination,
    file.buffer
  );

  return {
    storageType:
      'local',

    fileName:
      file.originalname,

    mimeType:
      file.mimetype,

    key,

    url:
      config.publicBaseUrl
        ? `${config.publicBaseUrl}/${key}`
        : destination,
  };
}

/*
 * Project document storage
 */
export async function storeProjectFile({
  projectId,
  file,
}) {
  const key =
    buildProjectObjectKey(
      projectId,
      file.originalname
    );

  return storeFile({
    key,
    file,
  });
}

/*
 * Organization registration supporting document storage
 */
export async function storeOrganizationApplicationFile({
  applicationNumber,
  documentType,
  file,
}) {
  if (
    !applicationNumber
  ) {
    throw new Error(
      'Application number is required for organization document storage'
    );
  }

  if (!documentType) {
    throw new Error(
      'Document type is required for organization document storage'
    );
  }

  if (!file) {
    throw new Error(
      'Organization document file is required'
    );
  }

  const key =
    buildOrganizationApplicationObjectKey(
      applicationNumber,
      documentType,
      file.originalname
    );

  return storeFile({
    key,
    file,
  });
}

/*
 * Registration fee payment receipt storage
 *
 * Stored separately from registration supporting
 * documents but under the same application root.
 */
export async function storeOrganizationPaymentReceipt({
  applicationNumber,
  file,
}) {
  if (
    !applicationNumber
  ) {
    throw new Error(
      'Application number is required for payment receipt storage'
    );
  }

  if (!file) {
    throw new Error(
      'Payment receipt file is required'
    );
  }

  const key =
    buildOrganizationPaymentReceiptObjectKey(
      applicationNumber,
      file.originalname
    );

  return storeFile({
    key,
    file,
  });
}

/*
 * Generated NGO registration certificate storage.
 *
 * The generated PDF is passed using the same
 * in-memory file structure already used by the
 * existing storage architecture:
 *
 * {
 *   originalname,
 *   mimetype,
 *   buffer
 * }
 */
export async function storeNGOCertificateFile({
  registrationNumber,
  file,
}) {
  if (
    !registrationNumber
  ) {
    throw new Error(
      'Registration number is required for NGO certificate storage'
    );
  }

  if (!file) {
    throw new Error(
      'NGO certificate file is required'
    );
  }

  if (
    !file.buffer
  ) {
    throw new Error(
      'NGO certificate file buffer is required'
    );
  }

  const key =
    buildNGOCertificateObjectKey(
      registrationNumber,
      file.originalname
    );

  return storeFile({
    key,
    file,
  });
}

/*
 * Generic stored-file deletion
 */
export async function deleteStoredProjectFile({
  storageType,
  storageKey,
}) {
  if (!storageKey) {
    return;
  }

  const config =
    getStorageConfig();

  if (
    storageType ===
    'cloud'
  ) {
    if (
      !config.isCloudflareReady
    ) {
      console.warn(
        'Cloud document delete skipped because Cloudflare R2 credentials are incomplete.'
      );

      return;
    }

    const r2 =
      createR2Client();

    await r2.send(
      new DeleteObjectCommand({
        Bucket:
          config.cloudflare
            .bucket,

        Key:
          storageKey,
      })
    );

    return;
  }

  const uploadRoot =
    path.resolve(
      process.cwd(),
      config.localUploadDir
    );

  const destination =
    path.resolve(
      uploadRoot,
      storageKey
    );

  if (
    !destination.startsWith(
      uploadRoot
    )
  ) {
    throw new Error(
      'Refusing to delete a file outside the configured upload directory'
    );
  }

  await fs.rm(
    destination,
    {
      force: true,
    }
  );
}

/*
 * Organization registration document deletion
 */
export async function deleteStoredOrganizationApplicationFile({
  storageType,
  storageKey,
}) {
  return deleteStoredProjectFile(
    {
      storageType,
      storageKey,
    }
  );
}

/*
 * Payment receipt deletion
 */
export async function deleteStoredOrganizationPaymentReceipt({
  storageType,
  storageKey,
}) {
  return deleteStoredProjectFile(
    {
      storageType,
      storageKey,
    }
  );
}

/*
 * Generated NGO certificate deletion
 */
export async function deleteStoredNGOCertificateFile({
  storageType,
  storageKey,
}) {
  return deleteStoredProjectFile(
    {
      storageType,
      storageKey,
    }
  );
}

/*
 * Generic stored-file reader
 */
export async function readStoredProjectFile({
  storageType,
  storageKey,
}) {
  if (!storageKey) {
    throw new Error(
      'Storage key is required'
    );
  }

  const config =
    getStorageConfig();

  if (
    storageType ===
    'cloud'
  ) {
    if (
      !config.isCloudflareReady
    ) {
      throw new Error(
        'Cloudflare R2 credentials are required to read this file'
      );
    }

    const r2 =
      createR2Client();

    const response =
      await r2.send(
        new GetObjectCommand({
          Bucket:
            config.cloudflare
              .bucket,

          Key:
            storageKey,
        })
      );

    const bytes =
      await response.Body
        .transformToByteArray();

    return Buffer.from(
      bytes
    );
  }

  const uploadRoot =
    path.resolve(
      process.cwd(),
      config.localUploadDir
    );

  const destination =
    path.resolve(
      uploadRoot,
      storageKey
    );

  if (
    !destination.startsWith(
      uploadRoot
    )
  ) {
    throw new Error(
      'Refusing to read a file outside the configured upload directory'
    );
  }

  return fs.readFile(
    destination
  );
}

/*
 * Organization supporting-document reader
 */
export async function readStoredOrganizationApplicationFile({
  storageType,
  storageKey,
}) {
  return readStoredProjectFile(
    {
      storageType,
      storageKey,
    }
  );
}

/*
 * Registration fee payment receipt reader
 */
export async function readStoredOrganizationPaymentReceipt({
  storageType,
  storageKey,
}) {
  return readStoredProjectFile(
    {
      storageType,
      storageKey,
    }
  );
}

/*
 * Generated NGO certificate reader
 */
export async function readStoredNGOCertificateFile({
  storageType,
  storageKey,
}) {
  return readStoredProjectFile(
    {
      storageType,
      storageKey,
    }
  );
}