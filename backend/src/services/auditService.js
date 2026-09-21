import { AuditLog } from '../models/AuditLog.js';

export function writeAudit(req, action, entityType, entityId, previousValue, newValue) {
  return AuditLog.create({
    user: req.user?._id,
    action,
    entityType,
    entityId,
    previousValue,
    newValue,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });
}
