import { z } from 'zod';
import { buildProjectScope } from '../middleware/scope.js';
import { FinancialTransaction } from '../models/FinancialTransaction.js';
import { Project } from '../models/Project.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const financialSchema = z.object({
  type: z.enum(['Budget', 'Disbursement', 'Expenditure']),
  amount: z.coerce.number().min(0),
  currency: z.string().default('USD'),
  transactionDate: z.coerce.date(),
  fundingSource: z.string().optional(),
  description: z.string().optional()
});

const financeStatuses = ['Approved', 'Procurement', 'Implementation', 'Monitoring'];

async function scopedProject(req) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  return project;
}

function assertFinanceOpen(project) {
  if (!financeStatuses.includes(project.status)) {
    throw new HttpError(409, 'Financial transactions are only allowed for approved or active projects.');
  }
}

function assertTransactionInsideTimeline(project, transactionDate) {
  if (!transactionDate) return;
  const date = new Date(transactionDate);

  if (date < project.startDate || date > project.endDate) {
    throw new HttpError(422, 'Transaction date must be within the project start and end dates.');
  }
}

function summarize(project, rows) {
  const totals = rows.reduce(
    (summary, row) => {
      if (row.type === 'Budget') summary.budget += row.amount;
      if (row.type === 'Disbursement') summary.disbursements += row.amount;
      if (row.type === 'Expenditure') summary.expenditures += row.amount;
      return summary;
    },
    { budget: project.budget || 0, disbursements: 0, expenditures: 0 }
  );

  totals.remainingBalance = Math.max(totals.budget - totals.expenditures, 0);
  totals.overBudgetAmount = Math.max(totals.expenditures - totals.budget, 0);
  totals.utilizationPercentage = totals.budget > 0 ? Math.round((totals.expenditures / totals.budget) * 100) : 0;
  return totals;
}

function financialProgress(summary) {
  return Math.min(summary.utilizationPercentage || 0, 100);
}

export async function listFinancialTransactions(req, res) {
  const project = await scopedProject(req);
  const data = await FinancialTransaction.find({ project: project._id })
    .populate('recordedBy', 'name email role')
    .sort({ transactionDate: -1 });

  res.json({ data, summary: summarize(project, data) });
}

export async function createFinancialTransaction(req, res) {
  const project = await scopedProject(req);
  const payload = financialSchema.parse(req.body);
  assertFinanceOpen(project);
  assertTransactionInsideTimeline(project, payload.transactionDate);
  const transaction = await FinancialTransaction.create({ ...payload, project: project._id, recordedBy: req.user._id });
  const rows = await FinancialTransaction.find({ project: project._id });
  const summary = summarize(project, rows);
  const before = project.toObject();

  project.financialProgress = financialProgress(summary);
  project.updatedBy = req.user._id;
  await project.save();

  await writeAudit(req, 'FINANCIAL_TRANSACTION_CREATED', 'FinancialTransaction', transaction._id, null, transaction.toObject());
  await writeAudit(req, 'PROJECT_FINANCIAL_PROGRESS_UPDATED', 'Project', project._id, before, project.toObject());

  res.status(201).json({ data: transaction, summary });
}

export async function updateFinancialTransaction(req, res) {
  const project = await scopedProject(req);
  const transaction = await FinancialTransaction.findOne({ _id: req.params.transactionId, project: project._id });

  if (!transaction) {
    throw new HttpError(404, 'Financial transaction not found');
  }

  const beforeTransaction = transaction.toObject();
  const payload = financialSchema.partial().parse(req.body);
  assertFinanceOpen(project);
  assertTransactionInsideTimeline(project, payload.transactionDate || transaction.transactionDate);
  Object.assign(transaction, payload);
  await transaction.save();

  const rows = await FinancialTransaction.find({ project: project._id });
  const summary = summarize(project, rows);
  const beforeProject = project.toObject();

  project.financialProgress = financialProgress(summary);
  project.updatedBy = req.user._id;
  await project.save();

  await writeAudit(req, 'FINANCIAL_TRANSACTION_UPDATED', 'FinancialTransaction', transaction._id, beforeTransaction, transaction.toObject());
  await writeAudit(req, 'PROJECT_FINANCIAL_PROGRESS_UPDATED', 'Project', project._id, beforeProject, project.toObject());

  res.json({ data: transaction, summary });
}

export async function deleteFinancialTransaction(req, res) {
  const project = await scopedProject(req);
  assertFinanceOpen(project);
  const transaction = await FinancialTransaction.findOne({ _id: req.params.transactionId, project: project._id });

  if (!transaction) {
    throw new HttpError(404, 'Financial transaction not found');
  }

  await transaction.deleteOne();
  const rows = await FinancialTransaction.find({ project: project._id });
  const summary = summarize(project, rows);
  const before = project.toObject();

  project.financialProgress = financialProgress(summary);
  project.updatedBy = req.user._id;
  await project.save();

  await writeAudit(req, 'FINANCIAL_TRANSACTION_DELETED', 'FinancialTransaction', transaction._id, transaction.toObject(), null);
  await writeAudit(req, 'PROJECT_FINANCIAL_PROGRESS_UPDATED', 'Project', project._id, before, project.toObject());

  res.json({ summary });
}
