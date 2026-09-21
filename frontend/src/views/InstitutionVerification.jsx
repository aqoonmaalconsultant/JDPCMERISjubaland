import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CheckCircle2,
  Eye,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';

import { api } from '../api/client.js';

const institutionTypes = [
  'Government Line Ministry',
  'Government Agency',
  'Other Government Institution',
  'UN Agency',
  'INGO',
  'LNGO',
  'Development Partner',
  'Private Company',
  'Consultant',
  'CBO',
  'Other',
];

const statuses = [
  'Incomplete',
  'Pending Verification',
  'Verified',
  'Returned for Update',
  'Suspended',
];

function statusClass(status) {
  if (status === 'Verified') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'Pending Verification') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (status === 'Returned for Update') {
    return 'border-orange-200 bg-orange-50 text-orange-700';
  }

  if (status === 'Suspended') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

function DetailItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value || '—'}
      </p>
    </div>
  );
}

export function InstitutionVerification() {
  const [
    search,
    setSearch,
  ] = useState('');

  const [
    status,
    setStatus,
  ] = useState(
    'Pending Verification'
  );

  const [
    type,
    setType,
  ] = useState('');

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
    pages: 1,
    total: 0,
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
    returnReason,
    setReturnReason,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  const query = useMemo(
    () => ({
      search: search.trim(),
      status,
      type,
      page,
      limit: 20,
    }),
    [
      search,
      status,
      type,
      page,
    ]
  );

  async function loadInstitutions() {
    try {
      setLoading(true);
      setError('');

      const { data } =
        await api.get(
          '/institution-profiles',
          {
            params: query,
          }
        );

      setRows(
        data?.data || []
      );

      setPagination(
        data?.pagination || {
          page: 1,
          pages: 1,
          total: 0,
        }
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'Unable to load institution profiles.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInstitutions();
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [search, status, type]);

  async function openInstitution(
    id
  ) {
    try {
      setDetailLoading(true);
      setError('');
      setSuccess('');
      setReturnReason('');

      const { data } =
        await api.get(
          `/institution-profiles/${id}`
        );

      setSelected(
        data?.data || null
      );
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'Unable to load institution details.'
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function verifyInstitution() {
    if (!selected?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Verify ${selected.institutionName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const { data } =
        await api.patch(
          `/institution-profiles/${selected._id}/verify`,
          {}
        );

      setSelected(
        data?.data || selected
      );

      setSuccess(
        data?.message ||
          'Institution verified successfully.'
      );

      await loadInstitutions();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'Unable to verify the institution.'
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function returnForUpdate() {
    if (!selected?._id) {
      return;
    }

    if (
      returnReason.trim().length <
      3
    ) {
      setError(
        'Enter a reason before returning the institution profile.'
      );
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const { data } =
        await api.patch(
          `/institution-profiles/${selected._id}/return-for-update`,
          {
            reason:
              returnReason.trim(),
          }
        );

      setSelected(
        data?.data || selected
      );

      setReturnReason('');

      setSuccess(
        data?.message ||
          'Institution profile returned for update.'
      );

      await loadInstitutions();
    } catch (requestError) {
      setError(
        requestError.response?.data
          ?.message ||
          'Unable to return the institution profile.'
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
              Institution Verification
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review institutions that want to register and manage projects through JAIMS.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
            <ShieldCheck
              size={18}
            />

            {pagination.total}{' '}
            institution
            {pagination.total === 1
              ? ''
              : 's'}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1.5fr_1fr_1fr]">
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search institution, email, phone, or contact person"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
            />
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
          >
            <option value="">
              All statuses
            </option>

            {statuses.map(
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
            value={type}
            onChange={(event) =>
              setType(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
          >
            <option value="">
              All institution types
            </option>

            {institutionTypes.map(
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
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Institution
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Contact Person
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Submitted
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Loading institution profiles...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map(
                  (institution) => (
                    <tr
                      key={
                        institution._id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {
                            institution.institutionName
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            institution.email
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {
                          institution.institutionType
                        }
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {
                            institution.contactPerson
                              ?.name ||
                            '—'
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            institution.contactPerson
                              ?.position ||
                            '—'
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          institution.submittedForVerificationAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex rounded-full border px-2.5 py-1 text-xs font-bold',
                            statusClass(
                              institution.verificationStatus
                            ),
                          ].join(
                            ' '
                          )}
                        >
                          {
                            institution.verificationStatus
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            openInstitution(
                              institution._id
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
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No institution profiles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500">
            Page{' '}
            {pagination.page || 1}{' '}
            of{' '}
            {pagination.pages || 1}
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
                      current - 1,
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
                (pagination.pages ||
                  1)
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
              className="rounded border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {selected || detailLoading ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 md:p-8">
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic">
                  Institution Review
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {selected
                    ?.institutionName ||
                    'Loading...'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setReturnReason('');
                  setError('');
                  setSuccess('');
                }}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-sm text-slate-500">
                Loading institution details...
              </div>
            ) : selected ? (
              <div className="space-y-6 p-6">
                <section>
                  <h4 className="text-sm font-bold text-slate-900">
                    Institution Information
                  </h4>

                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Institution Name"
                      value={
                        selected.institutionName
                      }
                    />

                    <DetailItem
                      label="Institution Type"
                      value={
                        selected.institutionType
                      }
                    />

                    <DetailItem
                      label="Country"
                      value={
                        selected.country
                      }
                    />

                    <DetailItem
                      label="Address"
                      value={
                        selected.address
                      }
                    />

                    <DetailItem
                      label="Phone"
                      value={
                        selected.phone
                      }
                    />

                    <DetailItem
                      label="Email"
                      value={
                        selected.email
                      }
                    />

                    <DetailItem
                      label="Website"
                      value={
                        selected.website
                      }
                    />

                    <DetailItem
                      label="Status"
                      value={
                        selected.verificationStatus
                      }
                    />
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-bold text-slate-900">
                    Registration Information
                  </h4>

                  <div className="mt-4 grid gap-5 sm:grid-cols-3">
                    <DetailItem
                      label="Registration / License Number"
                      value={
                        selected.registrationNumber
                      }
                    />

                    <DetailItem
                      label="Registration Authority"
                      value={
                        selected.registrationAuthority
                      }
                    />

                    <DetailItem
                      label="Registration Country"
                      value={
                        selected.registrationCountry
                      }
                    />
                  </div>
                // </section>

                <section className="border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-bold text-slate-900">
                    Contact Person
                  </h4>

                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <DetailItem
                      label="Name"
                      value={
                        selected.contactPerson
                          ?.name
                      }
                    />

                    <DetailItem
                      label="Position / Title"
                      value={
                        selected.contactPerson
                          ?.position
                      }
                    />

                    <DetailItem
                      label="Phone"
                      value={
                        selected.contactPerson
                          ?.phone
                      }
                    />

                    <DetailItem
                      label="Email"
                      value={
                        selected.contactPerson
                          ?.email
                      }
                    />
                  </div>
                </section>

                <section className="border-t border-slate-200 pt-6">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <DetailItem
                      label="Submitted Date"
                      value={formatDate(
                        selected.submittedForVerificationAt
                      )}
                    />

                    <DetailItem
                      label="Verified Date"
                      value={formatDate(
                        selected.verifiedAt
                      )}
                    />

                    <DetailItem
                      label="Verified By"
                      value={
                        selected.verifiedBy
                          ?.name
                      }
                    />
                  </div>

                  {selected.verificationNotes ? (
                    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Verification Note
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {
                          selected.verificationNotes
                        }
                      </p>
                    </div>
                  ) : null}
                </section>

                {selected.verificationStatus ===
                'Pending Verification' ? (
                  <section className="border-t border-slate-200 pt-6">
                    <h4 className="text-sm font-bold text-slate-900">
                      Review Decision
                    </h4>

                    <textarea
                      value={
                        returnReason
                      }
                      onChange={(event) =>
                        setReturnReason(
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="Reason required only when returning the profile for update"
                      className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic focus:ring-2 focus:ring-civic/10"
                    />

                    <div className="mt-4 flex flex-col justify-end gap-3 sm:flex-row">
                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={
                          returnForUpdate
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                      >
                        <RotateCcw
                          size={17}
                        />

                        Return for Update
                      </button>

                      <button
                        type="button"
                        disabled={
                          actionLoading
                        }
                        onClick={
                          verifyInstitution
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-civic px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <CheckCircle2
                          size={17}
                        />

                        Verify Institution
                      </button>
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default InstitutionVerification;
