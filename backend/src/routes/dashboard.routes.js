import { Router } from 'express';

import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

import {
  executiveDashboard,
} from '../controllers/dashboard.controller.js';

export const dashboardRouter =
  Router();

dashboardRouter.get(
  '/',
  authenticate,
  asyncHandler(executiveDashboard)
);