import { AuditLog } from '../models/AuditLog.js';

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildAuditFilter(query) {
  const limit = Math.min(Number(query.limit) || 100, 500);
  const filter = {};

  if (query.action) {
    filter.action = query.action;
  }

  if (query.entityType) {
    filter.entityType = query.entityType;
  }

  if (query.user) {
    filter.user = query.user;
  }

  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) {
      const toDate = new Date(query.to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  if (query.q) {
    filter.$or = [
      { action: new RegExp(query.q, 'i') },
      { entityType: new RegExp(query.q, 'i') },
      { ipAddress: new RegExp(query.q, 'i') }
    ];
  }

  return { filter, limit };
}

export async function listAuditLogs(req, res) {
  const { filter, limit } = buildAuditFilter(req.query);

  const data = await AuditLog.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ data });
}

export async function exportAuditLogsCsv(req, res) {
  const { filter, limit } = buildAuditFilter({ ...req.query, limit: req.query.limit || 500 });
  const data = await AuditLog.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit);

  const rows = [
    ['Time', 'User', 'Email', 'Role', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Previous Value', 'New Value'],
    ...data.map((log) => [
      log.createdAt?.toISOString(),
      log.user?.name || 'System',
      log.user?.email || '',
      log.user?.role || '',
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress,
      log.previousValue,
      log.newValue
    ])
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="jdpcmeris-audit-logs.csv"');
  res.send(rows.map((row) => row.map(escapeCsv).join(',')).join('\n'));
}
