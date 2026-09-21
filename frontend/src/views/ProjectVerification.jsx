import { Link } from 'react-router-dom';

import {
  ClipboardCheck,
  Search,
} from 'lucide-react';

import {
  useSubmittedProjects,
  useVerificationStatistics,
} from '../api/projectVerification.js';

export function ProjectVerification() {
  const {
    data: statistics,
    isLoading: loadingStats,
  } = useVerificationStatistics();

  const {
    data: projects = [],
    isLoading,
  } = useSubmittedProjects();

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          Project Verification
        </h1>

        <p className="text-slate-500">
          Review submitted project applications before final registration.
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-4">

        <StatCard
          title="Pending"
          value={
            loadingStats
              ? '...'
              : statistics?.pending ?? 0
          }
        />

        <StatCard
          title="Verified"
          value={
            loadingStats
              ? '...'
              : statistics?.verified ?? 0
          }
        />

        <StatCard
          title="Returned"
          value={
            loadingStats
              ? '...'
              : statistics?.returned ?? 0
          }
        />

        <StatCard
          title="Registered"
          value={
            loadingStats
              ? '...'
              : statistics?.registered ?? 0
          }
        />

      </div>

      <div className="rounded-lg border bg-white">

        <div className="flex items-center justify-between border-b p-4">

          <h2 className="font-semibold">
            Submitted Projects
          </h2>

          <div className="relative">

            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={16}
            />

            <input
              placeholder="Search..."
              className="rounded border pl-9 pr-3 py-2"
            />

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full">

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
                  Submitted
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {isLoading ? (
                <tr>

                  <td
                    colSpan="6"
                    className="p-6 text-center"
                  >
                    Loading...
                  </td>

                </tr>
                              ) : projects.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="p-6 text-center text-slate-500"
                  >
                    No submitted projects.
                  </td>

                </tr>

              ) : (

                projects.map(
                  (project) => (

                    <tr
                      key={project._id}
                      className="border-t"
                    >

                      <td className="px-4 py-3">
                        {project.projectName}
                      </td>

                      <td className="px-4 py-3">
                        {
                          project
                            .submittingInstitution
                            ?.institutionName
                        }
                      </td>

                      <td className="px-4 py-3">
                        {project.sector}
                      </td>

                      <td className="px-4 py-3">
                        {project.submittedAt
                          ? new Date(
                              project.submittedAt
                            ).toLocaleDateString()
                          : '-'}
                      </td>

                      <td className="px-4 py-3">

                        <span className="rounded bg-amber-100 px-2 py-1 text-xs">

                          {
                            project.registrationStatus
                          }

                        </span>

                      </td>

                      <td className="px-4 py-3 text-center">

                        <Link
                          to={`/project-verification/${project._id}`}
                          className="inline-flex items-center gap-2 rounded bg-civic px-3 py-2 text-sm font-medium text-white"
                        >

                          <ClipboardCheck
                            size={16}
                          />

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
}) {
  return (
    <div className="rounded-lg border bg-white p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {value}
      </h2>

    </div>
  );
}