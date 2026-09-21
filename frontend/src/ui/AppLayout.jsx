
import {
  Navigate,
  NavLink,
  Outlet,
} from 'react-router-dom';

import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  FolderKanban,
  CircleDot,
  ClipboardCheck,
  FileArchive,
  FileSearch,
  FileText,
  GitPullRequestArrow,
  Globe2,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  MapPinned,
  Settings,
  ShieldCheck,
  Target,
  UsersRound,
  Wallet,
} from 'lucide-react';

import {
  useAuth,
} from '../auth/AuthContext.jsx';

import {
  hasPermission,
  Permissions,
} from '../auth/permissions.js';

import {
  useNotifications,
} from '../api/notifications.js';

const navSections = [
  /*
  |--------------------------------------------------------------------------
  | Core
  |--------------------------------------------------------------------------
  */

  {
    label: 'Core',

    items: [
      {
        to: '/',

        label: 'Dashboard',

        icon: LayoutDashboard,

        permissions: [
          Permissions.VIEW_ALL_PROJECTS,
          Permissions.VIEW_ASSIGNED_PROJECTS,
          Permissions.VIEW_PUBLIC_PROJECTS,
        ],
      },

      {
        to: '/projects',

        label: 'Projects',

        icon: FolderKanban,

        permissions: [
          Permissions.VIEW_ALL_PROJECTS,
          Permissions.VIEW_ASSIGNED_PROJECTS,
        ],
      },

      {
        to: '/project-locations',

        label: 'Project Locations / GPS',

        icon: MapPinned,

        permissions: [
          Permissions.PROJECT_LOCATION_VIEW,
        ],
      },

      {
        to: '/map',

        label: 'GIS Map',

        icon: Map,

        permissions: [
          Permissions.PROJECT_LOCATION_VIEW,
        ],
      },

      
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Organization Registration
  |--------------------------------------------------------------------------
  */

  {
    label: 'Organization Registration',

    items: [
      {
        to: '/organization-registration',

        label: 'Registration Dashboard',

        icon: LayoutDashboard,

        permissions: [
          Permissions.REVIEW_ORGANIZATION_APPLICATION,
          Permissions.VERIFY_ORGANIZATION_PAYMENT,
          Permissions.APPROVE_ORGANIZATION_REGISTRATION,
        ],
      },

      {
        to: '/OrganizationApplications',

        label: 'Applications',

        icon: FileSearch,

        permissions: [
          Permissions.REVIEW_ORGANIZATION_APPLICATION,
          Permissions.VERIFY_ORGANIZATION_PAYMENT,
          Permissions.APPROVE_ORGANIZATION_REGISTRATION,
        ],
      },

      {
        to: '/OrganizationRegistry',

        label: 'Registered Organizations',

        icon: Building2,

        permissions: [
          Permissions.REVIEW_ORGANIZATION_APPLICATION,
          Permissions.VERIFY_ORGANIZATION_PAYMENT,
          Permissions.APPROVE_ORGANIZATION_REGISTRATION,
        ],
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Project Registration
  |--------------------------------------------------------------------------
  */

  {
    label: 'Project Registration',

    items: [
      /*
      | Admin Officer verifies institution information/documents.
      */

      {
        to: '/institution-verification',

        label: 'Institution Verification',

        icon: ShieldCheck,

        permissions: [
          Permissions.REVIEW_INSTITUTION,
        ],
      },

      /*
      | Admin Officer performs administrative project review.
      | Projects Manager performs project verification/management.
      */

      {
        to: '/project-verification',

        label: 'Project Verification',

        icon: ClipboardCheck,

        permissions: [
          Permissions.REVIEW_PROJECT_APPLICATION,
        ],
      },

      /*
      | Final registration is a project-management decision.
      | Projects Manager and Super Admin have APPROVE_PROJECT.
      */

      {
        to: '/final-registration',

        label: 'Final Registration',

        icon: FileText,

        permissions: [
          Permissions.APPROVE_PROJECT,
        ],
      },

      /*
      | Registered Projects is information, not an approval workflow.
      | Read-only roles can therefore continue to see it.
      */

      {
        to: '/registered-projects',

        label: 'Registered Projects',

        icon: FolderKanban,

        permissions: [
          Permissions.VIEW_ALL_PROJECTS,
          Permissions.VIEW_ASSIGNED_PROJECTS,
        ],
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Ministry Website
  |--------------------------------------------------------------------------
  |
  | Everyone with ministryProject.view may inspect Ministry website
  | projects. Create/Edit/Publish/Archive remain separately protected.
  |
  */

  {
    label: 'Ministry Website',

    items: [
      {
        to: '/ministry-projects',

        label: 'Projects Portal',

        icon: Globe2,

        permissions: [
          Permissions.MINISTRY_PROJECT_VIEW,
        ],
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Reporting & Oversight
  |--------------------------------------------------------------------------
  */

  {
    label: 'Reporting',

    items: [
      {
        to: '/reports',

        label: 'Reports',

        icon: FileText,

        permissions: [
          Permissions.GENERATE_REPORTS,
        ],
      },

      {
        to: '/audit-logs',

        label: 'Audit Logs',

        icon: History,

        permissions: [
          Permissions.VIEW_AUDIT_LOGS,
        ],
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Administration
  |--------------------------------------------------------------------------
  */

  {
    label: 'Administration',

    items: [
      {
        to: '/admin',

        label: 'User Management / RBAC',

        icon: ShieldCheck,

        permissions: [
          Permissions.MANAGE_USERS,
        ],
      },

      {
        to: '/settings',

        label: 'Settings',

        icon: Settings,

        permissions: [
          Permissions.MANAGE_SETTINGS,
        ],
      },
    ],
  },
];
export function AppLayout() {
  const {
    isAuthenticated,
    logout,
    user,
  } = useAuth();

  const canViewNotifications =
    hasPermission(
      user,
      Permissions.VIEW_ALL_PROJECTS,
      Permissions.VIEW_ASSIGNED_PROJECTS
    );

  const notifications =
    useNotifications(
      5,
      {},
      {
        enabled:
          isAuthenticated &&
          canViewNotifications,
      }
    );

  const visibleSections =
    navSections
      .map((section) => ({
        ...section,

       items:
  (section.items || []).filter(
            (item) =>
              hasPermission(
                user,
                ...(item.permissions ||
                  [])
              )
          ),
      }))
      .filter(
        (section) =>
          section.items.length
      );

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="grid h-11 w-11 place-items-center rounded bg-civic text-white">
            <BarChart3
              size={24}
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-civic">
              JAIMS
            </p>

            <p className="max-w-48 text-xs leading-5 text-slate-500">
              Jubaland Aid
              Information Management
              System
            </p>
          </div>
        </div>

        <nav className="h-[calc(100vh-5rem)] space-y-4 overflow-y-auto p-4">
          {visibleSections.map(
            (section) => (
              <div
                key={
                  section.label
                }
              >
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {
                    section.label
                  }
                </p>

                <div className="space-y-1">
                  {section.items.map(
                    (item) => (
                      <NavLink
                        key={
                          item.to
                        }
                        to={
                          item.to
                        }
                        end={
                          item.to ===
                          '/'
                        }
                        className={({
                          isActive,
                        }) =>
                          `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium ${
                            isActive
                              ? 'bg-civic text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`
                        }
                      >
                        <item.icon
                          size={
                            18
                          }
                        />

                        {
                          item.label
                        }
                      </NavLink>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">
                Jubaland Aid
                Information Management
                System
              </h1>

              <p className="text-sm text-slate-500">
                Ministry of Planning,
                Investment and
                International
                Cooperation
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                <Bell
                  size={16}
                />

                {notifications.data
                  ?.critical ||
                  0}{' '}
                critical
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                {user?.role ||
                  'Authenticated User'}
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={logout}
              >
                <LogOut
                  size={16}
                />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
