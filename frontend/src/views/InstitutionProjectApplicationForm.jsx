import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Plus, Save, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateInstitutionProjectDraft,
  useInstitutionProjectApplication,
  useInstitutionReferenceData,
  useSaveInstitutionProjectDraft,
  useSubmitInstitutionProjectApplication,
} from '../api/institutionProjects.js';

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-civic disabled:bg-slate-100';

const emptyLocation = {
  region: '', district: '', village: '', siteName: '', latitude: '', longitude: '',
};

const emptyStakeholder = { name: '' };

const initialForm = {
  projectName: '', description: '', objectives: '', components: [''], projectType: '',
  fundedBy: { ...emptyStakeholder }, fundingSource: '', budget: '', currency: 'USD',
  sector: '', subSector: '', startDate: '', endDate: '',
  projectContactName: '', projectContactPosition: '', projectContactPhone: '', projectContactEmail: '',
  householdCount: '', individuals: '', male: '', female: '', disabilityStatus: '',
};

function optionName(item) {
  return item?.name || item?.institutionName || item?.organizationName || item?.code || 'Unnamed';
}

function refId(value) {
  if (!value) return '';
  return typeof value === 'string' ? value : value._id || '';
}

function linesToArray(value = '') {
  return String(value).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function arrayToLines(values = []) {
  return Array.isArray(values) ? values.join('\n') : '';
}

function dateValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function numberOrUndefined(value) {
  return value === '' || value === null || value === undefined ? undefined : Number(value);
}

function removeEmpty(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== '' && entry !== null && entry !== undefined)
  );
}

function stakeholderFromApplication(stakeholder) {
    return {
        name:
            stakeholder?.institutionName || '',
    };
}

function locationFromApplication(location = {}) {
  return {
    region: refId(location.region),
    district: refId(location.district),
    village: location.village || '',
    siteName: location.siteName || '',
    latitude: location.latitude ?? '',
    longitude: location.longitude ?? '',
  };
}

function formFromApplication(application) {
  if (!application) return initialForm;
  return {
    projectName: application.projectName || '',
    description: application.description || '',
    objectives: arrayToLines(application.objectives),
    components: Array.isArray(application.components) && application.components.length ? application.components : [''],
    projectType: application.projectType || '',
    fundedBy: stakeholderFromApplication(application.fundedBy),
    fundingSource: application.fundingSource || '',
    budget: application.budget ?? '',
    currency: application.currency || 'USD',
    sector: application.sector || '',
    subSector: application.subSector || '',
    startDate: dateValue(application.startDate),
    endDate: dateValue(application.endDate),
    projectContactName: application.projectContact?.name || '',
    projectContactPosition: application.projectContact?.position || '',
    projectContactPhone: application.projectContact?.phone || '',
    projectContactEmail: application.projectContact?.email || '',
    householdCount: application.beneficiaries?.householdCount ?? '',
    individuals: application.beneficiaries?.individuals ?? '',
    male: application.beneficiaries?.male ?? '',
    female: application.beneficiaries?.female ?? '',
    disabilityStatus: application.beneficiaries?.disabilityStatus ?? '',
  };
}

