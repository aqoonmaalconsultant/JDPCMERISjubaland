import { Router } from 'express';
import { createEvaluation, deleteEvaluation, listEvaluations, updateEvaluation } from '../controllers/evaluation.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const evaluationRouter = Router({ mergeParams: true });

evaluationRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(listEvaluations)
);

evaluationRouter.post(
  '/',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(createEvaluation)
);

evaluationRouter.patch(
  '/:evaluationId',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(updateEvaluation)
);

evaluationRouter.delete(
  '/:evaluationId',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(deleteEvaluation)
);
