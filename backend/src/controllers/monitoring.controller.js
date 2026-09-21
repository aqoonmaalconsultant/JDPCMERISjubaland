import { z } from 'zod';
import { buildProjectScope } from '../middleware/scope.js';
import { MonitoringReport } from '../models/MonitoringReport.js';
import { Project } from '../models/Project.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const monitoringSchema = z.object({
  physicalProgress: z.coerce.number().min(0).max(100),
  financialProgress: z.coerce.number().min(0).max(100),
  timelineProgress: z.coerce.number().min(0).max(100),
  trafficLight: z.enum(['Green', 'Yellow', 'Red']),
  risks: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  findings: z.string().optional()
});

const monitorableStatuses = ['Implementation', 'Monitoring'];

function assertMonitorableProject(project) {
  if (!monitorableStatuses.includes(project.status)) {
    throw new HttpError(409, 'Monitoring updates are only allowed for Implementation or Monitoring projects.');
  }
}

export async function listProjectMonitoring(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const data = await MonitoringReport.find({ project: project._id })
    .populate('submittedBy verifiedBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ data });
}

export async function createMonitoringReport(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const data = monitoringSchema.parse(req.body);
  const before = project.toObject();
  assertMonitorableProject(project);

  const report = await MonitoringReport.create({
    ...data,
    project: project._id,
    submittedBy: req.user._id
  });

  project.physicalProgress = data.physicalProgress;
  project.financialProgress = data.financialProgress;
  project.timelineProgress = data.timelineProgress;
  project.trafficLight = data.trafficLight;
  project.risks = data.risks || project.risks;
  project.challenges = data.challenges || project.challenges;
  project.recommendations = data.recommendations || project.recommendations;
  project.updatedBy = req.user._id;
  await project.save();

  await writeAudit(req, 'MONITORING_REPORT_SUBMITTED', 'MonitoringReport', report._id, null, report.toObject());
  await writeAudit(req, 'PROJECT_PROGRESS_UPDATED', 'Project', project._id, before, project.toObject());

  res.status(201).json({ data: report });
}

export async function updateMonitoringReport(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const report = await MonitoringReport.findOne({ _id: req.params.reportId, project: project._id });
  if (!report) {
    throw new HttpError(404, 'Monitoring report not found');
  }

  const data = monitoringSchema.partial().parse(req.body);
  const beforeReport = report.toObject();
  const beforeProject = project.toObject();
  assertMonitorableProject(project);

  Object.assign(report, data, { verifiedBy: req.user._id, verifiedAt: new Date() });
  await report.save();

  if (data.physicalProgress !== undefined) project.physicalProgress = data.physicalProgress;
  if (data.financialProgress !== undefined) project.financialProgress = data.financialProgress;
  if (data.timelineProgress !== undefined) project.timelineProgress = data.timelineProgress;
  if (data.trafficLight !== undefined) project.trafficLight = data.trafficLight;
  if (data.risks !== undefined) project.risks = data.risks;
  if (data.challenges !== undefined) project.challenges = data.challenges;
  if (data.recommendations !== undefined) project.recommendations = data.recommendations;
  project.updatedBy = req.user._id;
  await project.save();

  await writeAudit(req, 'MONITORING_REPORT_UPDATED', 'MonitoringReport', report._id, beforeReport, report.toObject());
  await writeAudit(req, 'PROJECT_PROGRESS_UPDATED', 'Project', project._id, beforeProject, project.toObject());

  res.json({ data: report });
}

export async function deleteMonitoringReport(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const report = await MonitoringReport.findOne({ _id: req.params.reportId, project: project._id });
  if (!report) {
    throw new HttpError(404, 'Monitoring report not found');
  }

  await report.deleteOne();
  await writeAudit(req, 'MONITORING_REPORT_DELETED', 'MonitoringReport', report._id, report.toObject(), null);

  res.status(204).send();
}
