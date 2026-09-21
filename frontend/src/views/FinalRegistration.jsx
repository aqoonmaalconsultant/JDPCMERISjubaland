import { Link } from 'react-router-dom';

import {
  CheckCircle,
  Eye,
  FileCheck,
} from 'lucide-react';

import {
  useFinalRegistrationStatistics,
  useVerifiedProjects,
} from '../api/finalRegistration.js';

export function FinalRegistration() {
  const {
    data: statistics,
    isLoading: statisticsLoading,
  } = useFinalRegistrationStatistics();

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useVerifiedProjects();

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          Final Registration
        </h1>

        <p className="text-slate-500">
          Register verified projects into the official project registry.
        </p>

      </div>

      {/* Statistics */}

      <div className="grid gap-6 md:grid-cols-2">

        <StatCard
          title="Verified Projects"
          value={
            statisticsLoading
              ? '...'
              : statistics?.verified || 0
          }
          icon={
            <CheckCircle size={24} />
          }
        />

        <StatCard
          title="Registered Projects"
          value={
            statisticsLoading
              ? '...'
              : statistics?.registered || 0
          }
          icon={
            <FileCheck size={24} />
          }
        />

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-lg border bg-white">

        <div className="border-b px-6 py-4">

          <h2 className="text-lg font-semibold">
            Verified Projects Awaiting Registration
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Project
                </th>

                <th className="px-4 py-3 text-left">
                  Institution
                </th>

                <th className="px-4 py-3 text-left">
                  Sector
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {projectsLoading ? (

                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center"
                  >
                    Loading...
                  </td>

                </tr>

              ) : projects.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No verified projects awaiting registration.
                  </td>

                </tr>

              ) : (

                projects.map(
                  (project) => (

                    <tr
                      key={project._id}
                      className="border-t"
                    >

                      <td className="px-4 py-3 font-medium">

                        {project.projectName}

                      </td>

                      <td className="px-4 py-3">

                        {project
                          .submittingInstitution
                          ?.institutionName || '-'}

                      </td>

                      <td className="px-4 py-3">

                        {project.sector}

                      </td>

                      <td className="px-4 py-3">

                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">

                          {project.registrationStatus}

                        </span>

                      </td>

                      <td className="px-4 py-3">

                        <Link
                          to={`/final-registration/${project._id}`}
                          className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                        >

                          <Eye size={16} />

                          Review

                        </Link>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-lg border bg-white p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">

            {title}

          </p>

          <p className="mt-2 text-3xl font-bold">

            {value}

          </p>

        </div>

        <div className="rounded-full bg-slate-100 p-3">

          {icon}

        </div>

      </div>

    </div>
  );
}