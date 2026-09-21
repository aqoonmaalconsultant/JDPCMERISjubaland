import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react';

import {
  organizationApi,
} from '../api/organizationClient.js';


function RenewalReminder({
  reminder,
}) {
  if (!reminder) {
    return null;
  }

  const isExpiryDate =
    reminder.type ===
    'RENEWAL_EXPIRY_DATE';

  const isFiveDays =
    reminder.type ===
    'RENEWAL_5_DAYS';

  const containerClass =
    isExpiryDate
      ? 'border-red-300 bg-red-50 text-red-800'
      : isFiveDays
        ? 'border-amber-300 bg-amber-50 text-amber-800'
        : 'border-blue-300 bg-blue-50 text-blue-800';

  return (
    <section
      className={`rounded-xl border p-5 ${containerClass}`}
    >
      <div className="flex items-start gap-3">

        <AlertTriangle
          size={22}
          className="mt-0.5 shrink-0"
        />

        <div>

          <h2 className="font-bold">
            {isExpiryDate
              ? 'Registration Expires Today'
              : isFiveDays
                ? 'Urgent Renewal Reminder'
                : 'Renewal Reminder'}
          </h2>

          <p className="mt-1 text-sm leading-6">
            {reminder.message}
          </p>

          {reminder.expiryDate ? (
            <p className="mt-2 text-sm font-semibold">
              Expiry Date:{' '}
              {new Date(
                reminder.expiryDate
              ).toLocaleDateString()}
            </p>
          ) : null}

        </div>

      </div>
    </section>
  );
}


function normalizeList(
  value
) {
  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .filter(Boolean)
    .join(', ');
}


function parseList(
  value
) {
  return String(
    value || ''
  )
    .split(',')
    .map(
      (item) =>
        item.trim()
    )
    .filter(Boolean);
}


