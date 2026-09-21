import {
  lazy,
  Suspense,
} from 'react';
import {
  createBrowserRouter,
} from 'react-router-dom';

import {
  Permissions,
} from './auth/permissions.js';

import {
  RequirePermission,
} from './auth/RequirePermission.jsx';

import {
  AppErrorBoundary,
} from './ui/AppErrorBoundary.jsx';

import {
  AppLayout,
} from './ui/AppLayout.jsx';
import { OrganizationLogin } from './views/OrganizationLogin.jsx';

const Login = lazy(() =>
  import('./views/Login.jsx').then(
    (module) => ({
      default: module.Login,
    })
  )
);
const MinistryProjects = lazy(() =>
  import(
    './views/MinistryProjects.jsx'
  ).then((module) => ({
    default:
      module.MinistryProjects,
  }))
);
const MinistryProjectForm = lazy(() =>
  import(
    './views/MinistryProjectForm.jsx'
  )
);
const Dashboard = lazy(() =>
  import('./views/Dashboard.jsx').then(
    (module) => ({
      default: module.Dashboard,
    })
  )
);
const ExecutiveDashboard = lazy(() =>
  import('./views/ExecutiveDashboard.jsx').then((module) => ({
    default: module.default,
  }))
);
const Projects = lazy(() =>
  import('./views/Projects.jsx').then((module) => ({
    default: module.Projects,
  }))
);

const ProjectDashboard = lazy(() =>
  import('./views/ProjectDashboard.jsx').then((module) => ({
    default: module.ProjectDashboard,
  }))
);
const OrganizationApplicationStatus = lazy(() =>
  import(
    './views/OrganizationApplicationStatus.jsx'
  )
);

const ProjectDetails = lazy(() =>
  import(
    './views/ProjectDetails.jsx'
  ).then((module) => ({
    default:
      module.ProjectDetails,
  }))
);

const OrganizationApplications = lazy(() =>
  import(
    './views/OrganizationApplications.jsx'
  )
);

const OrganizationRegistrationDashboard = lazy(() =>
  import(
    './views/OrganizationRegistrationDashboard.jsx'
  )
);

const OrganizationRenewal = lazy(() =>
  import(
    './views/OrganizationRenewal.jsx'
  )
);

const OrganizationRegistry = lazy(() =>
  import(
    './views/OrganizationRegistry.jsx'
  ).then((module) => ({
    default:
      module.default,
  }))
);

const OrganizationDashboard = lazy(() =>
  import(
    './views/OrganizationDashboard.jsx'
  ).then((module) => ({
    default:
      module.OrganizationDashboard,
  }))
);

const OrganizationMyApplications = lazy(() =>
  import(
    './views/OrganizationMyApplications.jsx'
  )
);

const OrganizationRegistration = lazy(() =>
  import(
    './views/OrganizationRegistration.jsx'
  )
);

const OperationsDashboard = lazy(
  () =>
    import(
      './views/OperationsDashboard.jsx'
    ).then((module) => ({
      default:
        module.OperationsDashboard,
    }))
);

const AccountabilityDashboard =
  lazy(() =>
    import(
      './views/AccountabilityDashboard.jsx'
    ).then((module) => ({
      default:
        module.AccountabilityDashboard,
    }))
  );

const MonitoringPage = lazy(() =>
  import(
    './views/ProjectModulePage.jsx'
  ).then((module) => ({
    default:
      module.MonitoringPage,
  }))
);

const BeneficiariesPage = lazy(
  () =>
    import(
      './views/ProjectModulePage.jsx'
    ).then((module) => ({
      default:
        module.BeneficiariesPage,
    }))
);

const ProjectLocationsPage = lazy(
  () =>
    import(
      './views/ProjectModulePage.jsx'
    ).then((module) => ({
      default:
        module.ProjectLocationsPage,
    }))
);

const EvaluationsPage = lazy(() =>
  import(
    './views/ProjectModulePage.jsx'
  ).then((module) => ({
    default:
      module.EvaluationsPage,
  }))
);

const IndicatorsPage = lazy(() =>
  import(
    './views/ProjectModulePage.jsx'
  ).then((module) => ({
    default:
      module.IndicatorsPage,
  }))
);

