import {
  Router,
} from 'express';

import {
  createNGO,
  deleteNGO,
  downloadNGOCertificate,
  generateNGOCertificate,
  getNGO,
  getNGOCertificate,
  listNGOs,
  regenerateNGOCertificate,
  updateNGO,
} from '../controllers/ngo.controller.js';

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

export const ngoRouter =
  Router();

/*
 * List Registered Organizations
 */
ngoRouter.get(
  '/',

  authenticate,

  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS,
    Permissions.VIEW_PUBLIC_PROJECTS
  ),

  asyncHandler(
    listNGOs
  )
);

/*
 * Create NGO manually.
 */
ngoRouter.post(
  '/',

  authenticate,

  authorize(
    Permissions.CREATE_PROJECT
  ),

  asyncHandler(
    createNGO
  )
);

/*
 * Generate the current certificate PDF for the first time.
 */
ngoRouter.post(
  '/:id/certificate/generate',

  authenticate,

  authorize(
    Permissions.APPROVE_ORGANIZATION_REGISTRATION
  ),

  asyncHandler(
    generateNGOCertificate
  )
);

/*
 * Regenerate and replace the existing certificate PDF.
 *
 * The Certificate ID, License No., issue date and
 * expiry date remain unchanged.
 */
ngoRouter.post(
  '/:id/certificate/regenerate',

  authenticate,

  authorize(
    Permissions.APPROVE_ORGANIZATION_REGISTRATION
  ),

  asyncHandler(
    regenerateNGOCertificate
  )
);

/*
 * View the current certificate inline.
 */
ngoRouter.get(
  '/:id/certificate',

  authenticate,

  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS,
    Permissions.APPROVE_ORGANIZATION_REGISTRATION
  ),

  asyncHandler(
    getNGOCertificate
  )
);

/*
 * Download the current certificate.
 */
ngoRouter.get(
  '/:id/certificate/download',

  authenticate,

  authorize(
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_ASSIGNED_PROJECTS,
    Permissions.APPROVE_ORGANIZATION_REGISTRATION
  ),

  asyncHandler(
    downloadNGOCertificate
  )
);

/*
 * Get one Registered Organization.
 */
ngoRouter.get(
  '/:id',

  authenticate,

  asyncHandler(
    getNGO
  )
);

/*
 * Update NGO.
 */
ngoRouter.patch(
  '/:id',

  authenticate,

  authorize(
    Permissions.UPDATE_PROJECT,
    Permissions.APPROVE_PROJECT
  ),

  asyncHandler(
    updateNGO
  )
);

/*
 * Delete NGO.
 */
ngoRouter.delete(
  '/:id',

  authenticate,

  authorize(
    Permissions.UPDATE_PROJECT,
    Permissions.APPROVE_PROJECT
  ),

  asyncHandler(
    deleteNGO
  )
);