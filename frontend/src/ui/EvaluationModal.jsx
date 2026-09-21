import { useState } from 'react';
import { ClipboardCheck, Edit3, Trash2, X } from 'lucide-react';
import {
  useCreateEvaluation,
  useDeleteEvaluation,
  useProjectEvaluations,
  useUpdateEvaluation,
} from "../api/evaluations.js";

const initialForm = {
  evaluationType: 'Baseline Evaluation',
  evaluationDate: '',
  evaluatorName: '',
  score: '',
  findings: '',
  lessonsLearned: '',
  recommendations: ''
};

function toDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function EvaluationModal({ project, onClose, embedded = false }) {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const evaluations = useProjectEvaluations(project?.rawId);
  const createEvaluation = useCreateEvaluation(project?.rawId);
  const updateEvaluation = useUpdateEvaluation(project?.rawId);
  const deleteEvaluation = useDeleteEvaluation(project?.rawId);

  if (!project) return null;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = { ...form, score: Number(form.score) };
      if (editingId) {
        await updateEvaluation.mutateAsync({ evaluationId: editingId, payload });
      } else {
        await createEvaluation.mutateAsync(payload);
      }
      setForm(initialForm);
      setEditingId(null);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Evaluation save failed. Check values and permissions.');
    }
  };

  const editEvaluation = (evaluation) => {
    setEditingId(evaluation._id);
    setForm({
      evaluationType: evaluation.evaluationType || 'Baseline Evaluation',
      evaluationDate: toDateInput(evaluation.evaluationDate),
      evaluatorName: evaluation.evaluatorName || '',
      score: evaluation.score ?? '',
      findings: evaluation.findings || '',
      lessonsLearned: evaluation.lessonsLearned || '',
      recommendations: evaluation.recommendations || ''
    });
    setError('');
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const removeEvaluation = async (evaluation) => {
    if (!window.confirm('Delete this evaluation?')) return;
    await deleteEvaluation.mutateAsync(evaluation._id);
  };

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8'}>
      <div className={embedded ? 'rounded border border-slate-200 bg-white shadow-sm' : 'mx-auto max-w-5xl rounded border border-slate-200 bg-white shadow-xl'}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Evaluations</h2>
            <p className="text-sm text-slate-500">{project.name}</p>
          </div>
          {!embedded ? <button className="rounded p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button" title="Close">
            <X size={20} />
          </button> : null}
        </div>

        <form className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-4" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">
            Type
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.evaluationType} onChange={update('evaluationType')}>
              {['Baseline Evaluation', 'Midterm Evaluation', 'Final Evaluation', 'Impact Evaluation'].map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Date
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" type="date" value={form.evaluationDate} onChange={update('evaluationDate')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Evaluator
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.evaluatorName} onChange={update('evaluatorName')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Score
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" max="100" min="0" type="number" value={form.score} onChange={update('score')} required />
          </label>
          {['findings', 'lessonsLearned', 'recommendations'].map((field) => (
            <label key={field} className="block text-sm font-semibold capitalize text-slate-700 md:col-span-4">
              {field.replace(/([A-Z])/g, ' $1')}
              <textarea className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form[field]} onChange={update(field)} />
            </label>
          ))}
          {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-4">{error}</p> : null}
          <div className="flex justify-end md:col-span-4">
            {editingId ? (
              <button className="mr-3 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={resetForm} type="button">
                Cancel Edit
              </button>
            ) : null}
            <button className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={createEvaluation.isPending || updateEvaluation.isPending} type="submit">
              <ClipboardCheck size={16} />
              {createEvaluation.isPending || updateEvaluation.isPending ? 'Saving...' : editingId ? 'Update Evaluation' : 'Save Evaluation'}
            </button>
          </div>
        </form>

        <div className="p-5">
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Evaluator</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(evaluations.data || []).map((evaluation) => (
                  <tr key={evaluation._id}>
                    <td className="px-4 py-3">{new Date(evaluation.evaluationDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{evaluation.evaluationType}</td>
                    <td className="px-4 py-3">{evaluation.evaluatorName}</td>
                    <td className="px-4 py-3">{evaluation.score}%</td>
                    <td className="px-4 py-3">
                      <button className="mr-2 inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" onClick={() => editEvaluation(evaluation)} type="button">
                        <Edit3 size={13} />
                        Edit
                      </button>
                      <button className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => removeEvaluation(evaluation)} type="button">
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {evaluations.isFetching ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">Loading evaluations...</td></tr> : null}
                {!evaluations.isFetching && !evaluations.data?.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">No evaluations yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
