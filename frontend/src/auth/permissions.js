export const Permissions = Object.freeze({
  /*
  |--------------------------------------------------------------------------
  | System Administration
  |--------------------------------------------------------------------------
  */

  MANAGE_USERS:
    'MANAGE_USERS',

  MANAGE_SETTINGS:
    'MANAGE_SETTINGS',

  MANAGE_MINISTRIES:
    'MANAGE_MINISTRIES',

  VIEW_AUDIT_LOGS:
    'VIEW_AUDIT_LOGS',

  /*
  |--------------------------------------------------------------------------
  | JAIMS Projects
  |--------------------------------------------------------------------------
  */

  CREATE_PROJECT:
    'CREATE_PROJECT',

  UPDATE_PROJECT:
    'UPDATE_PROJECT',

  APPROVE_PROJECT:
    'APPROVE_PROJECT',

  VERIFY_PROGRESS:
    'VERIFY_PROGRESS',

  VIEW_ALL_PROJECTS:
    'VIEW_ALL_PROJECTS',

  VIEW_ASSIGNED_PROJECTS:
    'VIEW_ASSIGNED_PROJECTS',

  VIEW_PUBLIC_PROJECTS:
    'VIEW_PUBLIC_PROJECTS',

  UPLOAD_DOCUMENTS:
    'UPLOAD_DOCUMENTS',

  GENERATE_REPORTS:
    'GENERATE_REPORTS',

  /*
  |--------------------------------------------------------------------------
  | Organization Registration
  |--------------------------------------------------------------------------
  */

  APPROVE_ORGANIZATION_REGISTRATION:
    'APPROVE_ORGANIZATION_REGISTRATION',

  MANAGE_OWN_ORGANIZATION_APPLICATION:
    'MANAGE_OWN_ORGANIZATION_APPLICATION',

  /*
  |--------------------------------------------------------------------------
  | Institution / Organization / Project Review
  |--------------------------------------------------------------------------
  */

  REVIEW_INSTITUTION:
    'REVIEW_INSTITUTION',

  REVIEW_ORGANIZATION_APPLICATION:
    'REVIEW_ORGANIZATION_APPLICATION',

  REVIEW_PROJECT_APPLICATION:
    'REVIEW_PROJECT_APPLICATION',

  /*
  |--------------------------------------------------------------------------
  | Finance
  |--------------------------------------------------------------------------
  */

  VIEW_FINANCIALS:
    'VIEW_FINANCIALS',

  MANAGE_FINANCIALS:
    'MANAGE_FINANCIALS',

  VERIFY_ORGANIZATION_PAYMENT:
    'VERIFY_ORGANIZATION_PAYMENT',

  /*
  |--------------------------------------------------------------------------
  | Project Locations / GIS
  |--------------------------------------------------------------------------
  */

  PROJECT_LOCATION_VIEW:
    'projectLocation.view',

  PROJECT_LOCATION_CREATE:
    'projectLocation.create',

  PROJECT_LOCATION_UPDATE:
    'projectLocation.update',

  PROJECT_LOCATION_DELETE:
    'projectLocation.delete',

  /*
  |--------------------------------------------------------------------------
  | Ministry Website Projects Portal
  |--------------------------------------------------------------------------
  */

  MINISTRY_PROJECT_VIEW:
    'ministryProject.view',

  MINISTRY_PROJECT_CREATE:
    'ministryProject.create',

  MINISTRY_PROJECT_UPDATE:
    'ministryProject.update',

  MINISTRY_PROJECT_PUBLISH:
    'ministryProject.publish',

  MINISTRY_PROJECT_ARCHIVE:
    'ministryProject.archive'
});

/*
|--------------------------------------------------------------------------
| Permission Helper
|--------------------------------------------------------------------------
|
| A user passes when they hold at least ONE of the supplied permissions.
|
*/

export function hasPermission(
  user,
  ...permissions
) {
  if (!permissions.length) {
    return true;
  }

  const userPermissions =
    new Set(
      user?.permissions || []
    );

  return permissions.some(
    (permission) =>
      userPermissions.has(
        permission
      )
  );
}