import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
} from 'lucide-react';

import {
  useRegisteredProject,
} from '../api/registeredProjects.js';

export function RegisteredProjectDetails() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const {
    data: project,
    isLoading,
  } =
    useRegisteredProject(id);

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

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Registered Project
          </h1>

          <p className="text-slate-500">
            Official project registration record.
          </p>

        </div>

        <button
          onClick={() =>
            navigate(-1)
          }
          className="rounded border px-4 py-2"
        >
          <ArrowLeft
            size={16}
            className="mr-2 inline"
          />

          Back

        </button>

      </div>

      <Section title="Project Information">

        <Field
          label="Application Number"
          value={
            project.applicationNumber
          }
        />

        <Field
          label="Project Name"
          value={
            project.projectName
          }
        />

        <Field
          label="Project Type"
          value={
            project.projectType
          }
        />

        <Field
          label="Sector"
          value={
            project.sector
          }
        />

        <Field
          label="Funding Source"
          value={
            project.fundingSource
          }
        />

        <Field
          label="Budget"
          value={`${project.currency || ''} ${project.budget || ''}`}
        />

        <Field
          label="Implementation Status"
          value={
            project.implementationStatus
          }
        />

      </Section>

      <Section title="Institution">

        <Field
          label="Institution"
          value={
            project.submittingInstitution
              ?.institutionName
          }
        />

        <Field
          label="Registration Status"
          value={
            project.registrationStatus
          }
        />

        <Field
          label="Registration Stage"
          value={
            project.registrationStage
          }
        />

        <Field
          label="Registered Date"
          value={
            project.registeredAt
              ? new Date(
                  project.registeredAt
                ).toLocaleString()
              : '-'
          }
        />

        <Field
          label="Registered By"
          value={
            project.registeredBy
              ?.name
          }
        />

      </Section>

      <Section title="Stakeholders">

        <Field
          label="Funded By"
          value={
            project.fundedBy
              ?.institutionName
          }
        />

        <Field
          label="Supported By"
          value={
            project.supportedBy
              ?.map(
                x =>
                  x.institutionName
              )
              .join(', ')
          }
        />

        <Field
          label="Implemented By"
          value={
            project.implementedBy
              ?.map(
                x =>
                  x.institutionName
              )
              .join(', ')
          }
        />

      </Section>

      <Section title="Project Contact">

        <Field
          label="Name"
          value={
            project.projectContact
              ?.name
          }
        />

        <Field
          label="Position"
          value={
            project.projectContact
              ?.position
          }
        />

        <Field
          label="Phone"
          value={
            project.projectContact
              ?.phone
          }
        />

        <Field
          label="Email"
          value={
            project.projectContact
              ?.email
          }
        />

      </Section>

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

      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-slate-900">
        {value || '-'}
      </p>

    </div>
  );
}