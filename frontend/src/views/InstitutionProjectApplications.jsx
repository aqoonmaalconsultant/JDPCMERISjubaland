import { useMemo, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
} from 'lucide-react';

import {
  useInstitutionProjectApplications,
} from '../api/institutionProjects.js';

function refName(value, fallback = '—') {
  if (!value) return fallback;

  if (typeof value === 'string') {
    return value;
  }

  return (
    value.name ||
    value.institutionName ||
    value.organizationName ||
    fallback
  );
}

function formatCurrency(
  value,
  currency = 'USD'
) {
  if (
    value === null ||
    value === undefined ||
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

function statusClasses(status) {
  switch (status) {
    case 'Registered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';

    case 'Submitted':
    case 'Under Review':
      return 'bg-blue-50 text-blue-700 border-blue-200';

    case 'Returned for Revision':
      return 'bg-amber-50 text-amber-700 border-amber-200';

    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export default function InstitutionProjectApplications() {
  const [
    search,
    setSearch,
  ] = useState('');

  const applications =
    useInstitutionProjectApplications();

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const source =
        applications.data || [];

      if (!query) {
        return source;
      }

      return source.filter(
        (application) => {
          const text = [
            application.applicationNumber,
            application.projectName,
            refName(
              application.ministry,
              ''
            ),
            refName(
              application.donor,
              ''
            ),
            application.registrationStatus,
          ]
            .join(' ')
            .toLowerCase();

          return text.includes(
            query
          );
        }
      );
    }, [
      applications.data,
      search,
    ]);

  const openNewProject = () => {
  window.location.assign(
    '/public/organization/project-applications/new'
  );
};

const openApplication = (
  application
) => {
  window.location.assign(
    `/public/organization/project-applications/${application._id}`
  );
};

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic">
              JAIMS Institution Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              My Project Applications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage project registration applications submitted to MoPIIC.
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-lg bg-civic px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            onClick={
              openNewProject
            }
            type="button"
          >
            <Plus size={17} />
            Register New Project
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />

            <input
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-civic"
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search project applications"
              value={search}
            />
          </div>
        </div>

        {applications.isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading project applications...
          </div>
        ) : applications.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {applications.error
              ?.response?.data
              ?.message ||
              'Unable to load project applications.'}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Application Number
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Project Name
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Implementing Institution
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Donor
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Budget
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Registration Status
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Last Updated
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.length ? (
                    filtered.map(
                      (application) => (
                        <tr
                          className="hover:bg-slate-50"
                          key={
                            application._id
                          }
                        >
                          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                            {application.applicationNumber}
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">
                              {application.projectName}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {application.registrationStage ||
                                'Draft'}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {refName(
                              application.ministry
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {refName(
                              application.donor
                            )}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                            {formatCurrency(
                              application.budget,
                              application.currency
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses(
                                application.registrationStatus
                              )}`}
                            >
                              {application.registrationStatus ||
                                'Draft'}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                            {formatDate(
                              application.updatedAt
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                              onClick={() =>
                                openApplication(
                                  application
                                )
                              }
                              type="button"
                            >
                              <FileText
                                size={
                                  15
                                }
                              />

                              {[
                                'Draft',
                                'Returned for Revision',
                              ].includes(
                                application.registrationStatus
                              )
                                ? 'Open / Edit'
                                : 'View'}
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        className="px-6 py-12 text-center"
                        colSpan={8}
                      >
                        <FileText
                          className="mx-auto text-slate-300"
                          size={36}
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                          No project applications found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Start by registering a new project.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}