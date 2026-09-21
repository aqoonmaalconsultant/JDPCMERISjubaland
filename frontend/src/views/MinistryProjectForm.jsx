import {
  ArrowLeft,
  CalendarDays,
  Image,
  MapPinned,
  Save,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  createMinistryProject,
  getMinistryProject,
  updateMinistryProject,
  uploadMinistryProjectImage,
} from '../api/ministryProjects.js';

const initialForm = {
  projectCode: '',
  title: '',
  shortTitle: '',
  primarySector: '',
  projectType: '',
  status: 'Planned',
  overallProgress: 0,

  startDate: '',
  endDate: '',

  overview: '',
  goal: '',
  targetGroups: [''],

objectives: [
  {
    title: '',
    description: '',
    order: 0,
  },
],

components: [
  {
    title: '',
    description: '',
    order: 0,
  },
],

geographicCoverage: {
    description: '',
    locations: [
      {
        region: '',
        district: '',
        village: '',
        siteName: '',
        latitude: '',
        longitude: '',
      },
    ],
  },

  ministryRole: [''],
  keyOutputs: [''],
  achievements: [{ title: '', description: '', progress: 0, status: 'Not Started', order: 0 }],
 stakeholders: [
  {
    type: 'Partner',
    name: '',
    description: '',
    logoUrl: '',
    order: 0,
  },
],
  media: {
    coverImage: '',
    geographyImage: '',
    objectiveImage: '',
    gallery: [{ url: '', caption: '', altText: '', order: 0 }],
  },
  budget: '',
  currency: 'USD',
  showBudgetPublicly: false,
  publicationStatus: 'Draft',
  featured: false,
};

