import { Activity, ClipboardCheck, Files, MapPin, Search, Target, UsersRound, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '../api/projects.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { hasPermission, Permissions } from '../auth/permissions.js';
import { DocumentModal } from '../ui/DocumentModal.jsx';
import { EvaluationModal } from '../ui/EvaluationModal.jsx';
import { FinancialModal } from '../ui/FinancialModal.jsx';
import { IndicatorModal } from '../ui/IndicatorModal.jsx';
import { BeneficiariesModal } from '../ui/BeneficiariesModal.jsx';
import { LocationModal } from '../ui/LocationModal.jsx';
import { MonitoringModal } from '../ui/MonitoringModal.jsx';
import { StatusBadge } from '../ui/StatusBadge.jsx';

const moduleConfig = {
  monitoring: {
    title: 'Monitoring Visits',
    description: 'Record progress, findings, risks, challenges, and recommendations for each project.',
    actionLabel: 'Open Monitoring',
    icon: Activity,
    permission: [Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS],
    Modal: MonitoringModal,
    statuses: ['Active', 'On Hold', 'Completed']
  },
  beneficiaries: {
    title: 'Beneficiaries',
    description: 'Maintain household, individual, gender, and disability beneficiary counts by project.',
    actionLabel: 'Open Beneficiaries',
    icon: UsersRound,
    permission: [Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS],
    Modal: BeneficiariesModal
  },
  locations: {
    title: 'Project Locations / GPS',
    description: 'Update region, district, village, latitude, and longitude for project mapping.',
    actionLabel: 'Open Location',
    icon: MapPin,
    permission: [Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS],
    Modal: LocationModal
  },
  evaluations: {
    title: 'Evaluations',
    description: 'Manage baseline, midterm, final, and impact evaluations for project performance review.',
    actionLabel: 'Open Evaluations',
    icon: ClipboardCheck,
    permission: [Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS],
    Modal: EvaluationModal
  },
  indicators: {
    title: 'Indicators',
    description: 'Maintain goals, outcomes, outputs, activities, indicators, targets, actuals, and achievement status.',
    actionLabel: 'Open Indicators',
    icon: Target,
    permission: [Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS],
    Modal: IndicatorModal
  },
  finance: {
    title: 'Finance',
    description: 'Track budgets, disbursements, expenditures, balances, and budget utilization.',
    actionLabel: 'Open Finance',
    icon: Wallet,
    permission: [Permissions.UPDATE_PROJECT, Permissions.VERIFY_PROGRESS],
    Modal: FinancialModal,
    statuses: ['Planning', 'Active', 'On Hold', 'Completed']
  },
  documents: {
    title: 'Project Documents',
    description: 'Upload and manage contracts, reports, photos, videos, drawings, and certificates by project.',
    actionLabel: 'Open Documents',
    icon: Files,
    permission: [Permissions.UPLOAD_DOCUMENTS],
    Modal: DocumentModal
  }
};


function projectRawId(project) {
  return project?.rawId || project?._id || '';
}

function projectCode(project) {
  return project?.projectCode || project?.id || project?.applicationNumber || '-';
}

function projectName(project) {
  return project?.projectName || project?.name || '-';
}

function projectStatus(project) {
  return project?.implementationStatus || project?.status || 'Planning';
}

function projectProgress(project) {
  const value = project?.overallProgress ?? project?.progress ?? 0;
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function readableReference(value) {
  if (!value) return '-';

  if (typeof value === 'object') {
    return value.name || value.organizationName || value.code || '-';
  }

  if (/^[a-f\d]{24}$/i.test(String(value))) return '-';

  return String(value);
}

function projectInstitution(project) {
  return readableReference(
    project?.institution ||
    project?.leadMinistry ||
    project?.ministrySummary ||
    project?.ministry
  );
}

function projectFunding(project) {
  return readableReference(project?.fundingSource || project?.donor);
}

export function ProjectModulePage({ module }) {
  const config = moduleConfig[module] || moduleConfig.monitoring;
  const { user } = useAuth();
  const { data: projects = [], isFetching } = useProjects();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const Icon = config.icon;
  const Modal = config.Modal;
  const canUseModule = hasPermission(user, ...config.permission);
  const projectStatusAllowed = (project) => !config.statuses || config.statuses.includes(projectStatus(project));
  const projectParam = searchParams.get('project');

  useEffect(() => {
    if (!projectParam || !projects.length) return;

    const project = projects.find((item) => projectRawId(item) === projectParam || projectCode(item) === projectParam);
    if (project) {
      setSelectedProject(project);
      setIsModuleOpen(true);
    }
  }, [projectParam, projects]);

  useEffect(() => {
    if (!selectedProject) return;

    const refreshedProject = projects.find((project) => projectRawId(project) === projectRawId(selectedProject));
    if (refreshedProject) {
      setSelectedProject(refreshedProject);
    }
  }, [projects, selectedProject]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;

    return projects.filter((project) => [
      projectName(project),
      projectCode(project),
      projectInstitution(project),
      projectFunding(project),
      projectStatus(project),
      project.sector,
      project.projectType
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [projects, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="text-civic" size={22} />
            <h2 className="text-lg font-semibold">{config.title}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
          {isFetching ? <p className="mt-1 text-xs font-medium text-slate-400">Refreshing project list...</p> : null}
        </div>
        {!canUseModule ? (
          <span className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            View only
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          className="w-full outline-none"
          placeholder="Search projects by code, name, ministry, district, donor, sector, or status"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Selected Project Workspace</h3>
            {selectedProject ? (
              <p className="mt-1 text-sm text-slate-500">
                {projectCode(selectedProject)} / {projectName(selectedProject)} / {projectStatus(selectedProject)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Select a project from the table below to open the module form and table.</p>
            )}
          </div>
          <button
            className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
            disabled={!selectedProject || !canUseModule || !projectStatusAllowed(selectedProject)}
            onClick={() => setIsModuleOpen(true)}
            type="button"
          >
            <Icon size={16} />
            {config.actionLabel}
          </button>
        </div>
        {selectedProject ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-1 font-semibold">{projectStatus(selectedProject)}</p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stage</p>
              <p className="mt-1 font-semibold">{selectedProject.active === false ? 'Inactive' : 'Registered'}</p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</p>
              <p className="mt-1 font-semibold">{projectProgress(selectedProject)}%</p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Budget</p>
              <p className="mt-1 font-semibold">${Number(selectedProject.budget || 0).toLocaleString()}</p>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Beneficiaries</p>
              <p className="mt-1 font-semibold">{(selectedProject.beneficiaries?.individuals || 0).toLocaleString()}</p>
            </div>
          </div>
        ) : null}
      </section>

      {isModuleOpen && selectedProject ? (
        <section className="space-y-3">
          <Modal project={selectedProject} onClose={() => setIsModuleOpen(false)} embedded />
        </section>
      ) : null}

      <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Ministry</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Donor</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.map((project) => (
              <tr key={projectRawId(project) || projectCode(project)} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <p className="font-semibold text-ink">{projectName(project)}</p>
                  <p className="text-xs text-slate-500">{projectCode(project)}</p>
                </td>
                <td className="px-4 py-4">{projectInstitution(project)}</td>
                <td className="px-4 py-4">Managed in GPS module</td>
                <td className="px-4 py-4">{projectFunding(project)}</td>
                <td className="px-4 py-4">
                  <div className="h-2 w-28 overflow-hidden rounded bg-slate-200">
                    <div className="h-full bg-civic" style={{ width: `${projectProgress(project)}%` }} />
                  </div>
                  <span className="mt-1 block text-xs text-slate-500">{projectProgress(project)}%</span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={projectStatus(project)} />
                  <p className="mt-1 text-xs text-slate-500">{project.active === false ? 'Inactive' : 'Registered'}</p>
                </td>
                <td className="px-4 py-4">
                  <button
                    className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    disabled={!projectRawId(project) || !canUseModule || !projectStatusAllowed(project)}
                    onClick={() => {
                      setSelectedProject(project);
                      setIsModuleOpen(true);
                    }}
                    type="button"
                  >
                    <Icon size={14} />
                    {config.actionLabel}
                  </button>
                </td>
              </tr>
            ))}
            {isFetching ? (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="7">Loading projects...</td></tr>
            ) : null}
            {!isFetching && !filteredProjects.length ? (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="7">No projects found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>

    </div>
  );
}

export function MonitoringPage() {
  return <ProjectModulePage module="monitoring" />;
}

export function BeneficiariesPage() {
  return <ProjectModulePage module="beneficiaries" />;
}

export function ProjectLocationsPage() {
  return <ProjectModulePage module="locations" />;
}

export function EvaluationsPage() {
  return <ProjectModulePage module="evaluations" />;
}

export function IndicatorsPage() {
  return <ProjectModulePage module="indicators" />;
}

export function FinancePage() {
  return <ProjectModulePage module="finance" />;
}

export function ProjectDocumentsPage() {
  return <ProjectModulePage module="documents" />;
}
