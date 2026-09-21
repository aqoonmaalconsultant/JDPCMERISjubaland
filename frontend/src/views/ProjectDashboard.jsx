import { useParams } from 'react-router-dom';

import {
  FolderKanban,
  Calendar,
  Building2,
  DollarSign,
  BarChart3,
  Activity,
  FileText,
  ShieldAlert,
} from 'lucide-react';

import {
  useProject,
} from '../api/projects.js';

export function ProjectDashboard() {
  const { id } = useParams();

  const {
    data: project,
    isLoading,
  } = useProject(id);

  if (isLoading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          {project.projectName}
        </h1>

        <p className="text-slate-500 mt-2">
          {project.projectCode}
        </p>

      </div>

      {/* Overview */}

      <div className="grid gap-4 md:grid-cols-4">

        <InfoCard
          icon={<FolderKanban size={22} />}
          title="Status"
          value={project.implementationStatus}
        />

        <InfoCard
          icon={<BarChart3 size={22} />}
          title="Progress"
          value={`${project.overallProgress}%`}
        />

        <InfoCard
          icon={<DollarSign size={22} />}
          title="Budget"
          value={`${project.currency} ${project.budget?.toLocaleString()}`}
        />

        <InfoCard
          icon={<Calendar size={22} />}
          title="Timeline"
          value={`${formatDate(project.startDate)} - ${formatDate(project.endDate)}`}
        />

      </div>

      {/* Details */}

      <div className="grid gap-6 lg:grid-cols-2">

        <Section title="Project Information">

          <Field
            label="Project Code"
            value={project.projectCode}
          />

          <Field
            label="Application Number"
            value={project.applicationNumber}
          />

          <Field
            label="Project Type"
            value={project.projectType}
          />

          <Field
            label="Sector"
            value={project.sector}
          />

          <Field
            label="Funding Source"
            value={project.fundingSource}
          />

        </Section>

        <Section title="Ownership">

          <Field
            label="Institution"
            value={project.institution?.institutionName}
          />

          <Field
            label="Submitted By"
            value={project.submittedBy?.name}
          />

          <Field
            label="Registered By"
            value={project.registeredBy?.name}
          />

          <Field
            label="Registered At"
            value={formatDate(project.registeredAt)}
          />

        </Section>

      </div>

      {/* Future Modules */}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">

        <ModuleCard
          icon={<Activity size={22} />}
          title="Activities"
        />

        <ModuleCard
          icon={<DollarSign size={22} />}
          title="Budget"
        />

        <ModuleCard
          icon={<FileText size={22} />}
          title="Documents"
        />

        <ModuleCard
          icon={<ShieldAlert size={22} />}
          title="Risks"
        />

        <ModuleCard
          icon={<BarChart3 size={22} />}
          title="Monitoring"
        />

        <ModuleCard
          icon={<Building2 size={22} />}
          title="Reports"
        />

      </div>

    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-lg border bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-xl font-semibold">
            {value || '-'}
          </p>

        </div>

        {icon}

      </div>

    </div>
  );
}

function ModuleCard({
  icon,
  title,
}) {
  return (
    <div className="rounded-lg border bg-white p-5 text-center hover:shadow transition">

      <div className="flex justify-center mb-3">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs text-slate-500">
        Coming Soon
      </p>

    </div>
  );
}

function Section({
  title,
  children,
}) {
  return (
    <div className="rounded-lg border bg-white">

      <div className="border-b px-6 py-4">

        <h2 className="text-lg font-semibold">
          {title}
        </h2>

      </div>

      <div className="grid gap-4 p-6">
        {children}
      </div>

    </div>
  );
}

function Field({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value || '-'}
      </p>

    </div>
  );
}

function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString();
}