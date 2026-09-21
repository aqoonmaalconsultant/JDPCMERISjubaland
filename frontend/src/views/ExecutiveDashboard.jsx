import { useExecutiveDashboard } from "../api/dashboard";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import DashboardHeader from "../components/dashboard/common/DashboardHeader";

import OverviewCards from "../components/dashboard/overview/OverviewCards";

import RegistrationWorkflow from "../components/dashboard/RegistrationWorkflow";

import QuickActions from "../components/dashboard/QuickActions";

import ProjectStatusChart from "../components/dashboard/ProjectStatusChart";

import SectorChart from "../components/dashboard/SectorChart";

import BudgetOverview from "../components/dashboard/BudgetOverview";

import RegionChart from "../components/dashboard/RegionChart";

import DistrictChart from "../components/dashboard/DistrictChart";

import RecentActivities from "../components/dashboard/RecentActivities";

export default function ExecutiveDashboard() {

  const {

    data,

    isLoading,

    error,

  } = useExecutiveDashboard();

  if (isLoading) {

    return (

      <div className="flex h-96 items-center justify-center">

        <div className="text-lg font-medium text-slate-500">

          Loading Executive Dashboard...

        </div>

      </div>

    );

  }

  if (error) {

    return (

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">

        <h2 className="text-lg font-semibold text-red-700">

          Dashboard Error

        </h2>

        <p className="mt-2 text-red-600">

          {error.message}

        </p>

      </div>

    );

  }

  return (

    <DashboardLayout>

      {/* Header */}

      <DashboardHeader />

      {/* Quick Actions */}

      <QuickActions />

      {/* Executive KPIs */}

      <OverviewCards

        data={data?.overview}

      />

      {/* Registration */}

      <RegistrationWorkflow

        data={data?.registration}

      />

      {/* Portfolio */}

      <div className="grid gap-6 xl:grid-cols-2">

        <ProjectStatusChart

          data={data?.portfolio}

        />

        <SectorChart

          data={data?.portfolio}

        />

      </div>

      {/* Finance & Geography */}

      <div className="grid gap-6 xl:grid-cols-2">

        <BudgetOverview

          data={data?.finance}

        />

        <RegionChart

          data={data?.portfolio}

        />

      </div>

      {/* District */}

      <DistrictChart

        data={data?.portfolio}

      />

      {/* Activities */}

      <RecentActivities

        data={data?.activities}

      />

    </DashboardLayout>

  );

}