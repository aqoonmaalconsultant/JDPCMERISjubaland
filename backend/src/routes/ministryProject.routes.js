import { Router } from 'express';
import multer from 'multer';

import {
  ministryProjectStatistics,
  listMinistryProjects,
  getMinistryProject,
  createProject,
  updateProject,
  publishProject,
  unpublishProject,
  archiveProject,
  listPublicMinistryProjects,
  getPublicMinistryProject,
  uploadMinistryProjectImage,
} from '../controllers/ministryProject.controller.js';

import {
  authenticate,
  authorize,
} from '../middleware/auth.js';

export const ministryProjectRouter =
  Router();
const imageUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (
      !allowedTypes.includes(
        file.mimetype
      )
    ) {
      return callback(
        new Error(
          'Only JPG, PNG and WebP images are allowed.'
        )
      );
    }

    callback(null, true);
  },
});
/*
|--------------------------------------------------------------------------
| Public Website Routes
|--------------------------------------------------------------------------
|
| No authentication required.
| Only Published + Active projects are returned by the controller.
|
|--------------------------------------------------------------------------
*/

/*
| Public Project Dashboard / List
*/
ministryProjectRouter.post(
  '/:id/images',

  authenticate,

  authorize(
    'ministryProject.update'
  ),

  imageUpload.single(
    'image'
  ),

  uploadMinistryProjectImage
);
ministryProjectRouter.get(
  '/public',
  listPublicMinistryProjects
);

/*
| Public Project Details
|
| IMPORTANT:
| Keep this below /public and use /public/:slug
| so it does not conflict with internal /:id.
*/

ministryProjectRouter.get(
  '/public/:slug',
  getPublicMinistryProject
);

/*
|--------------------------------------------------------------------------
| Internal Projects Portal - Statistics
|--------------------------------------------------------------------------
|
| Viewer access:
| IT Office
| Super Admin
| Admin Officer
| Director General
| Viewer
| Finance Officer
| Projects Manager
|
| Access is ultimately determined by the permission assigned to each role.
|
|--------------------------------------------------------------------------
*/

ministryProjectRouter.get(
  '/statistics',
  authenticate,
  authorize(
    'ministryProject.view'
  ),
  ministryProjectStatistics
);

/*
|--------------------------------------------------------------------------
| Internal Projects Portal - Project List
|--------------------------------------------------------------------------
*/

ministryProjectRouter.get(
  '/',
  authenticate,
  authorize(
    'ministryProject.view'
  ),
  listMinistryProjects
);

/*
|--------------------------------------------------------------------------
| Internal Projects Portal - Project Details
|--------------------------------------------------------------------------
*/

ministryProjectRouter.get(
  '/:id',
  authenticate,
  authorize(
    'ministryProject.view'
  ),
  getMinistryProject
);

/*
|--------------------------------------------------------------------------
| Create Ministry Project
|--------------------------------------------------------------------------
|
| Projects Manager / Super Admin
|
|--------------------------------------------------------------------------
*/

ministryProjectRouter.post(
  '/',
  authenticate,
  authorize(
    'ministryProject.create'
  ),
  createProject
);

/*
|--------------------------------------------------------------------------
| Update Ministry Project
|--------------------------------------------------------------------------
|
| Projects Manager / Super Admin
|
|--------------------------------------------------------------------------
*/

ministryProjectRouter.patch(
  '/:id',
  authenticate,
  authorize(
    'ministryProject.update'
  ),
  updateProject
);

/*
|--------------------------------------------------------------------------
| Publish Ministry Project
|--------------------------------------------------------------------------
|
| Projects Manager / Super Admin
|
|--------------------------------------------------------------------------
*/

ministryProjectRouter.patch(
  '/:id/publish',
  authenticate,
  authorize(
    'ministryProject.publish'
  ),
  publishProject
);

/*
|--------------------------------------------------------------------------
| Unpublish / Return to Draft
|--------------------------------------------------------------------------
|
| Projects Manager / Super Admin
|
|--------------------------------------------------------------------------
*/

ministryProjectRouter.patch(
  '/:id/unpublish',
  authenticate,
  authorize(
    'ministryProject.publish'
  ),
  unpublishProject
);

/*
|--------------------------------------------------------------------------
| Archive Ministry Project
|--------------------------------------------------------------------------
|
| Projects Manager / Super Admin
|
| We use archive instead of destructive database deletion.
|
|--------------------------------------------------------------------------
*/

ministryProjectRouter.patch(
  '/:id/archive',
  authenticate,
  authorize(
    'ministryProject.archive'
  ),
  archiveProject
);