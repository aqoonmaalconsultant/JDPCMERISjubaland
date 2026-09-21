import { AlertTriangle, Info, Search, Siren } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications, useSendNotificationDigest } from '../api/notifications.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { hasPermission, Permissions } from '../auth/permissions.js';

const severityStyle = {
  critical: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800'
};

const severityIcon = {
  critical: Siren,
  warning: AlertTriangle,
  info: Info
};

function alertModulePath(item) {
  const type = String(item.type || '').toLowerCase();
  const projectQuery = item.projectId ? `?project=${item.projectId}` : '';

  if (type.includes('budget') || type.includes('finance')) return `/finance${projectQuery}`;
  if (type.includes('report') || type.includes('monitoring') || type.includes('delayed')) return `/monitoring${projectQuery}`;
  return `/projects${item.projectId ? `/${item.projectId}` : ''}`;
}

export function AlertsPanel({ compact = false }) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', severity: '', type: '' });
  const queryFilters = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);
  const notifications = useNotifications(compact ? 5 : 50, compact ? {} : queryFilters);
  const sendDigest = useSendNotificationDigest();
  const data = notifications.data?.data || [];
  const alertTypes = notifications.data?.types || [...new Set(data.map((item) => item.type).filter(Boolean))];
  const canSendDigest = !compact && hasPermission(user, Permissions.GENERATE_REPORTS, Permissions.MANAGE_SETTINGS);
  const updateFilter = (field) => (event) => setFilters((current) => ({ ...current, [field]: event.target.value }));

  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Alerts</h2>
          <p className="text-sm text-slate-500">Delayed projects, missing reports, and budget/progress risks.</p>
        </div>
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          {notifications.data?.filteredTotal ?? notifications.data?.total ?? 0}
        </div>
      </div>
      {!compact ? (
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_220px_auto]">
          <label className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
            <Search size={16} className="text-slate-400" />
            <input className="w-full outline-none" placeholder="Search alert or project" value={filters.q} onChange={updateFilter('q')} />
          </label>
          <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.severity} onChange={updateFilter('severity')}>
            <option value="">All severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.type} onChange={updateFilter('type')}>
            <option value="">All types</option>
            {alertTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <button className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setFilters({ q: '', severity: '', type: '' })} type="button">
            Reset
          </button>
        </div>
      ) : null}
      {!compact ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div className="rounded border border-slate-200 px-3 py-2 text-sm"><span className="font-semibold">{notifications.data?.total || 0}</span> total</div>
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"><span className="font-semibold">{notifications.data?.critical || 0}</span> critical</div>
          <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"><span className="font-semibold">{notifications.data?.warning || 0}</span> warning</div>
          <div className="rounded border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800"><span className="font-semibold">{notifications.data?.info || 0}</span> info</div>
        </div>
      ) : null}
      {canSendDigest ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-sm font-medium text-slate-600">
            Send alert digest to active users with project visibility.
          </p>
          <button className="rounded bg-civic px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={sendDigest.isPending} onClick={() => sendDigest.mutate()} type="button">
            {sendDigest.isPending ? 'Sending...' : 'Send Digest'}
          </button>
        </div>
      ) : null}
      {sendDigest.data ? (
        <p className="mt-3 rounded bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          Digest processed: {sendDigest.data.sent || 0} sent, {sendDigest.data.skipped || 0} skipped.
        </p>
      ) : null}
      {sendDigest.error ? (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {sendDigest.error.response?.data?.message || 'Could not send alert digest.'}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        {data.map((item) => {
          const Icon = severityIcon[item.severity] || Info;
          return (
            <div key={item.id} className={`rounded border px-3 py-2 ${severityStyle[item.severity] || severityStyle.info}`}>
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-sm font-semibold">{item.type}</p>
                  <p className="text-sm">{item.message}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs opacity-75">{item.projectName}</p>
                    <Link className="rounded border border-current px-2 py-0.5 text-xs font-semibold hover:bg-white/40" to={alertModulePath(item)}>
                      Work
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {notifications.isFetching ? <p className="text-sm font-medium text-slate-500">Refreshing alerts...</p> : null}
        {!notifications.isFetching && !data.length ? <p className="text-sm text-slate-500">No alerts right now.</p> : null}
      </div>
    </section>
  );
}
