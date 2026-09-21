import {
  Archive,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileText,
  FolderKanban,
  Plus,
  Search,
  Upload,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  archiveMinistryProject,
  getMinistryProjects,
  getMinistryProjectStatistics,
  publishMinistryProject,
  unpublishMinistryProject,
} from '../api/ministryProjects.js';

import {
  Permissions,
  hasPermission,
} from '../auth/permissions.js';

function getStoredUser() {
  try {
    const value =
      localStorage.getItem(
        'jdpcmeris_user'
      );

    return value
      ? JSON.parse(value)
      : null;
  } catch {
    return null;
  }
}

export function MinistryProjects() {
  const user =
    getStoredUser();

  const [projects, setProjects] =
    useState([]);

  const [statistics, setStatistics] =
    useState({
      total: 0,
      planned: 0,
      ongoing: 0,
      completed: 0,
      published: 0,
      drafts: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
    useState('');

  const [
    publicationStatus,
    setPublicationStatus,
  ] = useState('');

  const canCreate =
    hasPermission(
      user,
      Permissions.MINISTRY_PROJECT_CREATE
    );

  const canUpdate =
    hasPermission(
      user,
      Permissions.MINISTRY_PROJECT_UPDATE
    );

  const canPublish =
    hasPermission(
      user,
      Permissions.MINISTRY_PROJECT_PUBLISH
    );

  const canArchive =
    hasPermission(
      user,
      Permissions.MINISTRY_PROJECT_ARCHIVE
    );

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [
        projectResponse,
        statisticsResponse,
      ] = await Promise.all([
        getMinistryProjects(),
        getMinistryProjectStatistics(),
      ]);

      setProjects(
        Array.isArray(
          projectResponse?.data
        )
          ? projectResponse.data
          : []
      );

      setStatistics({
        total:
          statisticsResponse
            ?.data?.total || 0,

        planned:
          statisticsResponse
            ?.data?.planned || 0,

        ongoing:
          statisticsResponse
            ?.data?.ongoing || 0,

        completed:
          statisticsResponse
            ?.data?.completed || 0,

        published:
          statisticsResponse
            ?.data?.published || 0,

        drafts:
          statisticsResponse
            ?.data?.drafts || 0,
      });
    } catch (requestError) {
      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        requestError.message ||
        'Unable to load Ministry projects.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProjects =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return projects.filter(
        (project) => {
          const matchesSearch =
            !query ||
            [
              project.title,
              project.shortTitle,
              project.projectCode,
              project.primarySector,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(query)
              );

          const matchesStatus =
            !status ||
            project.status ===
              status;

          const matchesPublication =
            !publicationStatus ||
            project
              .publicationStatus ===
              publicationStatus;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPublication
          );
        }
      );
    }, [
      projects,
      search,
      status,
      publicationStatus,
    ]);

  async function handlePublish(
    project
  ) {
    const confirmed =
      window.confirm(
        `Publish "${project.title}" on the public Ministry website?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await publishMinistryProject(
        project._id
      );

      await loadData();
    } catch (requestError) {
      window.alert(
        requestError
          ?.response
          ?.data
          ?.message ||
        'Unable to publish project.'
      );
    }
  }

  async function handleUnpublish(
    project
  ) {
    const confirmed =
      window.confirm(
        `Move "${project.title}" back to Draft?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await unpublishMinistryProject(
        project._id
      );

      await loadData();
    } catch (requestError) {
      window.alert(
        requestError
          ?.response
          ?.data
          ?.message ||
        'Unable to unpublish project.'
      );
    }
  }

  async function handleArchive(
    project
  ) {
    const confirmed =
      window.confirm(
        `Archive "${project.title}"? It will no longer appear on the public website.`
      );

    if (!confirmed) {
      return;
    }

    try {
      await archiveMinistryProject(
        project._id
      );

      await loadData();
    } catch (requestError) {
      window.alert(
        requestError
          ?.response
          ?.data
          ?.message ||
        'Unable to archive project.'
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Ministry Website
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Projects Portal
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Manage the Ministry&apos;s
            public project portfolio.
            Draft projects remain internal
            until they are published.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => {
              window.location.assign(
                '/ministry-projects/new'
              );
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <Plus size={18} />

            Add New Project
          </button>
        )}
      </div>

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Total"
          value={statistics.total}
          icon={FolderKanban}
        />

        <StatCard
          label="Ongoing"
          value={statistics.ongoing}
          icon={Clock3}
        />

        <StatCard
          label="Planned"
          value={statistics.planned}
          icon={FileText}
        />

        <StatCard
          label="Completed"
          value={statistics.completed}
          icon={CheckCircle2}
        />

        <StatCard
          label="Published"
          value={statistics.published}
          icon={Upload}
        />

        <StatCard
          label="Drafts"
          value={statistics.drafts}
          icon={Edit3}
        />
      </div>

      {/* Filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search projects..."
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700"
          >
            <option value="">
              All Statuses
            </option>

            <option value="Ongoing">
              Ongoing
            </option>

            <option value="Planned">
              Planned
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

          <select
            value={
              publicationStatus
            }
            onChange={(event) =>
              setPublicationStatus(
                event.target.value
              )
            }
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700"
          >
            <option value="">
              All Publication
            </option>

            <option value="Draft">
              Draft
            </option>

            <option value="Published">
              Published
            </option>

            <option value="Archived">
              Archived
            </option>
          </select>
        </div>
      </div>
            {/* Project List */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Ministry Projects
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {
              filteredProjects.length
            }{" "}
            project
            {filteredProjects.length ===
            1
              ? ""
              : "s"}
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading projects...
          </div>
        ) : error ? (
          <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : filteredProjects.length ===
          0 ? (
          <div className="px-6 py-14 text-center">
            <FolderKanban
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No Ministry projects found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create the first project
              to begin managing the
              Ministry&apos;s public
              project portfolio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <TableHeading>
                    Project
                  </TableHeading>

                  <TableHeading>
                    Sector
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <TableHeading>
                    Progress
                  </TableHeading>

                  <TableHeading>
                    Publication
                  </TableHeading>

                  <TableHeading>
                    Actions
                  </TableHeading>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProjects.map(
                  (project) => (
                    <tr
                      key={project._id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="min-w-[280px] px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {project.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {project.projectCode ||
                            project.shortTitle ||
                            "No project code"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {project.primarySector ||
                          "—"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          value={
                            project.status
                          }
                        />
                      </td>

                      <td className="min-w-[150px] px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-600"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(
                                      project.overallProgress ||
                                        0
                                    )
                                  )
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs font-semibold text-slate-600">
                            {Number(
                              project.overallProgress ||
                                0
                            )}
                            %
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <PublicationBadge
                          value={
                            project.publicationStatus
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              window.location.assign(
                                `/ministry-projects/${project._id}`
                              )
                            }
                            title="View Project"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                          >
                            <Eye
                              size={16}
                            />
                          </button>

                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() =>
                                window.location.assign(
                                  `/ministry-projects/${project._id}/edit`
                                )
                              }
                              title="Edit Project"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                            >
                              <Edit3
                                size={16}
                              />
                            </button>
                          )}

                          {canPublish &&
                            project.publicationStatus !==
                              "Published" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handlePublish(
                                    project
                                  )
                                }
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Publish
                              </button>
                            )}

                          {canPublish &&
                            project.publicationStatus ===
                              "Published" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleUnpublish(
                                    project
                                  )
                                }
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                              >
                                Unpublish
                              </button>
                            )}

                          {canArchive &&
                            project.publicationStatus !==
                              "Archived" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleArchive(
                                    project
                                  )
                                }
                                title="Archive Project"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                              >
                                <Archive
                                  size={16}
                                />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}) {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function TableHeading({
  children,
}) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
    >
      {children}
    </th>
  );
}

function StatusBadge({
  value,
}) {
  const classes = {
    Ongoing:
      "bg-emerald-50 text-emerald-700",
    Planned:
      "bg-sky-50 text-sky-700",
    Completed:
      "bg-indigo-50 text-indigo-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        classes[value] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {value || "—"}
    </span>
  );
}

function PublicationBadge({
  value,
}) {
  const classes = {
    Published:
      "bg-emerald-50 text-emerald-700",
    Draft:
      "bg-amber-50 text-amber-700",
    Archived:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        classes[value] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {value || "Draft"}
    </span>
  );
}

export default MinistryProjects;