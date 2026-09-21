import {
  BarChart3,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UsersRound,
  XCircle,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  useOrganizationRegistrationDashboard,
} from '../api/organizationApplications.js';


function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value ?? 0}
          </p>

          {helper ? (
            <p className="mt-1 text-xs text-slate-500">
              {helper}
            </p>
          ) : null}
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}


function BreakdownList({
  title,
  items = [],
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
            >
              <span className="text-sm text-slate-600">
                {item.name}
              </span>

              <span className="text-sm font-bold text-slate-900">
                {item.count}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No data available.
          </p>
        )}
      </div>
    </div>
  );
}



function BarBreakdownChart({
  title,
  items = [],
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      <div className="mt-4 h-72">
        {items.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={items}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 11,
                }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={65}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                }}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="currentColor"
                className="text-civic"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}


function PieBreakdownChart({
  title,
  items = [],
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      <div className="mt-4 h-72">
        {items.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={items}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={92}
                label={({ name, count }) =>
                  `${name}: ${count}`
                }
              >
                {items.map((item, index) => (
                  <Cell
                    key={`${item.name}-${index}`}
                    fill="currentColor"
                    className={
                      [
                        'text-slate-700',
                        'text-slate-500',
                        'text-slate-400',
                        'text-slate-600',
                        'text-slate-300',
                      ][index % 5]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
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
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',
    }
  );
}


function StatusBadge({
  value,
}) {
  const label =
    value || 'Not set';

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {label}
    </span>
  );
}


function LoadingCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-slate-200" />
    </div>
  );
}


export default function OrganizationRegistrationDashboard() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } =
    useOrganizationRegistrationDashboard();

  const applications =
    data?.applications || {};

  const payments =
    data?.payments || {};

  const registry =
    data?.registry || {};

  const certificates =
    data?.certificates || {};

  const breakdowns =
    data?.breakdowns || {};

  const recentActivity =
    data?.recentActivity || {};

  const recentApplications =
    Array.isArray(
      recentActivity.applications
    )
      ? recentActivity.applications
      : [];

  const recentCertificates =
    Array.isArray(
      recentActivity.certificates
    )
      ? recentActivity.certificates
      : [];

  const totalFeesCollected =
    Number(
      payments.totalFeesCollected || 0
    ).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3
              size={22}
              className="text-civic"
            />

            <h1 className="text-2xl font-bold text-slate-900">
              Organization Registration Dashboard
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Monitor organization registration applications, payments,
            registered organizations, and certificate status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={
              isFetching
                ? 'animate-spin'
                : ''
            }
          />

          Refresh
        </button>
      </div>


      <section className="grid gap-4 md:grid-cols-2">

        <Link
          to="/OrganizationApplications"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-civic hover:shadow-md"
        >
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <FileText size={22} />
          </div>

          <h2 className="mt-4 font-bold text-slate-900">
            Applications
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review new and renewal organization registration applications.
          </p>
        </Link>


        <Link
          to="/OrganizationRegistry"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-civic hover:shadow-md"
        >
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <UsersRound size={22} />
          </div>

          <h2 className="mt-4 font-bold text-slate-900">
            Organization Registry
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            View approved organizations and manage registration certificates.
          </p>
        </Link>

      </section>


      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Dashboard statistics could not be loaded. Confirm that the backend
          dashboard route is running, then press Refresh.
        </div>
      ) : null}


      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Applications
          </h2>

          <p className="text-sm text-slate-500">
            Registration application workload and workflow status.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <>
     <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <StatCard
                label="Total Applications"
                value={applications.total}
                icon={FileText}
              />

              <StatCard
                label="Submitted"
                value={applications.submitted}
                icon={Clock3}
              />

              <StatCard
                label="Under Review"
                value={applications.underReview}
                icon={FileCheck2}
              />

              <StatCard
                label="Returned for Revision"
                value={applications.returnedForRevision}
                icon={RotateCcw}
              />

              <StatCard
                label="Approved"
                value={applications.approved}
                icon={CheckCircle2}
              />

              <StatCard
                label="New Registrations"
                value={applications.newRegistrations}
                icon={UsersRound}
              />

              <StatCard
                label="Renewals"
                value={applications.renewals}
                icon={RefreshCw}
              />
            </>
          )}
        </div>
      </section>


      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Payments
          </h2>

          <p className="text-sm text-slate-500">
            Registration fee status and verified revenue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <StatCard
                label="Payment Required"
                value={payments.required}
                icon={BadgeDollarSign}
              />

              <StatCard
                label="Pending"
                value={payments.pending}
                icon={Clock3}
              />

              <StatCard
                label="Paid"
                value={payments.paid}
                icon={BadgeDollarSign}
              />

              <StatCard
                label="Verified"
                value={payments.verified}
                icon={ShieldCheck}
              />

              <StatCard
                label="Exempt"
                value={payments.exempt}
                icon={CheckCircle2}
              />

              <StatCard
                label="Total Fees Collected"
                value={`$${totalFeesCollected}`}
                helper="Verified payments only"
                icon={BadgeDollarSign}
              />
            </>
          )}
        </div>
      </section>


      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Registered Organizations & Certificates
          </h2>

          <p className="text-sm text-slate-500">
            Current organization registry and certificate status.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <StatCard
                label="Registered Organizations"
                value={registry.totalRegisteredOrganizations}
                icon={UsersRound}
              />

              <StatCard
                label="Active Certificates"
                value={certificates.active}
                icon={CheckCircle2}
              />

              <StatCard
                label="Expired"
                value={certificates.expired}
                icon={Clock3}
              />

              <StatCard
                label="Suspended"
                value={certificates.suspended}
                icon={ShieldCheck}
              />

              <StatCard
                label="Revoked"
                value={certificates.revoked}
                icon={XCircle}
              />
            </>
          )}
        </div>
      </section>


      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Visual Analytics
          </h2>

          <p className="text-sm text-slate-500">
            Charts showing how registration applications are distributed.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <BarBreakdownChart
            title="Applications by Approval Stage"
            items={breakdowns.approvalStage}
          />

          <PieBreakdownChart
            title="New Registration vs Renewal"
            items={breakdowns.applicationType}
          />

          <BarBreakdownChart
            title="Applications by Organization Type"
            items={breakdowns.organizationType}
          />

          <PieBreakdownChart
            title="Applications by Payment Status"
            items={breakdowns.paymentStatus}
          />
        </div>
      </section>


      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Recent Activity
          </h2>

          <p className="text-sm text-slate-500">
            Latest registration applications and recently issued certificates.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">
                  Recent Applications
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Latest submitted organization applications
                </p>
              </div>

              <FileText size={20} className="text-slate-500" />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Application</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stage</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentApplications.length ? (
                    recentApplications.map(
                      (application) => (
                        <tr
                          key={
                            application.id ||
                            application.applicationNumber
                          }
                          className="hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="font-semibold text-slate-900">
                              {application.applicationNumber || '—'}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {application.applicationType || '—'}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {application.organizationName || '—'}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <StatusBadge
                              value={
                                application.approvalStage ||
                                application.status
                              }
                            />
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {formatDate(
                              application.submittedAt
                            )}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No recent applications.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-5 py-3">
              <Link
                to="/OrganizationApplications"
                className="text-sm font-semibold text-civic hover:underline"
              >
                View all applications
              </Link>
            </div>
          </div>


          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">
                  Recent Certificates
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Latest registration and certificate activity
                </p>
              </div>

              <CalendarDays size={20} className="text-slate-500" />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Organization</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Registration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Issue / Expiry</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentCertificates.length ? (
                    recentCertificates.map(
                      (certificate) => (
                        <tr
                          key={
                            certificate.id ||
                            certificate.certificateNumber
                          }
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">
                              {certificate.organizationName || '—'}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {certificate.registrationType || '—'}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="font-semibold text-slate-700">
                              {certificate.registrationNumber || '—'}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {certificate.certificateNumber || '—'}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            <StatusBadge
                              value={certificate.status}
                            />
                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            <div>
                              {formatDate(
                                certificate.issueDate
                              )}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Expires {formatDate(
                                certificate.expiryDate
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No recent certificate activity.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-5 py-3">
              <Link
                to="/OrganizationRegistry"
                className="text-sm font-semibold text-civic hover:underline"
              >
                View organization registry
              </Link>
            </div>
          </div>
        </div>
      </section>


      <section>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900">
            Registration Analytics
          </h2>

          <p className="text-sm text-slate-500">
            Application distribution across the registration workflow.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownList
            title="Applications by Organization Type"
            items={breakdowns.organizationType}
          />

          <BreakdownList
            title="Applications by Approval Stage"
            items={breakdowns.approvalStage}
          />

          <BreakdownList
            title="New Registration vs Renewal"
            items={breakdowns.applicationType}
          />

          <BreakdownList
            title="Applications by Payment Status"
            items={breakdowns.paymentStatus}
          />
        </div>
      </section>

    </div>
  );
}
