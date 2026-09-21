import { Router } from 'express';

import {
  getProjectApplicationForReview,
  listProjectApplicationsForReview,
  registerProjectApplication,
  returnProjectApplicationForRevision,
  submitProjectApplicationForFinalReview,
} from '../controllers/projectApplicationAdmin.controller.js';

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

export const projectApplicationAdminRouter =
  Router();

/*
 * INTERNAL MoPIIC PROJECT REGISTRATION
 *
 * Temporary permissions:
 *
 * View:
 * - VIEW_ALL_PROJECTS
 * - VIEW_ASSIGNED_PROJECTS
 *
 * Workflow:
 * - APPROVE_PROJECT
 *
 * Dedicated Project Registration
 * permissions will be introduced later.
 */

/*
 * List Project Registration Applications
 */
projectApplicationAdminRouter.get(
  '/',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    listProjectApplicationsForReview
  )
);

/*
 * Get one Project Registration Application
 */
projectApplicationAdminRouter.get(
  '/:id',
  authenticate,
  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS
  ),
  asyncHandler(
    getProjectApplicationForReview
  )
);

/*
 * Project Verification
 * → Returned for Revision
 */
projectApplicationAdminRouter.patch(
  '/:id/return-for-revision',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    returnProjectApplicationForRevision
  )
);

/*
 * Project Verification
 * → Final Review
 */
projectApplicationAdminRouter.patch(
  '/:id/submit-final-review',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    submitProjectApplicationForFinalReview
  )
);

/*
 * Final Review
 * → Registered
 *
 * Creates the normal JAIMS Project.
 */
projectApplicationAdminRouter.patch(
  '/:id/register',
  authenticate,
  authorize(
    Permissions.APPROVE_PROJECT
  ),
  asyncHandler(
    registerProjectApplication
  )
);