import { Router } from 'express';
import { exportAuditLogsCsv, listAuditLogs } from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const auditRouter = Router();

auditRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_AUDIT_LOGS),
  asyncHandler(listAuditLogs)
);

auditRouter.get(
  '/export.csv',
  authenticate,
  authorize(Permissions.VIEW_AUDIT_LOGS),
  asyncHandler(exportAuditLogsCsv)
);
