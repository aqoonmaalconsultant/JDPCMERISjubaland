import { ClipboardCheck, FileArchive } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOperationsDashboard } from '../api/operations.js';
import { MetricCard } from '../ui/MetricCard.jsx';
import { StatusBadge } from '../ui/StatusBadge.jsx';

const metricCards = [
  ['Pending Workflow', 'pendingWorkflow', 'bg-civic', '/workflow'],
  ['Risky Projects', 'riskyProjects', 'bg-red-600', '/monitoring'],
  ['Ending Soon', 'endingSoon', 'bg-amber-600', '/monitoring'],
  ['High Finance Use', 'highFinanceUtilization', 'bg-blue-600', '/finance'],
  ['At Risk Indicators', 'offTrackIndicators', 'bg-field', '/indicators'],
  ['Missing Documents', 'missingDocuments', 'bg-slate-700', '/documents']
];

function refName(value, fallback = '-') {
  if (!value) return fallback;
  return value.name || value.organizationName || value.projectName || value.projectCode || fallback;
}

function refNames(values = []) {
  return values.map((value) => refName(value)).filter((value) => value && value !== '-');
}

function projectMeta(project) {
  const locations = (project.locations || [])
    .map((location) => [refName(location.region, ''), refName(location.district, '')].filter(Boolean).join(' / '))
    .filter(Boolean);
  const ministries = [refName(project.ministry), ...refNames(project.supportingMinistries)]
    .filter((value) => value && value !== '-')
    .join(' + ');

  return [
    ministries,
    locations.join(' + ')
  ].filter((value) => value && value !== '-').join(' / ') || '-';
}

function moduleLink(to, projectId) {
  return projectId ? `${to}?project=${projectId}` : to;
}

function ProjectTable({ title, rows = [], to, emptyText }) {
  const isFinanceTable = to === '/finance';

  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Link className="text-sm font-semibold text-civic hover:underline" to={to}>Open</Link>
      </div>
      <div className="mt-4 overflow-hidden rounded border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((project) => (
              <tr key={project._id || project.projectCode}>
                <td className="px-4 py-3">
                  <p className="font-medium">{project.projectName}</p>
                  <p className="text-xs text-slate-500">{project.projectCode}</p>
                </td>
                <td className="px-4 py-3">{projectMeta(project)}</td>
                <td className="px-4 py-3">
                  <p>{project.physicalProgress || 0}% physical</p>
                  <p className="text-xs text-slate-500">{project.financialProgress || 0}% financial</p>
                  {isFinanceTable ? (
                    <p className={`text-xs font-semibold ${(project.overBudgetAmount || 0) > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                      ${(project.expenditures || 0).toLocaleString()} / ${(project.availableBudget || project.budget || 0).toLocaleString()}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                  <p className="mt-1 text-xs text-slate-500">{project.approvalStage}</p>
                </td>
                <td className="px-4 py-3">
                  <Link className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" to={moduleLink(to, project._id)}>
                    Work
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">{emptyText}</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LinkedMetric({ label, value, accent, to }) {
  return (
    <Link className="block rounded outline-none focus:ring-2 focus:ring-civic focus:ring-offset-2" to={to}>
      <MetricCard label={label} value={value} accent={accent} />
    </Link>
  );
}

function IndicatorTable({ rows = [] }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">At Risk Indicators</h3>
        <Link className="text-sm font-semibold text-civic hover:underline" to="/indicators">Open</Link>
      </div>
      <div className="mt-4 overflow-hidden rounded border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Indicator</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Target / Actual</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((indicator) => (
              <tr key={indicator._id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{indicator.code} / {indicator.name}</p>
                  <p className="text-xs text-slate-500">{indicator.level}</p>
                </td>
                <td className="px-4 py-3">{indicator.projectCode} / {indicator.projectName}</td>
                <td className="px-4 py-3">{indicator.target} / {indicator.actual}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{indicator.achievementPercentage || 0}%</p>
                  <p className="text-xs text-slate-500">{indicator.status}</p>
                </td>
                <td className="px-4 py-3">
                  <Link className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" to={moduleLink('/indicators', indicator.projectId)}>
                    Work
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length ? (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">No at-risk indicators found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function OperationsDashboard() {
  const operations = useOperationsDashboard();
  const data = operations.data || {};
  const metrics = data.metrics || {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-civic" size={22} />
            <h2 className="text-lg font-semibold">Operations Dashboard</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Operational priorities across workflow, monitoring, finance, documents, and results.</p>
          {operations.isFetching ? <p className="mt-1 text-xs font-medium text-slate-400">Refreshing operations data...</p> : null}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map(([label, key, accent, to]) => (
          <LinkedMetric key={key} label={label} value={(metrics[key] || 0).toLocaleString()} accent={accent} to={to} />
        ))}
        <LinkedMetric label="Document Coverage" value={`${metrics.documentCoverage || 0}%`} accent="bg-emerald-600" to="/documents" />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <ProjectTable title="Pending Approval Workflow" rows={data.workflow || []} to="/workflow" emptyText="No projects pending workflow action." />
        <ProjectTable title="Monitoring Risks" rows={data.riskProjects || []} to="/monitoring" emptyText="No risky projects found." />
        <ProjectTable title="Ending In 60 Days" rows={data.endingProjects || []} to="/monitoring" emptyText="No active projects ending soon." />
        <ProjectTable title="High Finance Utilization" rows={data.highUtilizationProjects || []} to="/finance" emptyText="No high-utilization finance items." />
        <ProjectTable title="Projects Missing Documents" rows={data.missingDocuments || []} to="/documents" emptyText="Every scoped project has at least one document." />
        <IndicatorTable rows={data.offTrackIndicators || []} />
      </div>
    </div>
  );
}
