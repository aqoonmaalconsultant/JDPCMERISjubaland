import { Link } from 'react-router-dom';

import {
  Eye,
  FolderCheck,
} from 'lucide-react';

import {
  useRegisteredProjectStatistics,
  useRegisteredProjects,
} from '../api/registeredProjects.js';

export function RegisteredProjects() {
  const {
    data: statistics,
    isLoading: statisticsLoading,
  } =
    useRegisteredProjectStatistics();

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } =
    useRegisteredProjects();

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          Registered Projects
        </h1>

        <p className="text-slate-500">
          Officially registered projects.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-1">

        <div className="rounded-lg border bg-white p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Total Registered
              </p>

              <p className="mt-2 text-3xl font-bold">
                {statisticsLoading
                  ? '...'
                  : statistics?.total || 0}
              </p>

            </div>

            <FolderCheck
              size={34}
            />

          </div>

        </div>

      </div>

      <div className="overflow-hidden rounded-lg border bg-white">

        <div className="border-b px-6 py-4">

          <h2 className="text-lg font-semibold">
            Registered Projects
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Application No.
                </th>

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
                  Registered
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
                    colSpan={6}
                    className="px-6 py-10 text-center"
                  >
                    Loading...
                  </td>

                </tr>

              ) : projects.length === 0 ? (

                <tr>

                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No registered projects.
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
                        {project.applicationNumber}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {project.projectName}
                      </td>

                      <td className="px-4 py-3">
                        {project.submittingInstitution
                          ?.institutionName || '-'}
                      </td>

                      <td className="px-4 py-3">
                        {project.sector}
                      </td>

                      <td className="px-4 py-3">
                        {project.registeredAt
                          ? new Date(
                              project.registeredAt
                            ).toLocaleDateString()
                          : '-'}
                      </td>

                      <td className="px-4 py-3">

                        <Link
                          to={`/registered-projects/${project._id}`}
                          className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                        >

                          <Eye size={16} />

                          View

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