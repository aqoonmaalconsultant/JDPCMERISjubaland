import {
  DollarSign,
  Landmark,
  TrendingUp,
} from "lucide-react";

export default function BudgetOverview({
  data,
}) {

  const totalBudget =
    Number(data?.totalBudget ?? 0);

  // Temporary values until donor module is completed
  const governmentContribution =
    totalBudget * 0.25;

  const donorContribution =
    totalBudget * 0.75;

  const averageProjectBudget =
  data?.totalProjects > 0
    ? totalBudget / data.totalProjects
    : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          Budget Overview
        </h2>

        <p className="text-sm text-slate-500">
          Financial Summary
        </p>

      </div>

      <div className="space-y-5">

        <BudgetItem
          icon={<DollarSign size={20} />}
          title="Total Budget"
          value={formatCurrency(totalBudget)}
        />

        <BudgetItem
          icon={<Landmark size={20} />}
          title="Government"
          value={formatCurrency(governmentContribution)}
        />

        <BudgetItem
          icon={<TrendingUp size={20} />}
          title="Development Partners"
          value={formatCurrency(donorContribution)}
        />

        <hr />

        <BudgetItem
          icon={<DollarSign size={20} />}
          title="Average / Project"
          value={formatCurrency(averageProjectBudget)}
        />

      </div>

    </div>
  );
}

function BudgetItem({
  icon,
  title,
  value,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-slate-100 p-2">
          {icon}
        </div>

        <span className="font-medium">
          {title}
        </span>

      </div>

      <span className="font-bold text-slate-800">
        {value}
      </span>

    </div>
  );
}

function formatCurrency(value) {

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(value);

}