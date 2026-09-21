import {
  useMemo,
  useState,
} from 'react';

import {
  Building2,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileBadge2,
  FilePlus2,
  FileWarning,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

import {
  openNGOCertificate,
  saveNGOCertificateDownload,
  useGenerateNGOCertificate,
  useNGOs,
  useRegenerateNGOCertificate,
} from '../api/ngos.js';

import {
  NGOFormModal,
} from '../ui/NGOFormModal.jsx';

function getStatusClasses(
  status
) {
  const normalizedStatus =
    String(
      status ||
        ''
    )
      .trim()
      .toLowerCase();

  if (
    [
      'active',
      'approved',
      'registered',
      'compliant',
    ].includes(
      normalizedStatus
    )
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (
    [
      'pending',
      'submitted',
      'under review',
      'not reviewed',
      'unknown',
    ].includes(
      normalizedStatus
    )
  ) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (
    [
      'expired',
      'suspended',
      'rejected',
      'revoked',
      'inactive',
      'non-compliant',
    ].includes(
      normalizedStatus
    )
  ) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function formatDate(
  value
) {
  if (!value) {
    return '—';
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',
    }
  ).format(
    date
  );
}

function getActionErrorMessage(
  error,
  fallback
) {
  return (
    error?.response?.data
      ?.message ||
    error?.message ||
    fallback
  );
}

function StatCard({
  label,
  value,
  icon:
    Icon,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-civic">
          <Icon
            size={22}
          />
        </div>
      </div>
    </div>
  );
}

function CertificateDetails({
  certificate,
}) {
  if (
    !certificate
  ) {
    return (
      <div className="min-w-52">
        <p className="text-sm font-semibold text-slate-700">
          No certificate
        </p>

        <p className="mt-1 text-xs text-slate-500">
          No certificate record is linked.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-56">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-slate-900">
          {certificate.certificateNumber ||
            'Certificate record'}
        </p>

        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getStatusClasses(
            certificate.status
          )}`}
        >
          {certificate.status ||
            'Unknown'}
        </span>
      </div>

      <div className="mt-2 space-y-1 text-xs text-slate-500">
        <p>
          Issue:{' '}
          <span className="font-medium text-slate-700">
            {formatDate(
              certificate.issueDate
            )}
          </span>
        </p>

        <p>
          Expiry:{' '}
          <span className="font-medium text-slate-700">
            {formatDate(
              certificate.expiryDate
            )}
          </span>
        </p>

        <p>
          PDF:{' '}
          <span
            className={`font-semibold ${
              certificate.generated
                ? 'text-emerald-700'
                : 'text-amber-700'
            }`}
          >
            {certificate.generated
              ? 'Generated'
              : 'Not generated'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function OrganizationRegistry() {
  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState('');

  const [
    registrationStatus,
    setRegistrationStatus,
  ] =
    useState(
      'all'
    );

  const [
    complianceStatus,
    setComplianceStatus,
  ] =
    useState(
      'all'
    );

  const [
    isNGOModalOpen,
    setIsNGOModalOpen,
  ] =
    useState(
      false
    );

  const [
    editingNGO,
    setEditingNGO,
  ] =
    useState(
      null
    );

  const [
    certificateAction,
    setCertificateAction,
  ] =
    useState('');

  const [
    actionMessage,
    setActionMessage,
  ] =
    useState('');

  const [
    actionError,
    setActionError,
  ] =
    useState('');

  const organizationsQuery =
    useNGOs();

  const generateCertificateMutation =
    useGenerateNGOCertificate();

  const regenerateCertificateMutation =
    useRegenerateNGOCertificate();

 const organizations =
  organizationsQuery.data
    ?.items ||
  [];

  const complianceOptions =
    useMemo(
      () =>
        Array.from(
          new Set([
            'Compliant',
            'Pending Review',
            'Non-Compliant',
            ...organizations
              .map(
                (organization) =>
                  organization.complianceStatus
              )
              .filter(Boolean),
          ])
        ),
      [organizations]
    );

  const statusOptions =
    useMemo(
      () =>
        Array.from(
          new Set([
            'Active',
            'Expired',
            'Suspended',
            'Revoked',
            ...organizations
              .map(
                (organization) =>
                  organization.registrationStatus
              )
              .filter(Boolean),
          ])
        ),
      [organizations]
    );
  const filteredorganizations =
    useMemo(
      () => {
        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();

        return organizations.filter(
          (
            organization
          ) => {
            const organizationName =
              String(
                organization.organizationName ||
                  ''
              ).toLowerCase();
const jaimsNumber =
  String(
    organization.latestApplication
      ?.applicationNumber ||
      ''
  ).toLowerCase();

            const organizationType =
              String(
                organization.organizationType ||
                  ''
              ).toLowerCase();

           const organizationAddress =
  String(
    organization.contact?.address ||
      organization.address ||
      ''
  ).toLowerCase();

            const certificateNumber =
              String(
                organization.currentCertificate
                  ?.certificateNumber ||
                  ''
              ).toLowerCase();

            const matchesSearch =
              !normalizedSearch ||
              organizationName.includes(
                normalizedSearch
              ) ||
              jaimsNumber.includes(
  normalizedSearch
) ||
              organizationType.includes(
                normalizedSearch
              ) ||
             organizationAddress.includes(
  normalizedSearch
) ||
              certificateNumber.includes(
                normalizedSearch
              );

            const matchesRegistrationStatus =
              registrationStatus ===
                'all' ||
              organization.registrationStatus ===
                registrationStatus;

            const matchesComplianceStatus =
              complianceStatus ===
                'all' ||
              organization.complianceStatus ===
                complianceStatus;

            return (
              matchesSearch &&
              matchesRegistrationStatus &&
              matchesComplianceStatus
            );
          }
        );
      },
      [
       organizations,
        searchTerm,
        registrationStatus,
        complianceStatus,
      ]
    );

  const statistics =
    useMemo(
      () => {
        const total =
          organizations.length;

        const active =
          organizations.filter(
            (
              organization
            ) =>
              String(
                organization.registrationStatus ||
                  ''
              ).toLowerCase() ===
              'active'
          ).length;

        const pending =
          organizations.filter(
            (
              organization
            ) =>
              String(
                organization.complianceStatus ||
                  ''
              ).toLowerCase() ===
              'pending review'
          ).length;

        const compliant =
  organizations.filter(
    (
      organization
    ) =>
      String(
        organization.complianceStatus ||
          ''
      ).toLowerCase() ===
      'compliant'
  ).length;
        return {
          total,
          active,
          pending,
          compliant,
        };
      },
      [
        organizations,
      ]
    );

  const clearActionState =
    () => {
      setActionMessage(
        ''
      );

      setActionError(
        ''
      );
    };

const openEditModal =
  (
    organization
  ) => {
    setEditingNGO(
      organization
    );

      setIsNGOModalOpen(
        true
      );
    };

  const closeNGOModal =
    () => {
      setIsNGOModalOpen(
        false
      );

      setEditingNGO(
        null
      );
    };

  const handleGenerateCertificate =
    async (
      organization
    ) => {
      const organizationId =
        organization.rawId ||
        organization.id;

      if (
        !organizationId
      ) {
        return;
      }

      clearActionState();

      setCertificateAction(
        `generate:${organizationId}`
      );

      try {
        const result =
          await generateCertificateMutation.mutateAsync(
            organizationId
          );

        setActionMessage(
          result?.message ||
            `Certificate generated successfully for ${organization.organizationName}.`
        );
      } catch (
        error
      ) {
        setActionError(
          getActionErrorMessage(
            error,
            'The certificate could not be generated.'
          )
        );
      } finally {
        setCertificateAction(
          ''
        );
      }
    };

  const handleRegenerateCertificate =
    async (
      organization
    ) => {
      const organizationId =
        organization.rawId ||
        organization.id;

      if (
        !organizationId
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Regenerate the certificate for ${organization.organizationName}?\n\nThe existing PDF will be replaced. The License Number, Certificate ID, issue date and expiry date will remain unchanged.`
        );

      if (
        !confirmed
      ) {
        return;
      }

      clearActionState();

      setCertificateAction(
        `regenerate:${organizationId}`
      );

      try {
        const result =
          await regenerateCertificateMutation.mutateAsync(
            organizationId
          );

        setActionMessage(
          result?.message ||
            `Certificate regenerated successfully for ${organization.organizationName}.`
        );
      } catch (
        error
      ) {
        setActionError(
          getActionErrorMessage(
            error,
            'The certificate could not be regenerated.'
          )
        );
      } finally {
        setCertificateAction(
          ''
        );
      }
    };

  const handleViewCertificate =
    async (
      organization
    ) => {
      const organizationId =
        organization.rawId ||
        organization.id;

      if (
        !organizationId
      ) {
        return;
      }

      clearActionState();

      setCertificateAction(
        `view:${organizationId}`
      );

      try {
        await openNGOCertificate(
          organizationId
        );
      } catch (
        error
      ) {
        setActionError(
          getActionErrorMessage(
            error,
            'The certificate could not be opened.'
          )
        );
      } finally {
        setCertificateAction(
          ''
        );
      }
    };

  const handleDownloadCertificate =
    async (
      organization
    ) => {
      const organizationId =
        organization.rawId ||
        organization.id;

      if (
        !organizationId
      ) {
        return;
      }

      clearActionState();

      setCertificateAction(
        `download:${organizationId}`
      );

      try {
        await saveNGOCertificateDownload(
          organizationId,
          `${organization.currentCertificate?.certificateNumber || organization.registrationNumber || 'organization-certificate'}.pdf`
        );

        setActionMessage(
          `Certificate downloaded successfully for ${organization.organizationName}.`
        );
      } catch (
        error
      ) {
        setActionError(
          getActionErrorMessage(
            error,
            'The certificate could not be downloaded.'
          )
        );
      } finally {
        setCertificateAction(
          ''
        );
      }
    };

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Organization Registry
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage registered non-governmental organizations and registration certificates in Jubaland.
            </p>
          </div>
        </div>

        {actionMessage ? (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <div className="flex items-start gap-2">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>
                {actionMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={
                () =>
                  setActionMessage(
                    ''
                  )
              }
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {actionError ? (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="flex items-start gap-2">
              <FileWarning
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>
                {actionError}
              </p>
            </div>

            <button
              type="button"
              onClick={
                () =>
                  setActionError(
                    ''
                  )
              }
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Organizations"
            value={
              statistics.total
            }
            icon={
              UsersRound
            }
          />

          <StatCard
            label="Active Registrations"
            value={
              statistics.active
            }
            icon={
              CheckCircle2
            }
          />

          <StatCard
            label="Pending Review"
            value={
              statistics.pending
            }
            icon={
              FileWarning
            }
          />

          <StatCard
            label="Compliant Organizations"
            value={
              statistics.compliant
            }
            icon={
              ShieldCheck
            }
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-64 flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={
                    searchTerm
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setSearchTerm(
                        event.target.value
                      )
                  }
                 placeholder="Search by organization name, JAIMS number, certificate number, type or address"
                  className="w-full rounded border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-civic focus:ring-2 focus:ring-civic/20"
                />
              </div>

              <select
                value={
                  registrationStatus
                }
                onChange={
                  (
                    event
                  ) =>
                    setRegistrationStatus(
                      event.target.value
                    )
                }
                className="rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-civic focus:ring-2 focus:ring-civic/20"
              >
                <option value="all">
                  All registration statuses
                </option>

                {statusOptions.map(
                  (
                    status
                  ) => (
                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {status}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  complianceStatus
                }
                onChange={
                  (
                    event
                  ) =>
                    setComplianceStatus(
                      event.target.value
                    )
                }
                className="rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-civic focus:ring-2 focus:ring-civic/20"
              >
                <option value="all">
                  All compliance statuses
                </option>

                {complianceOptions.map(
                  (
                    status
                  ) => (
                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {status}
                    </option>
                  )
                )}
              </select>

              <button
                type="button"
                onClick={
                  () =>
                    organizationsQuery.refetch()
                }
                disabled={
                  organizationsQuery.isFetching
                }
                className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    organizationsQuery.isFetching
                      ? 'animate-spin'
                      : ''
                  }
                />

                Refresh
              </button>
            </div>
          </div>

          {organizationsQuery.isLoading ? (
            <div className="flex min-h-64 items-center justify-center p-8">
              <div className="text-center">
                <RefreshCw
                  size={28}
                  className="mx-auto animate-spin text-civic"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  Loading Organization Registry...
                </p>
              </div>
            </div>
          ) : organizationsQuery.isError ? (
            <div className="flex min-h-64 items-center justify-center p-8">
              <div className="max-w-md text-center">
                <FileWarning
                  size={36}
                  className="mx-auto text-red-500"
                />

                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  Unable to load Organization Registry
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {organizationsQuery.error
                    ?.response
                    ?.data
                    ?.message ||
                    organizationsQuery.error
                      ?.message ||
                    'The organization information could not be retrieved from the server.'}
                </p>

                <button
                  type="button"
                  onClick={
                    () =>
                      organizationsQuery.refetch()
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  <RefreshCw
                    size={17}
                  />

                  Try Again
                </button>
              </div>
            </div>
          ) : filteredorganizations.length ===
            0 ? (
            <div className="flex min-h-64 items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-civic">
                  <Building2
                    size={28}
                  />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {organizations.length ===
                  0
                    ? 'No organizations registered'
                    : 'No matching organizations found'}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {organizations.length ===
                  0
                    ? 'No organization records are currently available.'
                    : 'Change the search term or selected filters and try again.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
  JAIMS No.
</th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Organization
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
  Type / Address
</th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Certificate
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registration
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Compliance
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredorganizations.map(
                      (
                        organization
                      ) => {
                        const organizationId =
                          organization.rawId ||
                          Organization.id;

                        const certificate =
                          organization.currentCertificate;

                        const isGenerated =
                          Boolean(
                            certificate
                              ?.generated
                          );

                        const isGenerating =
                          certificateAction ===
                          `generate:${organizationId}`;

                        const isRegenerating =
                          certificateAction ===
                          `regenerate:${organizationId}`;

                        const isViewing =
                          certificateAction ===
                          `view:${organizationId}`;

                        const isDownloading =
                          certificateAction ===
                          `download:${organizationId}`;

                        const isBusy =
                          Boolean(
                            certificateAction
                          );

                        return (
                          <tr
                            key={
                              organizationId
                            }
                            className="transition hover:bg-slate-50"
                          >
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-civic">
  {organization.latestApplication
    ?.applicationNumber ||
    '—'}
</td>

                            <td className="px-4 py-4">
                              <div className="flex min-w-60 items-center gap-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-slate-100 text-civic">
                                  <Building2
                                    size={18}
                                  />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {organization.organizationName ||
                                      'Unnamed organization'}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {Array.isArray(
                                      organization.sectors
                                    ) &&
                                    organization.sectors
                                      .length
                                      ?organization.sectors.join(
                                          ', '
                                        )
                                      : 'No sectors assigned'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="max-w-64 px-4 py-4 text-sm text-slate-600">
  <p className="font-medium text-slate-700">
    {organization.organizationType ||
      '—'}
  </p>

  <p
    className="mt-1 truncate text-xs text-slate-500"
    title={
      organization.contact?.address ||
      organization.address ||
      ''
    }
  >
    {organization.contact?.address ||
      organization.address ||
      '—'}
  </p>
</td>
                            <td className="px-4 py-4">
                              <CertificateDetails
                                certificate={
                                  certificate
                                }
                              />
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  organization.registrationStatus
                                )}`}
                              >
                                {organization.registrationStatus ||
                                  'Unknown'}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-4 py-4">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  organization.complianceStatus
                                )}`}
                              >
                                {organization.complianceStatus ||
                                  'Not Reviewed'}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right">
                              <div className="flex min-w-72 flex-wrap items-center justify-end gap-2">
                                {!isGenerated &&
                                certificate ? (
                                  <button
                                    type="button"
                                    onClick={
                                      () =>
                                        handleGenerateCertificate(
                                          organization
                                        )
                                    }
                                    disabled={
                                      isBusy
                                    }
                                    className="inline-flex items-center gap-1.5 rounded bg-civic px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isGenerating ? (
                                      <RefreshCw
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <FilePlus2
                                        size={15}
                                      />
                                    )}

                                    Generate
                                  </button>
                                ) : null}

                                {isGenerated ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          handleViewCertificate(
                                            organization
                                          )
                                      }
                                      disabled={
                                        isBusy
                                      }
                                      className="inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isViewing ? (
                                        <RefreshCw
                                          size={15}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Eye
                                          size={15}
                                        />
                                      )}

                                      View
                                    </button>

                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          handleDownloadCertificate(
                                            organization
                                          )
                                      }
                                      disabled={
                                        isBusy
                                      }
                                      className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isDownloading ? (
                                        <RefreshCw
                                          size={15}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Download
                                          size={15}
                                        />
                                      )}

                                      Download
                                    </button>

                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          handleRegenerateCertificate(
                                            organization
                                          )
                                      }
                                      disabled={
                                        isBusy
                                      }
                                      className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isRegenerating ? (
                                        <RefreshCw
                                          size={15}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <FileBadge2
                                          size={15}
                                        />
                                      )}

                                      Regenerate
                                    </button>
                                  </>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      openEditModal(
                                        organization
                                      )
                                  }
                                  disabled={
                                    isBusy
                                  }
                                  className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Edit
                                    size={15}
                                  />

                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
                <p className="text-sm text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {filteredorganizations.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-700">
                    {organizations.length}
                  </span>{' '}
                  Organizations
                </p>

                {organizationsQuery.isFetching ? (
                  <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />

                    Updating registry...
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <NGOFormModal
        isOpen={
          isNGOModalOpen
        }
        onClose={
          closeNGOModal
        }
        ngo={
          editingNGO
        }
      />
    </>
  );
}