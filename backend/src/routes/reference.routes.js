import { Router } from 'express';
import { createReference, deleteReference, listReference, updateReference } from '../controllers/reference.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const referenceRouter = Router();

referenceRouter.get('/:resource', authenticate, asyncHandler(listReference));

referenceRouter.post(
  '/:resource',
  authenticate,
  authorize(Permissions.MANAGE_MINISTRIES, Permissions.MANAGE_SETTINGS),
  asyncHandler(createReference)
);

referenceRouter.patch(
  '/:resource/:id',
  authenticate,
  authorize(Permissions.MANAGE_MINISTRIES, Permissions.MANAGE_SETTINGS),
  asyncHandler(updateReference)
);

referenceRouter.delete(
  '/:resource/:id',
  authenticate,
  authorize(Permissions.MANAGE_MINISTRIES, Permissions.MANAGE_SETTINGS),
  asyncHandler(deleteReference)
);
