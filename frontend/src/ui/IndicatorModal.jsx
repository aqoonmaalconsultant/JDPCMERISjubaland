import { useState } from 'react';
import { Edit3, Target, Trash2, X } from 'lucide-react';
import {
  useCreateIndicator,
  useDeleteIndicator,
  useProjectIndicators,
  useUpdateIndicator,
} from "../api/indicators.js";

const initialForm = {
  level: 'Indicator',
  code: '',
  name: '',
  description: '',
  unit: '',
  baseline: '',
  target: '',
  actual: ''
};

export function IndicatorModal({ project, onClose, embedded = false }) {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const indicators = useProjectIndicators(project?.rawId);
  const createIndicator = useCreateIndicator(project?.rawId);
  const updateIndicator = useUpdateIndicator(project?.rawId);
  const deleteIndicator = useDeleteIndicator(project?.rawId);

  if (!project) return null;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        baseline: Number(form.baseline || 0),
        target: Number(form.target || 0),
        actual: Number(form.actual || 0)
      };
      if (editingId) {
        await updateIndicator.mutateAsync({ indicatorId: editingId, payload });
      } else {
        await createIndicator.mutateAsync(payload);
      }
      setForm(initialForm);
      setEditingId(null);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Indicator save failed. Check code uniqueness and permissions.');
    }
  };

  const editIndicator = (indicator) => {
    setEditingId(indicator._id);
    setForm({
      level: indicator.level || 'Indicator',
      code: indicator.code || '',
      name: indicator.name || '',
      description: indicator.description || '',
      unit: indicator.unit || '',
      baseline: indicator.baseline ?? '',
      target: indicator.target ?? '',
      actual: indicator.actual ?? ''
    });
    setError('');
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const removeIndicator = async (indicator) => {
    if (!window.confirm('Delete this result/indicator?')) return;
    await deleteIndicator.mutateAsync(indicator._id);
  };

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8'}>
      <div className={embedded ? 'rounded border border-slate-200 bg-white shadow-sm' : 'mx-auto max-w-6xl rounded border border-slate-200 bg-white shadow-xl'}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Results Framework & Indicators</h2>
            <p className="text-sm text-slate-500">{project.name}</p>
          </div>
          {!embedded ? <button className="rounded p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button" title="Close">
            <X size={20} />
          </button> : null}
        </div>

        <form className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">
            Level
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.level} onChange={update('level')}>
              {['Goal', 'Outcome', 'Output', 'Activity', 'Indicator'].map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Code
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.code} onChange={update('code')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Name
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.name} onChange={update('name')} required />
          </label>
          {[
            ['unit', 'Unit'],
            ['baseline', 'Baseline'],
            ['target', 'Target'],
            ['actual', 'Actual']
          ].map(([field, label]) => (
            <label key={field} className="block text-sm font-semibold text-slate-700">
              {label}
              <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" type={field === 'unit' ? 'text' : 'number'} value={form[field]} onChange={update(field)} />
            </label>
          ))}
          <label className="block text-sm font-semibold text-slate-700 md:col-span-4">
            Description
            <textarea className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.description} onChange={update('description')} />
          </label>
          {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-4">{error}</p> : null}
          <div className="flex justify-end md:col-span-4">
            {editingId ? (
              <button className="mr-3 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={resetForm} type="button">
                Cancel Edit
              </button>
            ) : null}
            <button className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={createIndicator.isPending || updateIndicator.isPending} type="submit">
              <Target size={16} />
              {createIndicator.isPending || updateIndicator.isPending ? 'Saving...' : editingId ? 'Update Indicator' : 'Save Indicator'}
            </button>
          </div>
        </form>

        <div className="p-5">
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Actual</th>
                  <th className="px-4 py-3">Achievement</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(indicators.data || []).map((indicator) => (
                  <tr key={indicator._id}>
                    <td className="px-4 py-3 font-medium">{indicator.code}</td>
                    <td className="px-4 py-3">{indicator.level}</td>
                    <td className="px-4 py-3">{indicator.name}</td>
                    <td className="px-4 py-3">{indicator.target}</td>
                    <td className="px-4 py-3">{indicator.actual}</td>
                    <td className="px-4 py-3">{indicator.achievementPercentage}%</td>
                    <td className="px-4 py-3">{indicator.status}</td>
                    <td className="px-4 py-3">
                      <button className="mr-2 inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" onClick={() => editIndicator(indicator)} type="button">
                        <Edit3 size={13} />
                        Edit
                      </button>
                      <button className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => removeIndicator(indicator)} type="button">
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {indicators.isFetching ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="8">Loading indicators...</td></tr> : null}
                {!indicators.isFetching && !indicators.data?.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="8">No indicators yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
