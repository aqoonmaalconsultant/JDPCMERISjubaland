import { Router } from 'express';

import {
  getInstitutionProfile,
  saveInstitutionProfile,
  submitInstitutionProfile,
} from '../controllers/institutionPortal.controller.js';

import {
  createProjectApplicationDraft,
  getMyProjectApplication,
  listMyProjectApplications,
  saveProjectApplicationDraft,
  submitProjectApplication,
} from '../controllers/institutionProjectApplication.controller.js';

import {
  getMyRegisteredProject,
  listMyRegisteredProjects,
} from '../controllers/institutionProjectManagement.controller.js';

import {
  asyncHandler,
} from '../middleware/asyncHandler.js';

import {
  authenticate,
} from '../middleware/auth.js';

export const institutionPortalRouter =
  Router();

/*
 * Institution Profile
 */
institutionPortalRouter.get(
  '/profile',
  authenticate,
  asyncHandler(
    getInstitutionProfile
  )
);

institutionPortalRouter.put(
  '/profile',
  authenticate,
  asyncHandler(
    saveInstitutionProfile
  )
);

institutionPortalRouter.post(
  '/profile/submit',
  authenticate,
  asyncHandler(
    submitInstitutionProfile
  )
);

/*
 * Project Applications
 */

/*
 * List project applications belonging
 * to the logged-in institution.
 */
institutionPortalRouter.get(
  '/project-applications',
  authenticate,
  asyncHandler(
    listMyProjectApplications
  )
);

/*
 * Create a new project application Draft.
 */
institutionPortalRouter.post(
  '/project-applications',
  authenticate,
  asyncHandler(
    createProjectApplicationDraft
  )
);

/*
 * Get one project application.
 */
institutionPortalRouter.get(
  '/project-applications/:id',
  authenticate,
  asyncHandler(
    getMyProjectApplication
  )
);

/*
 * Save/update a Draft or an application
 * returned for revision.
 */
institutionPortalRouter.put(
  '/project-applications/:id',
  authenticate,
  asyncHandler(
    saveProjectApplicationDraft
  )
);

/*
 * Submit a completed project application
 * to MoPIIC for Project Verification.
 */
institutionPortalRouter.post(
  '/project-applications/:id/submit',
  authenticate,
  asyncHandler(
    submitProjectApplication
  )
);

/*
 * Registered Projects
 *
 * These are projects that have completed
 * Project Registration and now belong to
 * the organization's JAIMS workspace.
 */

/*
 * List registered projects belonging to
 * the logged-in organization.
 */
institutionPortalRouter.get(
  '/projects',
  authenticate,
  asyncHandler(
    listMyRegisteredProjects
  )
);

/*
 * Get one registered project belonging
 * to the logged-in organization.
 */
institutionPortalRouter.get(
  '/projects/:id',
  authenticate,
  asyncHandler(
    getMyRegisteredProject
  )
);