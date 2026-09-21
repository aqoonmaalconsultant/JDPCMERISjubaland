import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FolderOpen,
  Globe2,
  Search,
  UsersRound,
} from 'lucide-react';

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import ProjectStatusChart from '../components/dashboard/ProjectStatusChart.jsx';
import SectorChart from '../components/dashboard/SectorChart.jsx';
import RegionChart from '../components/dashboard/RegionChart.jsx';
import DistrictChart from '../components/dashboard/DistrictChart.jsx';

import {
  getPublicProjects,
  getPublicProjectStatistics,
} from '../api/publicProjects.js';

/*
|--------------------------------------------------------------------------
| CSV Helpers
|--------------------------------------------------------------------------
*/

function csvValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  const text =
    String(value);

  return /[",\n]/.test(text)
    ? `"${text.replace(
        /"/g,
        '""'
      )}"`
    : text;
}

function downloadPublicProjectsCsv(
  projects
) {
  const rows = [
    [
      'Project Code',
      'Project Name',
      'Status',
      'Sector',
      'Institution',
      'Funder',
      'Location',
      'Progress',
      'Beneficiaries',
    ],

    ...projects.map(
      (project) => [
        project.id || '',
        project.name || '',
        project.status || '',
        project.sector || '',

        project.institutionSummary ||
          project.institution ||
          '',

        project.fundedBy ||
          project.donor ||
          '',

        project.locationSummary ||
          [
            project.district,
            project.region,
          ]
            .filter(Boolean)
            .join(', '),

        project.progress || 0,

        project.beneficiaries
          ?.individuals || 0,
      ]
    ),
  ];

  const blob =
    new Blob(
      [
        rows
          .map((row) =>
            row
              .map(csvValue)
              .join(',')
          )
          .join('\n'),
      ],
      {
        type:
          'text/csv;charset=utf-8',
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      'a'
    );

  link.href = url;

  link.download =
    'jaims-public-projects.csv';

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

/*
|--------------------------------------------------------------------------
| Public Dashboard
|--------------------------------------------------------------------------
*/

export function PublicPortal() {
  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    statistics,
    setStatistics,
  ] = useState(null);

  const [
    isFetching,
    setIsFetching,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    status,
    setStatus,
  ] = useState('');

  const [
    region,
    setRegion,
  ] = useState('');

  const [
    sector,
    setSector,
  ] = useState('');

  const [
    exportError,
    setExportError,
  ] = useState('');

  /*
  |--------------------------------------------------------------------------
  | Load Public Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setIsFetching(true);
        setLoadError('');

        const [
          projectsResponse,
          statisticsResponse,
        ] =
          await Promise.all([
            getPublicProjects(),

            getPublicProjectStatistics(),
          ]);

        if (!active) {
          return;
        }

        setProjects(
          Array.isArray(
            projectsResponse?.data
          )
            ? projectsResponse.data
            : []
        );

        setStatistics(
          statisticsResponse?.data ||
            null
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setProjects([]);
        setStatistics(null);

        setLoadError(
          error?.message ||
            'Unable to load public JAIMS project information.'
        );
      } finally {
        if (active) {
          setIsFetching(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Dashboard Data
  |--------------------------------------------------------------------------
  */

  const overview =
    statistics?.overview || {};

  const rawPortfolio =
    statistics?.portfolio || {};

  /*
  |--------------------------------------------------------------------------
  | Normalize Public Status Labels
  |--------------------------------------------------------------------------
  |
  | Official Project uses:
  | Planning / Active
  |
  | Existing Executive chart uses:
  | Planned / Ongoing
  |
  */

  const portfolio =
    useMemo(
      () => ({
        ...rawPortfolio,

        implementationStatus:
          (
            rawPortfolio
              .implementationStatus ||
            []
          ).map((item) => ({
            ...item,

            _id:
              item._id ===
              'Planning'
                ? 'Planned'
                : item._id ===
                    'Active'
                  ? 'Ongoing'
                  : item._id,
          })),
      }),
      [rawPortfolio]
    );

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const regions =
    useMemo(
      () => [
        ...new Set(
          projects
            .flatMap(
              (project) =>
                (
                  project.locations ||
                  []
                ).map(
                  (location) =>
                    location.region
                )
            )
            .filter(Boolean)
        ),
      ],
      [projects]
    );

  const sectors =
    useMemo(
      () => [
        ...new Set(
          projects
            .map(
              (project) =>
                project.sector
            )
            .filter(Boolean)
        ),
      ],
      [projects]
    );

  const statuses =
    useMemo(
      () => [
        ...new Set(
          projects
            .map(
              (project) =>
                project.status
            )
            .filter(Boolean)
        ),
      ],
      [projects]
    );

  const filteredProjects =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return projects.filter(
        (project) => {
          const matchesSearch =
            !term ||
            [
              project.name,
              project.id,
              project.sector,

              project
                .institutionSummary,

              project.institution,

              project.fundedBy,

              project.donor,

              project
                .locationSummary,

              project.region,

              project.district,
            ].some((value) =>
              String(
                value || ''
              )
                .toLowerCase()
                .includes(term)
            );

          const matchesStatus =
            !status ||
            project.status ===
              status;

          const matchesSector =
            !sector ||
            project.sector ===
              sector;

          const matchesRegion =
            !region ||
            (
              project.locations ||
              []
            ).some(
              (location) =>
                location.region ===
                region
            );

          return (
            matchesSearch &&
            matchesStatus &&
            matchesSector &&
            matchesRegion
          );
        }
      );
    }, [
      projects,
      region,
      search,
      sector,
      status,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Map
  |--------------------------------------------------------------------------
  */

  const mapPoints =
    useMemo(
      () =>
        filteredProjects.flatMap(
          (project) =>
            (
              project.locations ||
              []
            )
              .filter(
                (location) =>
                  Array.isArray(
                    location.coordinates
                  ) &&
                  location
                    .coordinates
                    .length >= 2 &&
                  Number.isFinite(
                    location
                      .coordinates[0]
                  ) &&
                  Number.isFinite(
                    location
                      .coordinates[1]
                  )
              )
              .map(
                (
                  location,
                  index
                ) => ({
                  id:
                    `${
                      project.rawId ||
                      project.id
                    }-${index}`,

                  project,

                  position:
                    location.coordinates,

                  locationName:
                    [
                      location.siteName,
                      location.district,
                      location.region,
                    ]
                      .filter(Boolean)
                      .join(', '),
                })
              )
        ),
      [filteredProjects]
    );

  /*
  |--------------------------------------------------------------------------
  | CSV
  |--------------------------------------------------------------------------
  */

  const exportCsv = () => {
    setExportError('');

    try {
      downloadPublicProjectsCsv(
        filteredProjects
      );
    } catch {
      setExportError(
        'Could not export public projects.'
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    isFetching &&
    !projects.length
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-civic" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading JAIMS
            Projects Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-ink">
      {/* Hero */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-civic text-white">
              <Globe2
                size={23}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic">
                JAIMS Public Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Projects Dashboard
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Public overview of
                registered development
                projects coordinated
                through the Jubaland Aid
                Information Management
                System.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                exportCsv
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Download
                size={16}
              />

              Export Public Data
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 md:px-8">
        {loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        ) : null}

        {exportError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {exportError}
          </div>
        ) : null}

        {/* Public KPIs */}

        <section>
          <SectionHeading
            title="Project Portfolio Overview"
            description="Key public indicators for officially registered JAIMS projects."
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <PublicMetricCard
              title="Registered Projects"
              value={
                overview
                  .totalProjects ??
                projects.length
              }
              icon={FolderOpen}
            />

            <PublicMetricCard
              title="Planning"
              value={
                overview
                  .implementation
                  ?.planned ?? 0
              }
              icon={Clock3}
            />

            <PublicMetricCard
              title="Active"
              value={
                overview
                  .implementation
                  ?.ongoing ?? 0
              }
              icon={Activity}
            />

            <PublicMetricCard
              title="Completed"
              value={
                overview
                  .implementation
                  ?.completed ?? 0
              }
              icon={
                CheckCircle2
              }
            />

            <PublicMetricCard
              title="Beneficiaries"
              value={Number(
                overview
                  .totalBeneficiaries ??
                  0
              ).toLocaleString()}
              icon={UsersRound}
            />

            <PublicMetricCard
              title="Avg Progress"
              value={`${Number(
                overview
                  .averageProgress ??
                  0
              )}%`}
              icon={BarChart3}
            />
          </div>
        </section>

        {/* Project Reports */}

        <section>
          <SectionHeading
            title="Project Portfolio Report"
            description="Distribution of registered projects by implementation status, sector and geographic coverage."
          />

          <div className="mt-4 grid gap-6 xl:grid-cols-2">
            <ProjectStatusChart
              data={portfolio}
            />

            <SectorChart
              data={portfolio}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <RegionChart
              data={portfolio}
            />

            <DistrictChart
              data={portfolio}
            />
          </div>
        </section>

        {/* Project Directory */}

        <section>
          <SectionHeading
            title="Registered Projects"
            description="Browse publicly available information for projects registered through JAIMS."
          />

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px_190px_auto]">
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
                <Search
                  size={18}
                  className="shrink-0 text-slate-400"
                />

                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search projects, institutions, sectors..."
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <select
                className={selectClass}
                value={region}
                onChange={(
                  event
                ) =>
                  setRegion(
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  All Regions
                </option>

                {regions.map(
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

              <select
                className={selectClass}
                value={sector}
                onChange={(
                  event
                ) =>
                  setSector(
                    event.target
                      .value
                  )
                }
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

              <select
                className={selectClass}
                value={status}
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  All Statuses
                </option>

                {statuses.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {publicStatusLabel(
                        item
                      )}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setRegion('');
                  setSector('');
                  setStatus('');
                }}
                className="h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-semibold text-slate-800">
                {
                  filteredProjects.length
                }
              </span>{' '}
              registered project
              {filteredProjects.length ===
              1
                ? ''
                : 's'}
            </p>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map(
              (project) => (
                <PublicProjectCard
                  key={
                    project.rawId ||
                    project.id
                  }
                  project={
                    project
                  }
                />
              )
            )}

            {!filteredProjects.length ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm md:col-span-2 xl:col-span-3">
                No projects match
                the selected public
                filters.
              </div>
            ) : null}
          </div>
        </section>

        {/* Map - intentionally after dashboard/report and directory */}

        <section>
          <SectionHeading
            title="Project Map"
            description="Geographic distribution of registered JAIMS project locations with available GPS coordinates."
          />

          {mapPoints.length ? (
            <div className="mt-4 h-[500px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <MapContainer
                center={[
                  1.5,
                  42.8,
                ]}
                zoom={7}
                scrollWheelZoom={
                  false
                }
                className="h-full w-full"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mapPoints.map(
                  (point) => (
                    <Marker
                      key={
                        point.id
                      }
                      position={
                        point.position
                      }
                    >
                      <Popup>
                        <div className="min-w-[200px] space-y-2">
                          <p className="font-semibold">
                            {
                              point
                                .project
                                .name
                            }
                          </p>

                          <p className="text-sm">
                            {
                              point.locationName
                            }
                          </p>

                          <p className="text-sm">
                            {Number(
                              point
                                .project
                                .progress ||
                                0
                            )}
                            % complete
                          </p>

                          {point
                            .project
                            .institution ? (
                            <p className="text-sm">
                              {
                                point
                                  .project
                                  .institution
                              }
                            </p>
                          ) : null}
                        </div>
                      </Popup>
                    </Marker>
                  )
                )}
              </MapContainer>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              No project GPS
              locations are currently
              available for the
              selected projects.
            </div>
          )}
        </section>

        {/* Public information notice */}

        <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-500 shadow-sm">
          <p className="font-semibold text-slate-800">
            Public Information
            Notice
          </p>

          <p className="mt-1">
            This dashboard presents
            approved public project
            information from JAIMS.
            Financial records,
            internal documents,
            verification workflows,
            administrative notes and
            other restricted
            government information
            are not included.
          </p>
        </section>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Public Metric Card
|--------------------------------------------------------------------------
*/

function PublicMetricCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-civic">
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| Public Project Card
|--------------------------------------------------------------------------
*/

function PublicProjectCard({
  project,
}) {
  const progress =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          project.progress || 0
        )
      )
    );

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-civic">
            {project.id ||
              'Registered Project'}
          </p>

          <h3 className="mt-2 text-lg font-bold leading-6 text-slate-900">
            {project.name}
          </h3>
        </div>

        <PublicStatusBadge
          status={
            project.status
          }
        />
      </div>

      {project.description ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {project.description}
        </p>
      ) : null}

      <div className="mt-4 space-y-2 text-sm">
        <InfoRow
          label="Sector"
          value={
            project.sector ||
            'Not specified'
          }
        />

        <InfoRow
          label="Institution"
          value={
            project
              .institutionSummary ||
            project.institution ||
            'Not specified'
          }
        />

        <InfoRow
          label="Funder"
          value={
            project.fundedBy ||
            project.donor ||
            'Not specified'
          }
        />

        <InfoRow
          label="Location"
          value={
            project.locationSummary ||
            [
              project.district,
              project.region,
            ]
              .filter(Boolean)
              .join(', ') ||
            'Not specified'
          }
        />

        <InfoRow
          label="Beneficiaries"
          value={Number(
            project
              .beneficiaries
              ?.individuals ||
              0
          ).toLocaleString()}
        />
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            Implementation
            Progress
          </span>

          <span className="font-bold text-slate-800">
            {progress}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-civic"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>
    </article>
  );
}

/*
|--------------------------------------------------------------------------
| Small UI Helpers
|--------------------------------------------------------------------------
*/

function SectionHeading({
  title,
  description,
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="grid grid-cols-[95px_1fr] gap-3">
      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-medium text-slate-700">
        {value}
      </span>
    </div>
  );
}

function publicStatusLabel(
  status
) {
  if (
    status === 'Planning'
  ) {
    return 'Planned';
  }

  if (
    status === 'Active'
  ) {
    return 'Ongoing';
  }

  return (
    status ||
    'Unknown'
  );
}

function PublicStatusBadge({
  status,
}) {
  const label =
    publicStatusLabel(
      status
    );

  const classes = {
    Planned:
      'bg-amber-50 text-amber-700',

    Ongoing:
      'bg-emerald-50 text-emerald-700',

    Completed:
      'bg-blue-50 text-blue-700',

    'On Hold':
      'bg-orange-50 text-orange-700',

    Cancelled:
      'bg-red-50 text-red-700',
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
        classes[label] ||
        'bg-slate-100 text-slate-600'
      }`}
    >
      {label}
    </span>
  );
}

const selectClass =
  'h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-civic';