import {
  useExecutiveDashboard,
} from "../api/dashboard.js";

import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";

import OverviewCards from "../components/dashboard/overview/OverviewCards.jsx";

import RegistrationWorkflow from "../components/dashboard/RegistrationWorkflow.jsx";

import ProjectStatusChart from "../components/dashboard/ProjectStatusChart.jsx";

import SectorChart from "../components/dashboard/SectorChart.jsx";

import RegionChart from "../components/dashboard/RegionChart.jsx";

import DistrictChart from "../components/dashboard/DistrictChart.jsx";

import BudgetOverview from "../components/dashboard/BudgetOverview.jsx";

import RecentActivities from "../components/dashboard/RecentActivities.jsx";

export function Dashboard() {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useExecutiveDashboard();

  /*
   * Initial loading state
   */
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-civic" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading executive dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * API error state
   */
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error.response?.data?.message ||
            error.message ||
            "Could not load executive dashboard data."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Try Again
        </button>
      </div>
    );
  }

  /*
   * Safe fallback structure
   */
  const dashboard = data || {
    overview: {},
    registration: {},
    portfolio: {},
    finance: {},
    activities: {},
  };

  return (
    <DashboardLayout>

      {/* PAGE HEADER */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Executive Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Jubaland project portfolio,
            registration, implementation,
            geographic coverage and financial
            overview.
          </p>
        </div>

        {isFetching && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Refreshing...
          </span>
        )}

      </div>

      {/* EXECUTIVE OVERVIEW */}

      <section className="space-y-4">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Executive Overview
          </h2>

          <p className="text-sm text-slate-500">
            High-level portfolio indicators.
          </p>
        </div>

        <OverviewCards
          data={dashboard.overview}
        />

      </section>

      {/* REGISTRATION WORKFLOW */}

      <section className="space-y-4">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Registration Workflow
          </h2>

          <p className="text-sm text-slate-500">
            Institution and project registration
            progress.
          </p>
        </div>

        <RegistrationWorkflow
          data={dashboard.registration}
        />

      </section>

      {/* PROJECT STATUS + FINANCE */}

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

        <ProjectStatusChart
          data={dashboard.portfolio}
        />

        <BudgetOverview
          data={dashboard.finance}
        />

      </section>

      {/* SECTOR + REGION */}

      <section className="grid gap-6 xl:grid-cols-2">

        <SectorChart
          data={dashboard.portfolio}
        />

        <RegionChart
          data={dashboard.portfolio}
        />

      </section>

      {/* DISTRICT DISTRIBUTION */}

      <section>

        <DistrictChart
          data={dashboard.portfolio}
        />

      </section>

      {/* RECENT ACTIVITY */}

      <section>

        <RecentActivities
          data={dashboard.activities}
        />

      </section>

    </DashboardLayout>
  );
}