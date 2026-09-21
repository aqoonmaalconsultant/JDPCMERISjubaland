import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { organizationSignup } from '../controllers/organizationAuth.controller.js';


export const organizationAuthRouter = Router();


organizationAuthRouter.post(
  '/signup',
  asyncHandler(organizationSignup)
);