const FinancePage = lazy(() =>
  import(
    './views/ProjectModulePage.jsx'
  ).then((module) => ({
    default:
      module.FinancePage,
  }))
);

const ProjectDocumentsPage = lazy(
  () =>
    import(
      './views/ProjectModulePage.jsx'
    ).then((module) => ({
      default:
        module.ProjectDocumentsPage,
    }))
);

const ProjectMap = lazy(() =>
  import("./views/ProjectMap.jsx").then((module) => ({
    default: module.default,
  }))
);

const Reports = lazy(() =>
  import('./views/Reports.jsx').then(
    (module) => ({
      default: module.Reports,
    })
  )
);

const Documents = lazy(() =>
  import('./views/Documents.jsx').then(
    (module) => ({
      default: module.Documents,
    })
  )
);

const Admin = lazy(() =>
  import('./views/Admin.jsx').then(
    (module) => ({
      default: module.Admin,
    })
  )
);

const AuditLogs = lazy(() =>
  import('./views/AuditLogs.jsx').then(
    (module) => ({
      default: module.AuditLogs,
    })
  )
);

const Notifications = lazy(() =>
  import(
    './views/Notifications.jsx'
  ).then((module) => ({
    default:
      module.Notifications,
  }))
);

const SettingsPage = lazy(() =>
  import('./views/Settings.jsx').then(
    (module) => ({
      default:
        module.SettingsPage,
    })
  )
);

const OrganizationSignup = lazy(() =>
  import(
    './views/OrganizationSignup.jsx'
  ).then((module) => ({
    default:
      module.OrganizationSignup,
  }))
);

const InstitutionProfile = lazy(() =>
  import(
    './views/InstitutionProfile.jsx'
  ).then((module) => ({
    default:
      module.InstitutionProfile,
  }))
);

const InstitutionVerification = lazy(() =>
  import(
    './views/InstitutionVerification.jsx'
  ).then((module) => ({
    default:
      module.InstitutionVerification,
  }))
);

const ProjectApplicationVerification = lazy(() =>
  import(
    './views/ProjectApplicationVerification.jsx'
  ).then((module) => ({
    default:
      module.ProjectApplicationVerification,
  }))
);
const ProjectVerification = lazy(() =>
  import(
    './views/ProjectVerification.jsx'
  ).then((module) => ({
    default:
      module.ProjectVerification,
  }))
);
const FinalRegistration = lazy(() =>
  import(
    './views/FinalRegistration.jsx'
  ).then((module) => ({
    default:
      module.FinalRegistration,
  }))
);

const FinalRegistrationDetails =
  lazy(() =>
    import(
      './views/FinalRegistrationDetails.jsx'
    ).then((module) => ({
      default:
        module.FinalRegistrationDetails,
    }))
  );
const ProjectVerificationDetails =
  lazy(() =>
    import(
      './views/ProjectVerificationDetails.jsx'
    ).then((module) => ({
      default:
        module.ProjectVerificationDetails,
    }))
  );
  const RegisteredProjects = lazy(() =>
  import(
    './views/RegisteredProjects.jsx'
  ).then((module) => ({
    default:
      module.RegisteredProjects,
  }))
);

const RegisteredProjectDetails =
  lazy(() =>
    import(
      './views/RegisteredProjectDetails.jsx'
    ).then((module) => ({
      default:
        module.RegisteredProjectDetails,
    }))
  );
const InstitutionProjectApplicationForm = lazy(() =>
  import(
    './views/InstitutionProjectApplicationForm.jsx'
  )
);

const InstitutionProjectApplications = lazy(() =>
  import(
    './views/InstitutionProjectApplications.jsx'
  )
);

const PublicPortal = lazy(() =>
  import(
    './views/PublicPortal.jsx'
  ).then((module) => ({
    default:
      module.PublicPortal,
  }))
);

const ReferenceData = lazy(() =>
  import(
    './views/ReferenceData.jsx'
  ).then((module) => ({
    default:
      module.ReferenceData,
  }))
);

const Unauthorized = lazy(() =>
  import(
    './views/Unauthorized.jsx'
  ).then((module) => ({
    default:
      module.Unauthorized,
  }))
);

