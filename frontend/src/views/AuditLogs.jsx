import { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp, Download, History, RotateCcw, Search } from 'lucide-react';
import { downloadAuditLogsCsv, useAuditLogs, useUsers } from '../api/admin.js';

function prettyJson(value) {
  if (!value) return '-';
  return JSON.stringify(value, null, 2);
}

export function AuditLogs() {
  const [filters, setFilters] = useState({ limit: 100 });
  const [expandedId, setExpandedId] = useState(null);
  const [exportError, setExportError] = useState('');
  const [exporting, setExporting] = useState(false);
  const auditLogs = useAuditLogs(filters);
  const users = useUsers();

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="text-civic" />
            <h2 className="text-lg font-semibold">Audit Logs</h2>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded bg-civic px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
            disabled={exporting}
            onClick={async () => {
              setExportError('');
              setExporting(true);
              try {
                await downloadAuditLogsCsv({ ...filters, limit: 500 });
              } catch (error) {
                setExportError(error.response?.data?.message || 'Could not export audit logs.');
              } finally {
                setExporting(false);
              }
            }}
            type="button"
          >
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">Track user actions, timestamps, changed entities, and accountability evidence.</p>
        {exportError ? <p className="mt-2 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{exportError}</p> : null}
      </div>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_180px_180px_180px] xl:grid-cols-[1fr_180px_180px_180px_180px_180px_130px_auto]">
          <label className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full outline-none"
              placeholder="Search action, entity, or IP"
              value={filters.q || ''}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value || undefined }))}
            />
          </label>
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            value={filters.action || ''}
            onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value || undefined }))}
          >
            <option value="">All actions</option>
            <option value="PROJECT_CREATED">Project Created</option>
            <option value="PROJECT_UPDATED">Project Updated</option>
            <option value="PROJECT_WORKFLOW_UPDATED">Workflow Updated</option>
            <option value="MONITORING_REPORT_SUBMITTED">Monitoring Submitted</option>
            <option value="DOCUMENT_UPLOADED">Document Uploaded</option>
            <option value="EVALUATION_CREATED">Evaluation Created</option>
            <option value="INDICATOR_CREATED">Indicator Created</option>
            <option value="FINANCIAL_TRANSACTION_CREATED">Financial Transaction Created</option>
            <option value="DOCUMENT_DELETED">Document Deleted</option>
            <option value="SETTING_DELETED">Setting Deleted</option>
            <option value="USER_UPDATED">User Updated</option>
          </select>
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            value={filters.entityType || ''}
            onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value || undefined }))}
          >
            <option value="">All entities</option>
            <option value="Project">Project</option>
            <option value="Document">Document</option>
            <option value="MonitoringReport">Monitoring Report</option>
            <option value="Evaluation">Evaluation</option>
            <option value="Indicator">Indicator</option>
            <option value="FinancialTransaction">Financial Transaction</option>
            <option value="User">User</option>
            <option value="Setting">Setting</option>
            <option value="ministries">Reference / Ministries</option>
          </select>
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            value={filters.user || ''}
            onChange={(event) => setFilters((current) => ({ ...current, user: event.target.value || undefined }))}
          >
            <option value="">All users</option>
            {(users.data || []).map((item) => <option key={item._id} value={item._id}>{item.name} / {item.role}</option>)}
          </select>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            type="date"
            value={filters.from || ''}
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value || undefined }))}
          />
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            type="date"
            value={filters.to || ''}
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value || undefined }))}
          />
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
            value={filters.limit || 100}
            onChange={(event) => setFilters((current) => ({ ...current, limit: Number(event.target.value) }))}
          >
            <option value="50">50 rows</option>
            <option value="100">100 rows</option>
            <option value="250">250 rows</option>
            <option value="500">500 rows</option>
          </select>
          <button
            className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => {
              setFilters({ limit: 100 });
              setExpandedId(null);
              setExportError('');
            }}
            type="button"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
        <p className="mt-3 text-xs font-medium text-slate-500">{(auditLogs.data || []).length.toLocaleString()} audit rows shown</p>

        <div className="mt-5 overflow-hidden rounded border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(auditLogs.data || []).map((log) => (
                <Fragment key={log._id}>
                  <tr key={log._id}>
                    <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{log.user?.name || 'System'}</p>
                      <p className="text-xs text-slate-500">{log.user?.role || ''}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{log.action}</td>
                    <td className="px-4 py-3">
                      <p>{log.entityType}</p>
                      <p className="text-xs text-slate-500">{log.entityId}</p>
                    </td>
                    <td className="px-4 py-3">{log.ipAddress || '-'}</td>
                    <td className="px-4 py-3">
                      <button className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-100" onClick={() => setExpandedId((current) => current === log._id ? null : log._id)} type="button">
                        {expandedId === log._id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        View
                      </button>
                    </td>
                  </tr>
                  {expandedId === log._id ? (
                    <tr key={`${log._id}-details`} className="bg-slate-50">
                      <td className="px-4 py-4" colSpan="6">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Previous Value</p>
                            <pre className="max-h-72 overflow-auto rounded border border-slate-200 bg-white p-3 text-xs">{prettyJson(log.previousValue)}</pre>
                          </div>
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">New Value</p>
                            <pre className="max-h-72 overflow-auto rounded border border-slate-200 bg-white p-3 text-xs">{prettyJson(log.newValue)}</pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
              {auditLogs.isFetching ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="6">Loading audit logs...</td></tr> : null}
              {!auditLogs.isFetching && !auditLogs.data?.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="6">No audit logs found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
