import { AlertTriangle, Bell, ClipboardList, Download, FileText, Globe2, History, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuditLogs } from '../api/admin.js';
import { useNotifications } from '../api/notifications.js';
import { useProjects } from '../api/projects.js';
import { useReportSummary } from '../api/reports.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { hasPermission, Permissions } from '../auth/permissions.js';
import { MetricCard } from '../ui/MetricCard.jsx';

function csvValue(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadSnapshot(rows) {
  const blob = new Blob([rows.map((row) => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'jdpcmeris-accountability-snapshot.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function WorkCard({ title, description, icon: Icon, to, stat, accent = 'bg-civic' }) {
  return (
    <Link className="rounded border border-slate-200 bg-white p-5 shadow-sm hover:border-civic hover:bg-teal-50" to={to}>
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded text-white ${accent}`}>
          <Icon size={19} />
        </div>
        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">{stat}</span>
      </div>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

function RecentAudit({ rows }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="text-civic" size={18} />
          <h3 className="font-semibold">Recent Audit Evidence</h3>
        </div>
        <Link className="text-sm font-semibold text-civic hover:underline" to="/audit-logs">Open</Link>
      </div>
      <div className="mt-4 overflow-hidden rounded border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row._id}>
                <td className="px-4 py-3">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{row.user?.name || 'System'}</td>
                <td className="px-4 py-3 font-medium">{row.action}</td>
                <td className="px-4 py-3">{row.entityType}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="4">No audit activity available.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AccountabilityDashboard() {
  const { user } = useAuth();
  const canReports = hasPermission(user, Permissions.GENERATE_REPORTS);
  const canAudit = hasPermission(user, Permissions.VIEW_AUDIT_LOGS);
  const canPublic = hasPermission(user, Permissions.VIEW_PUBLIC_PROJECTS, Permissions.VIEW_ALL_PROJECTS);
  const notifications = useNotifications(8);
  const reports = useReportSummary({ enabled: canReports });
  const auditLogs = useAuditLogs({ limit: 6 }, { enabled: canAudit });
  const projectsQuery = useProjects();
  const alerts = notifications.data?.data || [];
  const criticalAlerts = alerts.filter((item) => item.severity === 'critical').length;
  const reportGroups = reports.data ? ['byMinistry', 'byRegion', 'byDistrict', 'byDonor', 'bySector', 'byStatus'].filter((key) => reports.data[key]?.length).length : 0;
  const publicRows = canPublic ? projectsQuery.data || [] : [];
  const publicBeneficiaries = publicRows.reduce((total, project) => total + (project.beneficiaries?.individuals || 0), 0);
  const exportSnapshot = () => {
    const auditRows = auditLogs.data || [];
    const rows = [
      ['Section', 'Name', 'Value', 'Detail', 'Time'],
      ['Metric', 'Alerts', notifications.data?.total || 0, '', ''],
      ['Metric', 'Critical Alerts', criticalAlerts, '', ''],
      ['Metric', 'Report Groups', reportGroups, '', ''],
      ['Metric', 'Projects in Scope', publicRows.length, '', ''],
      ['Metric', 'Beneficiaries in Scope', publicBeneficiaries, '', ''],
      ...alerts.map((alert) => ['Priority Alert', alert.type, alert.severity, `${alert.projectName || ''} / ${alert.message || ''}`, alert.createdAt || '']),
      ...auditRows.map((row) => ['Audit Evidence', row.action, row.entityType, `${row.user?.name || 'System'} / ${row.entityId || ''}`, row.createdAt || '']),
      ['Workflow', 'Step 1', 'Review alerts', '', ''],
      ['Workflow', 'Step 2', 'Verify evidence', '', ''],
      ['Workflow', 'Step 3', 'Export reports', '', ''],
      ['Workflow', 'Step 4', 'Publish public updates', '', '']
    ];

    downloadSnapshot(rows);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Accountability</h2>
          <p className="text-sm text-slate-500">Evidence, alerts, public transparency, audit trail, and official reporting in one control view.</p>
          {notifications.isFetching || reports.isFetching || auditLogs.isFetching || projectsQuery.isFetching ? (
            <p className="mt-1 text-xs font-medium text-slate-400">Refreshing accountability data...</p>
          ) : null}
        </div>
        <button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100" onClick={exportSnapshot} type="button">
          <Download size={16} />
          Export Snapshot
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Alerts" value={(notifications.data?.total || 0).toLocaleString()} accent="bg-alert" />
        <MetricCard label="Critical Alerts" value={criticalAlerts.toLocaleString()} accent="bg-red-700" />
        <MetricCard label="Report Groups" value={reportGroups.toLocaleString()} accent="bg-civic" />
        <MetricCard label="Projects in Scope" value={publicRows.length.toLocaleString()} accent="bg-blue-600" />
        <MetricCard label="Beneficiaries in Scope" value={publicBeneficiaries.toLocaleString()} accent="bg-field" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkCard title="Reports" description="Official summaries, CSV/Excel/PDF exports, and module-level operational exports." icon={FileText} to="/reports" stat={canReports ? 'Ready' : 'Restricted'} />
        <WorkCard title="Notifications / Alerts" description="Delayed projects, missing reports, budget risks, and digest workflow." icon={Bell} to="/notifications" stat={`${notifications.data?.total || 0} alerts`} accent="bg-alert" />
        <WorkCard title="Audit Logs" description="User actions, entity changes, previous/new values, and exportable accountability evidence." icon={History} to="/audit-logs" stat={canAudit ? 'Evidence' : 'Restricted'} accent="bg-slate-700" />
        <WorkCard title="Public Portal" description="Public-facing project transparency with map, progress, and beneficiary records." icon={Globe2} to="/public" stat={canPublic ? 'Available' : 'Restricted'} accent="bg-blue-600" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-alert" size={18} />
            <h3 className="font-semibold">Priority Alerts</h3>
          </div>
          <div className="mt-4 space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <Link key={alert.id} className="block rounded border border-slate-200 px-3 py-2 hover:border-civic hover:bg-teal-50" to={alert.projectId ? `/projects/${alert.projectId}` : '/notifications'}>
                <p className="text-sm font-semibold">{alert.type}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{alert.message}</p>
              </Link>
            ))}
            {!alerts.length ? <p className="text-sm text-slate-500">No priority alerts right now.</p> : null}
          </div>
        </section>

        {canAudit ? <RecentAudit rows={auditLogs.data || []} /> : (
          <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-slate-600" size={18} />
              <h3 className="font-semibold">Audit Evidence</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">Your role can use accountability tools, but audit evidence is restricted to users with audit log permission.</p>
          </section>
        )}
      </section>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-civic" size={18} />
          <h3 className="font-semibold">Accountability Workflow</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {['Review alerts', 'Verify evidence', 'Export reports', 'Publish public updates'].map((step, index) => (
            <div key={step} className="rounded border border-slate-200 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</p>
              <p className="mt-1 text-sm font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
