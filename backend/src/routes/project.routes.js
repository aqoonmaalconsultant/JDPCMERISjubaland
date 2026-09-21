import { Router } from 'express';

import {
  projectStatistics,
  listProjects,
  getProject,
  updateProject,
} from '../controllers/project.controller.js';

import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const projectRouter =
  Router();

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

projectRouter.get(
  '/statistics',
  authenticate,
  asyncHandler(
    projectStatistics
  )
);

/*
|--------------------------------------------------------------------------
| List Projects
|--------------------------------------------------------------------------
*/

projectRouter.get(
  '/',
  authenticate,
  asyncHandler(
    listProjects
  )
);

/*
|--------------------------------------------------------------------------
| Project Dashboard
|--------------------------------------------------------------------------
*/

projectRouter.get(
  '/:id',
  authenticate,
  asyncHandler(
    getProject
  )
);

/*
|--------------------------------------------------------------------------
| Update Project
|--------------------------------------------------------------------------
*/

projectRouter.patch(
  '/:id',
  authenticate,
  asyncHandler(
    updateProject
  )
);