import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function RegionChart({
  data,
}) {

  const chartData =
    data?.regionDistribution?.map((item) => ({
      region: item._id || "Unknown",
      projects: item.total,
    })) || [];

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          Region Distribution
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          Projects by Region
        </p>

        <div className="flex h-72 items-center justify-center text-slate-400">
          No regional project data available.
        </div>

      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          Region Distribution
        </h2>

        <p className="text-sm text-slate-500">
          Projects by Region
        </p>

      </div>

      <div className="h-80">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 10,
              right: 40,
              left: 20,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              allowDecimals={false}
            />

            <YAxis
              type="category"
              dataKey="region"
              width={140}
            />

            <Tooltip
              formatter={(value) => [`${value} Projects`, "Total"]}
            />

            <Bar
              dataKey="projects"
              fill="#16A34A"
              radius={[0, 6, 6, 0]}
            >
              <LabelList
                dataKey="projects"
                position="right"
              />
            </Bar>

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}