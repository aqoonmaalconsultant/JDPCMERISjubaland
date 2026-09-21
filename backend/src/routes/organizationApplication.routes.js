import { Router } from 'express';

import {
  approveNGOApplicationByDirectorGeneral,
  completeDocumentVerification,
  completeRegistrationReview,
  getNGOApplication,
  getNGOApplicationDocument,
  getNGOApplicationPaymentReceipt,
  getOrganizationRegistrationDashboard,
  listNGOApplications,
  rejectNGOApplicationPayment,
  returnNGOApplicationForRevision,
  startNGOApplicationReview,
  verifyNGOApplicationPayment,
} from '../controllers/organizationApplication.controller.js';

import {
  authenticate,
  authorize,
} from '../middleware/auth.js';

import { asyncHandler } from '../middleware/asyncHandler.js';

import { Permissions } from '../security/roles.js';

export const organizationApplicationRouter =
  Router();


/*
 * Organization application listing.
 */
organizationApplicationRouter.get(
  '/',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    listNGOApplications
  )
);


/*
 * Organization Registration Dashboard statistics.
 *
 * IMPORTANT:
 * This route must stay above '/:id'
 * so Express does not treat "dashboard"
 * as an application ID.
 */
organizationApplicationRouter.get(
  '/dashboard',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    getOrganizationRegistrationDashboard
  )
);


/*
 * Private supporting-document access.
 */
organizationApplicationRouter.get(
  '/:id/documents/:documentType',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    getNGOApplicationDocument
  )
);


/*
 * Private registration-fee receipt access.
 */
organizationApplicationRouter.get(
  '/:id/payment-receipt',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    getNGOApplicationPaymentReceipt
  )
);


/*
 * Get one organization application.
 */
organizationApplicationRouter.get(
  '/:id',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    getNGOApplication
  )
);


/*
 * Start Ministry Review
 */
organizationApplicationRouter.patch(
  '/:id/start-review',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    startNGOApplicationReview
  )
);


/*
 * Complete Document Verification
 */
organizationApplicationRouter.patch(
  '/:id/complete-document-verification',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    completeDocumentVerification
  )
);


/*
 * Return application to applicant for revision
 */
organizationApplicationRouter.patch(
  '/:id/return-for-revision',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    returnNGOApplicationForRevision
  )
);


/*
 * Complete Registration / Compliance Review
 */
organizationApplicationRouter.patch(
  '/:id/complete-registration-review',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    completeRegistrationReview
  )
);


/*
 * Verify Registration Fee Payment
 */
organizationApplicationRouter.patch(
  '/:id/verify-payment',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    verifyNGOApplicationPayment
  )
);


/*
 * Reject Registration Fee Payment Proof
 */
organizationApplicationRouter.patch(
  '/:id/reject-payment',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    rejectNGOApplicationPayment
  )
);


/*
 * Director General Final Approval
 */
organizationApplicationRouter.patch(
  '/:id/director-general-approve',
  authenticate,
  authorize(
    Permissions.APPROVE_ORGANIZATION_REGISTRATION
  ),
  asyncHandler(
    approveNGOApplicationByDirectorGeneral
  )
);