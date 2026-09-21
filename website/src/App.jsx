import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";

/*
|--------------------------------------------------------------------------
| Ministry Pages
|--------------------------------------------------------------------------
*/

import HomePage from "./pages/HomePage";
import AboutMinistryPage from "./pages/AboutMinistryPage";
import MinisterPage from "./pages/MinisterPage";
import DeputyMinisterPage from "./pages/DeputyMinisterPage";
import DirectorGeneralPage from "./pages/DirectorGeneralPage";

/*
|--------------------------------------------------------------------------
| Department Pages
|--------------------------------------------------------------------------
*/

import PlanningPolicyDepartmentPage from "./Pages/PlanningPolicyDepartmentPage";
import AidCoordinationDepartmentPage from "./Pages/AidCoordinationDepartmentpage";
import StatisticsDepartmentPage from "./Pages/StatisticsDepartmentPage";
import MonitoringEvaluationPage from "./Pages/MonitoringEvaluationPage";
import AdministrationFinancePage from "./Pages/AdministrationFinancePage";
import InvestmentPromotionPage from "./Pages/InvestmentPromotionPage";
import DurableSolutionsPage from "./Pages/DurableSolutionsPage";
import SDGPage from "./Pages/SDGPage";

/*
|--------------------------------------------------------------------------
| Organization Registry
|--------------------------------------------------------------------------
*/

import OrganizationRegisterPage from "./pages/OrganizationRegisterPage";
import TrackApplicationPage from "./pages/TrackApplicationPage";
import OrganizationVerificationPage from "./pages/OrganizationVerificationPage";

/*
|--------------------------------------------------------------------------
| Ministry Projects
|--------------------------------------------------------------------------
*/

import ProjectDashboardPage from "./Pages/ProjectDashboardPage";

/*
|--------------------------------------------------------------------------
| Other
|--------------------------------------------------------------------------
*/
import ProjectDetailPage from "./Pages/ProjectDetailPage";
import PlaceholderPage from "./pages/PlaceholderPage";

/*
|--------------------------------------------------------------------------
| External System Redirect
|--------------------------------------------------------------------------
|
| Used for routes that are access points to the authenticated JAIMS
| application running separately from the Ministry public website.
|
*/

function ExternalSystemRedirect({
  url,
  message = "Redirecting...",
}) {
  window.location.replace(url);

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />

        <p className="mt-4 text-sm font-medium text-slate-600">
          {message}
        </p>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Projects Portal Redirect
|--------------------------------------------------------------------------
|
| Projects Portal is the access point for Ministry project/program staff.
|
| Public users browse projects through:
|   /projects
|   /projects/dashboard
|
| Authorized Ministry staff manage website projects through:
|   JAIMS -> /ministry-projects
|
*/

function ProjectsPortalRedirect() {
  return (
    <ExternalSystemRedirect
      url="http://127.0.0.1:5173/login?redirect=/ministry-projects"
      message="Redirecting to Ministry Projects Portal..."
    />
  );
}

/*
|--------------------------------------------------------------------------
| JAIMS Redirect
|--------------------------------------------------------------------------
|
| General access point to the internal JAIMS application.
|
*/

function JaimsRedirect() {
  return (
    <ExternalSystemRedirect
      url="http://127.0.0.1:5173/public"
      message="Redirecting to JAIMS..."
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          {/*
          |--------------------------------------------------------------------------
          | Home
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/"
            element={<HomePage />}
          />

          {/*
          |--------------------------------------------------------------------------
          | About / Leadership
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/about"
            element={
              <AboutMinistryPage />
            }
          />

          <Route
            path="/leadership/minister"
            element={
              <MinisterPage />
            }
          />

          <Route
            path="/leadership/deputy-minister"
            element={
              <DeputyMinisterPage />
            }
          />

          <Route
            path="/leadership/director-general"
            element={
              <DirectorGeneralPage />
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | Departments
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/departments"
            element={
              <PlaceholderPage />
            }
          />

          <Route
            path="/departments/planning"
            element={
              <PlanningPolicyDepartmentPage />
            }
          />

          <Route
            path="/departments/aid-coordination"
            element={
              <AidCoordinationDepartmentPage />
            }
          />

          <Route
            path="/departments/statistics"
            element={
              <StatisticsDepartmentPage />
            }
          />

          <Route
            path="/departments/monitoring-evaluation"
            element={
              <MonitoringEvaluationPage />
            }
          />

          <Route
            path="/departments/administration-finance"
            element={
              <AdministrationFinancePage />
            }
          />

          <Route
            path="/departments/investment-promotion"
            element={
              <InvestmentPromotionPage />
            }
          />

          <Route
            path="/departments/durable-solutions"
            element={
              <DurableSolutionsPage />
            }
          />

          <Route
            path="/departments/sdg"
            element={
              <SDGPage />
            }
          />

          <Route
            path="/departments/:departmentId"
            element={
              <PlaceholderPage />
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | JAIMS
          |--------------------------------------------------------------------------
          |
          | General JAIMS access from the Ministry website.
          |
          */}

          <Route
            path="/jaims"
            element={
              <JaimsRedirect />
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | Ministry Projects - Public
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/projects"
            element={
              <ProjectDashboardPage
                listingOnly
                pageTitle="All Projects"
                pageDescription="Browse published Ministry projects and use the available filters to find ongoing, planned, and completed projects."
              />
            }
          />

          <Route
            path="/projects/dashboard"
            element={
              <ProjectDashboardPage />
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | Ministry Projects - Staff Portal
          |--------------------------------------------------------------------------
          |
          | This is NOT another public projects page.
          |
          | It sends Ministry project/program staff to JAIMS authentication,
          | then redirects them to the Ministry Projects management portal.
          |
          */}

          <Route
            path="/projects/portal"
            element={
              <ProjectsPortalRedirect />
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | Public Project Details
          |--------------------------------------------------------------------------
          |
          | Keep this AFTER:
          |
          | /projects/dashboard
          | /projects/portal
          |
          | Otherwise those route names could be interpreted as project IDs.
          |
          */}

         <Route
  path="/projects/:projectId"
  element={
    <ProjectDetailPage />
  }
/>

          {/*
          |--------------------------------------------------------------------------
          | Publications / Events / News
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/publications"
            element={
              <PlaceholderPage />
            }
          />

          <Route
            path="/events"
            element={
              <PlaceholderPage />
            }
          />

          <Route
            path="/news"
            element={
              <PlaceholderPage />
            }
          />

          <Route
            path="/contact"
            element={
              <PlaceholderPage />
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | Organization Registry
          |--------------------------------------------------------------------------
          */}

          <Route
            path="/organizations/register"
            element={
              <OrganizationRegisterPage />
            }
          />

          <Route
            path="/organizations/track"
            element={
              <OrganizationVerificationPage />
            }
          />

          <Route
            path="/organizations/application-status"
            element={
              <TrackApplicationPage />
            }
          />

          <Route
            path="/organizations/registry"
            element={
              <PlaceholderPage />
            }
          />

          {/*
          |--------------------------------------------------------------------------
          | Fallback
          |--------------------------------------------------------------------------
          */}

          <Route
            path="*"
            element={
              <PlaceholderPage />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;