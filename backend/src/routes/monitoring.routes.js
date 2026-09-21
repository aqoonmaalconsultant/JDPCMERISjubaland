import { Router } from 'express';
import { createMonitoringReport, deleteMonitoringReport, listProjectMonitoring, updateMonitoringReport } from '../controllers/monitoring.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const monitoringRouter = Router({ mergeParams: true });

monitoringRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(listProjectMonitoring)
);

monitoringRouter.post(
  '/',
  authenticate,
  authorize(Permissions.VERIFY_PROGRESS, Permissions.UPDATE_PROJECT),
  asyncHandler(createMonitoringReport)
);

monitoringRouter.patch(
  '/:reportId',
  authenticate,
  authorize(Permissions.VERIFY_PROGRESS, Permissions.UPDATE_PROJECT),
  asyncHandler(updateMonitoringReport)
);

monitoringRouter.delete(
  '/:reportId',
  authenticate,
  authorize(Permissions.VERIFY_PROGRESS, Permissions.UPDATE_PROJECT),
  asyncHandler(deleteMonitoringReport)
);
