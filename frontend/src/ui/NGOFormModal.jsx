import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '../api/client.js';

const organizationTypes = [
  'Local NGO',
  'International NGO',
  'Community-Based Organization',
  'Civil Society Organization',
  'Foundation',
  'Network',
  'Association',
];

const registrationStatuses = [
  'Pending',
  'Active',
  'Suspended',
  'Expired',
  'Revoked',
];

const complianceStatuses = [
  'Not Reviewed',
  'Compliant',
  'Partially Compliant',
  'Non-Compliant',
  'Under Review',
];

const visibilityOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'public', label: 'Public' },
  { value: 'confidential', label: 'Confidential' },
];

const initialForm = {
  registrationNumber: '',
  organizationName: '',
  organizationType: 'Local NGO',
  establishmentDate: '',

  email: '',
  phone: '',
  alternatePhone: '',
  website: '',
  address: '',

  sectorsText: '',
  activityAreasText: '',

  registrationStatus: 'Active',
statusReason: '',
complianceStatus: 'Not Reviewed',
visibility: 'internal',
remarks: '',
};

function dateValue(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function listToText(values) {
  if (!Array.isArray(values)) {
    return '';
  }

  return values
    .map((value) => {
      if (typeof value === 'string') {
        return value;
      }

      return value?.name || value?.title || '';
    })
    .filter(Boolean)
    .join(', ');
}

function textToList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function removeEmptyObjectFields(value) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) =>
        entry !== '' &&
        entry !== null &&
        entry !== undefined
    )
  );
}

function formFromNGO(ngo) {
  if (!ngo) {
    return initialForm;
  }

  const source = ngo.source || ngo;
  const contact = source.contact || {};

  return {
    registrationNumber:
      source.registrationNumber ||
      ngo.registrationNumber ||
      '',

    organizationName:
      source.organizationName ||
      ngo.organizationName ||
      '',

    organizationType:
      source.organizationType ||
      ngo.organizationType ||
      'Local NGO',

    establishmentDate: dateValue(
      source.establishmentDate ||
        ngo.establishmentDate
    ),

    email:
      contact.email ||
      source.email ||
      '',

    phone:
      contact.phone ||
      source.phone ||
      '',

    alternatePhone:
      contact.alternatePhone ||
      source.alternatePhone ||
      '',

    website:
      contact.website ||
      source.website ||
      '',

    address:
      contact.address ||
      source.address ||
      '',

    sectorsText: listToText(
      source.sectors || ngo.sectors
    ),

    activityAreasText: listToText(
      source.activityAreas || ngo.activityAreas
    ),

   registrationStatus:
  source.registrationStatus ||
  ngo.registrationStatus ||
  'Active',

statusReason: '',

complianceStatus:
  source.complianceStatus ||
  ngo.complianceStatus ||
  'Not Reviewed',

    visibility:
      source.visibility ||
      ngo.visibility ||
      'internal',

    remarks:
      source.remarks ||
      ngo.remarks ||
      '',
  };
}
export function NGOFormModal({
  isOpen,
  onClose,
  ngo = null,
}) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);
const [error, setError] = useState('');

  const isEditing = Boolean(
    ngo?.rawId ||
      ngo?.id ||
      ngo?._id
  );

  const ngoId =
    ngo?.rawId ||
    ngo?.id ||
    ngo?._id ||
    '';

  const saveNGO = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        const { data } = await api.patch(
          `/ngos/${ngoId}`,
          payload
        );

        return data;
      }

      const { data } = await api.post(
        '/ngos',
        payload
      );

      return data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['ngos'],
      });
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(formFromNGO(ngo));
    setError('');
  }, [isOpen, ngo]);

  if (!isOpen) {
    return null;
  }

  const update = (field) => (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };
  const closeModal = () => {
    if (saveNGO.isPending) {
      return;
    }

    setError('');
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.registrationNumber.trim()) {
      setError(
        'Registration number is required.'
      );
      return;
    }

    if (!form.organizationName.trim()) {
      setError(
        'Organization name is required.'
      );
      return;
    }

    if (!form.organizationType) {
      setError(
        'Organization type is required.'
      );
      return;
    }

    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      setError(
        'Enter a valid organization email address.'
      );
      return;
    }

    if (
      form.website &&
      !/^https?:\/\//i.test(form.website)
    ) {
      setError(
        'Website must begin with http:// or https://.'
      );
      return;
    }
    const requiresStatusReason =
  [
    'Suspended',
    'Revoked',
  ].includes(
    form.registrationStatus
  );

