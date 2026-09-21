import {
  useState,
} from 'react';

import {
  Edit3,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

import {
  useCreateUser,
  useDeleteUser,
  useRbacCatalog,
  useUpdateUser,
  useUsers,
} from '../api/admin.js';

import {
  useAuth,
} from '../auth/AuthContext.jsx';

import {
  hasPermission,
  Permissions,
} from '../auth/permissions.js';

/*
|--------------------------------------------------------------------------
| Internal JAIMS Roles
|--------------------------------------------------------------------------
|
| This fallback list mirrors the seven internal roles defined by the
| backend. Normally the role catalog is loaded from /users/rbac.
|
| External organization portal accounts are intentionally excluded.
|
*/

const fallbackRoles = [
  {
    value: 'IT_OFFICE',
    label: 'IT Officer',
  },

  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
  },

  {
    value: 'ADMIN_OFFICER',
    label: 'Admin Officer',
  },

  {
    value: 'DIRECTOR_GENERAL',
    label: 'Director General',
  },

  {
    value: 'VIEWER',
    label: 'Viewer',
  },

  {
    value: 'FINANCE_OFFICER',
    label: 'Finance Officer',
  },

  {
    value: 'PROJECTS_MANAGER',
    label: 'Projects Manager',
  },
];

/*
|--------------------------------------------------------------------------
| Initial User Form
|--------------------------------------------------------------------------
*/

const initialUser = {
  name: '',
  email: '',
  password: '',
  role: 'VIEWER',
};

/*
|--------------------------------------------------------------------------
| Permission Labels
|--------------------------------------------------------------------------
*/

function permissionLabel(
  permission
) {
  const labels = {
    MANAGE_USERS:
      'Manage Users',

    MANAGE_SETTINGS:
      'Manage Settings',

    MANAGE_MINISTRIES:
      'Manage Reference Data',

    VIEW_AUDIT_LOGS:
      'View Audit Logs',

    CREATE_PROJECT:
      'Create Projects',

    UPDATE_PROJECT:
      'Update Projects',

    APPROVE_PROJECT:
      'Approve Projects',

    VERIFY_PROGRESS:
      'Verify Progress',

    VIEW_ALL_PROJECTS:
      'View Projects',

    VIEW_ASSIGNED_PROJECTS:
      'View Assigned Projects',

    VIEW_PUBLIC_PROJECTS:
      'View Public Projects',

    GENERATE_REPORTS:
      'Generate Reports',

    UPLOAD_DOCUMENTS:
      'Upload Documents',

    APPROVE_ORGANIZATION_REGISTRATION:
      'Final Organization Approval',

    MANAGE_OWN_ORGANIZATION_APPLICATION:
      'Manage Own Organization Application',

    REVIEW_INSTITUTION:
      'Review Institutions',

    REVIEW_ORGANIZATION_APPLICATION:
      'Review Organization Applications',

    REVIEW_PROJECT_APPLICATION:
      'Review Project Applications',

    VIEW_FINANCIALS:
      'View Financial Information',

    MANAGE_FINANCIALS:
      'Manage Financial Information',

    VERIFY_ORGANIZATION_PAYMENT:
      'Verify Organization Payments',

    'projectLocation.view':
      'View Project Locations',

    'projectLocation.create':
      'Create Project Locations',

    'projectLocation.update':
      'Update Project Locations',

    'projectLocation.delete':
      'Delete Project Locations',

    'ministryProject.view':
      'View Ministry Projects',

    'ministryProject.create':
      'Create Ministry Projects',

    'ministryProject.update':
      'Update Ministry Projects',

    'ministryProject.publish':
      'Publish Ministry Projects',

    'ministryProject.archive':
      'Archive Ministry Projects',
  };

  return (
    labels[permission] ||
    permission
  );
}

/*
|--------------------------------------------------------------------------
| Role Description
|--------------------------------------------------------------------------
*/

