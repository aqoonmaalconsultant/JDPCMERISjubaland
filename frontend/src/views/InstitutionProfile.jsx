import {
  useEffect,
  useState,
} from 'react';

import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Save,
  Send,
  ShieldCheck,
} from 'lucide-react';

import {
  getOrganizationUser,
  organizationApi,
} from '../api/organizationClient.js';

const institutionTypes = [
  'UN Agency',
  'INGO',
  'LNGO',
  'Development Partner',
  'Private Company',
  'Consultant',
  'CBO',
  'Other',
];

const initialForm = {
  institutionName: '',
  institutionType: '',
  country: 'Somalia',
  address: '',
  phone: '',
  email: '',
  website: '',
  registrationNumber: '',
  registrationAuthority: '',
  registrationCountry: '',
  contactPerson: {
    name: '',
    position: '',
    phone: '',
    email: '',
  },
};

function statusClasses(
  status
) {
  if (
    status ===
    'Verified'
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (
    status ===
    'Pending Verification'
  ) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (
    status ===
    'Returned for Update'
  ) {
    return 'border-orange-200 bg-orange-50 text-orange-700';
  }

  if (
    status ===
    'Suspended'
  ) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function Field({
  label,
  required = false,
  children,
  hint,
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-slate-700">
        {label}

        {required ? (
          <span className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </span>

      <div className="mt-2">
        {children}
      </div>

      {hint ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}

    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-civic focus:ring-2 focus:ring-civic/10 disabled:cursor-not-allowed disabled:bg-slate-100';

export function InstitutionProfile() {
  const user =
    getOrganizationUser();

  const isGovernment =
    user?.institutionCategory ===
    'Government';

  const [
    form,
    setForm,
  ] =
    useState(
      initialForm
    );

  const [
    profile,
    setProfile,
  ] =
    useState(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    success,
    setSuccess,
  ] =
    useState('');

  const verificationStatus =
    profile
      ?.verificationStatus ||
    'Incomplete';

  const editable = [
    'Incomplete',
    'Returned for Update',
  ].includes(
    verificationStatus
  );

  useEffect(() => {
    let active =
      true;

    async function loadProfile() {
      try {
        setLoading(
          true
        );

        setError(
          ''
        );

        const {
          data,
        } =
          await organizationApi.get(
            '/institution-portal/profile'
          );

        if (!active) {
          return;
        }

        const existing =
          data?.data ||
          null;

        setProfile(
          existing
        );

        if (
          existing
        ) {
          setForm({
            institutionName:
              existing
                .institutionName ||
              '',

            institutionType:
              existing
                .institutionType ||
              '',

            country:
              existing
                .country ||
              'Somalia',

            address:
              existing
                .address ||
              '',

            phone:
              existing
                .phone ||
              '',

            email:
              existing
                .email ||
              '',

            website:
              existing
                .website ||
              '',

            registrationNumber:
              existing
                .registrationNumber ||
              '',

            registrationAuthority:
              existing
                .registrationAuthority ||
              '',

            registrationCountry:
              existing
                .registrationCountry ||
              '',

            contactPerson: {
              name:
                existing
                  .contactPerson
                  ?.name ||
                '',

              position:
                existing
                  .contactPerson
                  ?.position ||
                '',

              phone:
                existing
                  .contactPerson
                  ?.phone ||
                '',

              email:
                existing
                  .contactPerson
                  ?.email ||
                '',
            },
          });
        } else if (
          user?.email
        ) {
          setForm(
            (
              current
            ) => ({
              ...current,

              email:
                isGovernment
                  ? ''
                  : current
                      .email ||
                    user.email,

              contactPerson: {
                ...current
                  .contactPerson,

                email:
                  current
                    .contactPerson
                    .email ||
                  user.email,
              },
            })
          );
        }
      } catch (
        requestError
      ) {
        if (!active) {
          return;
        }

        setError(
          requestError
            .response
            ?.data
            ?.message ||
            'Unable to load the institution profile.'
        );
      } finally {
        if (
          active
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadProfile();

    return () => {
      active =
        false;
    };
  }, [
    isGovernment,
    user?.email,
  ]);

  const updateField =
    (field) =>
    (event) => {
      setForm(
        (
          current
        ) => ({
          ...current,

          [field]:
            event
              .target
              .value,
        })
      );

      setError(
        ''
      );

      setSuccess(
        ''
      );
    };

  const updateContactField =
    (field) =>
    (event) => {
      setForm(
        (
          current
        ) => ({
          ...current,

          contactPerson: {
            ...current
              .contactPerson,

            [field]:
              event
                .target
                .value,
          },
        })
      );

      setError(
        ''
      );

      setSuccess(
        ''
      );
    };

  function validateForm() {
    if (
      !form
        .institutionName
        .trim()
    ) {
      return 'Institution Name is required.';
    }

    /*
     * Government Institution
     *
     * Only institution identity
     * and contact person details
     * are required.
     */
    if (
      !isGovernment
    ) {
      if (
        !form
          .institutionType
          .trim()
      ) {
        return 'Institution Type is required.';
      }

      if (
        !form
          .country
          .trim()
      ) {
        return 'Country is required.';
      }

      if (
        !form
          .phone
          .trim()
      ) {
        return 'Institution Phone is required.';
      }

      if (
        !form
          .email
          .trim()
      ) {
        return 'Institution Email is required.';
      }
    }

    if (
      !form
        .contactPerson
        .name
        .trim()
    ) {
      return 'Contact Person Name is required.';
    }

    if (
      !form
        .contactPerson
        .position
        .trim()
    ) {
      return 'Contact Person Position is required.';
    }

    if (
      !form
        .contactPerson
        .phone
        .trim()
    ) {
      return 'Contact Person Phone is required.';
    }

    if (
      !form
        .contactPerson
        .email
        .trim()
    ) {
      return 'Contact Person Email is required.';
    }

    return '';
  }

  function payload() {
    const common = {
      institutionName:
        form
          .institutionName
          .trim(),

      website:
        form
          .website
          .trim(),

      contactPerson: {
        name:
          form
            .contactPerson
            .name
            .trim(),

        position:
          form
            .contactPerson
            .position
            .trim(),

        phone:
          form
            .contactPerson
            .phone
            .trim(),

        email:
          form
            .contactPerson
            .email
            .trim(),
      },
    };

    if (
      isGovernment
    ) {
      return common;
    }

    return {
      ...common,

      institutionType:
        form
          .institutionType,

      country:
        form
          .country
          .trim(),

      address:
        form
          .address
          .trim(),

      phone:
        form
          .phone
          .trim(),

      email:
        form
          .email
          .trim(),

      registrationNumber:
        form
          .registrationNumber
          .trim(),

      registrationAuthority:
        form
          .registrationAuthority
          .trim(),

      registrationCountry:
        form
          .registrationCountry
          .trim(),
    };
  }

  async function handleSave(
    event
  ) {
    event
      .preventDefault();

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError
      );

      return;
    }

    try {
      setSaving(
        true
      );

      setError(
        ''
      );

      setSuccess(
        ''
      );

      const {
        data,
      } =
        await organizationApi.put(
          '/institution-portal/profile',
          payload()
        );

      setProfile(
        data?.data ||
        null
      );

      setSuccess(
        data?.message ||
          'Institution profile saved successfully.'
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          .response
          ?.data
          ?.message ||
          'Unable to save the institution profile.'
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  async function handleSubmitForVerification() {
    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError
      );

      return;
    }

    try {
      setSubmitting(
        true
      );

      setError(
        ''
      );

      setSuccess(
        ''
      );

      const saveResponse =
        await organizationApi.put(
          '/institution-portal/profile',
          payload()
        );

      const savedProfile =
        saveResponse
          .data
          ?.data;

      if (
        savedProfile
      ) {
        setProfile(
          savedProfile
        );
      }

      const {
        data,
      } =
        await organizationApi.post(
          '/institution-portal/profile/submit'
        );

      setProfile(
        data?.data ||
        savedProfile
      );

      setSuccess(
        data?.message ||
          'Institution profile submitted for verification.'
      );
    } catch (
      requestError
    ) {
      setError(
        requestError
          .response
          ?.data
          ?.message ||
          'Unable to submit the institution profile for verification.'
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  if (
    loading
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">

        <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-8 text-sm font-medium text-slate-600 shadow-sm">
          Loading institution profile...
        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-6xl">

        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div className="flex items-start gap-4">

              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-civic text-white">
                <Building2
                  size={24}
                />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic">
                  JAIMS Institution Portal
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  {isGovernment
                    ? 'Government Institution Profile'
                    : 'Institution Profile'}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {isGovernment
                    ? 'Provide the institution name and official contact person details. MoPIIC will verify the institution before project registration and management access is enabled.'
                    : 'Complete the institution information once. The profile will be used when registering and managing projects in JAIMS.'}
                </p>

              </div>

            </div>

            <div
              className={[
                'inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold',

                statusClasses(
                  verificationStatus
                ),
              ].join(
                ' '
              )}
            >
              {verificationStatus ===
              'Verified' ? (
                <CheckCircle2
                  size={15}
                />
              ) : (
                <FileCheck2
                  size={15}
                />
              )}

              {
                verificationStatus
              }
            </div>

          </div>

          {profile
            ?.verificationNotes ? (
            <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">

              <span className="font-semibold">
                MoPIIC note:
              </span>{' '}

              {
                profile
                  .verificationNotes
              }

            </div>
          ) : null}

          {!editable ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              This profile cannot currently be edited because its verification status is{' '}
              <strong>
                {
                  verificationStatus
                }
              </strong>.
            </div>
          ) : null}

        </header>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        ) : null}

        <form
          onSubmit={
            handleSave
          }
          className="mt-6 space-y-6"
        >
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic">
                Section 1
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {isGovernment
                  ? 'Government Institution Information'
                  : 'Institution Information'}
              </h2>

              {isGovernment ? (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Only the official institution name is required. Website is optional.
                </p>
              ) : null}

            </div>

            {isGovernment ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <Field
                  label="Institution Name"
                  required
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .institutionName
                    }
                    onChange={
                      updateField(
                        'institutionName'
                      )
                    }
                    disabled={
                      !editable
                    }
                    placeholder="Official government institution name"
                  />
                </Field>

                <Field
                  label="Website"
                  hint="Optional"
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .website
                    }
                    onChange={
                      updateField(
                        'website'
                      )
                    }
                    disabled={
                      !editable
                    }
                    placeholder="https://"
                  />
                </Field>

              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <Field
                  label="Institution Name"
                  required
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .institutionName
                    }
                    onChange={
                      updateField(
                        'institutionName'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

                <Field
                  label="Institution Type"
                  required
                >
                  <select
                    className={
                      inputClass
                    }
                    value={
                      form
                        .institutionType
                    }
                    onChange={
                      updateField(
                        'institutionType'
                      )
                    }
                    disabled={
                      !editable
                    }
                  >
                    <option value="">
                      Select institution type
                    </option>

                    {institutionTypes.map(
                      (
                        type
                      ) => (
                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {
                            type
                          }
                        </option>
                      )
                    )}

                  </select>
                </Field>

                <Field
                  label="Country"
                  required
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .country
                    }
                    onChange={
                      updateField(
                        'country'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

                <Field
                  label="Address"
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .address
                    }
                    onChange={
                      updateField(
                        'address'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

                <Field
                  label="Phone"
                  required
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .phone
                    }
                    onChange={
                      updateField(
                        'phone'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

                <Field
                  label="Email"
                  required
                >
                  <input
                    type="email"
                    className={
                      inputClass
                    }
                    value={
                      form
                        .email
                    }
                    onChange={
                      updateField(
                        'email'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

                <Field
                  label="Website"
                  hint="Optional"
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .website
                    }
                    onChange={
                      updateField(
                        'website'
                      )
                    }
                    disabled={
                      !editable
                    }
                    placeholder="https://"
                  />
                </Field>

              </div>
            )}

          </section>

          {!isGovernment ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic">
                  Section 2
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Registration Information
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Provide existing institution registration or licensing information where applicable.
                </p>

              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">

                <Field
                  label="Registration / License Number"
                  hint="Where applicable"
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .registrationNumber
                    }
                    onChange={
                      updateField(
                        'registrationNumber'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

                <Field
                  label="Registration Authority"
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .registrationAuthority
                    }
                    onChange={
                      updateField(
                        'registrationAuthority'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

                <Field
                  label="Registration Country"
                >
                  <input
                    className={
                      inputClass
                    }
                    value={
                      form
                        .registrationCountry
                    }
                    onChange={
                      updateField(
                        'registrationCountry'
                      )
                    }
                    disabled={
                      !editable
                    }
                  />
                </Field>

              </div>

            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-civic">
                {isGovernment
                  ? 'Section 2'
                  : 'Section 3'}
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Contact Person
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {isGovernment
                  ? 'Provide the official person MoPIIC should contact for institution verification and project coordination.'
                  : 'Provide the main person MoPIIC should contact for institution and project coordination.'}
              </p>

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Field
                label="Contact Person Name"
                required
              >
                <input
                  className={
                    inputClass
                  }
                  value={
                    form
                      .contactPerson
                      .name
                  }
                  onChange={
                    updateContactField(
                      'name'
                    )
                  }
                  disabled={
                    !editable
                  }
                />
              </Field>

              <Field
                label="Position / Title"
                required
              >
                <input
                  className={
                    inputClass
                  }
                  value={
                    form
                      .contactPerson
                      .position
                  }
                  onChange={
                    updateContactField(
                      'position'
                    )
                  }
                  disabled={
                    !editable
                  }
                />
              </Field>

              <Field
                label="Phone"
                required
              >
                <input
                  className={
                    inputClass
                  }
                  value={
                    form
                      .contactPerson
                      .phone
                  }
                  onChange={
                    updateContactField(
                      'phone'
                    )
                  }
                  disabled={
                    !editable
                  }
                />
              </Field>

              <Field
                label="Email"
                required
              >
                <input
                  type="email"
                  className={
                    inputClass
                  }
                  value={
                    form
                      .contactPerson
                      .email
                  }
                  onChange={
                    updateContactField(
                      'email'
                    )
                  }
                  disabled={
                    !editable
                  }
                />
              </Field>

            </div>

          </section>

          {isGovernment ? (
            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-700"
                />

                <div>

                  <h3 className="font-bold text-blue-900">
                    Government Institution Verification
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Government institutions do not require registration certificates, registration fees, renewals, or license information. MoPIIC only verifies the institution identity before enabling project registration and management access.
                  </p>

                </div>

              </div>

            </section>
          ) : null}

          {editable ? (
            <div className="flex flex-col justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">

              <button
                type="submit"
                disabled={
                  saving ||
                  submitting
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-civic hover:text-civic disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save
                  size={17}
                />

                {saving
                  ? 'Saving...'
                  : 'Save Profile'}
              </button>

              <button
                type="button"
                onClick={
                  handleSubmitForVerification
                }
                disabled={
                  saving ||
                  submitting
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-civic px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send
                  size={17}
                />

                {submitting
                  ? 'Submitting...'
                  : 'Submit for Verification'}
              </button>

            </div>
          ) : null}

        </form>

      </div>

    </main>
  );
}

export default InstitutionProfile;