import { Router } from 'express';
import { deleteSetting, listPublicSettings, listSettings, upsertSetting } from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const settingsRouter = Router();

settingsRouter.get('/public', asyncHandler(listPublicSettings));
settingsRouter.get('/', authenticate, authorize(Permissions.MANAGE_SETTINGS), asyncHandler(listSettings));
settingsRouter.post('/', authenticate, authorize(Permissions.MANAGE_SETTINGS), asyncHandler(upsertSetting));
settingsRouter.delete('/:id', authenticate, authorize(Permissions.MANAGE_SETTINGS), asyncHandler(deleteSetting));
