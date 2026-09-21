import {
  Plus,
  ShieldCheck,
  Map,
  FileBarChart2,
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Register Project",
      icon: Plus,
    },
    {
      title: "Verify Institution",
      icon: ShieldCheck,
    },
    {
      title: "GIS Map",
      icon: Map,
    },
    {
      title: "Reports",
      icon: FileBarChart2,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      {actions.map((action) => {

        const Icon = action.icon;

        return (

          <button
            key={action.title}
            className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
          >

            <Icon size={22} />

            <span className="font-medium">
              {action.title}
            </span>

          </button>

        );

      })}

    </div>
  );
}