function PageLoader({
  children,
}) {
  return (
    <Suspense
      fallback={
        <div className="rounded border border-slate-200 bg-white p-4 text-sm font-medium text-slate-600">
          Loading...
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function ProtectedPage({
  children,
  permissions,
}) {
  return (
    <RequirePermission
      permissions={permissions}
    >
      <PageLoader>
        {children}
      </PageLoader>
    </RequirePermission>
  );
}

const staffViewPermissions = [
  Permissions.VIEW_ALL_PROJECTS,
  Permissions.VIEW_ASSIGNED_PROJECTS,
];

export const router =
  createBrowserRouter([
    {
      path: '/login',

      element: (
        <PageLoader>
          <Login />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
      path: '/public/organization/my-applications',

      element: (
        <OrganizationMyApplications />
      ),
    },

    {
      path: '/public',

      element: (
        <PageLoader>
          <PublicPortal />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
      path: '/public/organization/signup',

      element: (
        <PageLoader>
          <OrganizationSignup />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
      path: '/public/organization/login',

      element: (
        <PageLoader>
          <OrganizationLogin />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
      path:
        '/public/organization/dashboard',

      element: (
        <PageLoader>
          <OrganizationDashboard />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
  path:
    '/public/organization/profile',

  element: (
    <PageLoader>
      <InstitutionProfile />
    </PageLoader>
  ),

  errorElement: (
    <AppErrorBoundary />
  ),
},

{
  path:
    '/public/organization/project-applications',

  element: (
    <PageLoader>
      <InstitutionProjectApplications />
    </PageLoader>
  ),

  errorElement: (
    <AppErrorBoundary />
  ),
},

{
  path:
    '/public/organization/project-applications/:id',

  element: (
    <PageLoader>
      <InstitutionProjectApplicationForm />
    </PageLoader>
  ),

  errorElement: (
    <AppErrorBoundary />
  ),
},

    {
      path:
        '/public/organization/application-status',

      element: (
        <PageLoader>
          <OrganizationApplicationStatus />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
      path:
        '/public/organization/register',

      element: (
        <PageLoader>
          <OrganizationRegistration />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
      path:
        '/public/organization/renewal',

      element: (
        <PageLoader>
          <OrganizationRenewal />
        </PageLoader>
      ),

      errorElement: (
        <AppErrorBoundary />
      ),
    },

    {
      path: '/',

      element: <AppLayout />,

      errorElement: (
        <AppErrorBoundary />
      ),

      children: [
        {
          index: true,

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
                Permissions.VIEW_PUBLIC_PROJECTS,
              ]}
            >
              <ExecutiveDashboard />
            </ProtectedPage>
          ),
        },

        {
          path: 'projects',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <Projects />
            </ProtectedPage>
          ),
        },
{
  path: 'ministry-projects',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.MINISTRY_PROJECT_VIEW,
      ]}
    >
      <MinistryProjects />
    </ProtectedPage>
  ),
},
{
  path: 'ministry-projects/new',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.MINISTRY_PROJECT_CREATE,
      ]}
    >
      <MinistryProjectForm />
    </ProtectedPage>
  ),
},
{
  path: 'ministry-projects/:projectId/edit',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.MINISTRY_PROJECT_UPDATE,
      ]}
    >
      <MinistryProjectForm />
    </ProtectedPage>
  ),
},
        {
  path: 'projects/:id',

  element: (
    <ProtectedPage
      permissions={
        staffViewPermissions
      }
    >
      <ProjectDashboard />
    </ProtectedPage>
  ),
},
        {
          path: 'institution-verification',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
              ]}
            >
              <InstitutionVerification />
            </ProtectedPage>
          ),
        },

        {
          path: 'project-applications',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
              ]}
            >
              <ProjectApplicationVerification />
            </ProtectedPage>
          ),
        },
{
  path: 'project-verification',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.VIEW_ALL_PROJECTS,
        Permissions.VIEW_ASSIGNED_PROJECTS,
      ]}
    >
      <ProjectVerification />
    </ProtectedPage>
  ),
},

{
  path: 'project-verification/:id',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.VIEW_ALL_PROJECTS,
        Permissions.VIEW_ASSIGNED_PROJECTS,
      ]}
    >
      <ProjectVerificationDetails />
    </ProtectedPage>
  ),
},
{
  path: 'final-registration',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.VIEW_ALL_PROJECTS,
        Permissions.VIEW_ASSIGNED_PROJECTS,
      ]}
    >
      <FinalRegistration />
    </ProtectedPage>
  ),
},

