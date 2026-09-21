import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  FolderKanban,
  Goal,
  MapPin,
  Target,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getPublicMinistryProject,
} from "../api/ministryProjects";

/*
|--------------------------------------------------------------------------
| Project Detail Page
|--------------------------------------------------------------------------
*/

export default function ProjectDetailPage() {
  const { projectId } =
    useParams();

  const [project, setProject] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Published Project
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let active = true;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getPublicMinistryProject(
            projectId
          );

        if (!active) {
          return;
        }

        setProject(
          response?.data || null
        );
      } catch (requestError) {
        if (!active) {
          return;
        }

        setProject(null);

        setError(
          requestError?.message ||
            "Unable to load this project."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (projectId) {
      loadProject();
    }

    return () => {
      active = false;
    };
  }, [projectId]);

  /*
  |--------------------------------------------------------------------------
  | Geographic Coverage
  |--------------------------------------------------------------------------
  */

  const locations =
    useMemo(
      () =>
        Array.isArray(
          project
            ?.geographicCoverage
            ?.locations
        )
          ? project
              .geographicCoverage
              .locations
          : Array.isArray(
                project?.locations
              )
            ? project.locations
            : [],
      [project]
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-700" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading project...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error / Not Found
  |--------------------------------------------------------------------------
  */

  if (error || !project) {
    return (
      <main className="min-h-[70vh] bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <FolderKanban
              size={44}
              className="mx-auto text-slate-300"
            />

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Project Not Available
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              {error ||
                "This project could not be found or is not publicly available."}
            </p>

            <Link
              to="/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <ArrowLeft
                size={16}
              />

              Back to Projects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const progress =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          project.overallProgress ||
            0
        )
      )
    );

  const coverImage =
    project.media?.coverImage;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================================================================
          HERO
      ================================================================= */}

      <section className="bg-emerald-800 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            All Projects
          </Link>

          <div className="mt-7 max-w-5xl">
            <div className="flex flex-wrap gap-2">
              {project.status && (
                <StatusBadge
                  status={
                    project.status
                  }
                />
              )}

              {project.primarySector && (
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                  {
                    project.primarySector
                  }
                </span>
              )}

              {project.projectType && (
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                  {
                    project.projectType
                  }
                </span>
              )}
            </div>

            {project.projectCode && (
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">
                {
                  project.projectCode
                }
              </p>
            )}

            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              {project.title}
            </h1>

            {project.shortTitle && (
              <p className="mt-4 text-xl font-medium text-emerald-100">
                {
                  project.shortTitle
                }
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          MAIN CONTENT
      ================================================================= */}

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* ============================================================
              LEFT CONTENT
          ============================================================= */}

          <div className="space-y-7">
            {/* Cover Image */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={project.title}
                  className="max-h-[520px] w-full object-cover"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-slate-100 text-slate-300">
                  <FolderKanban
                    size={58}
                  />
                </div>
              )}
            </section>

            {/* Overview */}

            {project.overview && (
              <ContentSection
                title="Project Overview"
              >
                <p className="whitespace-pre-line text-[15px] leading-8 text-slate-600">
                  {
                    project.overview
                  }
                </p>
              </ContentSection>
            )}

            {/* Goal */}

            {project.goal && (
              <ContentSection
                title="Project Goal"
                icon={Goal}
              >
                <p className="whitespace-pre-line text-[15px] leading-8 text-slate-600">
                  {project.goal}
                </p>
              </ContentSection>
            )}

           {/* Objectives */}

{!!project.objectives?.length && (
  <ContentSection
    title="Project Objectives"
    icon={Target}
  >
    <div
      className={
        project.media?.objectiveImage
         ? "grid gap-8 lg:grid-cols-2 lg:items-stretch"
          : ""
      }
    >
     {/* LEFT: Objectives */}
<div className="flex h-full items-center">
  <div className="w-full">
    <BulletList
      items={project.objectives}
    />
  </div>
</div>

      {/* RIGHT: Objective Image */}
      {project.media?.objectiveImage && (
        <div className="min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            src={
              project.media.objectiveImage
            }
            alt={`${project.title} objectives`}
           className="h-full min-h-[420px] w-full object-cover"
          />
        </div>
      )}
    </div>
  </ContentSection>
)}

            {/* Target Groups */}

            {!!project.targetGroups
              ?.length && (
              <ContentSection
                title="Target Groups"
                icon={UsersRound}
              >
                <div className="flex flex-wrap gap-3">
                  {project.targetGroups.map(
                    (
                      target,
                      index
                    ) => (
                      <span
                        key={
                          target._id ||
                          index
                        }
                        className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
                      >
                        {getText(
                          target
                        )}
                      </span>
                    )
                  )}
                </div>
              </ContentSection>
            )}

           {/* Ministry Role */}

