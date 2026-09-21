import { useState } from 'react';
import { Activity, Edit3, Trash2, X } from 'lucide-react';
import {
  useCreateMonitoringReport,
  useDeleteMonitoringReport,
  useProjectMonitoring,
  useUpdateMonitoringReport,
} from "../api/monitoring.js";

const initialForm = {
  physicalProgress: '',
  financialProgress: '',
  timelineProgress: '',
  trafficLight: 'Green',
  risks: '',
  challenges: '',
  recommendations: '',
  findings: ''
};

function splitLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function MonitoringModal({ project, onClose, embedded = false }) {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const monitoring = useProjectMonitoring(project?.rawId);
  const createReport = useCreateMonitoringReport(project?.rawId);
  const updateReport = useUpdateMonitoringReport(project?.rawId);
  const deleteReport = useDeleteMonitoringReport(project?.rawId);

  if (!project) {
    return null;
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        physicalProgress: Number(form.physicalProgress),
        financialProgress: Number(form.financialProgress),
        timelineProgress: Number(form.timelineProgress),
        trafficLight: form.trafficLight,
        risks: splitLines(form.risks),
        challenges: splitLines(form.challenges),
        recommendations: splitLines(form.recommendations),
        findings: form.findings
      };
      if (editingId) {
        await updateReport.mutateAsync({ reportId: editingId, payload });
      } else {
        await createReport.mutateAsync(payload);
      }
      setForm(initialForm);
      setEditingId(null);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Monitoring update failed. Check values and permissions.');
    }
  };

  const editReport = (report) => {
    setEditingId(report._id);
    setForm({
      physicalProgress: report.physicalProgress ?? '',
      financialProgress: report.financialProgress ?? '',
      timelineProgress: report.timelineProgress ?? '',
      trafficLight: report.trafficLight || 'Green',
      risks: (report.risks || []).join('\n'),
      challenges: (report.challenges || []).join('\n'),
      recommendations: (report.recommendations || []).join('\n'),
      findings: report.findings || ''
    });
    setError('');
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const removeReport = async (report) => {
    if (!window.confirm('Delete this monitoring report?')) return;
    await deleteReport.mutateAsync(report._id);
  };

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8'}>
      <div className={embedded ? 'rounded border border-slate-200 bg-white shadow-sm' : 'mx-auto max-w-5xl rounded border border-slate-200 bg-white shadow-xl'}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Monitoring Update</h2>
            <p className="text-sm text-slate-500">{project.name}</p>
          </div>
          {!embedded ? (
            <button className="rounded p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button" title="Close">
              <X size={20} />
            </button>
          ) : null}
        </div>

        <form className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">
            Physical %
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" max="100" min="0" type="number" value={form.physicalProgress} onChange={update('physicalProgress')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Financial %
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" max="100" min="0" type="number" value={form.financialProgress} onChange={update('financialProgress')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Timeline %
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" max="100" min="0" type="number" value={form.timelineProgress} onChange={update('timelineProgress')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Traffic Light
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.trafficLight} onChange={update('trafficLight')}>
              <option>Green</option>
              <option>Yellow</option>
              <option>Red</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Risks
            <textarea className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.risks} onChange={update('risks')} placeholder="One risk per line" />
          </label>
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Challenges
            <textarea className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.challenges} onChange={update('challenges')} placeholder="One challenge per line" />
          </label>
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Recommendations
            <textarea className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.recommendations} onChange={update('recommendations')} placeholder="One recommendation per line" />
          </label>
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Findings
            <textarea className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.findings} onChange={update('findings')} />
          </label>
          {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-4">{error}</p> : null}
          <div className="flex justify-end md:col-span-4">
            {editingId ? (
              <button className="mr-3 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={resetForm} type="button">
                Cancel Edit
              </button>
            ) : null}
            <button className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={createReport.isPending || updateReport.isPending} type="submit">
              <Activity size={16} />
              {createReport.isPending || updateReport.isPending ? 'Saving...' : editingId ? 'Update Monitoring' : 'Save Monitoring Update'}
            </button>
          </div>
        </form>

        <div className="p-5">
          {monitoring.isFetching ? <p className="text-sm font-medium text-slate-500">Loading monitoring history...</p> : null}
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Physical</th>
                  <th className="px-4 py-3">Financial</th>
                  <th className="px-4 py-3">Timeline</th>
                  <th className="px-4 py-3">Light</th>
                  <th className="px-4 py-3">Submitted By</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(monitoring.data || []).map((report) => (
                  <tr key={report._id}>
                    <td className="px-4 py-3">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{report.physicalProgress}%</td>
                    <td className="px-4 py-3">{report.financialProgress}%</td>
                    <td className="px-4 py-3">{report.timelineProgress}%</td>
                    <td className="px-4 py-3">{report.trafficLight}</td>
                    <td className="px-4 py-3">{report.submittedBy?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <button className="mr-2 inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" onClick={() => editReport(report)} type="button">
                        <Edit3 size={13} />
                        Edit
                      </button>
                      <button className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => removeReport(report)} type="button">
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!monitoring.isFetching && !monitoring.data?.length ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan="7">No monitoring updates yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
