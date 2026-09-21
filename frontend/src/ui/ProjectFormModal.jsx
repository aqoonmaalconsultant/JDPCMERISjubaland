import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  useReferenceData,
  useUpdateProject,
} from "../api/projects.js";

const emptyLocation = {
  region: '',
  district: '',
  village: '',
  siteName: '',
  latitude: '',
  longitude: ''
};

const initialForm = {
  projectName: '',
  projectCode: '',
  description: '',
  objectives: '',
  components: '',
  achievements: '',

  projectType: '',
  implementationStatus: 'Planned',

  ministry: '',
  supportingMinistries: [],
  federalLineMinistry: '',

  donor: '',

  leadImplementerType: '',
  leadImplementerMinistry: '',
  partner: '',
  coImplementingPartners: [],

  contractor: '',
  consultant: '',

  sector: '',
  subSector: '',
  fundingSource: '',
  budget: '',
  currency: 'USD',

  startDate: '',
  endDate: '',

  governmentFocalPointName: '',
  governmentFocalPointPosition: '',
  governmentFocalPointPhone: '',
  governmentFocalPointEmail: '',

  implementerFocalPointName: '',
  implementerFocalPointPosition: '',
  implementerFocalPointPhone: '',
  implementerFocalPointEmail: '',

  visibility: 'internal'
};

function optionName(item) {
  return item.name || item.organizationName || item.code;
}

function removeEmpty(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== '' && entry !== null && entry !== undefined));
}

function refId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || '';
}

function refIds(values = []) {
  return values.map(refId).filter(Boolean);
}