{!!project.ministryRole?.length && (
  <ContentSection
    title="Role of the Ministry"
    icon={Building2}
  >
    <BulletList
      items={project.ministryRole}
    />
  </ContentSection>
)}

            {/* Key Outputs */}

            {!!project.keyOutputs
              ?.length && (
              <ContentSection
                title="Key Outputs"
                icon={CheckCircle2}
              >
                <BulletList
                  items={
                    project.keyOutputs
                  }
                />
              </ContentSection>
            )}

            {/* Achievements */}

            {!!project.achievements
              ?.length && (
              <ContentSection
                title="Key Achievements"
                icon={CheckCircle2}
              >
                <BulletList
                  items={
                    project.achievements
                  }
                />
              </ContentSection>
            )}

         {/* Geographic Coverage */}

{(
  locations.length > 0 ||
  project.geographicCoverage?.description ||
  project.media?.geographyImage
) && (
  <ContentSection
    title="Geographic Coverage"
    icon={MapPin}
  >
    <div
      className={
        project.media?.geographyImage
          ? "grid gap-8 lg:grid-cols-2 lg:items-stretch"
          : ""
      }
    >
      {/* LEFT: Geographic Information */}

      <div className="flex h-full items-center">
        <div className="w-full">
          {project.geographicCoverage
            ?.description && (
            <p className="mb-5 whitespace-pre-line text-[15px] leading-8 text-slate-600">
              {
                project
                  .geographicCoverage
                  .description
              }
            </p>
          )}

          {locations.length > 0 && (
            <div className="grid gap-4">
              {locations.map(
                (
                  location,
                  index
                ) => (
                  <div
                    key={
                      location._id ||
                      index
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <MapPin
                          size={17}
                        />
                      </div>

                      <div className="space-y-1 text-sm">
                        {location.siteName && (
                          <p className="font-semibold text-slate-800">
                            {
                              location.siteName
                            }
                          </p>
                        )}

                        <p className="text-slate-600">
                          {[
                            location.village,
                            location.district,
                            location.region,
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                            "Project location"}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Geography Image */}

      {project.media?.geographyImage && (
        <div className="min-h-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <img
            src={
              project.media
                .geographyImage
            }
            alt={`${project.title} geographic coverage`}
            className="h-full min-h-[460px] w-full object-cover"
          />
        </div>
      )}
    </div>
  </ContentSection>
)}
           {/* Stakeholders */}

{!!project.stakeholders?.length && (
  <ContentSection
    title="Project Stakeholders"
    icon={Building2}
  >
    <div className="grid gap-4 md:grid-cols-2">
      {project.stakeholders.map(
        (stakeholder, index) => (
          <div
            key={
              stakeholder._id ||
              `${stakeholder.name}-${index}`
            }
            className="rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex items-start gap-4">
              {stakeholder.logoUrl ? (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                  <img
                    src={
                      stakeholder.logoUrl
                    }
                    alt={
                      stakeholder.name ||
                      "Stakeholder logo"
                    }
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Building2
                    size={26}
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                {stakeholder.type && (
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {stakeholder.type}
                  </span>
                )}

                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {stakeholder.name}
                </h3>

                {stakeholder.description && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {
                      stakeholder.description
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  </ContentSection>
)}
            {/* Gallery */}

            {!!project.media
              ?.gallery?.length && (
              <ContentSection
                title="Project Gallery"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.media.gallery.map(
                    (
                      image,
                      index
                    ) => {
                      const imageUrl =
                        typeof image ===
                        "string"
                          ? image
                          : image.url;

                      if (!imageUrl) {
                        return null;
                      }

                      return (
                        <img
                          key={
                            image._id ||
                            imageUrl ||
                            index
                          }
                          src={
                            imageUrl
                          }
                          alt={`${project.title} - ${index + 1}`}
                          className="h-64 w-full rounded-xl object-cover"
                        />
                      );
                    }
                  )}
                </div>
              </ContentSection>
            )}
          </div>

          {/* ============================================================
              RIGHT SIDEBAR
          ============================================================= */}

          <aside className="order-first grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* Progress */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-emerald-700">
                Implementation
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-4xl font-bold text-slate-900">
                  {progress}%
                </p>

                <span className="text-sm font-medium text-slate-500">
                  Progress
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            {/* Key Information */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Project Information
              </h2>

              <div className="mt-5 divide-y divide-slate-100">
                <InfoItem
                  label="Status"
                  value={
                    project.status
                  }
                />

                <InfoItem
                  label="Project Code"
                  value={
                    project.projectCode
                  }
                />

                <InfoItem
                  label="Project Type"
                  value={
                    project.projectType
                  }
                />

                <InfoItem
                  label="Primary Sector"
                  value={
                    project.primarySector
                  }
                />

                <InfoItem
                  label="Start Date"
                  value={formatDate(
                    project.startDate
                  )}
                />

                <InfoItem
                  label="End Date"
                  value={formatDate(
                    project.endDate
                  )}
                />
              </div>
            </div>

            {/* Additional Sectors */}

            {!!project.sectors
              ?.length && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">
                  Sectors
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.sectors.map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Back */}

            <Link
              to="/projects"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              <ArrowLeft
                size={17}
              />

              Back to All Projects
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

function ContentSection({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Icon size={20} />
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
          {title}
        </h2>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function BulletList({
  items = [],
}) {
  return (
    <div className="space-y-3">
      {items.map(
        (item, index) => (
          <div
            key={
              item?._id ||
              index
            }
            className="flex items-start gap-3"
          >
            <CircleDot
              size={17}
              className="mt-1 shrink-0 text-emerald-600"
            />

            <p className="text-[15px] leading-7 text-slate-600">
              {getText(item)}
            </p>
          </div>
        )
      )}
    </div>
  );
}

function ListCard({
  number,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">
          {number}
        </span>

        <p className="pt-1 text-sm leading-6 text-slate-600">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const styles = {
    Ongoing:
      "bg-emerald-500/20 text-emerald-50",

    Planned:
      "bg-amber-500/20 text-amber-50",

    Completed:
      "bg-sky-500/20 text-sky-50",

    "On Hold":
      "bg-orange-500/20 text-orange-50",

    Cancelled:
      "bg-red-500/20 text-red-50",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        styles[status] ||
        "bg-white/15 text-white"
      }`}
    >
      {status}
    </span>
  );
}

function StakeholderGroup({
  title,
  items = [],
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        {title}
      </p>

      <div className="mt-3 space-y-2">
        {items.map(
          (item, index) => (
            <p
              key={
                item?._id ||
                item?.name ||
                index
              }
              className="text-sm font-medium text-slate-700"
            >
              {stakeholderName(
                item
              )}
            </p>
          )
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getText(value) {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  return (
    value?.title ||
    value?.name ||
    value?.description ||
    value?.text ||
    ""
  );
}

function stakeholderName(
  value
) {
  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  return (
    value?.name ||
    value?.institutionName ||
    value?.organizationName ||
    value?.title ||
    ""
  );
}

function getStakeholders(
  project,
  type
) {
  const stakeholders =
    project?.stakeholders ||
    {};

  const possibleKeys = {
    funding: [
      "fundingPartners",
      "fundedBy",
      "funders",
    ],

    implementing: [
      "implementingPartners",
      "implementedBy",
      "implementers",
    ],

    supporting: [
      "supportingPartners",
      "supportedBy",
      "supporters",
    ],

    endUsers: [
      "endUsers",
      "beneficiaries",
    ],
  };

  for (const key of
    possibleKeys[type] || []) {
    const value =
      stakeholders[key] ??
      project[key];

    if (
      Array.isArray(value)
    ) {
      return value;
    }

    if (value) {
      return [value];
    }
  }

  return [];
}

function hasStakeholders(
  project
) {
  return [
    "funding",
    "implementing",
    "supporting",
    "endUsers",
  ].some(
    (type) =>
      getStakeholders(
        project,
        type
      ).length > 0
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}