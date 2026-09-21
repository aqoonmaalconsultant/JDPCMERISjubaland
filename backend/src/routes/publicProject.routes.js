import {
  Router,
} from 'express';

import {
  getPublicProjects,
  getPublicProjectStatistics,
} from '../controllers/publicProject.controller.js';

import {
  asyncHandler,
} from '../middleware/asyncHandler.js';

export const publicProjectRouter =
  Router();

/*
|--------------------------------------------------------------------------
| Public JAIMS Projects
|--------------------------------------------------------------------------
|
| No authenticate middleware is used here.
|
| These endpoints return only the sanitized fields explicitly exposed
| by publicProject.controller.js.
|
*/

publicProjectRouter.get(
  '/projects',
  asyncHandler(
    getPublicProjects
  )
);

publicProjectRouter.get(
  '/projects/statistics',
  asyncHandler(
    getPublicProjectStatistics
  )
);