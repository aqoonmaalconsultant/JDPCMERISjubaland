import {
  UsersRound,
  X,
} from "lucide-react";

const emptyBeneficiaries = {
  householdCount: 0,
  individuals: 0,
  male: 0,
  female: 0,
  disabilityStatus: 0,
};

export function BeneficiariesModal({
  project,
  onClose,
  embedded = false,
}) {
  if (!project) {
    return null;
  }

  const beneficiaries = {
    ...emptyBeneficiaries,
    ...(project.beneficiaries || {}),
  };

  const items = [
    {
      key: "householdCount",
      label: "Households",
    },
    {
      key: "individuals",
      label: "Individuals",
    },
    {
      key: "male",
      label: "Male",
    },
    {
      key: "female",
      label: "Female",
    },
    {
      key: "disabilityStatus",
      label: "Persons with Disability",
    },
  ];

  return (
    <div
      className={
        embedded
          ? ""
          : "fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8"
      }
    >
      <div
        className={
          embedded
            ? "rounded border border-slate-200 bg-white shadow-sm"
            : "mx-auto max-w-2xl rounded border border-slate-200 bg-white shadow-xl"
        }
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <UsersRound
                size={20}
                className="text-civic"
              />

              <h2 className="text-lg font-semibold">
                Beneficiaries
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {project.name ||
                project.projectName ||
                "Project"}
            </p>
          </div>

          {!embedded ? (
            <button
              className="rounded p-2 text-slate-500 hover:bg-slate-100"
              onClick={onClose}
              type="button"
              title="Close"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>

        {/* Information */}

        <div className="border-b border-slate-200 bg-amber-50 px-5 py-3">
          <p className="text-sm text-amber-800">
            These figures represent the project's
            planned beneficiary targets.
          </p>
        </div>

        {/* Beneficiary figures */}

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {Number(
                  beneficiaries[item.key] || 0
                ).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}

        {!embedded ? (
          <div className="flex justify-end border-t border-slate-200 px-5 py-4">
            <button
              className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}