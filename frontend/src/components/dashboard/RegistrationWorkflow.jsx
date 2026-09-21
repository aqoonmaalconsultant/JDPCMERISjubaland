import {
  Building2,
  FolderOpen,
} from "lucide-react";

export default function RegistrationWorkflow({
  data,
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">

      {/* Institution */}

      <WorkflowCard
        title="Institution Registration"
        icon={
          <Building2
            className="text-blue-600"
            size={24}
          />
        }
        items={[
          {
            label: "Pending",
            value:
              data?.institution?.pending ??
              0,
            color: "bg-yellow-500",
          },
          {
            label: "Verified",
            value:
              data?.institution?.verified ??
              0,
            color: "bg-blue-500",
          },
          {
            label: "Approved",
            value:
              data?.institution?.approved ??
              0,
            color: "bg-green-600",
          },
        ]}
      />

      {/* Project */}

      <WorkflowCard
        title="Project Registration"
        icon={
          <FolderOpen
            className="text-emerald-600"
            size={24}
          />
        }
        items={[
          {
            label: "Draft",
            value:
              data?.project?.draft ??
              0,
            color: "bg-slate-500",
          },
          {
            label: "Submitted",
            value:
              data?.project?.submitted ??
              0,
            color: "bg-yellow-500",
          },
          {
            label: "Verified",
            value:
              data?.project?.verified ??
              0,
            color: "bg-blue-500",
          },
          {
            label: "Returned",
            value:
              data?.project?.returned ??
              0,
            color: "bg-red-500",
          },
          {
            label: "Registered",
            value:
              data?.project?.registered ??
              0,
            color: "bg-green-600",
          },
        ]}
      />

    </div>
  );
}

function WorkflowCard({
  title,
  icon,
  items,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center gap-3">

        {icon}

        <h2 className="text-lg font-semibold">
          {title}
        </h2>

      </div>

      {items.map((item) => (

        <div
          key={item.label}
          className="mb-5"
        >

          <div className="mb-2 flex items-center justify-between">

            <span className="text-sm font-medium text-slate-600">
              {item.label}
            </span>

            <span className="text-lg font-bold">
              {item.value}
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">

            <div
              className={`h-full rounded-full ${item.color}`}
              style={{
                width: `${Math.min(
                  item.value * 10,
                  100
                )}%`,
              }}
            />

          </div>

        </div>

      ))}

    </div>
  );
}