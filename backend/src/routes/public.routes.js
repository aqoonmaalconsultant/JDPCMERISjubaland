import { Router } from 'express';
import multer from 'multer';

import {
  exportPublicProjectsCsv,
  listPublicProjects,
  resubmitOrganizationRevision,
  submitOrganizationApplication,
  submitOrganizationPayment,
  trackOrganizationApplication,
  verifyOrganizationRevisionAccess,
  verifyPublicOrganizationRegistration,
} from '../controllers/public.controller.js';

import {
  asyncHandler,
} from '../middleware/asyncHandler.js';

export const publicRouter =
  Router();

/*
 * Organization application supporting documents.
 */
const allowedOrganizationDocumentMimeTypes =
  new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ]);

const organizationApplicationUpload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        20 *
        1024 *
        1024,

      files:
        5,
    },

    fileFilter: (
      _req,
      file,
      callback
    ) => {
      if (
        !allowedOrganizationDocumentMimeTypes.has(
          file.mimetype
        )
      ) {
        return callback(
          new Error(
            `Unsupported file type for ${file.fieldname}. Only PDF, DOC, DOCX, JPG and PNG files are allowed.`
          )
        );
      }

      return callback(
        null,
        true
      );
    },
  });

/*
 * Registration fee receipt.
 *
 * Receipt is submitted separately after the
 * Registration / Compliance Review is complete.
 */
const allowedPaymentReceiptMimeTypes =
  new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
  ]);

const organizationPaymentReceiptUpload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        10 *
        1024 *
        1024,

      files:
        1,
    },

    fileFilter: (
      _req,
      file,
      callback
    ) => {
      if (
        !allowedPaymentReceiptMimeTypes.has(
          file.mimetype
        )
      ) {
        return callback(
          new Error(
            'Unsupported payment receipt type. Only PDF, JPG and PNG files are allowed.'
          )
        );
      }

      return callback(
        null,
        true
      );
    },
  });

/*
 * =============================================
 * Public Projects
 * =============================================
 */

publicRouter.get(
  '/projects',

  asyncHandler(
    listPublicProjects
  )
);

publicRouter.get(
  '/projects/export.csv',

  asyncHandler(
    exportPublicProjectsCsv
  )
);

/*
 * =============================================
 * Public Organization Registration
 * =============================================
 *
 * Accepts organization data plus the required
 * registration supporting documents.
 */

publicRouter.post(
  '/organization-applications',

  organizationApplicationUpload.fields(
    [
      {
        name:
          'registrationCertificate',

        maxCount:
          1,
      },

      {
        name:
          'constitution',

        maxCount:
          1,
      },

      {
        name:
          'organizationProfile',

        maxCount:
          1,
      },

      {
        name:
          'leadershipList',

        maxCount:
          1,
      },

      {
        name:
          'otherSupportingDocument',

        maxCount:
          1,
      },
    ]
  ),

  asyncHandler(
    submitOrganizationApplication
  )
);

/*
 * =============================================
 * Verify Applicant Revision Access
 * =============================================
 */

publicRouter.post(
  '/organization-applications/:applicationNumber/revision-access',

  asyncHandler(
    verifyOrganizationRevisionAccess
  )
);

/*
 * =============================================
 * Resubmit Corrected Organization Application
 * =============================================
 */

publicRouter.post(
  '/organization-applications/:applicationNumber/resubmit',

  organizationApplicationUpload.fields(
    [
      {
        name:
          'registrationCertificate',

        maxCount:
          1,
      },

      {
        name:
          'constitution',

        maxCount:
          1,
      },

      {
        name:
          'organizationProfile',

        maxCount:
          1,
      },

      {
        name:
          'leadershipList',

        maxCount:
          1,
      },

      {
        name:
          'otherSupportingDocument',

        maxCount:
          1,
      },
    ]
  ),

  asyncHandler(
    resubmitOrganizationRevision
  )
);

/*
 * =============================================
 * Registration Fee Payment Submission
 * =============================================
 *
 * Awaiting Registration Fee
 *              ↓
 * Applicant submits:
 *   - paymentReference
 *   - paymentDate
 *   - receipt
 *              ↓
 * Payment Verification
 *
 * This does NOT verify the payment.
 * It only submits payment proof for Ministry review.
 */

publicRouter.post(
  '/organization-applications/:applicationNumber/payment',

  organizationPaymentReceiptUpload.single(
    'receipt'
  ),

  asyncHandler(
    submitOrganizationPayment
  )
);

/*
 * =============================================
 * Detailed Application Tracking
 * =============================================
 *
 * This existing endpoint remains available for
 * the Organizations Registration Portal.
 */

publicRouter.get(
  '/organization-applications/:applicationNumber',

  asyncHandler(
    trackOrganizationApplication
  )
);

/*
 * =============================================
 * Public Organization Certificate Verification
 * =============================================
 *
 * Public lookup only.
 *
 * Lookup:
 * - Certificate Number
 *
 * Returns:
 * - Organization Name
 * - Certificate Number
 * - Issue Date
 * - Expiry Date
 * - VALID / EXPIRED / SUSPENDED / REVOKED
 */

publicRouter.get(
  '/organization-registry/:certificateNumber',

  asyncHandler(
    verifyPublicOrganizationRegistration
  )
);