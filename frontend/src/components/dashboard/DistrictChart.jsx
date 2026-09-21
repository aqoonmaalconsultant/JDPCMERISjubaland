import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function DistrictChart({
  data,
}) {

  const chartData =
    data?.districtDistribution?.map((item) => ({
      district: item._id || "Unknown",
      projects: item.total,
    })) || [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          District Distribution
        </h2>

        <p className="text-sm text-slate-500">
          Projects by District
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
              right: 20,
              left: 20,
              bottom: 10,
            }}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" />

            <YAxis
              type="category"
              dataKey="district"
              width={140}
            />

            <Tooltip />

            <Bar
              dataKey="projects"
              fill="#7C3AED"
              radius={[0, 6, 6, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}