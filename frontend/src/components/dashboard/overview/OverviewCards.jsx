import {
  FolderOpen,
  Clock,
  BarChart3,
  CheckCircle,
  Building2,
  DollarSign,
} from "lucide-react";

import DashboardCard from "./DashboardCard";

export default function OverviewCards({
  data,
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">

      <DashboardCard
        title="Projects"
        value={data?.totalProjects ?? 0}
        icon={<FolderOpen size={24} />}
        color="bg-blue-100"
      />

      <DashboardCard
        title="Planned"
        value={
          data?.implementation?.planned ?? 0
        }
        icon={<Clock size={24} />}
        color="bg-yellow-100"
      />

      <DashboardCard
        title="Ongoing"
        value={
          data?.implementation?.ongoing ?? 0
        }
        icon={<BarChart3 size={24} />}
        color="bg-green-100"
      />

      <DashboardCard
        title="Completed"
        value={
          data?.implementation?.completed ?? 0
        }
        icon={<CheckCircle size={24} />}
        color="bg-emerald-100"
      />

      <DashboardCard
        title="Organizations"
        value={data?.totalOrganizations ?? 0}
        icon={<Building2 size={24} />}
        color="bg-indigo-100"
      />

      <DashboardCard
        title="Budget"
        value={`$${Number(
          data?.totalBudget ?? 0
        ).toLocaleString()}`}
        icon={<DollarSign size={24} />}
        color="bg-purple-100"
      />

    </div>
  );
}