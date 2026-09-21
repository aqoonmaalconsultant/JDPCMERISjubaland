import { Router } from 'express';
import { createFinancialTransaction, deleteFinancialTransaction, listFinancialTransactions, updateFinancialTransaction } from '../controllers/financial.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const financialRouter = Router({ mergeParams: true });

financialRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS, Permissions.GENERATE_REPORTS),
  asyncHandler(listFinancialTransactions)
);

financialRouter.post(
  '/',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(createFinancialTransaction)
);

financialRouter.patch(
  '/:transactionId',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(updateFinancialTransaction)
);

financialRouter.delete(
  '/:transactionId',
  authenticate,
  authorize(Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS),
  asyncHandler(deleteFinancialTransaction)
);