if (
  requiresStatusReason &&
  !form.statusReason.trim()
) {
  setError(
    form.registrationStatus ===
      'Suspended'
      ? 'Suspension reason is required.'
      : 'Revocation reason is required.'
  );

  return;
}
    const contact =
      removeEmptyObjectFields({
        email: form.email.trim(),
        phone: form.phone.trim(),
        alternatePhone:
          form.alternatePhone.trim(),
        website: form.website.trim(),
        address: form.address.trim(),
      });

    const payload =
      removeEmptyObjectFields({
        registrationNumber:
          form.registrationNumber.trim(),

        organizationName:
          form.organizationName.trim(),

        organizationType:
          form.organizationType,

        establishmentDate:
          form.establishmentDate,

        contact,

        sectors: textToList(
          form.sectorsText
        ),

        activityAreas: textToList(
          form.activityAreasText
        ),
       registrationStatus:
  form.registrationStatus,

statusReason:
  requiresStatusReason
    ? form.statusReason.trim()
    : '',

complianceStatus:
  form.complianceStatus,

        visibility: form.visibility,

        remarks: form.remarks.trim(),
      });

    try {
      await saveNGO.mutateAsync(payload);

      setForm(initialForm);
      
      setError('');
      onClose();
    } catch (mutationError) {
      const validationErrors =
        mutationError.response?.data?.errors;

      if (
        Array.isArray(validationErrors) &&
        validationErrors.length
      ) {
        setError(
          validationErrors
            .map(
              (validationError) =>
                validationError.message ||
                validationError.msg
            )
            .filter(Boolean)
            .join(' ')
        );

        return;
      }

      setError(
        mutationError.response?.data?.message ||
          `NGO ${
            isEditing ? 'update' : 'registration'
          } failed. Check the required fields and permissions.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
      <form
        className="mx-auto max-w-5xl rounded border border-slate-200 bg-white shadow-xl"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? 'Edit NGO'
                : 'Register NGO'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
  Register or update organization,
  contact and compliance information.
</p>
          </div>

          <button
            type="button"
            title="Close"
            disabled={saveNGO.isPending}
            onClick={closeModal}
            className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <section>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Organization Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Basic legal and registration
                information about the NGO.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Registration Number
                <input
                  type="text"
                  required
                  value={
                    form.registrationNumber
                  }
                  onChange={update(
                    'registrationNumber'
                  )}
                  placeholder="MOPIIC-NGO-2026-0003"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Organization Name
                <input
                  type="text"
                  required
                  value={
                    form.organizationName
                  }
                  onChange={update(
                    'organizationName'
                  )}
                  placeholder="Official organization name"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Organization Type
                <select
                  required
                  value={
                    form.organizationType
                  }
                  onChange={update(
                    'organizationType'
                  )}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                >
                  {organizationTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Establishment Date
                <input
                  type="date"
                  value={
                    form.establishmentDate
                  }
                  onChange={update(
                    'establishmentDate'
                  )}
                  max={new Date()
                    .toISOString()
                    .slice(0, 10)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Contact Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Official communication details for
                the organization.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Email Address
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="info@organization.org"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Phone Number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="+252..."
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Alternate Phone
                <input
                  type="tel"
                  value={
                    form.alternatePhone
                  }
                  onChange={update(
                    'alternatePhone'
                  )}
                  placeholder="+252..."
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Website
                <input
                  type="url"
                  value={form.website}
                  onChange={update('website')}
                  placeholder="https://organization.org"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Physical Address
                <input
                  type="text"
                  value={form.address}
                  onChange={update('address')}
                  placeholder="Office address"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Sector and Activity Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Separate multiple entries using
                commas.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Sectors
                <input
                  type="text"
                  value={form.sectorsText}
                  onChange={update(
                    'sectorsText'
                  )}
                  placeholder="Water, Health, Education"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />

                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Example: Water, Health,
                  Education
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Activity Areas
                <input
                  type="text"
                  value={
                    form.activityAreasText
                  }
                  onChange={update(
                    'activityAreasText'
                  )}
                  placeholder="WASH, Livelihoods, Protection"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />

                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Example: WASH, Livelihoods,
                  Protection
                </span>
              </label>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Registration and Compliance
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Administrative status and public
                visibility settings.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Registration Status
                <select
                  value={
                    form.registrationStatus
                  }
                  onChange={update(
                    'registrationStatus'
                  )}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                >
                  {registrationStatuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </label>
{[
  'Suspended',
  'Revoked',
].includes(
  form.registrationStatus
) ? (
  <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
    {form.registrationStatus ===
    'Suspended'
      ? 'Suspension Reason'
      : 'Revocation Reason'}

    <textarea
      value={
        form.statusReason
      }
      onChange={update(
        'statusReason'
      )}
      rows={4}
      required
      placeholder={
        form.registrationStatus ===
        'Suspended'
          ? 'Enter the reason for suspending this organization registration...'
          : 'Enter the reason for revoking this organization registration...'
      }
      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
    />

    <span className="mt-1 block text-xs font-normal text-slate-500">
      This reason will be communicated to the organization through its portal.
    </span>
  </label>
) : null}
              <label className="block text-sm font-semibold text-slate-700">
                Compliance Status
                <select
                  value={
                    form.complianceStatus
                  }
                  onChange={update(
                    'complianceStatus'
                  )}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                >
                  {complianceStatuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Visibility
                <select
                  value={form.visibility}
                  onChange={update('visibility')}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                >
                  {visibilityOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Remarks
                <textarea
                  value={form.remarks}
                  onChange={update('remarks')}
                  placeholder="Administrative remarks or additional information"
                  className="mt-1 min-h-24 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                />
              </label>
            </div>
          </section>
        </div>

        {error ? (
          <p className="mx-5 mb-5 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            disabled={saveNGO.isPending}
            onClick={closeModal}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saveNGO.isPending}
            className="rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveNGO.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update NGO'
                : 'Register NGO'}
          </button>
        </div>
      </form>
    </div>
  );
}