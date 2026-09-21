import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  FileCheck,
} from 'lucide-react';

import {
  useFinalRegistrationProject,
  useRegisterProject,
} from '../api/finalRegistration.js';

export function FinalRegistrationDetails() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const {
    data: project,
    isLoading,
  } =
    useFinalRegistrationProject(
      id
    );

  const registerProject =
    useRegisterProject();

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

  const canRegister =
    project.registrationStatus ===
      'Verified' &&
    project.registrationStage ===
      'Final Registration';

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Final Registration
          </h1>

          <p className="text-slate-500">
            Complete the official
            registration of this project.
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
          value={
            `${project.currency || ''} ${project.budget || ''}`
          }
        />

        <Field
          label="Implementation Status"
          value={
            project.implementationStatus
          }
        />

        <Field
          label="Description"
          value={
            project.description
          }
        />

      </Section>

      <Section title="Institution">

        <Field
          label="Institution"
          value={
            project
              .submittingInstitution
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

      <div className="flex justify-end">

        <button
          disabled={
            !canRegister ||
            registerProject.isPending
          }
          onClick={() =>
            registerProject.mutate(
              id,
              {
               onSuccess: () => {
  navigate('/final-registration');
},
              }
            )
          }
          className={`inline-flex items-center gap-2 rounded px-6 py-3 font-semibold text-white ${
            canRegister
              ? 'bg-green-700 hover:bg-green-800'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >

          <FileCheck
            size={18}
          />

          Register Project

        </button>

      </div>

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