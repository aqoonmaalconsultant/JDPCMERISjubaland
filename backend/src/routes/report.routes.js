import {
  Router,
} from 'express';

import {
  exportProjectsCsv,
  exportProjectsPdf,
  exportProjectsXlsx,
  exportReportSummaryCsv,
  getReportSummary,
} from '../controllers/report.controller.js';

import {
  authenticate,
  authorize,
} from '../middleware/auth.js';

import {
  asyncHandler,
} from '../middleware/asyncHandler.js';

import {
  Permissions,
} from '../security/roles.js';

export const reportRouter =
  Router();

/*
|--------------------------------------------------------------------------
| Report Access
|--------------------------------------------------------------------------
|
| Current JAIMS reporting is based on officially registered projects.
|
| GENERATE_REPORTS:
|   Allows dedicated reporting roles.
|
| VIEW_ALL_PROJECTS:
|   Allows read-only/project-wide roles to access portfolio reporting.
|
| Sensitive financial information is NOT controlled here.
| The report controller separately checks VIEW_FINANCIALS before returning
| budget information.
|
*/

/*
|--------------------------------------------------------------------------
| Portfolio Summary
|--------------------------------------------------------------------------
*/

reportRouter.get(
  '/summary',

  authenticate,

  authorize(
    Permissions.GENERATE_REPORTS,
    Permissions.VIEW_ALL_PROJECTS
  ),

  asyncHandler(
    getReportSummary
  )
);

/*
|--------------------------------------------------------------------------
| Portfolio Summary CSV
|--------------------------------------------------------------------------
*/

reportRouter.get(
  '/summary.csv',

  authenticate,

  authorize(
    Permissions.GENERATE_REPORTS,
    Permissions.VIEW_ALL_PROJECTS
  ),

  asyncHandler(
    exportReportSummaryCsv
  )
);

/*
|--------------------------------------------------------------------------
| Registered Projects CSV
|--------------------------------------------------------------------------
*/

reportRouter.get(
  '/projects.csv',

  authenticate,

  authorize(
    Permissions.GENERATE_REPORTS,
    Permissions.VIEW_ALL_PROJECTS
  ),

  asyncHandler(
    exportProjectsCsv
  )
);

/*
|--------------------------------------------------------------------------
| Registered Projects Excel
|--------------------------------------------------------------------------
*/

reportRouter.get(
  '/projects.xlsx',

  authenticate,

  authorize(
    Permissions.GENERATE_REPORTS,
    Permissions.VIEW_ALL_PROJECTS
  ),

  asyncHandler(
    exportProjectsXlsx
  )
);

/*
|--------------------------------------------------------------------------
| Registered Projects PDF
|--------------------------------------------------------------------------
*/

reportRouter.get(
  '/projects.pdf',

  authenticate,

  authorize(
    Permissions.GENERATE_REPORTS,
    Permissions.VIEW_ALL_PROJECTS
  ),

  asyncHandler(
    exportProjectsPdf
  )
);