function linesToArray(value = '') {
  return String(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToLines(values = []) {
  return Array.isArray(values)
    ? values.join('\n')
    : '';
}

function dateValue(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function locationFromSource(location = {}) {
  return {
    region: refId(location.region) || location.regionId || '',
    district: refId(location.district) || location.districtId || '',
    village: location.village || '',
    siteName: location.siteName || '',
    latitude: location.latitude ?? '',
    longitude: location.longitude ?? ''
  };
}

function locationsFromProject(project) {
  if (!project) return [emptyLocation];
  const source = project.source || {};
  const sourceLocations = source.locations?.length ? source.locations : project.location ? [project.location] : [];
  return sourceLocations.length ? sourceLocations.map(locationFromSource) : [emptyLocation];
}

function formFromProject(project) {
  if (!project) return initialForm;
  const source = project.source || {};

  return {
    projectName: source.projectName || project.name || '',
    projectCode: source.projectCode || project.id || '',
    description: source.description || project.description || '',
    objectives: arrayToLines(source.objectives),
    components: arrayToLines(source.components),
    achievements: arrayToLines(source.achievements),

    projectType: source.projectType || '',
    implementationStatus: source.implementationStatus || 'Planned',

    ministry: refId(source.ministry),
    supportingMinistries: refIds(source.supportingMinistries),
    federalLineMinistry: source.federalLineMinistry || '',

    donor: refId(source.donor),

    leadImplementerType: source.leadImplementerType || '',
    leadImplementerMinistry: refId(source.leadImplementerMinistry),
    partner: refId(source.partner),
    coImplementingPartners: refIds(source.coImplementingPartners),

    contractor: source.contractor || '',
    consultant: source.consultant || '',

    sector: source.sector || project.sector || '',
    subSector: source.subSector || '',
    fundingSource: source.fundingSource || '',
    budget: source.budget ?? project.budget ?? '',
    currency: source.currency || 'USD',

    startDate: dateValue(source.startDate),
    endDate: dateValue(source.endDate),

    governmentFocalPointName: source.governmentFocalPoint?.name || '',
    governmentFocalPointPosition: source.governmentFocalPoint?.position || '',
    governmentFocalPointPhone: source.governmentFocalPoint?.phone || '',
    governmentFocalPointEmail: source.governmentFocalPoint?.email || '',

    implementerFocalPointName: source.implementerFocalPoint?.name || '',
    implementerFocalPointPosition: source.implementerFocalPoint?.position || '',
    implementerFocalPointPhone: source.implementerFocalPoint?.phone || '',
    implementerFocalPointEmail: source.implementerFocalPoint?.email || '',

    visibility: source.visibility || 'internal'
  };
}

export function ProjectFormModal({ isOpen, onClose, project }) {
  const [form, setForm] = useState(initialForm);
  const [locations, setLocations] = useState([emptyLocation]);
  const [error, setError] = useState('');  
  const updateProject = useUpdateProject();
  const ministries = useReferenceData('ministries');
  const donors = useReferenceData('donors');
  const partners = useReferenceData('partners');
  const regions = useReferenceData('regions');
  const districts = useReferenceData('districts');

  const districtsByRegion = useMemo(() => {
    const groups = new Map();

    for (const district of districts.data || []) {
      const regionId = typeof district.region === 'object' ? district.region?._id : district.region;
      if (!groups.has(String(regionId))) groups.set(String(regionId), []);
      groups.get(String(regionId)).push(district);
    }

    return groups;
  }, [districts.data]);
  const isEditing = Boolean(project?.rawId);

  useEffect(() => {
    if (isOpen) {
      setForm(formFromProject(project));
      setLocations(locationsFromProject(project));
      setError('');
    }
  }, [isOpen, project]);

  if (!isOpen) {
    return null;
  }

  const update = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateMulti = (field) => (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setForm((current) => ({ ...current, [field]: values }));
  };

  const updateLocation = (index, field) => (event) => {
    const value = event.target.value;
    setLocations((current) => current.map((location, locationIndex) => (
      locationIndex === index
        ? { ...location, [field]: value, ...(field === 'region' ? { district: '' } : {}) }
        : location
    )));
  };

  const addLocation = () => {
    setLocations((current) => [...current, emptyLocation]);
  };

  const removeLocation = (index) => {
    setLocations((current) => current.length === 1 ? current : current.filter((_, locationIndex) => locationIndex !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date must be on or after start date.');
      return;
    }

    const touchedLocations = locations.filter((location) => Object.values(location).some((value) => value !== '' && value !== null && value !== undefined));
    if (touchedLocations.some((location) => !location.region || !location.district)) {
      setError('Each project location needs both region and district.');
      return;
    }

    const payload = removeEmpty({
      projectName: form.projectName,
      ...(isEditing && form.projectCode
        ? { projectCode: form.projectCode }
        : {}),
      description: form.description,

      objectives: linesToArray(form.objectives),
      components: linesToArray(form.components),
      achievements: linesToArray(form.achievements),

      projectType: form.projectType,
      implementationStatus: form.implementationStatus,

      ministry: form.ministry,
      supportingMinistries: form.supportingMinistries.filter(
        (id) => id !== form.ministry
      ),
      federalLineMinistry: form.federalLineMinistry,

      donor: form.donor,

      leadImplementerType: form.leadImplementerType,
      leadImplementerMinistry:
        form.leadImplementerType === 'Government Line Ministry'
          ? form.leadImplementerMinistry
          : undefined,
      partner:
        form.leadImplementerType !== 'Government Line Ministry'
          ? form.partner
          : undefined,
      coImplementingPartners: form.coImplementingPartners,

      contractor: form.contractor,
      consultant: form.consultant,

      sector: form.sector,
      subSector: form.subSector,
      fundingSource: form.fundingSource,

      budget: Number(form.budget),
      currency: form.currency,

      startDate: form.startDate,
      endDate: form.endDate,

      governmentFocalPoint: removeEmpty({
        name: form.governmentFocalPointName,
        position: form.governmentFocalPointPosition,
        phone: form.governmentFocalPointPhone,
        email: form.governmentFocalPointEmail
      }),

      implementerFocalPoint: removeEmpty({
        name: form.implementerFocalPointName,
        position: form.implementerFocalPointPosition,
        phone: form.implementerFocalPointPhone,
        email: form.implementerFocalPointEmail
      }),

      visibility: form.visibility,

      locations: touchedLocations.map((location) => removeEmpty({
        region: location.region,
        district: location.district,
        village: location.village,
        siteName: location.siteName,
        latitude: location.latitude === '' ? undefined : Number(location.latitude),
        longitude: location.longitude === '' ? undefined : Number(location.longitude)
      }))
    });

    try {
     if (!isEditing) {
  setError(
    "Projects cannot be created directly. New projects must complete the Project Application and Final Registration workflow."
  );
  return;
}

await updateProject.mutateAsync({
  id: project.rawId,
  values: payload,
});
      setForm(initialForm);
      setLocations([emptyLocation]);
      onClose();
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Project save failed. Check required fields and permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8">
      <form
        className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        onSubmit={submit}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Project' : 'New Project Registration'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Register and coordinate projects implemented across Jubaland under MoPIIC oversight.
            </p>
          </div>

          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-200"
            onClick={onClose}
            type="button"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>


        <div className="space-y-6 p-6">

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                1. Project Identification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Core information used to identify and classify the project in JAIMS.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Project Name *
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.projectName}
                  onChange={update('projectName')}
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                JAIMS Project Code
                <input
                  className="mt-1 w-full rounded border border-slate-200 bg-slate-100 px-3 py-2 font-normal text-slate-600 outline-none"
                  value={isEditing ? form.projectCode : 'Generated automatically after saving'}
                  readOnly
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Project Description
                <textarea
                  className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.description}
                  onChange={update('description')}
                  placeholder="Provide a concise description of the project, its purpose, and intended intervention."
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Project Objectives
                <textarea
                  className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.objectives}
                  onChange={update('objectives')}
                  placeholder={"Enter one objective per line"}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Project Components
                <textarea
                  className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.components}
                  onChange={update('components')}
                  placeholder={"Enter one project component per line"}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Project Achievements
                <textarea
                  className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.achievements}
                  onChange={update('achievements')}
                  placeholder={"Enter one achievement per line. This can be updated during implementation."}
                />
              </label>
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                2. Government Coordination
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Identify the Jubaland Government line ministry responsible for technical coordination and any supporting line ministries.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Primary Government Line Ministry *
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.ministry}
                  onChange={update('ministry')}
                  required
                >
                  <option value="">Select primary government line ministry</option>

                  {(ministries.data || []).map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {optionName(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Supporting Government Line Ministries
                <select
                  className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  multiple
                  value={form.supportingMinistries}
                  onChange={updateMulti('supportingMinistries')}
                >
                  {(ministries.data || [])
                    .filter((item) => item._id !== form.ministry)
                    .map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {optionName(item)}
                      </option>
                    ))}
                </select>

                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Hold Ctrl on Windows to select more than one ministry.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Federal Government Line Ministry
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.federalLineMinistry}
                  onChange={update('federalLineMinistry')}
                  placeholder="Optional — enter the relevant Federal Government line ministry"
                />
              </label>
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                3. Funding
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Record the institution financing the project and the approved project budget.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="block text-sm font-semibold text-slate-700">
                Funding Institution / Donor
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.donor}
                  onChange={update('donor')}
                >
                  <option value="">Not assigned</option>

                  {(donors.data || []).map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {optionName(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Funding Source
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.fundingSource}
                  onChange={update('fundingSource')}
                  placeholder="Grant, loan, government budget"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Total Project Budget *
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  min="0"
                  type="number"
                  value={form.budget}
                  onChange={update('budget')}
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Currency
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.currency}
                  onChange={update('currency')}
                >
                  <option>USD</option>
                  <option>SOS</option>
                  <option>EUR</option>
                </select>
              </label>
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                4. Implementation Arrangement
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Identify the institution primarily responsible for implementation and other implementing partners.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Lead Implementer Type
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.leadImplementerType}
                  onChange={update('leadImplementerType')}
                >
                  <option value="">Select institution type</option>
                  <option>Government Line Ministry</option>
                  <option>Government Agency</option>
                  <option>UN Agency</option>
                  <option>INGO</option>
                  <option>LNGO</option>
                  <option>Private Company</option>
                  <option>Consultant</option>
                  <option>CBO</option>
                  <option>Other</option>
                </select>
              </label>

              {form.leadImplementerType === 'Government Line Ministry' ? (
                <label className="block text-sm font-semibold text-slate-700">
                  Lead Implementing Government Line Ministry
                  <select
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                    value={form.leadImplementerMinistry}
                    onChange={update('leadImplementerMinistry')}
                  >
                    <option value="">Select implementing line ministry</option>

                    {(ministries.data || []).map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {optionName(item)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="block text-sm font-semibold text-slate-700">
                  Lead Implementing Institution
                  <select
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                    value={form.partner}
                    onChange={update('partner')}
                  >
                    <option value="">Not assigned</option>

                    {(partners.data || []).map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {optionName(item)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Co-Implementing Institutions
                <select
                  className="mt-1 min-h-28 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  multiple
                  value={form.coImplementingPartners}
                  onChange={updateMulti('coImplementingPartners')}
                >
                  {(partners.data || [])
                    .filter((item) => item._id !== form.partner)
                    .map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {optionName(item)}
                      </option>
                    ))}
                </select>

                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Hold Ctrl on Windows to select more than one institution.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Contractor
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.contractor}
                  onChange={update('contractor')}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Consultant
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.consultant}
                  onChange={update('consultant')}
                />
              </label>
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                5. Project Classification
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Classify the project by sector and sub-sector for portfolio analysis.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Primary Sector
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.sector}
                  onChange={update('sector')}
                  placeholder="Health, Water, Education, Infrastructure"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Sub-Sector
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.subSector}
                  onChange={update('subSector')}
                  placeholder="Primary care, rural roads, irrigation"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Project Type
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.projectType}
                  onChange={update('projectType')}
                >
                  <option value="">Select project type</option>
                  <option>Development</option>
                  <option>Humanitarian</option>
                  <option>Emergency Response</option>
                  <option>Infrastructure</option>
                  <option>Technical Assistance</option>
                  <option>Capacity Building</option>
                  <option>Research / Assessment</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Implementation Status
                <select
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  value={form.implementationStatus}
                  onChange={update('implementationStatus')}
                >
                  <option>Planned</option>
                  <option>Not Started</option>
                  <option>Ongoing</option>
                  <option>On Hold</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </label>
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                6. Project Duration
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Record the planned implementation period.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Start Date *
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  type="date"
                  value={form.startDate}
                  onChange={update('startDate')}
                  required
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                End Date *
                <input
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                  min={form.startDate || undefined}
                  type="date"
                  value={form.endDate}
                  onChange={update('endDate')}
                  required
                />
              </label>
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">
                  7. Geographic Coverage
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add every project location required for GIS mapping and geographic analysis.
                </p>
              </div>

              <button
                className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100"
                onClick={addLocation}
                type="button"
              >
                <Plus size={16} />
                Add Location
              </button>
            </div>

            <div className="space-y-4">
              {locations.map((location, index) => (
                <div
                  className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"
                  key={index}
                >
                  <div className="flex items-center justify-between md:col-span-2">
                    <p className="text-sm font-bold text-slate-700">
                      Location {index + 1}
                    </p>

                    <button
                      className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      disabled={locations.length === 1}
                      onClick={() => removeLocation(index)}
                      type="button"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>

                  <label className="block text-sm font-semibold text-slate-700">
                    Region
                    <select
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={location.region}
                      onChange={updateLocation(index, 'region')}
                    >
                      <option value="">Select region</option>

                      {(regions.data || []).map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {optionName(item)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    District
                    <select
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={location.district}
                      onChange={updateLocation(index, 'district')}
                      disabled={!location.region}
                    >
                      <option value="">Select district</option>

                      {(districtsByRegion.get(String(location.region)) || []).map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {optionName(item)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Site Name
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={location.siteName}
                      onChange={updateLocation(index, 'siteName')}
                      placeholder="Example: Al-Nasar Irrigation Cooperative"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Village / Locality
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={location.village}
                      onChange={updateLocation(index, 'village')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Latitude
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      max="90"
                      min="-90"
                      step="any"
                      type="number"
                      value={location.latitude}
                      onChange={updateLocation(index, 'latitude')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Longitude
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      max="180"
                      min="-180"
                      step="any"
                      type="number"
                      value={location.longitude}
                      onChange={updateLocation(index, 'longitude')}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                8. Project Contacts
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Record the main government and implementing institution focal points for coordination.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-800">
                  Government Focal Point
                </h4>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Name
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={form.governmentFocalPointName}
                      onChange={update('governmentFocalPointName')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Position / Title
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={form.governmentFocalPointPosition}
                      onChange={update('governmentFocalPointPosition')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Phone
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={form.governmentFocalPointPhone}
                      onChange={update('governmentFocalPointPhone')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      type="email"
                      value={form.governmentFocalPointEmail}
                      onChange={update('governmentFocalPointEmail')}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-semibold text-slate-800">
                  Implementing Institution Focal Point
                </h4>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Name
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={form.implementerFocalPointName}
                      onChange={update('implementerFocalPointName')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Position / Title
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={form.implementerFocalPointPosition}
                      onChange={update('implementerFocalPointPosition')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Phone
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      value={form.implementerFocalPointPhone}
                      onChange={update('implementerFocalPointPhone')}
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Email
                    <input
                      className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-civic"
                      type="email"
                      value={form.implementerFocalPointEmail}
                      onChange={update('implementerFocalPointEmail')}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>


          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">
                9. Visibility
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Control whether the project is visible internally, publicly, or restricted.
              </p>
            </div>

            <label className="block max-w-md text-sm font-semibold text-slate-700">
              Project Visibility
              <select
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                value={form.visibility}
                onChange={update('visibility')}
              >
                <option value="internal">Internal</option>
                <option value="public">Public</option>
                <option value="confidential">Confidential</option>
              </select>
            </label>
          </section>

        </div>


        {error ? (
          <p className="mx-6 mb-4 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}


        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>

          <button
            className="rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
            disabled={updateProject.isPending}
            type="submit"
          >
            {updateProject.isPending
  ? "Saving..."
  : "Save Changes"}
          </button>
        </div>
      </form>
    </div>

  );
}
