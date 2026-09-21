import { Link } from "react-router-dom";

import {
  Building2,
  MapPin,
  Landmark,
  CircleDollarSign,
  Activity,
  FolderOpen,
  Users,
} from "lucide-react";

import { StatusBadge } from "../../../ui/StatusBadge.jsx";

function formatBudget(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Not specified";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

export default function ProjectPopup({
  project,
}) {
  const location = [
    project.village,
    project.district,
    project.region,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-80 space-y-4">

      {/* PROJECT HEADER */}

      <div>
        <h3 className="text-lg font-bold text-slate-800">
          {project.projectName ||
            "Unnamed Project"}
        </h3>

        <p className="mt-1 text-xs font-medium text-slate-500">
          {project.projectCode ||
            "No project code"}
        </p>
      </div>

      {/* PROJECT INFORMATION */}

      <div className="grid gap-2.5 text-sm">

        {project.organization && (
          <div className="flex items-start gap-2">
            <Building2
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>
              {project.organization}
            </span>
          </div>
        )}

        {project.ministry && (
          <div className="flex items-start gap-2">
            <Landmark
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>
              {project.ministry}
            </span>
          </div>
        )}

        {project.supportingMinistries && (
          <div className="pl-6 text-xs text-slate-500">
            Supported by:{" "}
            {project.supportingMinistries}
          </div>
        )}

        {project.sector && (
          <div className="flex items-center gap-2">
            <Activity
              size={16}
              className="shrink-0"
            />

            <span>
              {project.sector}
            </span>
          </div>
        )}

        {location && (
          <div className="flex items-start gap-2">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0"
            />

            <div>
              {project.siteName && (
                <p className="font-medium">
                  {project.siteName}
                </p>
              )}

              <p>{location}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <CircleDollarSign
            size={16}
            className="shrink-0"
          />

          <span>
            {project.donor ||
              "No funding institution specified"}
          </span>
        </div>

      </div>

      {/* BUDGET + BENEFICIARIES */}

      <div className="grid grid-cols-2 gap-2">

        <div className="rounded-lg bg-slate-50 p-2">
          <p className="text-xs text-slate-500">
            Budget
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {formatBudget(project.budget)}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={13} />
            Beneficiaries
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {Number(
              project.beneficiaries || 0
            ).toLocaleString()}
          </p>
        </div>

      </div>

      {/* STATUS + PROGRESS */}

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">

        <StatusBadge
          status={project.status}
        />

        <div className="text-right">
          <p className="text-xs text-slate-500">
            Progress
          </p>

          <span className="text-sm font-semibold text-slate-700">
            {Number(
              project.progress || 0
            )}
            %
          </span>
        </div>

      </div>

      {/* PROJECT LINK */}

      <Link
        to={`/projects/${project.projectId}`}
        className="flex items-center justify-center gap-2 rounded-lg bg-civic px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
      >
        <FolderOpen size={16} />

        Open Project
      </Link>

    </div>
  );
}