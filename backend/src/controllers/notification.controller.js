import { buildProjectScope } from '../middleware/scope.js';
import { FinancialTransaction } from '../models/FinancialTransaction.js';
import { MonitoringReport } from '../models/MonitoringReport.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

function severityRank(severity) {
  return { critical: 0, warning: 1, info: 2 }[severity] ?? 3;
}

export async function listNotifications(req, res) {
  const scope = buildProjectScope(req.user);
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const projects = await Project.find(scope)
    .select('projectName projectCode status budget endDate physicalProgress financialProgress timelineProgress trafficLight updatedAt')
    .sort({ updatedAt: -1 })
    .limit(300);
  const projectIds = projects.map((project) => project._id);

  const latestMonitoring = await MonitoringReport.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$project', latestAt: { $first: '$createdAt' } } }
  ]);
  const monitoringMap = new Map(latestMonitoring.map((item) => [item._id.toString(), item.latestAt]));
  const financialTotals = await FinancialTransaction.aggregate([
    { $match: { project: { $in: projectIds }, type: { $in: ['Budget', 'Expenditure'] } } },
    { $group: { _id: { project: '$project', type: '$type' }, amount: { $sum: '$amount' } } }
  ]);
  const financialMap = new Map();

  for (const total of financialTotals) {
    const projectKey = total._id.project.toString();
    const current = financialMap.get(projectKey) || { budgetAdjustments: 0, expenditures: 0 };
    if (total._id.type === 'Budget') current.budgetAdjustments = total.amount;
    if (total._id.type === 'Expenditure') current.expenditures = total.amount;
    financialMap.set(projectKey, current);
  }

  const notifications = [];

  for (const project of projects) {
    if (project.endDate < now && !['Completed', 'Cancelled'].includes(project.status)) {
      notifications.push({
        id: `${project._id}-overdue`,
        severity: 'critical',
        type: 'Delayed Project',
        message: `${project.projectCode} is past its end date and is still ${project.status}.`,
        projectId: project._id,
        projectName: project.projectName,
        createdAt: project.endDate
      });
    }

    if (project.trafficLight === 'Red' || project.trafficLight === 'Yellow') {
      notifications.push({
        id: `${project._id}-traffic-light`,
        severity: project.trafficLight === 'Red' ? 'critical' : 'warning',
        type: 'Monitoring Risk',
        message: `${project.projectCode} has ${project.trafficLight} monitoring status.`,
        projectId: project._id,
        projectName: project.projectName,
        createdAt: project.updatedAt
      });
    }

    if (project.physicalProgress - project.financialProgress >= 25) {
      notifications.push({
        id: `${project._id}-budget-gap`,
        severity: 'warning',
        type: 'Budget Issue',
        message: `${project.projectCode} physical progress is significantly ahead of financial progress.`,
        projectId: project._id,
        projectName: project.projectName,
        createdAt: project.updatedAt
      });
    }

    const finance = financialMap.get(project._id.toString()) || { budgetAdjustments: 0, expenditures: 0 };
    const availableBudget = (project.budget || 0) + (finance.budgetAdjustments || 0);
    const utilization = availableBudget > 0 ? Math.round((finance.expenditures / availableBudget) * 100) : 0;

    if (availableBudget > 0 && finance.expenditures > availableBudget) {
      notifications.push({
        id: `${project._id}-over-budget`,
        severity: 'critical',
        type: 'Over Budget',
        message: `${project.projectCode} has spent ${utilization}% of available budget.`,
        projectId: project._id,
        projectName: project.projectName,
        createdAt: project.updatedAt
      });
    } else if (utilization >= 90 && !['Completed', 'Cancelled'].includes(project.status)) {
      notifications.push({
        id: `${project._id}-high-utilization`,
        severity: 'warning',
        type: 'High Finance Utilization',
        message: `${project.projectCode} has used ${utilization}% of available budget.`,
        projectId: project._id,
        projectName: project.projectName,
        createdAt: project.updatedAt
      });
    }

    const latestReportAt = monitoringMap.get(project._id.toString());
    if (!latestReportAt || latestReportAt < thirtyDaysAgo) {
      notifications.push({
        id: `${project._id}-missing-report`,
        severity: 'info',
        type: 'Missing Report',
        message: `${project.projectCode} has no monitoring report in the last 30 days.`,
        projectId: project._id,
        projectName: project.projectName,
        createdAt: latestReportAt || project.updatedAt
      });
    }
  }

  notifications.sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || new Date(b.createdAt) - new Date(a.createdAt));
  const filteredNotifications = notifications.filter((item) => {
    const matchesSeverity = !req.query.severity || item.severity === req.query.severity;
    const matchesType = !req.query.type || item.type === req.query.type;
    const term = String(req.query.q || '').trim().toLowerCase();
    const matchesSearch = !term || [
      item.type,
      item.message,
      item.projectName
    ].some((value) => String(value || '').toLowerCase().includes(term));

    return matchesSeverity && matchesType && matchesSearch;
  });

  res.json({
    total: notifications.length,
    critical: notifications.filter((item) => item.severity === 'critical').length,
    warning: notifications.filter((item) => item.severity === 'warning').length,
    info: notifications.filter((item) => item.severity === 'info').length,
    filteredTotal: filteredNotifications.length,
    types: [...new Set(notifications.map((item) => item.type))].sort(),
    data: filteredNotifications.slice(0, Number(req.query.limit) || 50)
  });
}

export async function sendNotificationDigest(req, res) {
  const scope = buildProjectScope(req.user);
  const projects = await Project.find(scope)
    .select('projectName projectCode status budget endDate trafficLight financialProgress updatedAt')
    .sort({ updatedAt: -1 })
    .limit(50);
  const recipients = await User.find({ isActive: true, permissions: 'VIEW_ALL_PROJECTS' }).select('email name');
  const riskyProjects = projects.filter((project) => project.trafficLight !== 'Green' || project.financialProgress >= 90 || (project.endDate < new Date() && !['Completed', 'Cancelled'].includes(project.status)));

  if (!riskyProjects.length) {
    return res.json({ sent: 0, message: 'No alert digest needed' });
  }

  const subject = 'JDPCMERIS project alert digest';
  const text = riskyProjects.map((project) => `${project.projectCode}: ${project.projectName} (${project.status}, ${project.trafficLight})`).join('\n');
  const results = [];

  for (const recipient of recipients) {
    results.push(await sendEmail({ to: recipient.email, subject, text }));
  }

  return res.json({ sent: results.length, skipped: results.filter((result) => result?.skipped).length });
}
