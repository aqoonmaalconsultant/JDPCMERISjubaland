import { z } from 'zod';
import { buildProjectScope } from '../middleware/scope.js';
import { Evaluation } from '../models/Evaluation.js';
import { Project } from '../models/Project.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const evaluationSchema = z.object({
  evaluationType: z.enum(['Baseline Evaluation', 'Midterm Evaluation', 'Final Evaluation', 'Impact Evaluation']),
  evaluationDate: z.coerce.date(),
  evaluatorName: z.string().min(2),
  findings: z.string().optional(),
  lessonsLearned: z.string().optional(),
  recommendations: z.string().optional(),
  score: z.coerce.number().min(0).max(100).default(0)
});

async function scopedProject(req) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  return project;
}

export async function listEvaluations(req, res) {
  const project = await scopedProject(req);
  const data = await Evaluation.find({ project: project._id })
    .populate('submittedBy', 'name email role')
    .sort({ evaluationDate: -1 });

  res.json({ data });
}

export async function createEvaluation(req, res) {
  const project = await scopedProject(req);
  const payload = evaluationSchema.parse(req.body);

  const evaluation = await Evaluation.create({
    ...payload,
    project: project._id,
    submittedBy: req.user._id
  });

  await writeAudit(req, 'EVALUATION_CREATED', 'Evaluation', evaluation._id, null, evaluation.toObject());
  res.status(201).json({ data: evaluation });
}

export async function updateEvaluation(req, res) {
  const project = await scopedProject(req);
  const evaluation = await Evaluation.findOne({ _id: req.params.evaluationId, project: project._id });

  if (!evaluation) {
    throw new HttpError(404, 'Evaluation not found');
  }

  const before = evaluation.toObject();
  Object.assign(evaluation, evaluationSchema.partial().parse(req.body));
  await evaluation.save();
  await writeAudit(req, 'EVALUATION_UPDATED', 'Evaluation', evaluation._id, before, evaluation.toObject());

  res.json({ data: evaluation });
}

export async function deleteEvaluation(req, res) {
  const project = await scopedProject(req);
  const evaluation = await Evaluation.findOne({ _id: req.params.evaluationId, project: project._id });

  if (!evaluation) {
    throw new HttpError(404, 'Evaluation not found');
  }

  await evaluation.deleteOne();
  await writeAudit(req, 'EVALUATION_DELETED', 'Evaluation', evaluation._id, evaluation.toObject(), null);
  res.status(204).send();
}
