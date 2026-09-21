import {
  useState,
} from "react";

const API_BASE_URL =
  "http://localhost:5000/api/v1";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  ).format(date);
}

function getStatusClasses(
  status
) {
  switch (status) {
    case "VALID":
      return "bg-emerald-100 text-emerald-700";

    case "SUSPENDED":
      return "bg-amber-100 text-amber-800";

    case "REVOKED":
      return "bg-red-100 text-red-700";

    case "EXPIRED":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusTextClasses(
  status
) {
  switch (status) {
    case "VALID":
      return "text-emerald-700";

    case "SUSPENDED":
      return "text-amber-700";

    case "REVOKED":
      return "text-red-700";

    case "EXPIRED":
      return "text-slate-700";

    default:
      return "text-slate-700";
  }
}

function OrganizationVerificationPage() {
  const [
    certificateNumber,
    setCertificateNumber,
  ] =
    useState("");

  const [
    result,
    setResult,
  ] =
    useState(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    const normalizedCertificateNumber =
      certificateNumber
        .trim()
        .toUpperCase();

    setResult(null);
    setError("");

    if (
      !normalizedCertificateNumber
    ) {
      setError(
        "Please enter certificate number."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_BASE_URL}/public/organization-registry/${encodeURIComponent(
            normalizedCertificateNumber
          )}`
        );

      const payload =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            "Unable to verify organization registration."
        );
      }

      setResult(
        payload.data
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to verify organization registration."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
            Organization Registry
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Verify Organization Registration
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Enter the certificate number to verify an organization&apos;s registration with the Ministry of Planning, Investment and International Cooperation of Jubaland State.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={
              handleSubmit
            }
          >
            <label
              htmlFor="certificateNumber"
              className="block text-sm font-semibold text-slate-800"
            >
              Certificate Number
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="certificateNumber"
                type="text"
                value={
                  certificateNumber
                }
                onChange={(
                  event
                ) =>
                  setCertificateNumber(
                    event.target
                      .value
                  )
                }
                placeholder="CERT-2026-000007"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

              <button
                type="submit"
                disabled={
                  loading
                }
                className="rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Verifying..."
                  : "Verify"}
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Please enter certificate number. Example: CERT-2026-000007
            </p>
          </form>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Registration Verification
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {
                        result.organizationName
                      }
                    </h2>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                      result.status
                    )}`}
                  >
                    {
                      result.status
                    }
                  </span>
                </div>
              </div>

              <dl className="divide-y divide-slate-200">
                <div className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                  <dt className="text-sm font-medium text-slate-500">
                    Organization Name
                  </dt>

                  <dd className="text-sm font-semibold text-slate-900 sm:col-span-2">
                    {
                      result.organizationName
                    }
                  </dd>
                </div>

                <div className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                  <dt className="text-sm font-medium text-slate-500">
                    Certificate Number
                  </dt>

                  <dd className="text-sm font-semibold text-slate-900 sm:col-span-2">
                    {
                      result.certificateNumber
                    }
                  </dd>
                </div>

                <div className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                  <dt className="text-sm font-medium text-slate-500">
                    Issue Date
                  </dt>

                  <dd className="text-sm font-semibold text-slate-900 sm:col-span-2">
                    {formatDate(
                      result.issueDate
                    )}
                  </dd>
                </div>

                <div className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                  <dt className="text-sm font-medium text-slate-500">
                    Expiry Date
                  </dt>

                  <dd className="text-sm font-semibold text-slate-900 sm:col-span-2">
                    {formatDate(
                      result.expiryDate
                    )}
                  </dd>
                </div>

                <div className="grid gap-1 px-5 py-4 sm:grid-cols-3">
                  <dt className="text-sm font-medium text-slate-500">
                    Status
                  </dt>

                  <dd className="text-sm font-semibold sm:col-span-2">
                    <span
                      className={
                        getStatusTextClasses(
                          result.status
                        )
                      }
                    >
                      {
                        result.status
                      }
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default OrganizationVerificationPage;