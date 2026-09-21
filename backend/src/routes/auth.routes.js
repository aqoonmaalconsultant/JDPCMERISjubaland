import { Router } from 'express';
import { getCurrentUser, login, logout, refreshToken } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refreshToken));
authRouter.post('/logout', asyncHandler(logout));
authRouter.get('/me', authenticate, getCurrentUser);
