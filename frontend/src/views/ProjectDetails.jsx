import { Activity, ArrowLeft, ClipboardCheck, Edit, Files, MapPin, Target, UsersRound, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProject } from '../api/projects.js';
import { useProjectDocuments } from '../api/documents.js';
import { useProjectEvaluations } from '../api/evaluations.js';
import { useProjectFinancials } from '../api/financials.js';
import { useProjectIndicators } from '../api/indicators.js';
import { useProjectMonitoring } from '../api/monitoring.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { hasPermission, Permissions } from '../auth/permissions.js';
import { BeneficiariesModal } from '../ui/BeneficiariesModal.jsx';
import { DocumentModal } from '../ui/DocumentModal.jsx';
import { EvaluationModal } from '../ui/EvaluationModal.jsx';
import { FinancialModal } from '../ui/FinancialModal.jsx';
import { IndicatorModal } from '../ui/IndicatorModal.jsx';
import { LocationModal } from '../ui/LocationModal.jsx';
import { MonitoringModal } from '../ui/MonitoringModal.jsx';
import { ProjectFormModal } from '../ui/ProjectFormModal.jsx';
import { StatusBadge } from '../ui/StatusBadge.jsx';


function InfoItem({ label, value }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value || '-'}</p>
    </div>
  );
}

