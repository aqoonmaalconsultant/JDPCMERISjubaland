import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SectorChart({
  data,
}) {
console.log("Sector Data:", data);
  const chartData =
  data?.sectorDistribution?.map((item) => ({
    sector: item._id || "Unknown",
    projects: item.total,
  })) || [];

console.log("Sector Distribution:", data?.sectorDistribution);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          Sector Distribution
        </h2>

        <p className="text-sm text-slate-500">
          Projects by Sector
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

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
            />

            <YAxis
              type="category"
              dataKey="sector"
              width={110}
            />

            <Tooltip />

            <Bar
              dataKey="projects"
              fill="#2563EB"
              radius={[0, 6, 6, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}