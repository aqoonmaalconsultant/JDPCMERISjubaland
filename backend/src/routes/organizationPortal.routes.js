import { Router } from 'express';

import {
  authenticate,
} from '../middleware/auth.js';

import {
  listMyOrganizationApplications,
  listMyOrganizationNotifications,
  markOrganizationNotificationRead,
  verifyOrganizationForRenewal,
  submitOrganizationRenewal,
  viewMyOrganizationCertificate,
  downloadMyOrganizationCertificate,
} from '../controllers/organizationPortal.controller.js';

import {
  submitOrganizationApplication,
} from '../controllers/public.controller.js';

import {
  asyncHandler,
} from '../middleware/asyncHandler.js';

import multer from 'multer';

export const organizationPortalRouter =
  Router();

organizationPortalRouter.use(
  authenticate
);

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


organizationPortalRouter.get(
  '/applications',
  asyncHandler(
    listMyOrganizationApplications
  )
);

organizationPortalRouter.get(
  '/applications/:applicationId/certificate',
  asyncHandler(
    viewMyOrganizationCertificate
  )
);

organizationPortalRouter.get(
  '/applications/:applicationId/certificate/download',
  asyncHandler(
    downloadMyOrganizationCertificate
  )
);

organizationPortalRouter.get(
  '/notifications',
  asyncHandler(
    listMyOrganizationNotifications
  )
);

organizationPortalRouter.patch(
  '/notifications/:notificationId/read',
  asyncHandler(
    markOrganizationNotificationRead
  )
);
organizationPortalRouter.get(
  '/applications/:applicationId/certificate',
  asyncHandler(
    viewMyOrganizationCertificate
  )
);

organizationPortalRouter.get(
  '/applications/:applicationId/certificate/download',
  asyncHandler(
    downloadMyOrganizationCertificate
  )
);
organizationPortalRouter.get(
  '/notifications',
  asyncHandler(
    listMyOrganizationNotifications
  )
);

organizationPortalRouter.patch(
  '/notifications/:notificationId/read',
  asyncHandler(
    markOrganizationNotificationRead
  )
);

organizationPortalRouter.get(
  '/renewal/:jaimsNumber',
  asyncHandler(
    verifyOrganizationForRenewal
  )
);


organizationPortalRouter.post(
  '/applications',

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
 * Renewal Registration
 *
 * Previous Registration Certificate
 * is required by the renewal controller.
 *
 * Other documents may also be submitted
 * when information has been updated.
 */
organizationPortalRouter.post(
  '/renewals',

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
    submitOrganizationRenewal
  )
);