import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

import {
  useReturnProject,
  useVerificationProject,
  useVerifyProject,
} from '../api/projectVerification.js';

export function ProjectVerificationDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const {
    data: project,
    isLoading,
  } = useVerificationProject(id);

  const verifyProject =
    useVerifyProject();

  const returnProject =
    useReturnProject();

  const [notes, setNotes] =
    useState('');

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
            Project Verification
          </h1>

          <p className="text-slate-500">
            Review project before final registration.
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
            className="inline mr-2"
          />
          Back
        </button>

      </div>

      <Section
        title="Project Information"
      >

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
          label="Description"
          value={
            project.description
          }
        />

      </Section>

      <Section
        title="Stakeholders"
      >

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

        <Field
          label="End Users"
          value={
            project.endUsers
              ?.map(
                x =>
                  x.institutionName
              )
              .join(', ')
          }
        />

      </Section>

      <Section
        title="Project Contact"
      >

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

      <Section
        title="Verification Notes"
      >

        <textarea
          value={notes}
          onChange={event =>
            setNotes(
              event.target.value
            )
          }
          rows={6}
          className="w-full rounded border p-3"
          placeholder="Verification observations..."
        />

      </Section>
            <div className="flex justify-end gap-3">

        <button
         onClick={() =>
  returnProject.mutate(
    {
      id,
      revisionReason: notes,
    },
    {
      onSuccess: () => {
        alert('Project returned successfully.');
        navigate('/project-verification');
      },

      onError: (error) => {
        console.error(error);
        alert(
          error?.response?.data?.message ||
          error.message
        );
      },
    }
  )
}
          className="inline-flex items-center gap-2 rounded bg-red-600 px-5 py-3 font-semibold text-white"
        >

          <RotateCcw
            size={18}
          />

          Return For Revision

        </button>

        <button
         onClick={() =>
  verifyProject.mutate(id, {
    onSuccess: () => {
      alert('Project verified successfully.');
      navigate('/project-verification');
    },

    onError: (error) => {
      console.error(error);
      alert(
        error?.response?.data?.message ||
        error.message
      );
    },
  })
}
          className="inline-flex items-center gap-2 rounded bg-green-700 px-5 py-3 font-semibold text-white"
        >

          <CheckCircle
            size={18}
          />

          Verify Project

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