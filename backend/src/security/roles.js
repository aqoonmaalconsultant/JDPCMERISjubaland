export const Roles = Object.freeze({
  IT_OFFICE: 'IT_OFFICE',
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_OFFICER: 'ADMIN_OFFICER',
  DIRECTOR_GENERAL: 'DIRECTOR_GENERAL',
  VIEWER: 'VIEWER',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  PROJECTS_MANAGER: 'PROJECTS_MANAGER'
});

/*
|--------------------------------------------------------------------------
| Role Labels
|--------------------------------------------------------------------------
*/

export const roleLabels = Object.freeze({
  [Roles.IT_OFFICE]:
    'IT Officer',

  [Roles.SUPER_ADMIN]:
    'Super Admin',

  [Roles.ADMIN_OFFICER]:
    'Admin Officer',

  [Roles.DIRECTOR_GENERAL]:
    'Director General',

  [Roles.VIEWER]:
    'Viewer',

  [Roles.FINANCE_OFFICER]:
    'Finance Officer',

  [Roles.PROJECTS_MANAGER]:
    'Projects Manager'
});
/*
|--------------------------------------------------------------------------
| External Portal Roles
|--------------------------------------------------------------------------
|
| These are NOT internal JAIMS staff roles.
| They are used only for external portal accounts.
|
*/

export const PortalRoles = Object.freeze({
  ORGANIZATION_USER: 'ORGANIZATION_USER'
});
/*
|--------------------------------------------------------------------------
| Permissions
|--------------------------------------------------------------------------
*/

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
  | Institution / Organization Administration
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
  | Project Locations
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
| Role Permissions
|--------------------------------------------------------------------------
*/

