import { Router } from 'express';
import { createIndicator, deleteIndicator, listIndicators, updateIndicator } from '../controllers/indicator.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const indicatorRouter = Router({ mergeParams: true });

indicatorRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(listIndicators)
);

indicatorRouter.post(
  '/',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(createIndicator)
);

indicatorRouter.patch(
  '/:indicatorId',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(updateIndicator)
);

indicatorRouter.delete(
  '/:indicatorId',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(deleteIndicator)
);
