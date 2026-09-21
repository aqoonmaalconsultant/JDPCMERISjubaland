import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";

const STATUS_COLORS = {
  Planned: "#FBBF24",
  "Not Started": "#94A3B8",
  Ongoing: "#10B981",
  "On Hold": "#F97316",
  Completed: "#2563EB",
  Cancelled: "#EF4444",
  Unknown: "#CBD5E1",
};

export default function ProjectStatusChart({
  data,
}) {
  const chartData =
  data?.implementationStatus?.map((item) => ({
    name: item._id || "Unknown",
    value: item.total,
    label: `${item._id || "Unknown"} (${item.total})`,
  })) || [];

  const totalProjects = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            Project Status
          </h2>

          <p className="text-sm text-slate-500">
            Implementation Progress
          </p>

        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          {totalProjects} Projects
        </span>

      </div>

      <div className="h-80">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
            >

              {chartData.map(
                (entry, index) => (
                 <Cell
    key={index}
    fill={
        STATUS_COLORS[entry.name] ??
        STATUS_COLORS.Unknown
    }
/>
                )
              )}
<Label
  value={`${totalProjects}`}
  position="center"
  style={{
    fontSize: 30,
    fontWeight: 700,
    fill: "#0F172A",
  }}
/>
            </Pie>

            <Tooltip />

           <Legend
  formatter={(value, entry) =>
    `${value} (${entry.payload.value})`
  }
/>

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}