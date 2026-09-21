import { Router } from 'express';
import { listNotifications, sendNotificationDigest } from '../controllers/notification.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const notificationRouter = Router();

notificationRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(listNotifications)
);

notificationRouter.post(
  '/digest',
  authenticate,
  authorize(Permissions.GENERATE_REPORTS, Permissions.MANAGE_SETTINGS),
  asyncHandler(sendNotificationDigest)
);
