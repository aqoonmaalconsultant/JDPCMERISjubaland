import { Router } from 'express';

import {
  getProjectForVerification,
  listSubmittedProjects,
  returnProjectForRevision,
  verificationStatistics,
  verifyProject,
} from '../controllers/projectVerification.controller.js';

import { authenticate } from '../middleware/auth.js';

import { asyncHandler } from '../middleware/asyncHandler.js';

export const projectVerificationRouter =
  Router();

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

projectVerificationRouter.get(
  '/statistics',
  authenticate,
  asyncHandler(
    verificationStatistics
  )
);

/*
|--------------------------------------------------------------------------
| Submitted Projects
|--------------------------------------------------------------------------
*/

projectVerificationRouter.get(
  '/',
  authenticate,
  asyncHandler(
    listSubmittedProjects
  )
);

/*
|--------------------------------------------------------------------------
| Single Project
|--------------------------------------------------------------------------
*/

projectVerificationRouter.get(
  '/:id',
  authenticate,
  asyncHandler(
    getProjectForVerification
  )
);

/*
|--------------------------------------------------------------------------
| Verify Project
|--------------------------------------------------------------------------
*/

projectVerificationRouter.post(
  '/:id/verify',
  authenticate,
  asyncHandler(
    verifyProject
  )
);

/*
|--------------------------------------------------------------------------
| Return For Revision
|--------------------------------------------------------------------------
*/

projectVerificationRouter.post(
  '/:id/return',
  authenticate,
  asyncHandler(
    returnProjectForRevision
  )
);