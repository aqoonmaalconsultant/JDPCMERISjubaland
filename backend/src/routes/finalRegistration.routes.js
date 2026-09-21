import { Router } from 'express';

import {
  finalRegistrationStatistics,
  listVerifiedProjects,
  getProjectForRegistration,
  registerProject,
} from '../controllers/finalRegistration.controller.js';

import { authenticate } from '../middleware/auth.js';

import { asyncHandler } from '../middleware/asyncHandler.js';

export const finalRegistrationRouter =
  Router();

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

finalRegistrationRouter.get(
  '/statistics',
  authenticate,
  asyncHandler(
    finalRegistrationStatistics
  )
);

/*
|--------------------------------------------------------------------------
| Verified Projects
|--------------------------------------------------------------------------
*/

finalRegistrationRouter.get(
  '/',
  authenticate,
  asyncHandler(
    listVerifiedProjects
  )
);

/*
|--------------------------------------------------------------------------
| Single Project
|--------------------------------------------------------------------------
*/

finalRegistrationRouter.get(
  '/:id',
  authenticate,
  asyncHandler(
    getProjectForRegistration
  )
);

/*
|--------------------------------------------------------------------------
| Register Project
|--------------------------------------------------------------------------
*/

finalRegistrationRouter.post(
  '/:id/register',
  authenticate,
  asyncHandler(
    registerProject
  )
);