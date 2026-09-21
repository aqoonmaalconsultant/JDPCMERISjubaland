import { Router } from 'express';
import { getGisHeatmap, getGisProjects } from '../controllers/gis.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const gisRouter = Router();

gisRouter.get('/projects.geojson', authenticate, authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS), asyncHandler(getGisProjects));
gisRouter.get('/heatmap', authenticate, authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS), asyncHandler(getGisHeatmap));
