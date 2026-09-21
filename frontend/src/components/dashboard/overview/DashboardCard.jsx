export default function DashboardCard({
  title,
  value,
  icon,
  color = "bg-blue-50",
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h2>

        </div>

        <div
          className={`rounded-xl p-3 ${color}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}