export default function MinistryProjectForm() {
  const navigate =
    useNavigate();
  const { projectId } =
    useParams();

  const isEditMode =
    Boolean(projectId);

  const [loading, setLoading] =
    useState(isEditMode);
  const [
    form,
    setForm,
  ] = useState(initialForm);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');
  const [
  uploadingImage,
  setUploadingImage,
] = useState('');

async function uploadProjectImage(
  file,
  onUploaded,
  uploadKey
) {
  if (!file) {
    return;
  }

  if (!isEditMode || !projectId) {
    setError(
      'Save the project as a draft first, then upload images.'
    );
    return;
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    setError(
      'Only JPG, PNG and WebP images are allowed.'
    );
    return;
  }

  if (
    file.size >
    10 * 1024 * 1024
  ) {
    setError(
      'Image must not exceed 10 MB.'
    );
    return;
  }

  try {
    setUploadingImage(
      uploadKey
    );

    setError('');

    const response =
      await uploadMinistryProjectImage(
        projectId,
        file
      );

    const url =
      response?.data?.url;

    if (!url) {
      throw new Error(
        'The server did not return an image URL.'
      );
    }

    onUploaded(url);
  } catch (requestError) {
    setError(
      requestError
        ?.response
        ?.data
        ?.message ||
        requestError
          ?.response
          ?.data
          ?.error ||
        requestError.message ||
        'Unable to upload image.'
    );
  } finally {
    setUploadingImage('');
  }
}

function handleMainImageUpload(
  file,
  field
) {
  return uploadProjectImage(
    file,

    (url) => {
      updateMediaField(
        field,
        url
      );
    },

    field
  );
}

function handleGalleryUpload(
  file,
  index
) {
  return uploadProjectImage(
    file,

    (url) => {
      updateGalleryImage(
        index,
        'url',
        url
      );
    },

    `gallery-${index}`
  );
}

function handleStakeholderLogoUpload(
  file,
  index
) {
  return uploadProjectImage(
    file,

    (url) => {
      updateStakeholder(
        index,
        'logoUrl',
        url
      );
    },

    `stakeholder-${index}`
  );
}

useEffect(() => {
  if (!isEditMode) {
    setLoading(false);
    return;
  }

  let active = true;

  async function loadProject() {
      try {
        setLoading(true);
        setError('');

        const response =
          await getMinistryProject(
            projectId
          );

        const project =
          response?.data ||
          response;

        if (!active) {
          return;
        }

        setForm({
          ...initialForm,
          ...project,

          projectCode:
            project.projectCode ||
            '',

          title:
            project.title ||
            '',

          shortTitle:
            project.shortTitle ||
            '',

          primarySector:
            project.primarySector ||
            '',

          projectType:
            project.projectType ||
            '',

          status:
            project.status ||
            'Planned',

          overallProgress:
            project.overallProgress ??
            0,

          startDate:
            project.startDate
              ? String(
                  project.startDate
                ).slice(0, 10)
              : '',

          endDate:
            project.endDate
              ? String(
                  project.endDate
                ).slice(0, 10)
              : '',

          overview:
            project.overview ||
            '',

          goal:
            project.goal ||
            '',

          targetGroups:
            Array.isArray(
              project.targetGroups
            ) &&
            project.targetGroups.length
              ? project.targetGroups
              : [''],
          objectives:
            Array.isArray(project.objectives) && project.objectives.length
              ? project.objectives.map((item, index) => ({
                  title: item.title || '',
                  description: item.description || '',
                  order: item.order ?? index,
                }))
              : [{ title: '', description: '', order: 0 }],

          components:
            Array.isArray(project.components) && project.components.length
              ? project.components.map((item, index) => ({
                  title: item.title || '',
                  description: item.description || '',
                  order: item.order ?? index,
                }))
              : [{ title: '', description: '', order: 0 }],

          ministryRole:
            Array.isArray(project.ministryRole) && project.ministryRole.length
              ? project.ministryRole : [''],

          keyOutputs:
            Array.isArray(project.keyOutputs) && project.keyOutputs.length
              ? project.keyOutputs : [''],

          achievements:
            Array.isArray(project.achievements) && project.achievements.length
              ? project.achievements.map((item, index) => ({
                  title: item.title || '',
                  description: item.description || '',
                  progress: item.progress ?? 0,
                  status: item.status || 'Not Started',
                  order: item.order ?? index,
                }))
              : [{ title: '', description: '', progress: 0, status: 'Not Started', order: 0 }],

          stakeholders:
  Array.isArray(
    project.stakeholders
  ) &&
  project.stakeholders.length
    ? project.stakeholders.map(
        (item, index) => ({
          type:
            item.type ||
            'Partner',

          name:
            item.name ||
            '',

          description:
            item.description ||
            '',

          logoUrl:
            item.logoUrl ||
            '',

          order:
            item.order ??
            index,
        })
      )
    : [
        {
          type: 'Partner',
          name: '',
          description: '',
          logoUrl: '',
          order: 0,
        },
      ],

          media: {
            coverImage: project.media?.coverImage || '',
            geographyImage: project.media?.geographyImage || '',
            objectiveImage: project.media?.objectiveImage || '',
            gallery:
              Array.isArray(project.media?.gallery) && project.media.gallery.length
                ? project.media.gallery.map((item, index) => ({
                    url: item.url || '',
                    caption: item.caption || '',
                    altText: item.altText || '',
                    order: item.order ?? index,
                  }))
                : [{ url: '', caption: '', altText: '', order: 0 }],
          },

          budget: project.budget ?? '',
          currency: project.currency || 'USD',
          showBudgetPublicly: Boolean(project.showBudgetPublicly),

          geographicCoverage: {
            description:
              project
                .geographicCoverage
                ?.description ||
              '',

            locations:
              Array.isArray(
                project
                  .geographicCoverage
                  ?.locations
              ) &&
              project
                .geographicCoverage
                .locations.length
                ? project
                    .geographicCoverage
                    .locations
                    .map(
                      (location) => ({
                        region:
                          location.region ||
                          '',

                        district:
                          location.district ||
                          '',

                        village:
                          location.village ||
                          '',

                        siteName:
                          location.siteName ||
                          '',

                        latitude:
                          location.latitude ??
                          '',

                        longitude:
                          location.longitude ??
                          '',
                      })
                    )
                : [
                    {
                      region: '',
                      district: '',
                      village: '',
                      siteName: '',
                      latitude: '',
                      longitude: '',
                    },
                  ],
          },

          publicationStatus:
            project
              .publicationStatus ||
            'Draft',

          featured:
            Boolean(
              project.featured
            ),
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            requestError.message ||
            'Unable to load project.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [
    isEditMode,
    projectId,
  ]);
  function updateField(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateCoverageDescription(
    value
  ) {
    setForm((current) => ({
      ...current,

      geographicCoverage: {
        ...current.geographicCoverage,
        description: value,
      },
    }));
  }

  function updateLocation(
    index,
    field,
    value
  ) {
    setForm((current) => {
      const locations = [
        ...current
          .geographicCoverage
          .locations,
      ];

      locations[index] = {
        ...locations[index],
        [field]: value,
      };

      return {
        ...current,

        geographicCoverage: {
          ...current.geographicCoverage,
          locations,
        },
      };
    });
  }

  function addLocation() {
    setForm((current) => ({
      ...current,

      geographicCoverage: {
        ...current.geographicCoverage,

        locations: [
          ...current
            .geographicCoverage
            .locations,

          {
            region: '',
            district: '',
            village: '',
            siteName: '',
            latitude: '',
            longitude: '',
          },
        ],
      },
    }));
  }

  function removeLocation(
    index
  ) {
    setForm((current) => {
      const locations =
        current
          .geographicCoverage
          .locations
          .filter(
            (_, itemIndex) =>
              itemIndex !== index
          );

      return {
        ...current,

        geographicCoverage: {
          ...current.geographicCoverage,

          locations:
            locations.length
              ? locations
              : [
                  {
                    region: '',
                    district: '',
                    village: '',
                    siteName: '',
                    latitude: '',
                    longitude: '',
                  },
                ],
        },
      };
    });
  }

  function updateTargetGroup(
    index,
    value
  ) {
    setForm((current) => {
      const targetGroups = [
        ...current.targetGroups,
      ];

      targetGroups[index] =
        value;

      return {
        ...current,
        targetGroups,
      };
    });
  }

  function addTargetGroup() {
    setForm((current) => ({
      ...current,

      targetGroups: [
        ...current.targetGroups,
        '',
      ],
    }));
  }

  function removeTargetGroup(
    index
  ) {
    setForm((current) => ({
      ...current,

      targetGroups:
        current.targetGroups
          .filter(
            (_, itemIndex) =>
              itemIndex !== index
          ),
    }));
  }
function updateObjective(
  index,
  field,
  value
) {
  setForm((current) => {
    const objectives = [
      ...current.objectives,
    ];

    objectives[index] = {
      ...objectives[index],
      [field]: value,
    };

    return {
      ...current,
      objectives,
    };
  });
}

function addObjective() {
  setForm((current) => ({
    ...current,

    objectives: [
      ...current.objectives,
      {
        title: '',
        description: '',
        order:
          current.objectives.length,
      },
    ],
  }));
}

function removeObjective(index) {
  setForm((current) => ({
    ...current,

    objectives:
      current.objectives.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
  }));
}

function updateComponent(
  index,
  field,
  value
) {
  setForm((current) => {
    const components = [
      ...current.components,
    ];

    components[index] = {
      ...components[index],
      [field]: value,
    };

    return {
      ...current,
      components,
    };
  });
}

function addComponent() {
  setForm((current) => ({
    ...current,

    components: [
      ...current.components,
      {
        title: '',
        description: '',
        order:
          current.components.length,
      },
    ],
  }));
}

function removeComponent(index) {
  setForm((current) => ({
    ...current,

    components:
      current.components.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
  }));
}
  function updateStringList(field, index, value) {
    setForm((current) => {
      const values = [...current[field]];
      values[index] = value;
      return { ...current, [field]: values };
    });
  }

  function addStringListItem(field) {
    setForm((current) => ({ ...current, [field]: [...current[field], ''] }));
  }

  function removeStringListItem(field, index) {
    setForm((current) => {
      const values = current[field].filter((_, i) => i !== index);
      return { ...current, [field]: values.length ? values : [''] };
    });
  }

  function updateAchievement(index, field, value) {
    setForm((current) => {
      const achievements = [...current.achievements];
      achievements[index] = { ...achievements[index], [field]: value };
      return { ...current, achievements };
    });
  }

  function addAchievement() {
    setForm((current) => ({
      ...current,
      achievements: [...current.achievements, {
        title: '', description: '', progress: 0,
        status: 'Not Started', order: current.achievements.length,
      }],
    }));
  }

  function removeAchievement(index) {
    setForm((current) => {
      const values = current.achievements.filter((_, i) => i !== index);
      return {
        ...current,
        achievements: values.length ? values :
          [{ title: '', description: '', progress: 0, status: 'Not Started', order: 0 }],
      };
    });
  }

  function updateStakeholder(index, field, value) {
    setForm((current) => {
      const stakeholders = [...current.stakeholders];
      stakeholders[index] = { ...stakeholders[index], [field]: value };
      return { ...current, stakeholders };
    });
  }

  function addStakeholder() {
  setForm((current) => ({
    ...current,

    stakeholders: [
      ...current.stakeholders,
      {
        type: 'Partner',
        name: '',
        description: '',
        logoUrl: '',
        order:
          current.stakeholders.length,
      },
    ],
  }));
}

  function removeStakeholder(index) {
    setForm((current) => {
      const values = current.stakeholders.filter((_, i) => i !== index);
      return {
        ...current,
        stakeholders: values.length ? values :
          [{ type: 'Partner', name: '', description: '', logoUrl: '',  order: 0 }],
      };
    });
  }

  function updateMediaField(field, value) {
    setForm((current) => ({ ...current, media: { ...current.media, [field]: value } }));
  }

  function updateGalleryImage(index, field, value) {
    setForm((current) => {
      const gallery = [...current.media.gallery];
      gallery[index] = { ...gallery[index], [field]: value };
      return { ...current, media: { ...current.media, gallery } };
    });
  }

  function addGalleryImage() {
    setForm((current) => ({
      ...current,
      media: {
        ...current.media,
        gallery: [...current.media.gallery,
          { url: '', caption: '', altText: '', order: current.media.gallery.length }],
      },
    }));
  }

  function removeGalleryImage(index) {
    setForm((current) => {
      const gallery = current.media.gallery.filter((_, i) => i !== index);
      return {
        ...current,
        media: {
          ...current.media,
          gallery: gallery.length ? gallery : [{ url: '', caption: '', altText: '', order: 0 }],
        },
      };
    });
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...form,
projectCode:
  form.projectCode.trim() ||
  undefined,
        overallProgress:
          Number(
            form.overallProgress ||
              0
          ),

        targetGroups:
          form.targetGroups
            .map((item) =>
              item.trim()
            )
            .filter(Boolean),

        objectives:
          form.objectives
            .filter((item) => item.title.trim() || item.description.trim())
            .map((item, index) => ({
              title: item.title.trim(),
              description: item.description.trim(),
              order: index,
            })),

        components:
          form.components
            .filter((item) => item.title.trim())
            .map((item, index) => ({
              title: item.title.trim(),
              description: item.description.trim(),
              order: index,
            })),

        ministryRole: form.ministryRole.map((item) => item.trim()).filter(Boolean),
        keyOutputs: form.keyOutputs.map((item) => item.trim()).filter(Boolean),

        achievements: form.achievements
          .filter((item) => item.title.trim())
          .map((item, index) => ({
            title: item.title.trim(),
            description: item.description.trim(),
            progress: Math.min(100, Math.max(0, Number(item.progress || 0))),
            status: item.status,
            order: index,
          })),

        stakeholders: form.stakeholders
  .filter((item) =>
    item.name.trim()
  )
  .map((item, index) => ({
    type: item.type,
    name: item.name.trim(),
    description:
      item.description.trim(),
    logoUrl:
      item.logoUrl.trim(),
    order: index,
  })),
        media: {
          coverImage: form.media.coverImage.trim(),
          geographyImage: form.media.geographyImage.trim(),
          objectiveImage: form.media.objectiveImage.trim(),
          gallery: form.media.gallery
            .filter((item) => item.url.trim())
            .map((item, index) => ({
              url: item.url.trim(),
              caption: item.caption.trim(),
              altText: item.altText.trim(),
              order: index,
            })),
        },

        budget: form.budget === '' ? undefined : Number(form.budget),
        currency: form.currency.trim().toUpperCase() || 'USD',
        showBudgetPublicly: Boolean(form.showBudgetPublicly),
        featured: Boolean(form.featured),

        geographicCoverage: {
          ...form.geographicCoverage,

          locations:
            form
              .geographicCoverage
              .locations
              .filter(
                (location) =>
                  location.region ||
                  location.district ||
                  location.siteName
              )
              .map(
                (location) => ({
                  ...location,

                  latitude:
                    location.latitude ===
                    ''
                      ? undefined
                      : Number(
                          location.latitude
                        ),

                  longitude:
                    location.longitude ===
                    ''
                      ? undefined
                      : Number(
                          location.longitude
                        ),
                })
              ),
        },

        publicationStatus:
  isEditMode
    ? form.publicationStatus
    : 'Draft',
      };

     const response =
  isEditMode
    ? await updateMinistryProject(
        projectId,
        payload
      )
    : await createMinistryProject(
        payload
      );

      const savedProject =
  response?.data ||
  response;

if (
  !isEditMode &&
  savedProject?._id
) {
  navigate(
    `/ministry-projects/${savedProject._id}/edit`,
    {
      replace: true,
    }
  );

  return;
}

if (isEditMode) {
  navigate(
    '/ministry-projects'
  );

  return;
}

navigate(
  '/ministry-projects');    
} catch (requestError) {
      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
          requestError
            ?.response
            ?.data
            ?.error ||
          requestError.message ||
          'Unable to save project.'
      );
    } finally {
      setSaving(false);
    }
  }
if (loading) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
      Loading Ministry project...
    </div>
  );
}
  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {/* Header */}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                '/ministry-projects'
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft
              size={17}
            />

            Back to Projects Portal
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Ministry Website
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
  {isEditMode
    ? 'Edit Ministry Project'
    : 'Add New Project'}
</h1>

          <p className="mt-2 text-sm text-slate-500">
            Create a Ministry
            project and save it
            as a draft before
            publication.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} />

         {saving
  ? 'Saving...'
  : isEditMode
    ? 'Save Changes'
    : 'Save Draft'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}

      <Section
        number="01"
        title="Basic Information"
        description="Main identification and implementation information for the project."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Project Title"
            required
            className="md:col-span-2 xl:col-span-2"
          >
            <input
              required
              value={form.title}
              onChange={(event) =>
                updateField(
                  'title',
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Enter full project title"
            />
          </Field>

          <Field label="Project Code">
            <input
              value={
                form.projectCode
              }
              onChange={(event) =>
                updateField(
                  'projectCode',
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="e.g. MOPIIC-001"
            />
          </Field>

          <Field label="Short Title">
            <input
              value={
                form.shortTitle
              }
              onChange={(event) =>
                updateField(
                  'shortTitle',
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Short project name"
            />
          </Field>

          <Field label="Primary Sector">
            <input
              value={
                form.primarySector
              }
              onChange={(event) =>
                updateField(
                  'primarySector',
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="e.g. Durable Solutions"
            />
          </Field>

          <Field label="Project Type">
            <input
              value={
                form.projectType
              }
              onChange={(event) =>
                updateField(
                  'projectType',
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="e.g. Development Project"
            />
          </Field>

          <Field label="Status">
            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  'status',
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="Planned">
                Planned
              </option>

              <option value="Ongoing">
                Ongoing
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="On Hold">
                On Hold
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </Field>

          <Field label="Overall Progress">
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={
                  form.overallProgress
                }
                onChange={(event) =>
                  updateField(
                    'overallProgress',
                    event.target.value
                  )
                }
                className={`${inputClass} pr-10`}
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                %
              </span>
            </div>
          </Field>

          <Field label="Start Date">
            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={
                  form.startDate
                }
                onChange={(event) =>
                  updateField(
                    'startDate',
                    event.target.value
                  )
                }
                className={`${inputClass} pl-11`}
              />
            </div>
          </Field>

          <Field label="End Date">
            <input
              type="date"
              value={
                form.endDate
              }
              onChange={(event) =>
                updateField(
                  'endDate',
                  event.target.value
                )
              }
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* 2. Overview */}

      <Section
        number="02"
        title="Project Overview"
        description="Explain what the project does, its goal and who it is intended to support."
      >
        <div className="space-y-5">
          <Field
            label="Project Overview"
            required
          >
            <textarea
              required
              rows={6}
              value={
                form.overview
              }
              onChange={(event) =>
                updateField(
                  'overview',
                  event.target.value
                )
              }
              className={textareaClass}
              placeholder="Provide a clear public description of the project..."
            />
          </Field>

          <Field label="Overall Goal">
            <textarea
              rows={4}
              value={form.goal}
              onChange={(event) =>
                updateField(
                  'goal',
                  event.target.value
                )
              }
              className={textareaClass}
              placeholder="What is the overall goal of this project?"
            />
          </Field>

          <RepeatableHeader
            title="Target Groups"
            buttonLabel="Add Target Group"
            onAdd={addTargetGroup}
          />

          <div className="space-y-3">
            {form.targetGroups.map(
              (group, index) => (
                <div
                  key={index}
                  className="flex gap-3"
                >
                  <input
                    value={group}
                    onChange={(event) =>
                      updateTargetGroup(
                        index,
                        event.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="e.g. IDPs and displacement-affected communities"
                  />

                  {form
                    .targetGroups
                    .length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeTargetGroup(
                          index
                        )
                      }
                      className="rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </Section>

      {/* 3. Objectives */}

      <Section
        number="03"
        title="Project Objectives"
        description="Define the specific objectives the project intends to achieve."
      >
        <RepeatableHeader
          title="Objectives"
          buttonLabel="Add Objective"
          onAdd={addObjective}
        />

        <div className="mt-4 space-y-4">
          {form.objectives.map((objective, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-800">Objective {index + 1}</h3>
                {form.objectives.length > 1 && (
                  <button type="button" onClick={() => removeObjective(index)} className="text-sm font-semibold text-red-600 hover:text-red-700">Remove</button>
                )}
              </div>
              <div className="space-y-4">
                <Field label="Objective Title">
                  <input value={objective.title} onChange={(event) => updateObjective(index, 'title', event.target.value)} className={inputClass} placeholder="e.g. Improve sustainable access to safe water" />
                </Field>
                <Field label="Description">
                  <textarea rows={3} value={objective.description} onChange={(event) => updateObjective(index, 'description', event.target.value)} className={textareaClass} placeholder="Describe this objective..." />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Components */}

      <Section
        number="04"
        title="Project Components"
        description="Record the principal components or workstreams of the project."
      >
        <RepeatableHeader
          title="Components"
          buttonLabel="Add Component"
          onAdd={addComponent}
        />

        <div className="mt-4 space-y-4">
          {form.components.map((component, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-800">Component {index + 1}</h3>
                {form.components.length > 1 && (
                  <button type="button" onClick={() => removeComponent(index)} className="text-sm font-semibold text-red-600 hover:text-red-700">Remove</button>
                )}
              </div>
              <div className="space-y-4">
                <Field label="Component Title">
                  <input value={component.title} onChange={(event) => updateComponent(index, 'title', event.target.value)} className={inputClass} placeholder="e.g. Development of New Water Sources" />
                </Field>
                <Field label="Description">
                  <textarea rows={3} value={component.description} onChange={(event) => updateComponent(index, 'description', event.target.value)} className={textareaClass} placeholder="Describe the activities under this component..." />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Geography */}


      <Section
        number="05"
        title="Geographic Coverage"
        description="Record where the project is implemented and the GPS position of its main sites."
        icon={MapPinned}
      >
        <Field label="Coverage Description">
          <textarea
            rows={4}
            value={
              form
                .geographicCoverage
                .description
            }
            onChange={(event) =>
              updateCoverageDescription(
                event.target.value
              )
            }
            className={textareaClass}
            placeholder="Describe the geographic coverage, communities, IDP settlements or other implementation areas..."
          />
        </Field>

        <div className="mt-6">
          <RepeatableHeader
            title="Project Locations / Sites"
            buttonLabel="Add Location"
            onAdd={addLocation}
          />

          <div className="mt-4 space-y-4">
            {form
              .geographicCoverage
              .locations
              .map(
                (
                  location,
                  index
                ) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">
                        Location{' '}
                        {index + 1}
                      </h3>

                      {form
                        .geographicCoverage
                        .locations
                        .length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeLocation(
                              index
                            )
                          }
                          className="text-sm font-semibold text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Field label="Region">
                        <input
                          value={
                            location.region
                          }
                          onChange={(
                            event
                          ) =>
                            updateLocation(
                              index,
                              'region',
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                          placeholder="e.g. Lower Juba"
                        />
                      </Field>

                      <Field label="District">
                        <input
                          value={
                            location.district
                          }
                          onChange={(
                            event
                          ) =>
                            updateLocation(
                              index,
                              'district',
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                          placeholder="e.g. Kismaayo"
                        />
                      </Field>

                      <Field label="Village / Area">
                        <input
                          value={
                            location.village
                          }
                          onChange={(
                            event
                          ) =>
                            updateLocation(
                              index,
                              'village',
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                          placeholder="e.g. Dalhiska"
                        />
                      </Field>

                      <Field label="Site Name">
                        <input
                          value={
                            location.siteName
                          }
                          onChange={(
                            event
                          ) =>
                            updateLocation(
                              index,
                              'siteName',
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                          placeholder="Project site or facility"
                        />
                      </Field>

                      <Field label="Latitude">
                        <input
                          type="number"
                          step="any"
                          value={
                            location.latitude
                          }
                          onChange={(
                            event
                          ) =>
                            updateLocation(
                              index,
                              'latitude',
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                          placeholder="-0.3582"
                        />
                      </Field>

                      <Field label="Longitude">
                        <input
                          type="number"
                          step="any"
                          value={
                            location.longitude
                          }
                          onChange={(
                            event
                          ) =>
                            updateLocation(
                              index,
                              'longitude',
                              event
                                .target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                          placeholder="42.5454"
                        />
                      </Field>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      </Section>

      {/* 6. Ministry Role */}
      <Section number="06" title="Role of the Ministry" description="Record the Ministry's roles in facilitating, coordinating, supervising or implementing the project.">
        <RepeatableHeader title="Ministry Roles" buttonLabel="Add Role" onAdd={() => addStringListItem('ministryRole')} />
        <StringListEditor values={form.ministryRole} placeholder="e.g. Coordination and oversight"
          onChange={(index, value) => updateStringList('ministryRole', index, value)}
          onRemove={(index) => removeStringListItem('ministryRole', index)} />
      </Section>

      {/* 7. Key Outputs */}
      <Section number="07" title="Key Outputs" description="Record the principal outputs and deliverables expected from the project.">
        <RepeatableHeader title="Key Outputs" buttonLabel="Add Output" onAdd={() => addStringListItem('keyOutputs')} />
        <StringListEditor values={form.keyOutputs} placeholder="Enter a key project output"
          onChange={(index, value) => updateStringList('keyOutputs', index, value)}
          onRemove={(index) => removeStringListItem('keyOutputs', index)} />
      </Section>

      {/* 8. Achievements */}
      <Section number="08" title="Project Achievements" description="Record major achievements together with their current status and progress.">
        <RepeatableHeader title="Achievements" buttonLabel="Add Achievement" onAdd={addAchievement} />
        <div className="mt-4 space-y-4">
          {form.achievements.map((achievement, index) => (
            <EditorCard key={index} title={`Achievement ${index + 1}`}
              removable={form.achievements.length > 1} onRemove={() => removeAchievement(index)}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Achievement Title" className="md:col-span-2">
                  <input value={achievement.title} onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                    className={inputClass} placeholder="Enter achievement title" />
                </Field>
                <Field label="Status">
                  <select value={achievement.status} onChange={(e) => updateAchievement(index, 'status', e.target.value)} className={inputClass}>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </Field>
                <Field label="Progress">
                  <input type="number" min="0" max="100" value={achievement.progress}
                    onChange={(e) => updateAchievement(index, 'progress', e.target.value)} className={inputClass} />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <textarea rows={3} value={achievement.description}
                    onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                    className={textareaClass} placeholder="Describe this achievement..." />
                </Field>
              </div>
            </EditorCard>
          ))}
        </div>
      </Section>

      {/* 9. Stakeholders */}
      <Section number="09" title="Project Stakeholders" description="Record funding, implementation, supporting, facilitating and other project partners.">
        <RepeatableHeader title="Stakeholders" buttonLabel="Add Stakeholder" onAdd={addStakeholder} />
        <div className="mt-4 space-y-4">
          {form.stakeholders.map((stakeholder, index) => (
            <EditorCard key={index} title={`Stakeholder ${index + 1}`}
              removable={form.stakeholders.length > 1} onRemove={() => removeStakeholder(index)}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Stakeholder Name" className="md:col-span-2">
                  <input value={stakeholder.name} onChange={(e) => updateStakeholder(index, 'name', e.target.value)}
                    className={inputClass} placeholder="Organization or institution name" />
                </Field>
                <Field label="Role / Type">
                  <select value={stakeholder.type} onChange={(e) => updateStakeholder(index, 'type', e.target.value)} className={inputClass}>
                    <option value="Funded By">Funded By</option>
                    <option value="Implemented By">Implemented By</option>
                    <option value="Supported By">Supported By</option>
                    <option value="Facilitated By">Facilitated By</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <div className="md:col-span-2 xl:col-span-3">
  <ImageUploadField
    label="Stakeholder Logo"
    value={stakeholder.logoUrl}
    uploading={
      uploadingImage ===
      `stakeholder-${index}`
    }
    disabled={!isEditMode}
    onUpload={(file) =>
      handleStakeholderLogoUpload(
        file,
        index
      )
    }
    onRemove={() =>
      updateStakeholder(
        index,
        'logoUrl',
        ''
      )
    }
  />
</div>
                <Field label="Description" className="md:col-span-2 xl:col-span-3">
                  <textarea rows={3} value={stakeholder.description}
                    onChange={(e) => updateStakeholder(index, 'description', e.target.value)}
                    className={textareaClass} placeholder="Describe the stakeholder's role..." />
                </Field>
              </div>
            </EditorCard>
          ))}
        </div>
      </Section>

      {/* 10. Media */}

<Section
  number="10"
  title="Project Media"
  description="Upload images that will be displayed on the public Ministry project page."
  icon={Image}
>
  {!isEditMode && (
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Save the project as a draft first.
      Image upload will become available
      after the project has been created.
    </div>
  )}

  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    <ImageUploadField
      label="Cover Image"
      value={
        form.media.coverImage
      }
      uploading={
        uploadingImage ===
        'coverImage'
      }
      disabled={!isEditMode}
      onUpload={(file) =>
        handleMainImageUpload(
          file,
          'coverImage'
        )
      }
      onRemove={() =>
        updateMediaField(
          'coverImage',
          ''
        )
      }
    />

    <ImageUploadField
      label="Geography Image"
      value={
        form.media.geographyImage
      }
      uploading={
        uploadingImage ===
        'geographyImage'
      }
      disabled={!isEditMode}
      onUpload={(file) =>
        handleMainImageUpload(
          file,
          'geographyImage'
        )
      }
      onRemove={() =>
        updateMediaField(
          'geographyImage',
          ''
        )
      }
    />

    <ImageUploadField
      label="Objective Image"
      value={
        form.media.objectiveImage
      }
      uploading={
        uploadingImage ===
        'objectiveImage'
      }
      disabled={!isEditMode}
      onUpload={(file) =>
        handleMainImageUpload(
          file,
          'objectiveImage'
        )
      }
      onRemove={() =>
        updateMediaField(
          'objectiveImage',
          ''
        )
      }
    />
  </div>

  <div className="mt-8 border-t border-slate-200 pt-6">
    <RepeatableHeader
      title="Project Gallery"
      buttonLabel="Add Gallery Image"
      onAdd={addGalleryImage}
    />

    <p className="mt-2 text-sm text-slate-500">
      Upload project photos and optionally
      provide a caption and alternative text.
    </p>

    <div className="mt-4 grid gap-5 lg:grid-cols-2">
      {form.media.gallery.map(
        (image, index) => (
          <EditorCard
            key={index}
            title={`Gallery Image ${index + 1}`}
            removable={
              form.media.gallery.length >
              1
            }
            onRemove={() =>
              removeGalleryImage(
                index
              )
            }
          >
            <ImageUploadField
              label="Image"
              value={image.url}
              uploading={
                uploadingImage ===
                `gallery-${index}`
              }
              disabled={!isEditMode}
              onUpload={(file) =>
                handleGalleryUpload(
                  file,
                  index
                )
              }
              onRemove={() =>
                updateGalleryImage(
                  index,
                  'url',
                  ''
                )
              }
            />

            <div className="mt-4 space-y-4">
              <Field label="Caption">
                <input
                  value={
                    image.caption
                  }
                  onChange={(event) =>
                    updateGalleryImage(
                      index,
                      'caption',
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="Public image caption"
                />
              </Field>

              <Field label="Alternative Text">
                <input
                  value={
                    image.altText
                  }
                  onChange={(event) =>
                    updateGalleryImage(
                      index,
                      'altText',
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="Describe the image for accessibility"
                />
              </Field>
            </div>
          </EditorCard>
        )
      )}
    </div>
  </div>
  
</Section>

      <Section number="11" title="Financial & Publication Settings"
        description="Optional budget information and controls for how the project is presented publicly.">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Project Budget">
            <input type="number" min="0" step="any" value={form.budget}
              onChange={(e) => updateField('budget', e.target.value)} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Currency">
            <input value={form.currency} onChange={(e) => updateField('currency', e.target.value)}
              className={inputClass} placeholder="USD" />
          </Field>
          <div className="space-y-3">
            <Toggle label="Show budget publicly" checked={form.showBudgetPublicly}
              onChange={(checked) => updateField('showBudgetPublicly', checked)} />
            <Toggle label="Featured project" checked={form.featured}
              onChange={(checked) => updateField('featured', checked)} />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publication Status</p>
          <p className="mt-2 text-sm font-bold text-slate-800">{form.publicationStatus}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Publishing, unpublishing and archiving remain controlled from the Projects Portal actions.
          </p>
        </div>
      </Section>

      {/* Bottom Save */}

      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            navigate(
              '/ministry-projects'
            )
          }
          className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          <Save size={18} />

          {saving
            ? 'Saving...'
            : isEditMode
              ? 'Save Changes'
              : 'Save Draft'}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

const textareaClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

function Field({
  label,
  required = false,
  children,
  className = '',
}) {
  return (
    <label
      className={`block ${className}`}
    >
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function Section({
  number,
  title,
  description,
  children,
  icon: Icon,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
            {Icon ? (
              <Icon size={19} />
            ) : (
              number
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}

function StringListEditor({ values, placeholder, onChange, onRemove }) {
  return (
    <div className="mt-4 space-y-3">
      {values.map((value, index) => (
        <div key={index} className="flex gap-3">
          <input value={value} onChange={(e) => onChange(index, e.target.value)}
            className={inputClass} placeholder={placeholder} />
          {values.length > 1 && (
            <button type="button" onClick={() => onRemove(index)}
              className="rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50">
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function EditorCard({ title, removable, onRemove, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {removable && (
          <button type="button" onClick={onRemove}
            className="text-sm font-semibold text-red-600 hover:text-red-700">Remove</button>
        )}
      </div>
      {children}
    </div>
  );
}
function ImageUploadField({
  label,
  value,
  uploading,
  disabled,
  onUpload,
  onRemove,
}) {
  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    if (file) {
      onUpload(file);
    }

    event.target.value = '';
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">
        {label}
      </p>

      {value ? (
        <div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <img
              src={value}
              alt={label}
              className="h-48 w-full object-cover"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <label
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold text-white ${
                disabled || uploading
                  ? 'cursor-not-allowed bg-emerald-500 opacity-60'
                  : 'cursor-pointer bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {uploading
                ? 'Uploading...'
                : 'Replace Image'}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={
                  disabled ||
                  uploading
                }
                onChange={
                  handleFileChange
                }
                className="hidden"
              />
            </label>

            <button
              type="button"
              disabled={uploading}
              onClick={onRemove}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            JPG, PNG or WebP • Maximum 10 MB
          </p>
        </div>
      ) : (
        <label
          className={`flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center transition ${
            disabled || uploading
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40'
          }`}
        >
          <Image
            size={34}
            className="text-slate-300"
          />

          <span className="mt-3 text-sm font-semibold text-slate-700">
            {uploading
              ? 'Uploading Image...'
              : 'Choose Image'}
          </span>

          <span className="mt-1 text-xs text-slate-400">
            JPG, PNG or WebP
          </span>

          <span className="mt-1 text-xs text-slate-400">
            Maximum 10 MB
          </span>

          {disabled && (
            <span className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Save the project first
            </span>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={
              disabled ||
              uploading
            }
            onChange={
              handleFileChange
            }
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <input type="checkbox" checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300" />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}

function RepeatableHeader({
  title,
  buttonLabel,
  onAdd,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-slate-800">
        {title}
      </h3>

      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
      >
        + {buttonLabel}
      </button>
    </div>
  );
}