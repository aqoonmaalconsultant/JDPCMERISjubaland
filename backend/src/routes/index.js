import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { referenceRouter } from './reference.routes.js';
import { projectRouter } from './project.routes.js';
import { projectLocationRouter } from './projectLocation.routes.js';
import { publicRouter } from './public.routes.js';
import { projectVerificationRouter } from './projectVerification.routes.js';
import { registeredProjectsRouter } from './registeredProjects.routes.js';
import { institutionProfileAdminRouter } from './institutionProfileAdmin.routes.js';

import {
  projectApplicationAdminRouter,
} from './projectApplicationAdmin.routes.js';
import {
  ministryProjectRouter,
} from './ministryProject.routes.js';
import {
  documentRouter,
  documentSearchRouter,
} from './document.routes.js';

import {
  finalRegistrationRouter,
} from './finalRegistration.routes.js';

import { monitoringRouter } from './monitoring.routes.js';
import { evaluationRouter } from './evaluation.routes.js';
import { indicatorRouter } from './indicator.routes.js';
import { financialRouter } from './financial.routes.js';
import { auditRouter } from './audit.routes.js';
import { reportRouter } from './report.routes.js';
import { notificationRouter } from './notification.routes.js';
import { userRouter } from './user.routes.js';
import { settingsRouter } from './settings.routes.js';
import { gisRouter } from './gis.routes.js';
import { ngoRouter } from './ngo.routes.js';
import { organizationApplicationRouter } from './organizationApplication.routes.js';
import { organizationAuthRouter } from './organizationAuth.routes.js';
import { organizationPortalRouter } from './organizationPortal.routes.js';
import { institutionPortalRouter } from './institutionPortal.routes.js';
import {publicProjectRouter,} from './publicProject.routes.js';
export const apiRouter = Router();

/*
|--------------------------------------------------------------------------
| Temporary Test Router
|--------------------------------------------------------------------------
*/

const testRouter = Router();

apiRouter.use(
  '/project-locations',
  projectLocationRouter
);

apiRouter.use('/project-locations', testRouter);

/*
|--------------------------------------------------------------------------
| API Test
|--------------------------------------------------------------------------
*/

apiRouter.get('/test', (_req, res) => {
  res.json({
    success: true,
    message: 'API Router is working',
  });
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

apiRouter.use('/auth', authRouter);
apiRouter.use('/organization-auth', organizationAuthRouter);
apiRouter.use('/organization-portal', organizationPortalRouter);
apiRouter.use('/institution-profiles', institutionProfileAdminRouter);
apiRouter.use('/institution-portal', institutionPortalRouter);

/*
|--------------------------------------------------------------------------
| Internal Project Registration
|--------------------------------------------------------------------------
*/

apiRouter.use('/project-applications', projectApplicationAdminRouter);

/*
|--------------------------------------------------------------------------
| Administration
|--------------------------------------------------------------------------
*/

apiRouter.use('/audit-logs', auditRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/settings', settingsRouter);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/gis', gisRouter);
apiRouter.use('/reference', referenceRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/notifications', notificationRouter);

/*
|--------------------------------------------------------------------------
| Project Management
|--------------------------------------------------------------------------
*/

apiRouter.use('/project-verification', projectVerificationRouter);
apiRouter.use('/final-registration', finalRegistrationRouter);
apiRouter.use('/registered-projects', registeredProjectsRouter);
apiRouter.use('/projects', projectRouter);
/*
|--------------------------------------------------------------------------
| Ministry Website Projects Portal
|--------------------------------------------------------------------------
|
| Separate from the JAIMS project registration database.
|
*/

apiRouter.use(
  '/ministry-projects',
  ministryProjectRouter
);
/*
NOTE:
The real Project Location router is intentionally disabled
while we test the routing.

DO NOT register this yet.

apiRouter.use(
  '/project-locations',
  projectLocationRouter
);
*/

/*
|--------------------------------------------------------------------------
| Organization Registry
|--------------------------------------------------------------------------
*/

apiRouter.use('/ngos', ngoRouter);
apiRouter.use('/organization-applications', organizationApplicationRouter);

apiRouter.use('/documents', documentSearchRouter);

apiRouter.use('/projects/:projectId/documents', documentRouter);
apiRouter.use('/projects/:projectId/monitoring', monitoringRouter);
apiRouter.use('/projects/:projectId/evaluations', evaluationRouter);
apiRouter.use('/projects/:projectId/indicators', indicatorRouter);
apiRouter.use('/projects/:projectId/financials', financialRouter);
apiRouter.use('/public',publicProjectRouter);
apiRouter.use('/public', publicRouter);