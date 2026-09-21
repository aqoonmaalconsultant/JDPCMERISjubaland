import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowRightCircle,
  Building2,
  CheckCircle2,
  Eye,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

import {
  api,
} from '../api/client.js';

const registrationStatuses = [
  'Draft',
  'Submitted',
  'Under Review',
  'Returned for Revision',
  'Registered',
];

const registrationStages = [
  'Draft',
  'Submitted',
  'Project Verification',
  'Final Review',
  'Registered',
];

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—';
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
}

function formatCurrency(
  value,
  currency = 'USD'
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '—';
  }

  const amount =
    Number(value);

  if (
    Number.isNaN(amount)
  ) {
    return '—';
  }

  try {
    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency:
          currency || 'USD',
        maximumFractionDigits: 0,
      }
    ).format(amount);
  } catch {
    return `${currency || 'USD'} ${amount.toLocaleString()}`;
  }
}

function statusClass(status) {
  if (
    status === 'Registered'
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (
    status === 'Submitted'
  ) {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }

  if (
    status ===
    'Under Review'
  ) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (
    status ===
    'Returned for Revision'
  ) {
    return 'border-orange-200 bg-orange-50 text-orange-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function stageClass(stage) {
  if (
    stage === 'Registered'
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (
    stage ===
    'Final Review'
  ) {
    return 'border-violet-200 bg-violet-50 text-violet-700';
  }

  if (
    stage ===
    'Project Verification'
  ) {
    return 'border-cyan-200 bg-cyan-50 text-cyan-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function DetailItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || '—'}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}) {
  return (
    <section className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <h4 className="text-sm font-bold text-slate-900">
        {title}
      </h4>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}

function namesList(
  items,
  field = 'name'
) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return '—';
  }

  const names =
    items
      .map(
        (item) =>
          typeof item === 'string'
            ? item
            : item?.[field]
      )
      .filter(Boolean);

  return names.length
    ? names.join(', ')
    : '—';
}

function getLeadImplementer(
  application
) {
  if (!application) {
    return '—';
  }

  if (
    application
      .submittingInstitutionIsLeadImplementer
  ) {
    return (
      application
        .submittingInstitution
        ?.institutionName ||
      'Submitting Institution'
    );
  }

  return (
    application
      .leadImplementingInstitution
      ?.institutionName ||
    application
      .leadImplementerMinistry
      ?.name ||
    application
      .partner
      ?.name ||
    application
      .leadImplementerName ||
    '—'
  );
}

function canVerify(
  application
) {
  if (!application) {
    return false;
  }

  return (
    application.registrationStage ===
      'Project Verification' &&
    [
      'Submitted',
      'Under Review',
    ].includes(
      application.registrationStatus
    )
  );
}

function canRegister(
  application
) {
  if (!application) {
    return false;
  }

  return (
    application.registrationStage ===
      'Final Review' &&
    application.registrationStatus ===
      'Under Review'
  );
}

export function ProjectApplicationVerification() {
  const [
    search,
    setSearch,
  ] = useState('');

  const [
    status,
    setStatus,
  ] = useState('');

  const [
    stage,
    setStage,
  ] = useState(
    'Project Verification'
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    revisionReason,
    setRevisionReason,
  ] = useState('');

  const query =
    useMemo(
      () => ({
        search:
          search.trim(),

        status,

        stage,

        page,

        limit: 20,
      }),
      [
        search,
        status,
        stage,
        page,
      ]
    );

  async function loadApplications() {
    try {
      setLoading(true);

      setError('');

      const {
        data,
      } =
        await api.get(
          '/project-applications',
          {
            params: query,
          }
        );

      setRows(
        data?.data || []
      );

      setPagination({
        page:
          data?.pagination
            ?.page || 1,

        limit:
          data?.pagination
            ?.limit || 20,

        total:
          data?.pagination
            ?.total || 0,

        totalPages:
          data?.pagination
            ?.totalPages || 1,
      });
    } catch (
      requestError
    ) {
      setError(
        requestError.response
          ?.data?.message ||
        'Unable to load project applications.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    status,
    stage,
  ]);

  async function openApplication(
    id
  ) {
    try {
      setDetailLoading(true);

      setError('');

      setSuccess('');

      setRevisionReason('');

      const {
        data,
      } =
        await api.get(
          `/project-applications/${id}`
        );

      setSelected(
        data?.data || null
      );
    } catch (
      requestError
    ) {
      setError(
        requestError.response
          ?.data?.message ||
        'Unable to load project application details.'
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeApplication() {
    setSelected(null);

    setRevisionReason('');

    setError('');

    setSuccess('');
  }

  async function returnForRevision() {
    if (
      !selected?._id
    ) {
      return;
    }

    if (
      revisionReason
        .trim()
        .length < 5
    ) {
      setError(
        'Enter a clear revision reason of at least 5 characters.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        'Return this project application to the submitting institution for revision?'
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError('');

      setSuccess('');

      const {
        data,
      } =
        await api.patch(
          `/project-applications/${selected._id}/return-for-revision`,
          {
            reason:
              revisionReason
                .trim(),
          }
        );

      setSelected(
        data?.data ||
          selected
      );

      setRevisionReason('');

      setSuccess(
        data?.message ||
        'Project application returned for revision.'
      );

      await loadApplications();
    } catch (
      requestError
    ) {
      setError(
        requestError.response
          ?.data?.message ||
        'Unable to return the project application for revision.'
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function submitFinalReview() {
    if (
      !selected?._id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Confirm that Project Verification is complete and submit this application for Final Review?'
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError('');

      setSuccess('');

      const {
        data,
      } =
        await api.patch(
          `/project-applications/${selected._id}/submit-final-review`,
          {}
        );

      setSelected(
        data?.data ||
          selected
      );

      setSuccess(
        data?.message ||
        'Project application submitted for Final Review successfully.'
      );

      await loadApplications();
    } catch (
      requestError
    ) {
      setError(
        requestError.response
          ?.data?.message ||
        'Unable to submit the project application for Final Review.'
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function registerProject() {
    if (
      !selected?._id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Register this project and create the official JAIMS Project Management record? This action will complete Project Registration.'
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      setError('');

      setSuccess('');

      const {
        data,
      } =
        await api.patch(
          `/project-applications/${selected._id}/register`,
          {}
        );

      const updatedApplication =
        data?.data ||
        selected;

      setSelected(
        updatedApplication
      );

      setSuccess(
        data?.message ||
        `Project registered successfully${
          updatedApplication
            ?.registeredProject
            ?.projectCode
            ? ` as ${updatedApplication.registeredProject.projectCode}.`
            : '.'
        }`
      );

      await loadApplications();
    } catch (
      requestError
    ) {
      setError(
        requestError.response
          ?.data?.message ||
        'Unable to register the project.'
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic">
              Project Registration
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Project Applications
            </h2>

            <p className="mt-2 max-w-3xl text-sm text-slate-500">
              Review project applications submitted by verified institutions before they enter the JAIMS Project Management system.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
            <Building2
              size={18}
            />

            {pagination.total}{' '}
            application
            {pagination.total === 1
              ? ''
              : 's'}
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search application number, project name, or sector"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
            />
          </label>

          <select
            value={status}
            onChange={(
              event
            ) =>
              setStatus(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
          >
            <option value="">
              All statuses
            </option>

            {registrationStatuses.map(
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
            value={stage}
            onChange={(
              event
            ) =>
              setStage(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
          >
            <option value="">
              All stages
            </option>

            {registrationStages.map(
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

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Application
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Project
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Submitting Institution
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Lead Implementer
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Government Line Ministry
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Donor
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Sector
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Budget
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Stage
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Submitted
                </th>

                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading project applications...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map(
                  (
                    application
                  ) => (
                    <tr
                      key={
                        application._id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-civic">
                        {
                          application.applicationNumber
                        }
                      </td>

                      <td className="max-w-xs px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {
                            application.projectName
                          }
                        </p>
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm text-slate-700">
                        {
                          application
                            .submittingInstitution
                            ?.institutionName ||
                          '—'
                        }
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm text-slate-700">
                        {getLeadImplementer(
                          application
                        )}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-sm text-slate-700">
                        {
                          application
                            .ministry
                            ?.name ||
                          '—'
                        }
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {
                          application
                            .donor
                            ?.name ||
                          '—'
                        }
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {
                          application.sector ||
                          '—'
                        }
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-800">
                        {formatCurrency(
                          application.budget,
                          application.currency
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            'inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold',
                            stageClass(
                              application.registrationStage
                            ),
                          ].join(
                            ' '
                          )}
                        >
                          {
                            application.registrationStage
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            'inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold',
                            statusClass(
                              application.registrationStatus
                            ),
                          ].join(
                            ' '
                          )}
                        >
                          {
                            application.registrationStatus
                          }
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {formatDate(
                          application.submittedAt
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            openApplication(
                              application._id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-civic hover:text-civic"
                        >
                          <Eye
                            size={15}
                          />

                          Review
                        </button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={12}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No project applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500">
            Page{' '}
            {pagination.page ||
              1}{' '}
            of{' '}
            {pagination.totalPages ||
              1}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      current -
                        1,
                      1
                    )
                )
              }
              className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >=
                (pagination.totalPages ||
                  1)
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current +
                    1
                )
              }
              className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
            {selected ||
      detailLoading ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 md:p-8">
          <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic">
                  Project Registration Review
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {selected
                    ?.projectName ||
                    'Loading...'}
                </h3>

                {selected
                  ?.applicationNumber ? (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {
                      selected.applicationNumber
                    }
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={
                  closeApplication
                }
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X
                  size={18}
                />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-sm text-slate-500">
                Loading project application details...
              </div>
            ) : selected ? (
              <div className="space-y-7 p-6">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={[
                      'inline-flex rounded-full border px-3 py-1 text-xs font-bold',
                      statusClass(
                        selected.registrationStatus
                      ),
                    ].join(
                      ' '
                    )}
                  >
                    Status:{' '}
                    {
                      selected.registrationStatus
                    }
                  </span>

                  <span
                    className={[
                      'inline-flex rounded-full border px-3 py-1 text-xs font-bold',
                      stageClass(
                        selected.registrationStage
                      ),
                    ].join(
                      ' '
                    )}
                  >
                    Stage:{' '}
                    {
                      selected.registrationStage
                    }
                  </span>
                </div>

                <Section title="1. Project Identification">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Application Number"
                      value={
                        selected.applicationNumber
                      }
                    />

                    <DetailItem
                      label="Project Name"
                      value={
                        selected.projectName
                      }
                    />

                    <DetailItem
                      label="Project Type"
                      value={
                        selected.projectType
                      }
                    />

                    <DetailItem
                      label="Registration Status"
                      value={
                        selected.registrationStatus
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Project Description
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {selected.description ||
                        '—'}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Objectives
                      </p>

                      {selected.objectives
                        ?.length ? (
                        <ul className="mt-2 space-y-2 text-sm text-slate-700">
                          {selected.objectives.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="rounded-lg bg-slate-50 px-3 py-2"
                              >
                                {
                                  item
                                }
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          —
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Components
                      </p>

                      {selected.components
                        ?.length ? (
                        <ul className="mt-2 space-y-2 text-sm text-slate-700">
                          {selected.components.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="rounded-lg bg-slate-50 px-3 py-2"
                              >
                                {
                                  item
                                }
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          —
                        </p>
                      )}
                    </div>
                  </div>
                </Section>

                <Section title="2. Submitting Institution">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Institution Name"
                      value={
                        selected
                          .submittingInstitution
                          ?.institutionName
                      }
                    />

                    <DetailItem
                      label="Institution Type"
                      value={
                        selected
                          .submittingInstitution
                          ?.institutionType
                      }
                    />

                    <DetailItem
                      label="Verification Status"
                      value={
                        selected
                          .submittingInstitution
                          ?.verificationStatus
                      }
                    />

                    <DetailItem
                      label="Submitted Date"
                      value={formatDate(
                        selected.submittedAt
                      )}
                    />
                  </div>
                </Section>

                <Section title="3. Government Coordination">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailItem
                      label="Primary Government Line Ministry"
                      value={
                        selected
                          .ministry
                          ?.name
                      }
                    />

                    <DetailItem
                      label="Supporting Government Line Ministries"
                      value={namesList(
                        selected.supportingMinistries
                      )}
                    />

                    <DetailItem
                      label="Federal Line Ministry"
                      value={
                        selected.federalLineMinistry
                      }
                    />
                  </div>
                </Section>

                <Section title="4. Funding">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Funding Institution / Donor"
                      value={
                        selected
                          .donor
                          ?.name
                      }
                    />

                    <DetailItem
                      label="Funding Source"
                      value={
                        selected.fundingSource
                      }
                    />

                    <DetailItem
                      label="Total Project Budget"
                      value={formatCurrency(
                        selected.budget,
                        selected.currency
                      )}
                    />

                    <DetailItem
                      label="Currency"
                      value={
                        selected.currency
                      }
                    />
                  </div>
                </Section>

                <Section title="5. Implementation Arrangement">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Submitting Institution Is Lead Implementer"
                      value={
                        selected
                          .submittingInstitutionIsLeadImplementer
                          ? 'Yes'
                          : 'No'
                      }
                    />

                    <DetailItem
                      label="Lead Implementer Type"
                      value={
                        selected.leadImplementerType
                      }
                    />

                    <DetailItem
                      label="Lead Implementing Institution"
                      value={getLeadImplementer(
                        selected
                      )}
                    />

                    <DetailItem
                      label="Lead Implementer Name"
                      value={
                        selected.leadImplementerName
                      }
                    />

                    <DetailItem
                      label="Co-Implementing Ministries"
                      value={namesList(
                        selected.coImplementingMinistries
                      )}
                    />

                    <DetailItem
                      label="Co-Implementing JAIMS Institutions"
                      value={namesList(
                        selected.coImplementingInstitutions,
                        'institutionName'
                      )}
                    />

                    <DetailItem
                      label="Co-Implementing Partners"
                      value={namesList(
                        selected.coImplementingPartners
                      )}
                    />

                    <DetailItem
                      label="Contractor"
                      value={
                        selected.contractor
                      }
                    />

                    <DetailItem
                      label="Consultant"
                      value={
                        selected.consultant
                      }
                    />
                  </div>
                </Section>

                <Section title="6. Project Classification and Duration">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Primary Sector"
                      value={
                        selected.sector
                      }
                    />

                    <DetailItem
                      label="Sub-Sector"
                      value={
                        selected.subSector
                      }
                    />

                    <DetailItem
                      label="Start Date"
                      value={formatDate(
                        selected.startDate
                      )}
                    />

                    <DetailItem
                      label="End Date"
                      value={formatDate(
                        selected.endDate
                      )}
                    />
                  </div>
                </Section>

                <Section title="7. Geographic Coverage">
                  {selected.locations
                    ?.length ? (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">
                              Region
                            </th>

                            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">
                              District
                            </th>

                            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">
                              Site
                            </th>

                            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">
                              Village
                            </th>

                            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">
                              Latitude
                            </th>

                            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">
                              Longitude
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {selected.locations.map(
                            (
                              location,
                              index
                            ) => (
                              <tr
                                key={
                                  index
                                }
                              >
                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {
                                    location
                                      .region
                                      ?.name ||
                                    '—'
                                  }
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {
                                    location
                                      .district
                                      ?.name ||
                                    '—'
                                  }
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {
                                    location.siteName ||
                                    '—'
                                  }
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {
                                    location.village ||
                                    '—'
                                  }
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {
                                    location.latitude ??
                                    '—'
                                  }
                                </td>

                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {
                                    location.longitude ??
                                    '—'
                                  }
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No project locations recorded.
                    </p>
                  )}
                </Section>

                <Section title="8. Project Contacts">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-bold text-slate-900">
                        Government Focal Point
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <DetailItem
                          label="Name"
                          value={
                            selected
                              .governmentFocalPoint
                              ?.name
                          }
                        />

                        <DetailItem
                          label="Position"
                          value={
                            selected
                              .governmentFocalPoint
                              ?.position
                          }
                        />

                        <DetailItem
                          label="Phone"
                          value={
                            selected
                              .governmentFocalPoint
                              ?.phone
                          }
                        />

                        <DetailItem
                          label="Email"
                          value={
                            selected
                              .governmentFocalPoint
                              ?.email
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-bold text-slate-900">
                        Implementer Focal Point
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <DetailItem
                          label="Name"
                          value={
                            selected
                              .implementerFocalPoint
                              ?.name
                          }
                        />

                        <DetailItem
                          label="Position"
                          value={
                            selected
                              .implementerFocalPoint
                              ?.position
                          }
                        />

                        <DetailItem
                          label="Phone"
                          value={
                            selected
                              .implementerFocalPoint
                              ?.phone
                          }
                        />

                        <DetailItem
                          label="Email"
                          value={
                            selected
                              .implementerFocalPoint
                              ?.email
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Section>

                <Section title="9. Planned Target Beneficiaries">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    <DetailItem
                      label="Households"
                      value={
                        selected
                          .beneficiaries
                          ?.householdCount ??
                        0
                      }
                    />

                    <DetailItem
                      label="Individuals"
                      value={
                        selected
                          .beneficiaries
                          ?.individuals ??
                        0
                      }
                    />

                    <DetailItem
                      label="Male"
                      value={
                        selected
                          .beneficiaries
                          ?.male ??
                        0
                      }
                    />

                    <DetailItem
                      label="Female"
                      value={
                        selected
                          .beneficiaries
                          ?.female ??
                        0
                      }
                    />

                    <DetailItem
                      label="Persons with Disabilities"
                      value={
                        selected
                          .beneficiaries
                          ?.disabilityStatus ??
                        0
                      }
                    />
                  </div>
                </Section>

                <Section title="10. Registration Information">
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Visibility"
                      value={
                        selected.visibility
                      }
                    />

                    <DetailItem
                      label="Submitted"
                      value={formatDate(
                        selected.submittedAt
                      )}
                    />

                    <DetailItem
                      label="Project Verification"
                      value={formatDate(
                        selected.projectVerificationAt
                      )}
                    />

                    <DetailItem
                      label="Final Review"
                      value={formatDate(
                        selected.finalReviewAt
                      )}
                    />

                    <DetailItem
                      label="Registered"
                      value={formatDate(
                        selected.registeredAt
                      )}
                    />

                    <DetailItem
                      label="Registered Project Code"
                      value={
                        selected
                          .registeredProject
                          ?.projectCode
                      }
                    />
                  </div>

                  {selected.revisionReason ? (
                    <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                        Revision Reason
                      </p>

                      <p className="mt-2 text-sm text-orange-800">
                        {
                          selected.revisionReason
                        }
                      </p>
                    </div>
                  ) : null}
                </Section>

                {selected.registrationHistory
                  ?.length ? (
                  <Section title="Registration History">
                    <div className="space-y-3">
                      {[...selected.registrationHistory]
                        .reverse()
                        .map(
                          (
                            history,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                <p className="text-sm font-semibold text-slate-900">
                                  {
                                    history.action
                                  }
                                </p>

                                <p className="text-xs text-slate-500">
                                  {formatDate(
                                    history.actedAt
                                  )}
                                </p>
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {history.actor
                                  ?.name ||
                                  'System / User'}
                              </p>

                              {history.note ? (
                                <p className="mt-2 text-sm text-slate-700">
                                  {
                                    history.note
                                  }
                                </p>
                              ) : null}
                            </div>
                          )
                        )}
                    </div>
                  </Section>
                ) : null}

                {canVerify(
                  selected
                ) ? (
                  <Section title="Project Verification Decision">
                    <p className="text-sm text-slate-600">
                      Return the application to the submitting institution when corrections are required, or submit it to Final Review when verification is complete.
                    </p>

                    <textarea
                      value={
                        revisionReason
                      }
                      onChange={(
                        event
                      ) =>
                        setRevisionReason(
                          event.target.value
                        )
                      }
                      rows={4}
                      placeholder="Reason required only when returning the project application for revision"
                      className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
                    />

                    <div className="mt-4 flex flex-col justify-end gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={
                          returnForRevision
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw
                          size={17}
                        />

                        Return for Revision
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={
                          submitFinalReview
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-civic px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowRightCircle
                          size={17}
                        />

                        Submit for Final Review
                      </button>
                    </div>
                  </Section>
                ) : null}

                {canRegister(
                  selected
                ) ? (
                  <Section title="Final Review Decision">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-900">
                        Project Verification is complete.
                      </p>

                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        Registering this application will create the official JAIMS Project Management record, generate a JAIMS project code, and complete the Project Registration workflow.
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={
                          registerProject
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-civic px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2
                          size={18}
                        />

                        {actionLoading
                          ? 'Registering...'
                          : 'Register Project'}
                      </button>
                    </div>
                  </Section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ProjectApplicationVerification;