export const rolePermissions = {
  /*
  |--------------------------------------------------------------------------
  | 1. IT Office
  |--------------------------------------------------------------------------
  |
  | Responsible for technical administration of JAIMS.
  | Can manage users/settings and inspect the whole system,
  | but does not perform institutional approval decisions.
  |
  */

  [Roles.IT_OFFICE]: [
    Permissions.MANAGE_USERS,
    Permissions.MANAGE_SETTINGS,
    Permissions.MANAGE_MINISTRIES,

    Permissions.VIEW_ALL_PROJECTS,
    Permissions.VIEW_AUDIT_LOGS,
    Permissions.VIEW_FINANCIALS,
    Permissions.GENERATE_REPORTS,

    Permissions.PROJECT_LOCATION_VIEW,

    Permissions.MINISTRY_PROJECT_VIEW
  ],

  /*
  |--------------------------------------------------------------------------
  | 2. Super Admin
  |--------------------------------------------------------------------------
  |
  | Full system access.
  |
  */

  [Roles.SUPER_ADMIN]:
    Object.values(Permissions),

  /*
  |--------------------------------------------------------------------------
  | 3. Admin Officer
  |--------------------------------------------------------------------------
  |
  | Administrative review role.
  |
  | Handles:
  | - Institution details
  | - Institution documents
  | - Organization registration documents
  | - Project registration documents
  | - Administrative verification/review
  |
  | Does NOT perform finance verification or final DG approval.
  |
  */

  [Roles.ADMIN_OFFICER]: [
    Permissions.VIEW_ALL_PROJECTS,

    Permissions.REVIEW_INSTITUTION,
    Permissions.REVIEW_ORGANIZATION_APPLICATION,
    Permissions.REVIEW_PROJECT_APPLICATION,

    Permissions.UPLOAD_DOCUMENTS,

    Permissions.PROJECT_LOCATION_VIEW,

    Permissions.MINISTRY_PROJECT_VIEW
  ],

  /*
  |--------------------------------------------------------------------------
  | 4. Director General
  |--------------------------------------------------------------------------
  |
  | Senior management / final approval role.
  |
  | Can see the entire operational picture.
  | Responsible for final Organization Registration approval.
  |
  */

  [Roles.DIRECTOR_GENERAL]: [
    Permissions.VIEW_ALL_PROJECTS,

    Permissions.APPROVE_ORGANIZATION_REGISTRATION,

    Permissions.VIEW_FINANCIALS,

    Permissions.GENERATE_REPORTS,

    Permissions.VIEW_AUDIT_LOGS,

    Permissions.PROJECT_LOCATION_VIEW,

    Permissions.MINISTRY_PROJECT_VIEW
  ],

  /*
  |--------------------------------------------------------------------------
  | 5. Viewer
  |--------------------------------------------------------------------------
  |
  | STRICT READ-ONLY ROLE.
  |
  | Can view system information but can NEVER:
  | - Create
  | - Edit
  | - Delete
  | - Approve
  | - Publish
  | - Archive
  | - Verify payments
  | - Change settings
  |
  */

  [Roles.VIEWER]: [
    Permissions.VIEW_ALL_PROJECTS,

    Permissions.VIEW_FINANCIALS,

    Permissions.VIEW_AUDIT_LOGS,

    Permissions.PROJECT_LOCATION_VIEW,

    Permissions.MINISTRY_PROJECT_VIEW
  ],

  /*
  |--------------------------------------------------------------------------
  | 6. Finance Officer
  |--------------------------------------------------------------------------
  |
  | Finance-specific responsibilities.
  |
  | Primarily responsible for:
  | - Registration payment review
  | - Payment verification
  | - Financial records
  |
  */

  [Roles.FINANCE_OFFICER]: [
    Permissions.VIEW_FINANCIALS,
    Permissions.MANAGE_FINANCIALS,

    Permissions.VERIFY_ORGANIZATION_PAYMENT,

    Permissions.VIEW_ALL_PROJECTS,

    Permissions.MINISTRY_PROJECT_VIEW
  ],

  /*
  |--------------------------------------------------------------------------
  | 7. Projects Manager
  |--------------------------------------------------------------------------
  |
  | Responsible for project registration and management,
  | including the Ministry Website Projects Portal.
  |
  */

  [Roles.PROJECTS_MANAGER]: [
    /*
     * JAIMS Project Management
     */
    Permissions.VIEW_ALL_PROJECTS,
    Permissions.CREATE_PROJECT,
    Permissions.UPDATE_PROJECT,
    Permissions.APPROVE_PROJECT,
    Permissions.REVIEW_PROJECT_APPLICATION,

    Permissions.UPLOAD_DOCUMENTS,
    Permissions.GENERATE_REPORTS,

    /*
     * Project Locations / GIS
     */
    Permissions.PROJECT_LOCATION_VIEW,
    Permissions.PROJECT_LOCATION_CREATE,
    Permissions.PROJECT_LOCATION_UPDATE,
    Permissions.PROJECT_LOCATION_DELETE,

    /*
     * Ministry Website Projects Portal
     */
    Permissions.MINISTRY_PROJECT_VIEW,
    Permissions.MINISTRY_PROJECT_CREATE,
    Permissions.MINISTRY_PROJECT_UPDATE,
    Permissions.MINISTRY_PROJECT_PUBLISH,
    Permissions.MINISTRY_PROJECT_ARCHIVE
  ]
};

/*
|--------------------------------------------------------------------------
| Role Scope Requirements
|--------------------------------------------------------------------------
|
| These seven internal roles operate at Ministry/system level.
| Therefore no district/donor/partner scopes are required.
|
|--------------------------------------------------------------------------
*/

export const roleScopeRequirements =
  Object.freeze({
    [Roles.IT_OFFICE]: [],

    [Roles.SUPER_ADMIN]: [],

    [Roles.ADMIN_OFFICER]: [],

    [Roles.DIRECTOR_GENERAL]: [],

    [Roles.VIEWER]: [],

    [Roles.FINANCE_OFFICER]: [],

    [Roles.PROJECTS_MANAGER]: []
  });

/*
|--------------------------------------------------------------------------
| Role Helpers
|--------------------------------------------------------------------------
*/

export function getRolePermissions(role) {
  return [
    ...(
      rolePermissions[role] ||
      []
    )
  ];
}

export function getRoleCatalog() {
  return Object.values(
    Roles
  ).map((role) => ({
    value: role,

    label:
      roleLabels[role] ||
      role,

    permissions:
      getRolePermissions(
        role
      ),

    requiredScopes:
      roleScopeRequirements[
        role
      ] || []
  }));
}