export default function OrganizationRenewal() {
  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    organization,
    setOrganization,
  ] = useState(null);

  const [
    approvedApplication,
    setApprovedApplication,
  ] = useState(null);

  const [
    registrationCertificate,
    setRegistrationCertificate,
  ] = useState(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState('');

  const [
    submitSuccess,
    setSubmitSuccess,
  ] = useState('');

  const [
    renewalForm,
    setRenewalForm,
  ] = useState({
    organizationName: '',
    organizationType: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    sectors: '',
    activityAreas: '',
  });


  useEffect(() => {
    let active = true;

    async function loadRenewalInformation() {
      try {
        setLoading(true);
        setError('');

        const applicationsResponse =
          await organizationApi.get(
            '/organization-portal/applications'
          );

        const applications =
          applicationsResponse.data?.data ||
          [];

        const approved =
          applications.find(
            (application) =>
              application.applicationType ===
                'New Registration' &&
              application.status ===
                'Approved'
          );

        if (!approved) {
          throw new Error(
            'No approved organization registration was found for this account. Renewal is available only after a New Registration has been approved.'
          );
        }

        if (!active) {
          return;
        }

        setApprovedApplication(
          approved
        );

        const verificationResponse =
          await organizationApi.get(
            `/organization-portal/renewal/${encodeURIComponent(
              approved.applicationNumber
            )}`
          );

        if (!active) {
          return;
        }

        const existingOrganization =
          verificationResponse.data?.data ||
          null;

        if (!existingOrganization) {
          throw new Error(
            'Unable to load the existing organization registration.'
          );
        }

        setOrganization(
          existingOrganization
        );

        setRenewalForm({
          organizationName:
            existingOrganization.organizationName ||
            '',

          organizationType:
            existingOrganization.organizationType ||
            '',

          email:
            existingOrganization.contact?.email ||
            '',

          phone:
            existingOrganization.contact?.phone ||
            '',

          address:
            existingOrganization.contact?.address ||
            '',

          website:
            existingOrganization.contact?.website ||
            '',

          sectors:
            normalizeList(
              existingOrganization.sectors
            ),

          activityAreas:
            normalizeList(
              existingOrganization.activityAreas
            ),
        });

      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            'Unable to load renewal information.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRenewalInformation();

    return () => {
      active = false;
    };
  }, []);


  const updateRenewalForm =
    (field) =>
    (event) => {
      setRenewalForm(
        (current) => ({
          ...current,

          [field]:
            event.target.value,
        })
      );

      setSubmitError('');
    };


  const handleCertificateChange = (
    event
  ) => {
    const file =
      event.target.files?.[0] ||
      null;

    setRegistrationCertificate(
      file
    );

    setSubmitError('');
  };


  const handleSubmitRenewal =
    async () => {
      if (
        !organization?.jaimsNumber
      ) {
        setSubmitError(
          'Existing JAIMS registration information is missing.'
        );

        return;
      }

      if (
        !renewalForm.organizationName.trim()
      ) {
        setSubmitError(
          'Organization Name is required.'
        );

        return;
      }

      if (
        !renewalForm.organizationType.trim()
      ) {
        setSubmitError(
          'Organization Type is required.'
        );

        return;
      }

      if (
        !renewalForm.email.trim()
      ) {
        setSubmitError(
          'Organization contact email is required.'
        );

        return;
      }

      if (
        !renewalForm.phone.trim()
      ) {
        setSubmitError(
          'Organization contact phone is required.'
        );

        return;
      }
if (
  !renewalForm.address.trim()
) {
  setSubmitError(
    'Organization contact address is required.'
  );

  return;
}
      if (
        !registrationCertificate
      ) {
        setSubmitError(
          'Please upload the Previous Registration Certificate before submitting the renewal application.'
        );

        return;
      }

      try {
        setSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        const formData =
          new FormData();

        formData.append(
          'jaimsNumber',
          organization.jaimsNumber
        );

        formData.append(
          'organizationName',
          renewalForm.organizationName.trim()
        );

        formData.append(
          'organizationType',
          renewalForm.organizationType.trim()
        );

        formData.append(
          'email',
          renewalForm.email.trim()
        );

        formData.append(
          'phone',
          renewalForm.phone.trim()
        );

        formData.append(
          'address',
          renewalForm.address.trim()
        );

        formData.append(
          'website',
          renewalForm.website.trim()
        );

        formData.append(
          'sectors',
          JSON.stringify(
            parseList(
              renewalForm.sectors
            )
          )
        );

        formData.append(
          'activityAreas',
          JSON.stringify(
            parseList(
              renewalForm.activityAreas
            )
          )
        );

        formData.append(
          'registrationCertificate',
          registrationCertificate
        );

        const response =
          await organizationApi.post(
            '/organization-portal/renewals',
            formData
          );

        const renewalNumber =
          response.data?.data
            ?.applicationNumber;

        setSubmitSuccess(
          renewalNumber
            ? `Renewal application submitted successfully. New JAIMS Application No.: ${renewalNumber}`
            : 'Renewal application submitted successfully.'
        );

        window.setTimeout(
          () => {
            navigate(
              '/public/organization/my-applications'
            );
          },
          1200
        );

      } catch (requestError) {
        setSubmitError(
          requestError.response?.data?.message ||
            requestError.message ||
            'Unable to submit the renewal application.'
        );
      } finally {
        setSubmitting(false);
      }
    };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-8">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/public/organization/dashboard'
              )
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div>

            <h1 className="text-lg font-bold">
              Renewal Registration
            </h1>

            <p className="text-sm text-slate-500">
              Organization Registration Portal
            </p>

          </div>

        </div>

      </header>


      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">

        {loading ? (
          <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="flex items-center gap-3">

              <RefreshCw
                className="animate-spin text-civic"
                size={22}
              />

              <div>

                <h2 className="font-bold">
                  Checking registration
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Verifying your approved JAIMS registration and loading organization information.
                </p>

              </div>

            </div>

          </section>
        ) : null}


        {!loading && error ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-6">

            <h2 className="font-bold text-red-800">
              Renewal unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {error}
            </p>

          </section>
        ) : null}


        {!loading &&
        !error &&
        organization ? (
          <>

            <RenewalReminder
              reminder={
                organization.renewalReminder
              }
            />


            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div className="flex gap-3">

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-emerald-700">
                    <CheckCircle2 size={22} />
                  </div>

                  <div>

                    <h2 className="font-bold text-emerald-900">
                      Existing registration verified
                    </h2>

                    <p className="mt-1 text-sm text-emerald-700">
                      Review the information below, update anything that has changed, and submit the renewal application.
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                  {organization.registrationStatus}
                </span>

              </div>

            </section>


            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">

                <div className="flex items-center gap-3">

                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-civic/10 text-civic">
                    <Building2 size={22} />
                  </div>

                  <div>

                    <h2 className="font-bold">
                      Existing Registration
                    </h2>

                    <p className="text-sm text-slate-500">
                      Current registration and certificate information.
                    </p>

                  </div>

                </div>

              </div>


              <div className="grid gap-5 p-6 md:grid-cols-2">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    JAIMS No.
                  </p>

                  <p className="mt-1 font-bold text-civic">
                    {organization.jaimsNumber}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Registration Status
                  </p>

                  <p className="mt-1">
                    {organization.registrationStatus}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Certificate Number
                  </p>

                  <p className="mt-1">
                    {organization.currentCertificate
                      ?.certificateNumber ||
                      '-'}
                  </p>

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Certificate Expiry Date
                  </p>

                  <p className="mt-1">
                    {organization.currentCertificate
                      ?.expiryDate
                      ? new Date(
                          organization
                            .currentCertificate
                            .expiryDate
                        ).toLocaleDateString()
                      : '-'}
                  </p>

                </div>

              </div>

            </section>
                        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">

                <h2 className="font-bold">
                  Review / Update Organization Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  The current registered information has been loaded automatically. Update only the information that has changed.
                </p>

              </div>


              <div className="grid gap-5 p-6 md:grid-cols-2">

                <label className="block">

                  <span className="text-sm font-semibold">
                    Organization Name
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </span>

                  <input
                    type="text"
                    value={
                      renewalForm.organizationName
                    }
                    onChange={
                      updateRenewalForm(
                        'organizationName'
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
                    required
                  />

                </label>


                <label className="block">

                  <span className="text-sm font-semibold">
                    Organization Type
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </span>

                  <input
                    type="text"
                    value={
                      renewalForm.organizationType
                    }
                    onChange={
                      updateRenewalForm(
                        'organizationType'
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
                    required
                  />

                </label>


                <label className="block">

                  <span className="text-sm font-semibold">
                    Contact Email
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </span>

                  <input
                    type="email"
                    value={
                      renewalForm.email
                    }
                    onChange={
                      updateRenewalForm(
                        'email'
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
                    required
                  />

                </label>


                <label className="block">

                  <span className="text-sm font-semibold">
                    Contact Phone
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </span>

                  <input
                    type="text"
                    value={
                      renewalForm.phone
                    }
                    onChange={
                      updateRenewalForm(
                        'phone'
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
                    required
                  />

                </label>


                <label className="block">

                 <span className="text-sm font-semibold">
  Address
  <span className="ml-1 text-red-600">
    *
  </span>
</span>

<input
  type="text"
  value={
    renewalForm.address
  }
  onChange={
    updateRenewalForm(
      'address'
    )
  }
  disabled={
    submitting
  }
  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
  required
/>

                </label>


                <label className="block">

                  <span className="text-sm font-semibold">
                    Website
                  </span>

                  <input
                    type="text"
                    value={
                      renewalForm.website
                    }
                    onChange={
                      updateRenewalForm(
                        'website'
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="https://example.org"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
                  />

                </label>


                <label className="block md:col-span-2">

                  <span className="text-sm font-semibold">
                    Sectors
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Separate multiple sectors with commas.
                  </span>

                  <input
                    type="text"
                    value={
                      renewalForm.sectors
                    }
                    onChange={
                      updateRenewalForm(
                        'sectors'
                      )
                    }
                    disabled={
                      submitting
                    }
                    placeholder="Education, Health, WASH"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
                  />

                </label>


                <label className="block md:col-span-2">

                  <span className="text-sm font-semibold">
                    Activity Areas
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Separate multiple activity areas with commas.
                  </span>

                  <input
                    type="text"
                    value={
                      renewalForm.activityAreas
                    }
                    onChange={
                      updateRenewalForm(
                        'activityAreas'
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-civic"
                  />

                </label>

              </div>

            </section>


            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">

                <div className="flex items-center gap-3">

                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
                    <FileText size={22} />
                  </div>

                  <div>

                    <h2 className="font-bold">
                      Renewal Documents
                    </h2>

                    <p className="text-sm text-slate-500">
                      Only the current registration certificate must be uploaded again. Previously approved supporting documents will be reused automatically.
                    </p>

                  </div>

                </div>

              </div>


              <div className="p-6">

                <label className="block">

                  <span className="text-sm font-semibold">
                    Previous Registration Certificate
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </span>

                  <span className="mt-1 block text-sm text-slate-500">
                    Upload the certificate issued for the current registration.
                  </span>


                  <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">

                    <div className="flex flex-wrap items-center gap-3">

                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">

                        <Upload size={17} />

                        Select Certificate

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={
                            handleCertificateChange
                          }
                          disabled={
                            submitting
                          }
                        />

                      </label>


                      <span className="text-sm text-slate-500">
                        {registrationCertificate
                          ? registrationCertificate.name
                          : 'No file selected'}
                      </span>

                    </div>

                  </div>

                </label>

              </div>

            </section>


            {submitError ? (
              <section className="rounded-xl border border-red-200 bg-red-50 p-5">

                <div className="flex items-start gap-3">

                  <AlertTriangle
                    className="mt-0.5 shrink-0 text-red-700"
                    size={20}
                  />

                  <div>

                    <h3 className="font-bold text-red-800">
                      Renewal submission failed
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {submitError}
                    </p>

                  </div>

                </div>

              </section>
            ) : null}


            {submitSuccess ? (
              <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-emerald-700"
                    size={20}
                  />

                  <div>

                    <h3 className="font-bold text-emerald-800">
                      Renewal submitted
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      {submitSuccess}
                    </p>

                    <p className="mt-1 text-xs text-emerald-700">
                      Opening My Applications...
                    </p>

                  </div>

                </div>

              </section>
            ) : null}


            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-wrap items-center justify-between gap-5">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    className="mt-0.5 text-civic"
                    size={20}
                  />

                  <div>

                    <h3 className="font-bold">
                      Renewal Application
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Review the updated information and submit the renewal application to the Ministry.
                    </p>

                    {approvedApplication ? (
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Existing JAIMS No.:{' '}
                        {approvedApplication.applicationNumber}
                      </p>
                    ) : null}

                  </div>

                </div>


                <button
                  type="button"
                  onClick={
                    handleSubmitRenewal
                  }
                  disabled={
                    submitting ||
                    !registrationCertificate ||
                    Boolean(
                      submitSuccess
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-civic px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>

                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      Submitting...

                    </>
                  ) : (
                    <>

                      <RefreshCw
                        size={18}
                      />

                      Submit Renewal

                    </>
                  )}
                </button>

              </div>

            </section>

          </>
        ) : null}

      </main>

    </div>
  );
}