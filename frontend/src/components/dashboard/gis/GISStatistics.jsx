import {
  FolderKanban,
  MapPinned,
  Map,
  Building2,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </h2>
        </div>

        <div
          className={`rounded-full p-3 ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function GISStatistics({
  features = [],
}) {
  /*
   * One project can have multiple GPS locations,
   * therefore features.length is the number of
   * locations, not necessarily the number of projects.
   */

  const projectIds = new Set();

  const regions = new Set();

  const districts = new Set();

  let completed = 0;
  let ongoing = 0;

  const completedProjects = new Set();
  const ongoingProjects = new Set();

  features.forEach((feature) => {
    const props = feature?.properties || {};

    if (props.projectId) {
      projectIds.add(String(props.projectId));
    }

    if (props.region) {
      regions.add(props.region);
    }

    if (props.district) {
      districts.add(props.district);
    }

    const status = String(
      props.status || ""
    ).toLowerCase();

    /*
     * Avoid counting one project multiple times
     * when it has several GPS locations.
     */

    const projectKey =
      props.projectId ||
      props.projectCode ||
      props.projectName;

    if (
      status === "completed" &&
      projectKey
    ) {
      completedProjects.add(
        String(projectKey)
      );
    }

   if (
  status === "active" &&
  projectKey
) {
  ongoingProjects.add(
    String(projectKey)
  );
}
  });

  completed = completedProjects.size;
  ongoing = ongoingProjects.size;

  const statistics = {
    totalProjects: projectIds.size,
    totalLocations: features.length,
    regions: regions.size,
    districts: districts.size,
    completed,
    ongoing,
  };

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
      <StatCard
        title="Projects"
        value={statistics.totalProjects}
        color="bg-blue-100"
        icon={<FolderKanban size={24} />}
      />

      <StatCard
        title="Locations"
        value={statistics.totalLocations}
        color="bg-indigo-100"
        icon={<MapPinned size={24} />}
      />

      <StatCard
        title="Regions"
        value={statistics.regions}
        color="bg-green-100"
        icon={<Map size={24} />}
      />

      <StatCard
        title="Districts"
        value={statistics.districts}
        color="bg-purple-100"
        icon={<Building2 size={24} />}
      />

      <StatCard
        title="Completed"
        value={statistics.completed}
        color="bg-emerald-100"
        icon={<CheckCircle2 size={24} />}
      />

      <StatCard
        title="Active"
        value={statistics.ongoing}
        color="bg-amber-100"
        icon={<LoaderCircle size={24} />}
      />
    </div>
  );
}