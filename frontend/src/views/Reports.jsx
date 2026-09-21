import { AlertTriangle, Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useReferenceData } from '../api/projects.js';
import {
  downloadDocumentsCsv,
  downloadEvaluationsCsv,
  downloadFinancialsCsv,
  downloadIndicatorsCsv,
  downloadMonitoringCsv,
  downloadProjectCsv,
  downloadProjectPdf,
  downloadProjectXlsx,
  downloadReportSummaryCsv,
  downloadWorkflowCsv,
  useReportSummary
} from '../api/reports.js';

const reportGroups = [
  { key: 'byMinistry', title: 'Ministry Reports', field: 'ministry' },
  { key: 'byRegion', title: 'Regional Reports', field: 'locations.region' },
  { key: 'byDistrict', title: 'District Reports', field: 'locations.district' },
  { key: 'byDonor', title: 'Donor Reports', field: 'donor' },
  { key: 'bySector', title: 'Sector Reports', field: 'sector' },
  { key: 'byStatus', title: 'Budget Reports', field: 'status' }
];
const projectStatuses = ['Draft', 'Submitted', 'Approved', 'Procurement', 'Implementation', 'Monitoring', 'Completed', 'Suspended', 'Cancelled'];

const operationalExports = [
  { label: 'Monitoring CSV', description: 'Progress, traffic light, risks, challenges, and verification rows.', action: downloadMonitoringCsv, file: 'jdpcmeris-monitoring.csv' },
  { label: 'Evaluation CSV', description: 'Baseline, midterm, final, impact scores and recommendations.', action: downloadEvaluationsCsv, file: 'jdpcmeris-evaluations.csv' },
  { label: 'Indicators CSV', description: 'Results framework rows with target, actual, achievement, and status.', action: downloadIndicatorsCsv, file: 'jdpcmeris-indicators.csv' },
  { label: 'Finance CSV', description: 'Project finance summary with available budget, utilization, balance, over-budget, and transactions.', action: downloadFinancialsCsv, file: 'jdpcmeris-financials.csv' },
  { label: 'Documents CSV', description: 'Document register with storage type, category, uploader, and file key.', action: downloadDocumentsCsv, file: 'jdpcmeris-documents.csv' },
  { label: 'Workflow CSV', description: 'Approval stage, status, visibility, and latest progress per project.', action: downloadWorkflowCsv, file: 'jdpcmeris-workflow.csv' }
];

function slug(value) {
  return String(value || 'unassigned').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function exportGroupCsv(report, row, filters = {}) {
  const name = row.name || row._id || 'unassigned';
  return downloadProjectCsv({ ...filters, field: report.field, value: row._id }, `jdpcmeris-${slug(report.title)}-${slug(name)}.csv`);
}

function reportErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Report action failed. Please try again.';
}

