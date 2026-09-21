import { Router } from 'express';

import {
  registeredProjectStatistics,
  listRegisteredProjects,
  getRegisteredProject,
} from '../controllers/registeredProjects.controller.js';

import { authenticate } from '../middleware/auth.js';

import { asyncHandler } from '../middleware/asyncHandler.js';

export const registeredProjectsRouter =
  Router();

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

registeredProjectsRouter.get(
  '/statistics',
  authenticate,
  asyncHandler(
    registeredProjectStatistics
  )
);

/*
|--------------------------------------------------------------------------
| Registered Projects
|--------------------------------------------------------------------------
*/

registeredProjectsRouter.get(
  '/',
  authenticate,
  asyncHandler(
    listRegisteredProjects
  )
);

/*
|--------------------------------------------------------------------------
| Single Registered Project
|--------------------------------------------------------------------------
*/

registeredProjectsRouter.get(
  '/:id',
  authenticate,
  asyncHandler(
    getRegisteredProject
  )
);