function Section({ number, title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">{number}. {title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StakeholderRows({ title, description, required = false, rows, setRows, editable }) {
  const addRow = () => setRows((current) => [...current, { ...emptyStakeholder }]);
  const removeRow = (index) => setRows((current) => current.filter((_, i) => i !== index));
  const updateRow = (index, value) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, name: value } : row)));

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800">
            {title}{required ? <span className="ml-1 text-red-600">*</span> : null}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        {editable ? (
          <button type="button" onClick={addRow}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
            <Plus size={14} /> Add Institution
          </button>
        ) : null}
      </div>

      {!rows.length ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          No institution added.
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
            <label className="block text-sm font-semibold text-slate-700">
              Institution Name{required ? <span className="ml-1 text-red-600">*</span> : null}
              <input className={inputClass} disabled={!editable}
                onChange={(event) => updateRow(index, event.target.value)}
                placeholder="Enter institution name" value={row.name} />
            </label>
            {editable ? (
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => removeRow(index)}
                  className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InstitutionProjectApplicationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';
  const isEditing = Boolean(id) && !isNew;

  const [form, setForm] = useState(initialForm);
  const [locations, setLocations] = useState([{ ...emptyLocation }]);
  const [supportedBy, setSupportedBy] = useState([]);
  const [implementedBy, setImplementedBy] = useState([{ ...emptyStakeholder }]);
  const [endUsers, setEndUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const application = useInstitutionProjectApplication(isEditing ? id : null);
  const createDraft = useCreateInstitutionProjectDraft();
  const saveDraft = useSaveInstitutionProjectDraft();
  const submitApplication = useSubmitInstitutionProjectApplication();
  const regions = useInstitutionReferenceData('regions');
  const districts = useInstitutionReferenceData('districts');

  const districtGroups = useMemo(() => {
    const groups = new Map();
    for (const district of districts.data || []) {
      const regionId = typeof district.region === 'object' ? district.region?._id : district.region;
      const key = String(regionId || '');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(district);
    }
    return groups;
  }, [districts.data]);

  useEffect(() => {
    if (!isEditing || !application.data) return;
    const loaded = formFromApplication(application.data);
    setForm(loaded);
    setSupportedBy(application.data.supportedBy?.map(stakeholderFromApplication) || []);
    setImplementedBy(
      application.data.implementedBy?.length
        ? application.data.implementedBy.map(stakeholderFromApplication)
        : [{ ...emptyStakeholder }]
    );
    setEndUsers(application.data.endUsers?.map(stakeholderFromApplication) || []);
    setLocations(
      application.data.locations?.length
        ? application.data.locations.map(locationFromApplication)
        : [{ ...emptyLocation }]
    );
  }, [isEditing, application.data]);

  const editable = !isEditing || !application.data ||
    ['Draft', 'Returned for Revision'].includes(application.data?.registrationStatus);

  const goBack = () => navigate('/public/organization/project-applications');
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateFundedBy = (value) => setForm((current) => ({ ...current, fundedBy: { name: value } }));

  const updateComponent = (index, value) =>
    setForm((current) => ({
      ...current,
      components: current.components.map((component, i) => (i === index ? value : component)),
    }));

  const addComponent = () =>
    setForm((current) => ({ ...current, components: [...current.components, ''] }));

  const removeComponent = (index) =>
    setForm((current) => ({
      ...current,
      components: current.components.length === 1
        ? current.components
        : current.components.filter((_, i) => i !== index),
    }));

  const updateLocation = (index, field) => (event) => {
    const value = event.target.value;
    setLocations((current) => current.map((location, i) =>
      i === index
        ? { ...location, [field]: value, ...(field === 'region' ? { district: '' } : {}) }
        : location
    ));
  };

  const addLocation = () => setLocations((current) => [...current, { ...emptyLocation }]);
  const removeLocation = (index) =>
    setLocations((current) => current.length === 1 ? current : current.filter((_, i) => i !== index));

  function stakeholderPayload(stakeholder) {
    const institutionName =
        stakeholder?.name?.trim();

    return institutionName
        ? {
              institutionName,
          }
        : null;
}
  const buildPayload = () => {
    const touchedLocations = locations.filter((location) =>
      Object.values(location).some((value) => value !== '' && value !== null && value !== undefined)
    );

    if (touchedLocations.some((location) => !location.region || !location.district)) {
      throw new Error('Each project location must have both a Region and District.');
    }

    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      throw new Error('End Date must be on or after the Start Date.');
    }

    return removeEmpty({
      projectName: form.projectName.trim(),
      description: form.description.trim(),
      objectives: linesToArray(form.objectives),
      components: form.components.map((component) => component.trim()).filter(Boolean),
      projectType: form.projectType,
      fundedBy: stakeholderPayload(form.fundedBy) || undefined,
      supportedBy: supportedBy.map(stakeholderPayload).filter(Boolean),
      implementedBy: implementedBy.map(stakeholderPayload).filter(Boolean),
      endUsers: endUsers.map(stakeholderPayload).filter(Boolean),
      fundingSource: form.fundingSource.trim(),
      budget: numberOrUndefined(form.budget),
      currency: form.currency,
      sector: form.sector.trim(),
      subSector: form.subSector.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      locations: touchedLocations.map((location) => removeEmpty({
        region: location.region,
        district: location.district,
        village: location.village.trim(),
        siteName: location.siteName.trim(),
        latitude: numberOrUndefined(location.latitude),
        longitude: numberOrUndefined(location.longitude),
      })),
      projectContact: removeEmpty({
        name: form.projectContactName.trim(),
        position: form.projectContactPosition.trim(),
        phone: form.projectContactPhone.trim(),
        email: form.projectContactEmail.trim(),
      }),
      beneficiaries: removeEmpty({
        householdCount: numberOrUndefined(form.householdCount),
        individuals: numberOrUndefined(form.individuals),
        male: numberOrUndefined(form.male),
        female: numberOrUndefined(form.female),
        disabilityStatus: numberOrUndefined(form.disabilityStatus),
      }),
    });
  };

  const save = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (form.projectName.trim().length < 2) {
      setError('Enter the Project Name before saving the draft.');
      return;
    }

    try {
      const payload = buildPayload();
      if (isEditing) {
        const saved = await saveDraft.mutateAsync({ id, payload });
        setSuccess('Draft saved successfully.');
        if (saved) {
          setForm(formFromApplication(saved));
          setSupportedBy(saved.supportedBy?.map(stakeholderFromApplication) || []);
          setImplementedBy(
            saved.implementedBy?.length
              ? saved.implementedBy.map(stakeholderFromApplication)
              : [{ ...emptyStakeholder }]
          );
          setEndUsers(saved.endUsers?.map(stakeholderFromApplication) || []);
        }
        return;
      }

      const created = await createDraft.mutateAsync(payload);
      navigate(`/public/organization/project-applications/${created._id}`, { replace: true });
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || 'Unable to save the project application draft.');
    }
  };

  const submitToMoPIIC = async () => {
    setError('');
    setSuccess('');
    if (!isEditing || !id) {
      setError('Save the project application as a draft before submitting it to MoPIIC.');
      return;
    }

    if (!window.confirm('Submit this project application to MoPIIC? The current form will be saved first.')) return;

    try {
      const payload = buildPayload();
      await saveDraft.mutateAsync({ id, payload });
      await submitApplication.mutateAsync(id);
      navigate('/public/organization/project-applications');
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Unable to submit the project application.');
    }
  };

  const isSaving = createDraft.isPending || saveDraft.isPending;
  const isSubmitting = submitApplication.isPending;

  if (isEditing && application.isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8"><div className="mx-auto max-w-7xl rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading project application...</div></div>;
  }

  if (isEditing && application.isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            {application.error?.response?.data?.message || 'Unable to load the project application.'}
          </p>
          <button className="mt-4 rounded border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700" onClick={goBack} type="button">
            Back to My Project Applications
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <button type="button" onClick={goBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-civic">
            <ArrowLeft size={17} /> Back to My Project Applications
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-civic text-white"><FileText size={22} /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic">JAIMS Institution Portal</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">Project Registration Application</h1>
                <p className="mt-1 text-sm text-slate-500">Complete the project registration baseline and submit it to MoPIIC for verification.</p>
              </div>
            </div>

            {application.data ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Application Number</p>
                <p className="mt-1 font-bold text-slate-900">{application.data.applicationNumber}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{application.data.registrationStatus}</p>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <form onSubmit={save}>
        <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
          {!editable ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-800">
              This application is currently {application.data?.registrationStatus} and cannot be edited.
            </div>
          ) : null}

          <Section number="1" title="Project Identification" description="Provide the core information used to identify the project.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Project Name *
                <input className={inputClass} disabled={!editable} onChange={update('projectName')} value={form.projectName} />
              </label>

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Project Description *
                <textarea className={`${inputClass} min-h-28`} disabled={!editable} onChange={update('description')} value={form.description} />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Project Type *
                <select className={inputClass} disabled={!editable} onChange={update('projectType')} value={form.projectType}>
                  <option value="">Select project type</option>
                  <option>Development</option><option>Humanitarian</option><option>Emergency Response</option>
                  <option>Infrastructure</option><option>Technical Assistance</option><option>Capacity Building</option>
                  <option>Research / Assessment</option><option>Other</option>
                </select>
              </label>
              <div />

              <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                Project Objectives
                <textarea className={`${inputClass} min-h-28`} disabled={!editable} onChange={update('objectives')}
                  placeholder="One objective per line" value={form.objectives} />
              </label>

              <div className="md:col-span-2">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Project Components</p>
                    <p className="mt-1 text-xs text-slate-500">Add the main components or major areas of work under this project.</p>
                  </div>
                  {editable ? (
                    <button type="button" onClick={addComponent}
                      className="inline-flex items-center gap-2 rounded-lg border border-civic bg-white px-3 py-2 text-sm font-semibold text-civic hover:bg-teal-50">
                      <Plus size={16} /> Add Component
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {form.components.map((component, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-civic">Component {index + 1}</p>
                        {editable && form.components.length > 1 ? (
                          <button type="button" onClick={() => removeComponent(index)}
                            className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">
                            <Trash2 size={13} /> Remove
                          </button>
                        ) : null}
                      </div>
                      <textarea className={`${inputClass} min-h-32`} disabled={!editable}
                        onChange={(event) => updateComponent(index, event.target.value)}
                        placeholder={`Enter Project Component ${index + 1}`} value={component} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section number="2" title="Project Stakeholders"
            description="Identify the institutions funding, supporting, implementing, or ultimately using the project outputs.">
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold text-slate-800">Funded By <span className="text-red-600">*</span></h3>
                <p className="mt-1 text-xs text-slate-500">Enter the institution funding the project. Example: World Bank.</p>
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Institution Name *
                  <input className={inputClass} disabled={!editable}
                    onChange={(event) => updateFundedBy(event.target.value)}
                    placeholder="Enter funding institution name" value={form.fundedBy.name} />
                </label>
              </div>

              <StakeholderRows title="Supported By"
                description="Optional. Add institutions supporting the project. Example: Federal Ministry of Energy and Water Resources."
                rows={supportedBy} setRows={setSupportedBy} editable={editable} />

              <StakeholderRows title="Implemented By"
                description="Required. Add every institution directly responsible for implementing the project."
                required rows={implementedBy} setRows={setImplementedBy} editable={editable} />

              <StakeholderRows title="End User / Beneficiary Institution"
                description="Optional. Add institutions that will ultimately use or benefit from the project outputs."
                rows={endUsers} setRows={setEndUsers} editable={editable} />
            </div>
          </Section>

          <Section number="3" title="Funding"
            description="Record the financial details. The funding institution is already captured under Project Stakeholders.">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-semibold text-slate-700">Funding Source
                <input className={inputClass} disabled={!editable} onChange={update('fundingSource')}
                  placeholder="Grant, loan, government budget" value={form.fundingSource} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Total Project Budget *
                <input className={inputClass} disabled={!editable} min="0" onChange={update('budget')} type="number" value={form.budget} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Currency *
                <select className={inputClass} disabled={!editable} onChange={update('currency')} value={form.currency}>
                  <option value="USD">USD</option><option value="SOS">SOS</option><option value="EUR">EUR</option>
                </select>
              </label>
            </div>
          </Section>

          <Section number="4" title="Project Classification">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Primary Sector *
                <input className={inputClass} disabled={!editable} onChange={update('sector')}
                  placeholder="Water, Health, Energy, Education" value={form.sector} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Sub-Sector
                <input className={inputClass} disabled={!editable} onChange={update('subSector')} value={form.subSector} />
              </label>
            </div>
          </Section>

          <Section number="5" title="Project Duration" description="Enter the planned implementation period.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Start Date *
                <input className={inputClass} disabled={!editable} onChange={update('startDate')} type="date" value={form.startDate} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">End Date *
                <input className={inputClass} disabled={!editable} min={form.startDate || undefined}
                  onChange={update('endDate')} type="date" value={form.endDate} />
              </label>
            </div>
          </Section>

          <Section number="6" title="Geographic Coverage"
            description="Add every region, district, site, or locality where the project will be implemented.">
            <div className="mb-4 flex justify-end">
              {editable ? (
                <button type="button" onClick={addLocation}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  <Plus size={16} /> Add Location
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                  <div className="flex items-center justify-between md:col-span-2">
                    <p className="text-sm font-bold text-slate-700">Location {index + 1}</p>
                    {editable ? (
                      <button type="button" disabled={locations.length === 1} onClick={() => removeLocation(index)}
                        className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40">
                        <Trash2 size={13} /> Remove
                      </button>
                    ) : null}
                  </div>

                  <label className="block text-sm font-semibold text-slate-700">Region *
                    <select className={inputClass} disabled={!editable} onChange={updateLocation(index, 'region')} value={location.region}>
                      <option value="">Select region</option>
                      {(regions.data || []).map((item) => <option key={item._id} value={item._id}>{optionName(item)}</option>)}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">District *
                    <select className={inputClass} disabled={!editable || !location.region}
                      onChange={updateLocation(index, 'district')} value={location.district}>
                      <option value="">Select district</option>
                      {(districtGroups.get(String(location.region)) || []).map((item) =>
                        <option key={item._id} value={item._id}>{optionName(item)}</option>
                      )}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">Site Name
                    <input className={inputClass} disabled={!editable} onChange={updateLocation(index, 'siteName')} value={location.siteName} />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Village / Locality
                    <input className={inputClass} disabled={!editable} onChange={updateLocation(index, 'village')} value={location.village} />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Latitude
                    <input className={inputClass} disabled={!editable} min="-90" max="90" step="any" type="number"
                      onChange={updateLocation(index, 'latitude')} value={location.latitude} />
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">Longitude
                    <input className={inputClass} disabled={!editable} min="-180" max="180" step="any" type="number"
                      onChange={updateLocation(index, 'longitude')} value={location.longitude} />
                  </label>
                </div>
              ))}
            </div>
          </Section>

          <Section number="7" title="Project Contact"
            description="Provide the main project-specific contact person. This is separate from the institution account contact person.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Name *
                <input className={inputClass} disabled={!editable} onChange={update('projectContactName')} value={form.projectContactName} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Position / Title
                <input className={inputClass} disabled={!editable} onChange={update('projectContactPosition')} value={form.projectContactPosition} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Phone *
                <input className={inputClass} disabled={!editable} onChange={update('projectContactPhone')} value={form.projectContactPhone} />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Email *
                <input className={inputClass} disabled={!editable} onChange={update('projectContactEmail')} type="email" value={form.projectContactEmail} />
              </label>
            </div>
          </Section>

          <Section number="8" title="Target Beneficiaries"
            description="Enter planned beneficiary targets. These fields are optional. Actual results will be tracked later through Project Management.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['Households', 'householdCount'], ['Individuals', 'individuals'], ['Male', 'male'],
                ['Female', 'female'], ['Persons with Disabilities', 'disabilityStatus'],
              ].map(([label, field]) => (
                <label className="block text-sm font-semibold text-slate-700" key={field}>{label}
                  <input className={inputClass} disabled={!editable} min="0" onChange={update(field)} type="number" value={form[field]} />
                </label>
              ))}
            </div>
          </Section>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}
          {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div> : null}
        </main>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-xs text-slate-500">Saving a draft does not submit the project to MoPIIC.</p>
            <div className="flex gap-3">
              <button type="button" onClick={goBack}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Back</button>
              {editable ? (
                <>
                  <button type="submit" disabled={isSaving || isSubmitting}
                    className="inline-flex items-center gap-2 rounded-lg border border-civic bg-white px-5 py-2.5 text-sm font-semibold text-civic hover:bg-teal-50 disabled:opacity-60">
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  {isEditing ? (
                    <button type="button" onClick={submitToMoPIIC} disabled={isSaving || isSubmitting}
                      className="rounded-lg bg-civic px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
                      {isSubmitting ? 'Submitting...' : 'Submit to MoPIIC'}
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}