{
  path: 'final-registration/:id',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.VIEW_ALL_PROJECTS,
        Permissions.VIEW_ASSIGNED_PROJECTS,
      ]}
    >
      <FinalRegistrationDetails />
    </ProtectedPage>
  ),
},
{
  path: 'registered-projects',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.VIEW_ALL_PROJECTS,
        Permissions.VIEW_ASSIGNED_PROJECTS,
      ]}
    >
      <RegisteredProjects />
    </ProtectedPage>
  ),
},

{
  path: 'registered-projects/:id',

  element: (
    <ProtectedPage
      permissions={[
        Permissions.VIEW_ALL_PROJECTS,
        Permissions.VIEW_ASSIGNED_PROJECTS,
      ]}
    >
      <RegisteredProjectDetails />
    </ProtectedPage>
  ),
},
        {
          path: 'organization-registration',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
                Permissions.VIEW_PUBLIC_PROJECTS,
              ]}
            >
              <OrganizationRegistrationDashboard />
            </ProtectedPage>
          ),
        },

        {
          path:
            'OrganizationApplications',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
                Permissions.VIEW_PUBLIC_PROJECTS,
              ]}
            >
              <OrganizationApplications />
            </ProtectedPage>
          ),
        },

        {
          path: 'OrganizationRegistry',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
                Permissions.VIEW_PUBLIC_PROJECTS,
              ]}
            >
              <OrganizationRegistry />
            </ProtectedPage>
          ),
        },

        {
          path: 'operations',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <OperationsDashboard />
            </ProtectedPage>
          ),
        },

        {
          path:
            'accountability',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
                Permissions.VIEW_PUBLIC_PROJECTS,
                Permissions.GENERATE_REPORTS,
                Permissions.VIEW_AUDIT_LOGS,
              ]}
            >
              <AccountabilityDashboard />
            </ProtectedPage>
          ),
        },

        {
          path:
            'project-locations',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <ProjectLocationsPage />
            </ProtectedPage>
          ),
        },

        {
          path: 'monitoring',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <MonitoringPage />
            </ProtectedPage>
          ),
        },

        {
          path: 'beneficiaries',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <BeneficiariesPage />
            </ProtectedPage>
          ),
        },

        {
          path: 'evaluations',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <EvaluationsPage />
            </ProtectedPage>
          ),
        },

        {
          path: 'indicators',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <IndicatorsPage />
            </ProtectedPage>
          ),
        },

        {
          path: 'finance',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <FinancePage />
            </ProtectedPage>
          ),
        },

        {
          path: 'documents',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <ProjectDocumentsPage />
            </ProtectedPage>
          ),
        },

        {
          path:
            'document-search',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <Documents />
            </ProtectedPage>
          ),
        },

        {
          path: 'map',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <ProjectMap />
            </ProtectedPage>
          ),
        },

        {
          path: 'reports',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.GENERATE_REPORTS,
              ]}
            >
              <Reports />
            </ProtectedPage>
          ),
        },

        {
          path:
            'notifications',

          element: (
            <ProtectedPage
              permissions={
                staffViewPermissions
              }
            >
              <Notifications />
            </ProtectedPage>
          ),
        },

        {
          path: 'admin',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.MANAGE_USERS,
              ]}
            >
              <Admin />
            </ProtectedPage>
          ),
        },

        {
          path: 'audit-logs',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_AUDIT_LOGS,
              ]}
            >
              <AuditLogs />
            </ProtectedPage>
          ),
        },

        {
          path: 'settings',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.MANAGE_SETTINGS,
              ]}
            >
              <SettingsPage />
            </ProtectedPage>
          ),
        },

        {
          path:
            'master-data/:resource',

          element: (
            <ProtectedPage
              permissions={[
                Permissions.VIEW_ALL_PROJECTS,
                Permissions.VIEW_ASSIGNED_PROJECTS,
                Permissions.MANAGE_MINISTRIES,
                Permissions.MANAGE_SETTINGS,
              ]}
            >
              <ReferenceData />
            </ProtectedPage>
          ),
        },

        {
          path: 'unauthorized',

          element: (
            <PageLoader>
              <Unauthorized />
            </PageLoader>
          ),
        },
      ],
    },
  ]);