export function Reports() {
  const [filters, setFilters] = useState({ status: '', ministry: '', donor: '', sector: '', region: '', district: '' });
  const [exportState, setExportState] = useState({ key: '', error: '' });
  const queryFilters = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);
  const summary = useReportSummary(queryFilters);
  const ministries = useReferenceData('ministries');
  const donors = useReferenceData('donors');
  const regions = useReferenceData('regions');
  const districts = useReferenceData('districts');
  const data = summary.data || {};
  const sectorOptions = useMemo(() => {
    const sectors = new Set((data.bySector || []).map((row) => row._id || row.name).filter(Boolean));
    if (filters.sector) sectors.add(filters.sector);
    return [...sectors].sort();
  }, [data.bySector, filters.sector]);
  const reportTotals = useMemo(() => {
    const rows = data.byStatus || [];
    const totalProjects = rows.reduce((total, row) => total + (row.projects || 0), 0);
    const totalBudget = rows.reduce((total, row) => total + (row.budget || 0), 0);
    const beneficiaries = (data.bySector || []).reduce((total, row) => total + (row.beneficiaries || 0), 0);
    const modules = ['monitoring', 'evaluations', 'indicators', 'financials'].reduce((total, key) => total + (data[key]?.length || 0), 0);

    return { totalProjects, totalBudget, beneficiaries, modules };
  }, [data]);
  const updateFilter = (field) => (event) => {
    const value = event.target.value;
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'region' ? { district: '' } : {})
    }));
  };
  const resetFilters = () => setFilters({ status: '', ministry: '', donor: '', sector: '', region: '', district: '' });
  const runExport = async (key, action) => {
    setExportState({ key, error: '' });
    try {
      await action();
      setExportState({ key: '', error: '' });
    } catch (error) {
      setExportState({ key: '', error: reportErrorMessage(error) });
    }
  };
  const isExporting = (key) => exportState.key === key;
  const iconForExport = (key) => (isExporting(key) ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="text-sm text-slate-500">Generate official summaries and export project records for review and decision-making.</p>
          {summary.isFetching ? <p className="mt-1 text-xs font-medium text-slate-400">Refreshing report data...</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70" disabled={Boolean(exportState.key)} onClick={() => runExport('summary-csv', () => downloadReportSummaryCsv(queryFilters))}>
            {isExporting('summary-csv') ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            Summary CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded bg-civic px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70" disabled={Boolean(exportState.key)} onClick={() => runExport('projects-csv', () => downloadProjectCsv(queryFilters))}>
            {isExporting('projects-csv') ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            CSV
          </button>
          <button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={Boolean(exportState.key)} onClick={() => runExport('projects-xlsx', () => downloadProjectXlsx(queryFilters))}>
            {isExporting('projects-xlsx') ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            Excel
          </button>
          <button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={Boolean(exportState.key)} onClick={() => runExport('projects-pdf', () => downloadProjectPdf(queryFilters))}>
            {isExporting('projects-pdf') ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            PDF
          </button>
        </div>
      </div>
      {summary.error || exportState.error ? (
        <div className="flex items-start gap-2 rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={16} />
          <span>{summary.error ? reportErrorMessage(summary.error) : exportState.error}</span>
        </div>
      ) : null}
      <section className="grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-[150px_1fr_1fr_1fr_1fr_1fr_auto]">
        <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.status} onChange={updateFilter('status')}>
          <option value="">All statuses</option>
          {projectStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.ministry} onChange={updateFilter('ministry')}>
          <option value="">All ministries</option>
          {(ministries.data || []).map((ministry) => <option key={ministry._id} value={ministry._id}>{ministry.name}</option>)}
        </select>
        <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.donor} onChange={updateFilter('donor')}>
          <option value="">All donors</option>
          {(donors.data || []).map((donor) => <option key={donor._id} value={donor._id}>{donor.name}</option>)}
        </select>
        <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.sector} onChange={updateFilter('sector')}>
          <option value="">All sectors</option>
          {sectorOptions.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
        </select>
        <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.region} onChange={updateFilter('region')}>
          <option value="">All regions</option>
          {(regions.data || []).map((region) => <option key={region._id} value={region._id}>{region.name}</option>)}
        </select>
        <select className="rounded border border-slate-300 bg-white px-3 py-2 text-sm" value={filters.district} onChange={updateFilter('district')}>
          <option value="">All districts</option>
          {(districts.data || [])
            .filter((district) => !filters.region || district.region?._id === filters.region || district.region === filters.region)
            .map((district) => <option key={district._id} value={district._id}>{district.name}</option>)}
        </select>
        <button className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={resetFilters} type="button">
          Reset
        </button>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filtered Projects</p>
          <p className="mt-2 text-2xl font-semibold">{reportTotals.totalProjects.toLocaleString()}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filtered Budget</p>
          <p className="mt-2 text-2xl font-semibold">${Math.round(reportTotals.totalBudget).toLocaleString()}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Beneficiaries</p>
          <p className="mt-2 text-2xl font-semibold">{reportTotals.beneficiaries.toLocaleString()}</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Report Tables</p>
          <p className="mt-2 text-2xl font-semibold">{reportTotals.modules.toLocaleString()}</p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportGroups.map((report) => {
          const rows = data[report.key] || [];
          const totalBudget = rows.reduce((total, row) => total + (row.budget || 0), 0);
          const totalProjects = rows.reduce((total, row) => total + (row.projects || 0), 0);

          return (
          <div key={report.key} className="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <FileText className="text-civic" />
              <button className="rounded border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={Boolean(exportState.key)} onClick={() => runExport(`top-${report.key}`, () => rows[0] ? exportGroupCsv(report, rows[0], queryFilters) : downloadProjectCsv(queryFilters))} title="Download top report">
                {iconForExport(`top-${report.key}`)}
              </button>
            </div>
            <h3 className="mt-4 font-semibold">{report.title}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded border border-slate-200 p-3">
                <p className="text-slate-500">Projects</p>
                <p className="mt-1 text-lg font-semibold">{totalProjects.toLocaleString()}</p>
              </div>
              <div className="rounded border border-slate-200 p-3">
                <p className="text-slate-500">Budget</p>
                <p className="mt-1 text-lg font-semibold">${Math.round(totalBudget / 1000000)}M</p>
              </div>
            </div>
            <div className="mt-4 max-h-44 overflow-auto rounded border border-slate-200">
              <table className="min-w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 6).map((row) => (
                    <tr key={row._id || row.name}>
                      <td className="px-3 py-2 font-medium">{row.name || row._id || 'Unassigned'}</td>
                      <td className="px-3 py-2 text-right">
                        <button className="rounded px-2 py-1 font-semibold text-civic hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={Boolean(exportState.key)} onClick={() => runExport(`${report.key}-${row._id || row.name}`, () => exportGroupCsv(report, row, queryFilters))} type="button" title="Download CSV">
                          {row.projects}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!rows.length ? (
                    <tr>
                      <td className="px-3 py-4 text-center text-slate-500" colSpan="2">No data</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        );})}
      </div>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Operational CSV Exports</h3>
            <p className="mt-1 text-sm text-slate-500">Download module-level working data for review, reconciliation, and follow-up.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60" disabled={Boolean(exportState.key)} onClick={() => runExport('workflow-shortcut', () => downloadWorkflowCsv(queryFilters))} type="button">
            {iconForExport('workflow-shortcut')}
            Workflow
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {operationalExports.map((item) => (
            <button key={item.label} className="rounded border border-slate-200 p-4 text-left hover:border-civic hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={Boolean(exportState.key)} onClick={() => runExport(item.file, () => item.action(queryFilters, item.file))} type="button">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                {isExporting(item.file) ? <Loader2 size={16} className="animate-spin text-civic" /> : <FileSpreadsheet size={16} className="text-civic" />}
                {item.label}
              </span>
              <span className="mt-2 block text-xs leading-5 text-slate-500">{item.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Monitoring Reports</h3>
        <div className="mt-4 overflow-hidden rounded border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Traffic Light</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Avg Physical</th>
                <th className="px-4 py-3">Avg Financial</th>
                <th className="px-4 py-3">Avg Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.monitoring || []).map((row) => (
                <tr key={row._id}>
                  <td className="px-4 py-3 font-medium">{row._id}</td>
                  <td className="px-4 py-3">{row.reports}</td>
                  <td className="px-4 py-3">{Math.round(row.avgPhysical || 0)}%</td>
                  <td className="px-4 py-3">{Math.round(row.avgFinancial || 0)}%</td>
                  <td className="px-4 py-3">{Math.round(row.avgTimeline || 0)}%</td>
                </tr>
              ))}
              {!data.monitoring?.length ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan="5">No monitoring report data yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Evaluation Reports</h3>
          <div className="mt-4 overflow-hidden rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.evaluations || []).map((row) => (
                  <tr key={row._id}>
                    <td className="px-4 py-3 font-medium">{row._id}</td>
                    <td className="px-4 py-3">{row.evaluations}</td>
                    <td className="px-4 py-3">{Math.round(row.avgScore || 0)}%</td>
                  </tr>
                ))}
                {!data.evaluations?.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="3">No evaluation data yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Indicator Performance</h3>
          <div className="mt-4 overflow-hidden rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Indicators</th>
                  <th className="px-4 py-3">Avg Achievement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.indicators || []).map((row) => (
                  <tr key={row._id}>
                    <td className="px-4 py-3 font-medium">{row._id}</td>
                    <td className="px-4 py-3">{row.indicators}</td>
                    <td className="px-4 py-3">{Math.round(row.avgAchievement || 0)}%</td>
                  </tr>
                ))}
                {!data.indicators?.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="3">No indicator data yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Financial Report</h3>
          <div className="mt-4 overflow-hidden rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Rows</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.financials || []).map((row) => (
                  <tr key={row._id}>
                    <td className="px-4 py-3 font-medium">{row._id}</td>
                    <td className="px-4 py-3">{row.transactions}</td>
                    <td className="px-4 py-3">${Math.round(row.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {!data.financials?.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="3">No financial data yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
