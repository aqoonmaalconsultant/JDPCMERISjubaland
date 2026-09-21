import {
  Router,
} from 'express';

import {
  getInstitutionProfileForReview,
  listInstitutionProfiles,
  returnInstitutionProfileForUpdate,
  verifyInstitutionProfile,
} from '../controllers/institutionProfileAdmin.controller.js';

import {
  authenticate,
  authorize,
} from '../middleware/auth.js';

import {
  asyncHandler,
} from '../middleware/asyncHandler.js';

import {
  Permissions,
} from '../security/roles.js';

export const institutionProfileAdminRouter =
  Router();

/*
 * Internal institution list.
 */
institutionProfileAdminRouter.get(
  '/',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    listInstitutionProfiles
  )
);

/*
 * Internal institution details.
 */
institutionProfileAdminRouter.get(
  '/:id',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    getInstitutionProfileForReview
  )
);

/*
 * Return institution to portal user.
 */
institutionProfileAdminRouter.patch(
  '/:id/return-for-update',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    returnInstitutionProfileForUpdate
  )
);

/*
 * Verify institution.
 */
institutionProfileAdminRouter.patch(
  '/:id/verify',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    verifyInstitutionProfile
  )
);