import { Roles } from '../security/roles.js';

/*
|--------------------------------------------------------------------------
| Internal Project Scope
|--------------------------------------------------------------------------
|
| JAIMS now has seven internal roles only:
|
| - IT Office
| - Super Admin
| - Admin Officer
| - Director General
| - Viewer
| - Finance Officer
| - Projects Manager
|
| These are Ministry-level internal users.
|
| Project modification rights are controlled separately through permissions.
| This function only determines which project records an authenticated
| internal user is allowed to retrieve.
|
|--------------------------------------------------------------------------
*/

const INTERNAL_PROJECT_ROLES = [
  Roles.IT_OFFICE,
  Roles.SUPER_ADMIN,
  Roles.ADMIN_OFFICER,
  Roles.DIRECTOR_GENERAL,
  Roles.VIEWER,
  Roles.FINANCE_OFFICER,
  Roles.PROJECTS_MANAGER,
];

export function buildProjectScope(user) {
  /*
  |--------------------------------------------------------------------------
  | Missing User
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return {
      _id: null,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Internal JAIMS Users
  |--------------------------------------------------------------------------
  |
  | All seven internal roles can view the project registry.
  |
  | IMPORTANT:
  | Returning {} means the role may retrieve all project records.
  | It does NOT give create, update, approve, publish or delete rights.
  | Those actions remain protected by permissions/routes/controllers.
  |
  | Therefore VIEWER remains read-only.
  |
  */

  if (
    INTERNAL_PROJECT_ROLES.includes(
      user.role
    )
  ) {
    return {};
  }

  /*
  |--------------------------------------------------------------------------
  | External / Unknown Accounts
  |--------------------------------------------------------------------------
  |
  | External portal accounts must not automatically gain access to the
  | internal JAIMS project registry through this middleware.
  |
  */

  return {
    _id: null,
  };
}