function roleDescription(role) {
  const descriptions = {
    IT_OFFICE:
      'Technical administration, user management, settings and system oversight.',

    SUPER_ADMIN:
      'Full administrative and operational access to JAIMS.',

    ADMIN_OFFICER:
      'Administrative review of institutions, organizations and project applications.',

    DIRECTOR_GENERAL:
      'Executive oversight and final organization registration approval.',

    VIEWER:
      'Strictly read-only access to authorized system information.',

    FINANCE_OFFICER:
      'Financial records and organization registration payment verification.',

    PROJECTS_MANAGER:
      'Project registration, project management, GIS locations and Ministry website projects.',
  };

  return (
    descriptions[role] ||
    'Internal JAIMS staff role.'
  );
}

/*
|--------------------------------------------------------------------------
| Admin / User Management
|--------------------------------------------------------------------------
*/

export function Admin() {
  const {
    user,
  } = useAuth();

  const canManageUsers =
    hasPermission(
      user,
      Permissions.MANAGE_USERS
    );

  const [
    userForm,
    setUserForm,
  ] = useState(initialUser);

  const [
    editingUserId,
    setEditingUserId,
  ] = useState(null);

  const [
    userError,
    setUserError,
  ] = useState('');

  /*
  |--------------------------------------------------------------------------
  | API
  |--------------------------------------------------------------------------
  */

  const users =
    useUsers({
      enabled:
        canManageUsers,
    });

  const createUser =
    useCreateUser();

  const updateUser =
    useUpdateUser();

  const deleteUser =
    useDeleteUser();

  const rbac =
    useRbacCatalog({
      enabled:
        canManageUsers,
    });

  /*
  |--------------------------------------------------------------------------
  | Internal Users
  |--------------------------------------------------------------------------
  */

  const internalUsers =
    (
      users.data || []
    ).filter(
      (account) =>
        account.role !==
        'ORGANIZATION_USER'
    );

  /*
  |--------------------------------------------------------------------------
  | Current Role Catalog
  |--------------------------------------------------------------------------
  |
  | Backend roles.js is authoritative.
  |
  */

  const roleCatalog =
    (
      rbac.data?.roles
        ?.length
        ? rbac.data.roles
        : fallbackRoles.map(
            (role) => ({
              ...role,
              permissions: [],
              requiredScopes: [],
            })
          )
    ).filter(
      (role) =>
        role.value !==
        'ORGANIZATION_USER'
    );

  /*
  |--------------------------------------------------------------------------
  | Form Helpers
  |--------------------------------------------------------------------------
  */

  const updateForm =
    (field) =>
    (event) => {
      setUserForm(
        (current) => ({
          ...current,

          [field]:
            event.target.value,
        })
      );
    };

  const submitUser =
    async (event) => {
      event.preventDefault();

      setUserError('');

      /*
      |--------------------------------------------------------------------------
      | Staff User Payload
      |--------------------------------------------------------------------------
      |
      | Scope fields are intentionally not sent.
      |
      | Current internal JAIMS roles operate at Ministry/system level.
      |
      */

      const payload = {
        name:
          userForm.name.trim(),

        email:
          userForm.email
            .trim()
            .toLowerCase(),

        role:
          userForm.role,
      };

      if (
        userForm.password
          .trim()
      ) {
        payload.password =
          userForm.password;
      }

      try {
        if (editingUserId) {
          await updateUser.mutateAsync({
            id:
              editingUserId,

            payload,
          });
        } else {
          await createUser.mutateAsync(
            payload
          );
        }

        setUserForm({
          ...initialUser,
        });

        setEditingUserId(
          null
        );
      } catch (error) {
        setUserError(
          error.response
            ?.data
            ?.message ||
            'Could not save user. Check the name, email, password, and assigned role.'
        );
      }
    };

  const editUser =
    (account) => {
      setEditingUserId(
        account._id
      );

      setUserForm({
        name:
          account.name || '',

        email:
          account.email || '',

        password:
          '',

        role:
          account.role ||
          'VIEWER',
      });

      setUserError('');
    };

  const resetUserForm =
    () => {
      setUserForm({
        ...initialUser,
      });

      setEditingUserId(
        null
      );

      setUserError('');
    };

  /*
  |--------------------------------------------------------------------------
  | User Status
  |--------------------------------------------------------------------------
  */

  const toggleUser =
    async (account) => {
      try {
        await updateUser.mutateAsync({
          id:
            account._id,

          payload: {
            isActive:
              !account.isActive,
          },
        });
      } catch (error) {
        window.alert(
          error.response
            ?.data
            ?.message ||
            'Could not update user status.'
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Delete User
  |--------------------------------------------------------------------------
  */

  const removeUser =
    async (account) => {
      if (
        !window.confirm(
          `Delete user ${account.email}?`
        )
      ) {
        return;
      }

      try {
        await deleteUser.mutateAsync(
          account._id
        );
      } catch (error) {
        window.alert(
          error.response
            ?.data
            ?.message ||
            'Could not delete user.'
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">
      {/* Page Header */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          User Management / RBAC
        </h1>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Create internal JAIMS
          staff accounts and assign
          one of the authorized
          system roles.
        </p>
      </div>

      {canManageUsers ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            {/* User Provisioning */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-civic">
                  <UsersRound
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    {editingUserId
                      ? 'Edit User'
                      : 'User Provisioning'}
                  </h2>

                  <p className="text-xs text-slate-500">
                    Internal JAIMS
                    staff account
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Enter the staff
                member&apos;s details
                and assign the role
                that matches their
                official
                responsibilities.
              </p>

              <form
                className="mt-5 space-y-4"
                onSubmit={
                  submitUser
                }
              >
                <Field
                  label="Full Name"
                  required
                >
                  <input
                    className={
                      inputClass
                    }
                    placeholder="Full name"
                    value={
                      userForm.name
                    }
                    onChange={
                      updateForm(
                        'name'
                      )
                    }
                    required
                  />
                </Field>

                <Field
                  label="Email Address"
                  required
                >
                  <input
                    className={
                      inputClass
                    }
                    placeholder="name@jdpcmeris.gov.so"
                    type="email"
                    value={
                      userForm.email
                    }
                    onChange={
                      updateForm(
                        'email'
                      )
                    }
                    required
                  />
                </Field>

                <Field
                  label={
                    editingUserId
                      ? 'New Password'
                      : 'Temporary Password'
                  }
                  help={
                    editingUserId
                      ? 'Leave blank to keep the current password.'
                      : 'The password will be used for the first staff login.'
                  }
                  required={
                    !editingUserId
                  }
                >
                  <input
                    className={
                      inputClass
                    }
                    placeholder={
                      editingUserId
                        ? 'New password (optional)'
                        : 'Temporary password'
                    }
                    type="password"
                    value={
                      userForm.password
                    }
                    onChange={
                      updateForm(
                        'password'
                      )
                    }
                    required={
                      !editingUserId
                    }
                  />
                </Field>

                <Field
                  label="System Role"
                  required
                >
                  <select
                    className={
                      inputClass
                    }
                    value={
                      userForm.role
                    }
                    onChange={
                      updateForm(
                        'role'
                      )
                    }
                    required
                  >
                    {roleCatalog.map(
                      (role) => (
                        <option
                          key={
                            role.value
                          }
                          value={
                            role.value
                          }
                        >
                          {
                            role.label
                          }
                        </option>
                      )
                    )}
                  </select>
                </Field>

                {/* Selected Role Information */}

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Assigned Role
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {roleCatalog.find(
                      (role) =>
                        role.value ===
                        userForm.role
                    )?.label ||
                      userForm.role}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {roleDescription(
                      userForm.role
                    )}
                  </p>
                </div>

                {userError ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {userError}
                  </p>
                ) : null}

                <div className="flex gap-2 pt-1">
                  {editingUserId ? (
                    <button
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      onClick={
                        resetUserForm
                      }
                      type="button"
                    >
                      Cancel
                    </button>
                  ) : null}

                  <button
                    className="flex-1 rounded-lg bg-civic px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={
                      createUser
                        .isPending ||
                      updateUser
                        .isPending
                    }
                    type="submit"
                  >
                    {createUser
                      .isPending ||
                    updateUser
                      .isPending
                      ? 'Saving...'
                      : editingUserId
                        ? 'Update User'
                        : 'Create User'}
                  </button>
                </div>
              </form>
            </div>

            {/* Role Matrix */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-civic">
                  <ShieldCheck
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Role Matrix
                  </h2>

                  <p className="text-xs text-slate-500">
                    Current JAIMS
                    role permissions
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Permissions shown
                here are loaded from
                the backend RBAC
                configuration.
                Changing a staff
                member&apos;s role
                automatically changes
                their effective
                permissions.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {roleCatalog.map(
                  (role) => (
                    <article
                      key={
                        role.value
                      }
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {
                              role.label
                            }
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {roleDescription(
                              role.value
                            )}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {
                            (
                              role.permissions ||
                              []
                            ).length
                          }{' '}
                          permissions
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(
                          role.permissions ||
                          []
                        ).length ? (
                          role.permissions.map(
                            (
                              permission
                            ) => (
                              <span
                                key={
                                  permission
                                }
                                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600"
                              >
                                {permissionLabel(
                                  permission
                                )}
                              </span>
                            )
                          )
                        ) : (
                          <p className="text-xs text-slate-400">
                            Loading
                            permissions...
                          </p>
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            </div>
          </section>

          {/* Users */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-civic">
                  <UsersRound
                    size={20}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Internal JAIMS
                    Users
                  </h2>

                  <p className="text-sm text-slate-500">
                    Staff accounts
                    and assigned
                    system roles.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {
                  internalUsers.length
                }{' '}
                user
                {internalUsers.length ===
                1
                  ? ''
                  : 's'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      User
                    </th>

                    <th className="px-5 py-3">
                      Role
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {internalUsers.map(
                    (
                      account
                    ) => {
                      const accountRole =
                        roleCatalog.find(
                          (role) =>
                            role.value ===
                            account.role
                        );

                      return (
                        <tr
                          key={
                            account._id
                          }
                          className="hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {
                                account.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                account.email
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-700">
                              {accountRole
                                ?.label ||
                                account.role}
                            </p>

                            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                              {roleDescription(
                                account.role
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                account.isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {account.isActive
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                onClick={() =>
                                  editUser(
                                    account
                                  )
                                }
                                type="button"
                              >
                                <Edit3
                                  size={
                                    13
                                  }
                                />

                                Edit
                              </button>

                              <button
                                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                onClick={() =>
                                  toggleUser(
                                    account
                                  )
                                }
                                type="button"
                              >
                                {account.isActive
                                  ? 'Deactivate'
                                  : 'Activate'}
                              </button>

                              <button
                                className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                onClick={() =>
                                  removeUser(
                                    account
                                  )
                                }
                                type="button"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}

                  {users.isFetching ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan="4"
                      >
                        Loading
                        users...
                      </td>
                    </tr>
                  ) : null}

                  {!users.isFetching &&
                  !internalUsers.length ? (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan="4"
                      >
                        No internal
                        JAIMS users
                        found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Your role cannot manage
          platform users.
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Shared Form Components
|--------------------------------------------------------------------------
*/

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-civic focus:ring-2 focus:ring-emerald-100';

function Field({
  label,
  help,
  required = false,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {required ? (
          <span className="ml-1 text-red-500">
            *
          </span>
        ) : null}
      </span>

      {children}

      {help ? (
        <span className="mt-1.5 block text-xs leading-5 text-slate-400">
          {help}
        </span>
      ) : null}
    </label>
  );
}