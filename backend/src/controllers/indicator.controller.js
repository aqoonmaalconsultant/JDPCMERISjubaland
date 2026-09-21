import { z } from 'zod';
import { buildProjectScope } from '../middleware/scope.js';
import { Indicator } from '../models/Indicator.js';
import { Project } from '../models/Project.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const indicatorSchema = z.object({
  level: z.enum(['Goal', 'Outcome', 'Output', 'Activity', 'Indicator']).default('Indicator'),
  parent: z.string().optional(),
  code: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  unit: z.string().optional(),
  baseline: z.coerce.number().default(0),
  target: z.coerce.number().default(0),
  actual: z.coerce.number().default(0)
});

async function scopedProject(req) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  return project;
}

export async function listIndicators(req, res) {
  const project = await scopedProject(req);
  const data = await Indicator.find({ project: project._id })
    .populate('parent', 'code name level status achievementPercentage')
    .sort({ level: 1, code: 1 });

  res.json({ data });
}

export async function createIndicator(req, res) {
  const project = await scopedProject(req);
  const payload = indicatorSchema.parse(req.body);
  const indicator = await Indicator.create({ ...payload, project: project._id, updatedBy: req.user._id });

  await writeAudit(req, 'INDICATOR_CREATED', 'Indicator', indicator._id, null, indicator.toObject());
  res.status(201).json({ data: indicator });
}

export async function updateIndicator(req, res) {
  const project = await scopedProject(req);
  const indicator = await Indicator.findOne({ _id: req.params.indicatorId, project: project._id });

  if (!indicator) {
    throw new HttpError(404, 'Indicator not found');
  }

  const before = indicator.toObject();
  Object.assign(indicator, indicatorSchema.partial().parse(req.body), { updatedBy: req.user._id });
  await indicator.save();
  await writeAudit(req, 'INDICATOR_UPDATED', 'Indicator', indicator._id, before, indicator.toObject());

  res.json({ data: indicator });
}

export async function deleteIndicator(req, res) {
  const project = await scopedProject(req);
  const indicator = await Indicator.findOne({ _id: req.params.indicatorId, project: project._id });

  if (!indicator) {
    throw new HttpError(404, 'Indicator not found');
  }

  await indicator.deleteOne();
  await writeAudit(req, 'INDICATOR_DELETED', 'Indicator', indicator._id, indicator.toObject(), null);
  res.status(204).send();
}
