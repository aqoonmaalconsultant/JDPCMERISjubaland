import { Link } from 'react-router-dom';

import {
  FolderKanban,
  Eye,
} from 'lucide-react';

import {
  useProjects,
  useProjectStatistics,
} from '../api/projects.js';

export function Projects() {
  const {
    data: statistics,
    isLoading: statisticsLoading,
  } = useProjectStatistics();

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useProjects();

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold">
          Projects
        </h1>

        <p className="text-slate-500">
          Official registered government projects.
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-4">

        <Card
          title="Total"
          value={
            statisticsLoading
              ? '...'
              : statistics?.total ?? 0
          }
        />

        <Card
          title="Planning"
          value={
            statisticsLoading
              ? '...'
              : statistics?.planning ?? 0
          }
        />

        <Card
          title="Active"
          value={
            statisticsLoading
              ? '...'
              : statistics?.active ?? 0
          }
        />

        <Card
          title="Completed"
          value={
            statisticsLoading
              ? '...'
              : statistics?.completed ?? 0
          }
        />

      </div>

      <div className="overflow-hidden rounded-lg border bg-white">

        <div className="border-b px-6 py-4">

          <h2 className="text-lg font-semibold">
            Project List
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Code
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
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Progress
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
                    colSpan={7}
                    className="px-6 py-10 text-center"
                  >
                    Loading...
                  </td>

                </tr>

              ) : projects.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No projects found.
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
                        {project.projectCode}
                      </td>

                      <td className="px-4 py-3">
                        {project.projectName}
                      </td>

                      <td className="px-4 py-3">
                        {project.institution?.institutionName || '-'}
                      </td>

                      <td className="px-4 py-3">
                        {project.sector}
                      </td>

                      <td className="px-4 py-3">
                        {project.implementationStatus}
                      </td>

                      <td className="px-4 py-3">
                        {project.overallProgress}%
                      </td>

                      <td className="px-4 py-3">

                        <Link
                          to={`/projects/${project._id}`}
                          className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-white"
                        >
                          <Eye size={16} />
                          Dashboard
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

function Card({
  title,
  value,
}) {
  return (
    <div className="rounded-lg border bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>

        </div>

        <FolderKanban size={32} />

      </div>

    </div>
  );
}