function ProgressBar({ label, value, color = 'bg-civic' }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{value || 0}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(Number(value) || 0, 100)}%` }} />
      </div>
    </div>
  );
}

function ModuleSummaryCard({ title, value, detail, to }) {
  return (
    <Link className="rounded border border-slate-200 bg-white p-4 shadow-sm hover:border-civic hover:bg-teal-50" to={to}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </Link>
  );
}

function CompactStat({ label, value }) {
  return (
    <div className="rounded border border-slate-200 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value || '-'}</p>
    </div>
  );
}

function money(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function refName(value, fallback = '-') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.name || value.organizationName || fallback;
}

function listText(values = [], fallback = '-') {
  if (!Array.isArray(values) || !values.length) {
    return fallback;
  }

  return values.join(' • ');
}

const monitorableStatuses = ['Implementation', 'Monitoring'];
const financeStatuses = ['Approved', 'Procurement', 'Implementation', 'Monitoring'];

export function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const projectQuery = useProject(id);
  const project = projectQuery.data;
  const projectId = project?.rawId;
  const documents = useProjectDocuments(projectId);
  const monitoring = useProjectMonitoring(projectId);
  const evaluations = useProjectEvaluations(projectId);
  const indicators = useProjectIndicators(projectId);
  const financials = useProjectFinancials(projectId);
  const [modal, setModal] = useState(null);
  const canUpdateProject = hasPermission(user, Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS);
  const canUploadDocuments = hasPermission(user, Permissions.UPLOAD_DOCUMENTS);

  if (projectQuery.isFetching && !project) {
    return <div className="rounded border border-slate-200 bg-white p-4 text-sm font-medium text-slate-600">Loading project details...</div>;
  }

  if (!project) {
    return <div className="rounded border border-slate-200 bg-white p-4 text-sm font-medium text-slate-600">Project not found.</div>;
  }

  const source = project.source || {};
  const indicatorRows = indicators.data || [];
  const financeSummary = financials.data?.summary || {};
  const isOverBudget = (financeSummary.overBudgetAmount || 0) > 0;
  const latestMonitoring = (monitoring.data || [])[0];
  const moduleLink = (path) => `${path}?project=${project.rawId}`;
  const supportingMinistries = source.supportingMinistries || [];
  const coImplementingPartners = source.coImplementingPartners || [];
  const locationRows = project.locations || [];
  const leadImplementer =
    source.leadImplementerType === 'Government Line Ministry'
      ? refName(source.leadImplementerMinistry)
      : refName(source.partner);
  const indicatorHealth = {
    onTrack: indicatorRows.filter((indicator) => indicator.status === 'ON_TRACK').length,
    atRisk: indicatorRows.filter((indicator) => indicator.status === 'AT_RISK').length,
    offTrack: indicatorRows.filter((indicator) => indicator.status === 'OFF_TRACK').length
  };
  const actions = [
    { key: 'edit', label: 'Edit Project', icon: Edit, enabled: canUpdateProject },
    { key: 'monitoring', label: 'Monitoring', icon: Activity, enabled: canUpdateProject && monitorableStatuses.includes(project.status) },
    { key: 'evaluations', label: 'Evaluations', icon: ClipboardCheck, enabled: canUpdateProject },
    { key: 'indicators', label: 'Indicators', icon: Target, enabled: canUpdateProject },
    { key: 'finance', label: 'Finance', icon: Wallet, enabled: canUpdateProject && financeStatuses.includes(project.status) },
    { key: 'documents', label: 'Documents', icon: Files, enabled: canUploadDocuments },
    { key: 'beneficiaries', label: 'Beneficiaries', icon: UsersRound, enabled: canUpdateProject },
    { key: 'location', label: 'Location', icon: MapPin, enabled: canUpdateProject }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-civic" to="/projects">
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
          <h2 className="mt-2 text-xl font-semibold">{project.name}</h2>
          <p className="text-sm text-slate-500">{project.id} / {project.ministrySummary || project.ministry}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} />
          <span className="rounded border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">{project.approvalStage}</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Budget" value={`$${project.budget.toLocaleString()} ${source.currency || 'USD'}`} />
        <InfoItem label="Physical Progress" value={`${project.progress}%`} />
        <InfoItem label="Financial Progress" value={`${project.financialProgress}%`} />
        <InfoItem label="Timeline Progress" value={`${project.timelineProgress}%`} />
        <InfoItem label="Primary Government Line Ministry" value={project.leadMinistry || project.ministry} />
        <InfoItem label="Supporting Government Line Ministries" value={supportingMinistries.length ? supportingMinistries.map((ministry) => refName(ministry)).join(' + ') : 'None'} />
        <InfoItem label="Funding Institution / Donor" value={project.donor} />
        <InfoItem label="Primary Sector" value={project.sector} />
        <InfoItem label="Project Type" value={source.projectType} />
        <InfoItem label="Implementation Status" value={source.implementationStatus} />
        <InfoItem label="Lead Implementer" value={leadImplementer} />
        <InfoItem label="Locations" value={project.locationSummary || `${project.district}, ${project.region}`} />
        <InfoItem label="Beneficiaries" value={(project.beneficiaries?.individuals || 0).toLocaleString()} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Government & Implementation Arrangement</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Primary Government Line Ministry
              </p>

              <p className="mt-1 font-semibold text-ink">
                {refName(source.ministry, project.ministry)}
              </p>
            </div>

            <div className="rounded border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supporting Government Line Ministries
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {supportingMinistries.map((ministry) => (
                  <span
                    key={ministry._id || ministry.name}
                    className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-semibold text-civic"
                  >
                    {refName(ministry)}
                  </span>
                ))}

                {!supportingMinistries.length ? (
                  <span className="text-sm text-slate-500">
                    No supporting government line ministries assigned.
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Federal Government Line Ministry
              </p>

              <p className="mt-1 font-semibold text-ink">
                {source.federalLineMinistry || 'None'}
              </p>
            </div>

            <div className="rounded border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lead Implementer
              </p>

              <p className="mt-1 font-semibold text-ink">
                {leadImplementer}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {source.leadImplementerType || 'Institution type not specified'}
              </p>
            </div>

            <div className="rounded border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Co-Implementing Institutions
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {coImplementingPartners.map((partner) => (
                  <span
                    key={partner._id || partner.organizationName}
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700"
                  >
                    {refName(partner)}
                  </span>
                ))}

                {!coImplementingPartners.length ? (
                  <span className="text-sm text-slate-500">
                    No co-implementing institutions assigned.
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold">Location Coverage</h3>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Site Name</th>
                  <th className="px-4 py-3">Village / Locality</th>
                  <th className="px-4 py-3">GPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locationRows.map((location, index) => (
                  <tr key={`${location.region}-${location.district}-${index}`}>
                    <td className="px-4 py-3 font-medium">{location.region || '-'}</td>
                    <td className="px-4 py-3">{location.district || '-'}</td>
                    <td className="px-4 py-3">{location.siteName || '-'}</td>
                    <td className="px-4 py-3">{location.village || '-'}</td>
                    <td className="px-4 py-3">
                      {location.coordinates ? `${location.latitude}, ${location.longitude}` : '-'}
                    </td>
                  </tr>
                ))}
                {!locationRows.length ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500" colSpan="5">No project locations recorded.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Delivery Health</h3>
          <div className="mt-4 space-y-4">
            <ProgressBar label="Physical progress" value={project.progress} color="bg-civic" />
            <ProgressBar label="Financial progress" value={project.financialProgress} color="bg-emerald-600" />
            <ProgressBar label="Timeline progress" value={project.timelineProgress} color="bg-blue-600" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <CompactStat label="Traffic" value={project.trafficLight} />
            <CompactStat label="Latest Report" value={latestMonitoring ? new Date(latestMonitoring.createdAt).toLocaleDateString() : 'None'} />
            <CompactStat label="Light" value={latestMonitoring?.trafficLight || '-'} />
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Beneficiary Breakdown</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <CompactStat label="People" value={(project.beneficiaries?.individuals || 0).toLocaleString()} />
            <CompactStat label="Households" value={(project.beneficiaries?.householdCount || 0).toLocaleString()} />
            <CompactStat label="Female" value={(project.beneficiaries?.female || 0).toLocaleString()} />
            <CompactStat label="Male" value={(project.beneficiaries?.male || 0).toLocaleString()} />
            <CompactStat label="Disability" value={(project.beneficiaries?.disabilityStatus || 0).toLocaleString()} />
          </div>
        </div>
      </section>

      <section className={`rounded border bg-white p-5 shadow-sm ${isOverBudget ? 'border-red-200' : 'border-slate-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Financial Health</h3>
            <p className="mt-1 text-sm text-slate-500">Budget utilization, balance, and spending risk for this project.</p>
          </div>
          {isOverBudget ? (
            <span className="rounded border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">Over budget</span>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <CompactStat label="Budget" value={money(financeSummary.budget ?? project.budget)} />
          <CompactStat label="Disbursed" value={money(financeSummary.disbursements)} />
          <CompactStat label="Spent" value={money(financeSummary.expenditures)} />
          <CompactStat label="Balance" value={money(financeSummary.remainingBalance)} />
          <CompactStat label="Over Budget" value={money(financeSummary.overBudgetAmount)} />
          <CompactStat label="Utilization" value={`${financeSummary.utilizationPercentage || project.financialProgress || 0}%`} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <ModuleSummaryCard title="Monitoring" value={(monitoring.data || []).length.toLocaleString()} detail="reports logged" to={moduleLink('/monitoring')} />
        <ModuleSummaryCard title="Evaluations" value={(evaluations.data || []).length.toLocaleString()} detail="evaluation records" to={moduleLink('/evaluations')} />
        <ModuleSummaryCard title="Indicators" value={indicatorRows.length.toLocaleString()} detail={`${indicatorHealth.onTrack} on track / ${indicatorHealth.offTrack} off track`} to={moduleLink('/indicators')} />
        <ModuleSummaryCard title="Finance" value={`$${Math.round(financeSummary.expenditures || 0).toLocaleString()}`} detail={`${financeSummary.utilizationPercentage || 0}% utilized`} to={moduleLink('/finance')} />
        <ModuleSummaryCard title="Documents" value={(documents.data || []).length.toLocaleString()} detail="files attached" to={moduleLink('/documents')} />
        <ModuleSummaryCard title="Locations" value={(project.locations?.length || 0).toLocaleString()} detail={project.locationSummary || project.region} to={moduleLink('/project-locations')} />
      </section>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Project Information</h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {project.description || 'No description recorded.'}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoItem
            label="Start Date"
            value={
              source.startDate
                ? new Date(source.startDate).toLocaleDateString()
                : '-'
            }
          />

          <InfoItem
            label="End Date"
            value={
              source.endDate
                ? new Date(source.endDate).toLocaleDateString()
                : '-'
            }
          />

          <InfoItem label="Project Type" value={source.projectType} />
          <InfoItem label="Implementation Status" value={source.implementationStatus} />
          <InfoItem label="Sub-Sector" value={source.subSector} />
          <InfoItem label="Funding Source" value={source.fundingSource} />
          <InfoItem label="Contractor" value={source.contractor} />
          <InfoItem label="Consultant" value={source.consultant} />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Project Objectives
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {listText(source.objectives)}
            </p>
          </div>

          <div className="rounded border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Project Components
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {listText(source.components)}
            </p>
          </div>

          <div className="rounded border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Project Achievements
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {listText(source.achievements)}
            </p>
          </div>
        </div>
      </section>


      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Project Coordination Contacts</h3>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Government Focal Point
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <CompactStat label="Name" value={source.governmentFocalPoint?.name} />
              <CompactStat label="Position" value={source.governmentFocalPoint?.position} />
              <CompactStat label="Phone" value={source.governmentFocalPoint?.phone} />
              <CompactStat label="Email" value={source.governmentFocalPoint?.email} />
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Implementing Institution Focal Point
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <CompactStat label="Name" value={source.implementerFocalPoint?.name} />
              <CompactStat label="Position" value={source.implementerFocalPoint?.position} />
              <CompactStat label="Phone" value={source.implementerFocalPoint?.phone} />
              <CompactStat label="Email" value={source.implementerFocalPoint?.email} />
            </div>
          </div>
        </div>
      </section>


      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Project Actions</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={!action.enabled}
              onClick={() => setModal(action.key)}
              type="button"
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <ProjectFormModal isOpen={modal === 'edit'} onClose={() => setModal(null)} project={project} />
      <MonitoringModal project={modal === 'monitoring' ? project : null} onClose={() => setModal(null)} />
      <EvaluationModal project={modal === 'evaluations' ? project : null} onClose={() => setModal(null)} />
      <IndicatorModal project={modal === 'indicators' ? project : null} onClose={() => setModal(null)} />
      <FinancialModal project={modal === 'finance' ? project : null} onClose={() => setModal(null)} />
      <DocumentModal project={modal === 'documents' ? project : null} onClose={() => setModal(null)} />
      <BeneficiariesModal project={modal === 'beneficiaries' ? project : null} onClose={() => setModal(null)} />
      <LocationModal project={modal === 'location' ? project : null} onClose={() => setModal(null)} />
    </div>
  );
}
