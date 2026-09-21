import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  getPublicMinistryProjects,
} from "../api/ministryProjects";

function ProjectDashboardPage({
  listingOnly = false,
  pageTitle = "Project Dashboard",
  pageDescription = "Explore projects facilitated, coordinated, and managed by the Ministry of Planning, Investment and International Cooperation, Jubaland.",
}) {
  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [sector, setSector] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Published Projects
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getPublicMinistryProjects();

        if (active) {
          setProjects(
            Array.isArray(response?.data)
              ? response.data
              : []
          );
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message ||
              "Unable to load projects."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Dashboard Statistics
  |--------------------------------------------------------------------------
  */

  const statistics =
    useMemo(() => {
      return {
        total:
          projects.length,

        ongoing:
          projects.filter(
            (project) =>
              project.status ===
              "Ongoing"
          ).length,

        planned:
          projects.filter(
            (project) =>
              project.status ===
              "Planned"
          ).length,

        completed:
          projects.filter(
            (project) =>
              project.status ===
              "Completed"
          ).length,
      };
    }, [projects]);

  /*
  |--------------------------------------------------------------------------
  | Available Sectors
  |--------------------------------------------------------------------------
  */

  const sectors =
    useMemo(() => {
      const values =
        new Set();

      projects.forEach(
        (project) => {
          if (
            project.primarySector
          ) {
            values.add(
              project.primarySector
            );
          }

          (
            project.sectors || []
          ).forEach(
            (item) => {
              if (item) {
                values.add(item);
              }
            }
          );
        }
      );

      return Array.from(
        values
      ).sort();
    }, [projects]);

  /*
  |--------------------------------------------------------------------------
  | All Projects Filters
  |--------------------------------------------------------------------------
  */

  const filteredProjects =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return projects.filter(
        (project) => {
          const matchesSearch =
            !normalizedSearch ||
            [
              project.title,
              project.shortTitle,
              project.projectCode,
              project.overview,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              );

          const matchesStatus =
            !status ||
            project.status ===
              status;

          const matchesSector =
            !sector ||
            project.primarySector ===
              sector ||
            (
              project.sectors ||
              []
            ).includes(sector);

          return (
            matchesSearch &&
            matchesStatus &&
            matchesSector
          );
        }
      );
    }, [
      projects,
      search,
      status,
      sector,
    ]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/*
      |--------------------------------------------------------------------------
      | Hero
      |--------------------------------------------------------------------------
      */}

      <section className="bg-emerald-800 text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Ministry Projects
          </p>

          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white md:text-4xl">
            {pageTitle}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-100">
            {pageDescription}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        {/*
        |--------------------------------------------------------------------------
        | PROJECT DASHBOARD
        |--------------------------------------------------------------------------
        */}

        {!listingOnly && (
          <>
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Projects"
                value={
                  statistics.total
                }
                icon={
                  FolderKanban
                }
              />

              <StatCard
                title="Ongoing Projects"
                value={
                  statistics.ongoing
                }
                icon={
                  Clock3
                }
              />

              <StatCard
                title="Planned Projects"
                value={
                  statistics.planned
                }
                icon={
                  FolderKanban
                }
              />

              <StatCard
                title="Completed Projects"
                value={
                  statistics.completed
                }
                icon={
                  CheckCircle2
                }
              />
            </section>

            {/*
            |--------------------------------------------------------------------------
            | Dashboard Introduction
            |--------------------------------------------------------------------------
            */}

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
                    Project Portfolio
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Ministry Project Overview
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    The dashboard provides
                    an overview of published
                    Ministry projects,
                    including ongoing,
                    planned, and completed
                    initiatives.
                  </p>
                </div>

                <Link
                  to="/projects"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  View All Projects

                  <ArrowRight
                    size={17}
                  />
                </Link>
              </div>
            </section>
          </>
        )}

        {/*
        |--------------------------------------------------------------------------
        | ALL PROJECTS
        |--------------------------------------------------------------------------
        */}

        {listingOnly && (
          <>
            {/*
            |--------------------------------------------------------------------------
            | Search & Filters
            |--------------------------------------------------------------------------
            */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px_240px]">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search projects..."
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <select
                  value={status}
                  onChange={(
                    event
                  ) =>
                    setStatus(
                      event.target
                        .value
                    )
                  }
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-600"
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
                  value={sector}
                  onChange={(
                    event
                  ) =>
                    setSector(
                      event.target
                        .value
                    )
                  }
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:border-emerald-600"
                >
                  <option value="">
                    All Sectors
                  </option>

                  {sectors.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>
            </section>

            {/*
            |--------------------------------------------------------------------------
            | Project Directory
            |--------------------------------------------------------------------------
            */}

            <section className="mt-10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    All Projects
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      filteredProjects.length
                    }{" "}
                    project
                    {filteredProjects.length ===
                    1
                      ? ""
                      : "s"}{" "}
                    found
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                  Loading projects...
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {error}
                </div>
              ) : filteredProjects.length ===
                0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                  <FolderKanban
                    size={42}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-4 text-lg font-semibold text-slate-800">
                    No projects found
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Published Ministry
                    projects will appear
                    here automatically
                    once they are added
                    through the Projects
                    Portal.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProjects.map(
                    (project) => (
                      <ProjectCard
                        key={
                          project._id
                        }
                        project={
                          project
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Statistic Card
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  icon,
}) {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Public Project Card
|--------------------------------------------------------------------------
*/

function ProjectCard({
  project,
}) {
  const coverImage =
    project.media?.coverImage;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="h-52 bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <FolderKanban
              size={44}
            />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {project.status}
          </span>

          {project.primarySector && (
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              {
                project.primarySector
              }
            </span>
          )}
        </div>

        <h3 className="mt-4 line-clamp-2 text-xl font-bold leading-7 text-slate-900">
          {project.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {project.overview}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>
              Progress
            </span>

            <span>
              {Number(
                project.overallProgress ||
                  0
              )}
              %
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
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
        </div>

        <Link
          to={`/projects/${project.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
        >
          View Project

          <ArrowRight
            size={16}
          />
        </Link>
      </div>
    </article>
  );
}

export default ProjectDashboardPage;