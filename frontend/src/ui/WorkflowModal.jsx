import { useEffect, useMemo, useState } from 'react';
import { GitPullRequestArrow, X } from 'lucide-react';
import { useUpdateProjectWorkflow } from '../api/projects.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { hasPermission, Permissions } from '../auth/permissions.js';

const actions = [
  { value: 'submit', label: 'Submit', fromStages: ['Draft'], permissions: [Permissions.UPDATE_PROJECT] },
  { value: 'ministry-review', label: 'Ministry Review', fromStages: ['Submitted'], permissions: [Permissions.APPROVE_PROJECT] },
  { value: 'planning-review', label: 'Planning Review', fromStages: ['Ministry Review'], permissions: [Permissions.APPROVE_PROJECT] },
  { value: 'approve', label: 'Approve', fromStages: ['Planning Review'], permissions: [Permissions.APPROVE_PROJECT] },
  { value: 'procurement', label: 'Move to Procurement', fromStages: ['Approved'], fromStatuses: ['Approved'], permissions: [Permissions.APPROVE_PROJECT] },
  { value: 'implementation', label: 'Start Implementation', fromStages: ['Approved'], fromStatuses: ['Approved', 'Procurement'], permissions: [Permissions.APPROVE_PROJECT] },
  { value: 'monitoring', label: 'Start Monitoring', fromStages: ['Approved'], fromStatuses: ['Implementation'], permissions: [Permissions.VERIFY_PROGRESS, Permissions.APPROVE_PROJECT] },
  { value: 'complete', label: 'Mark Completed', fromStages: ['Approved'], fromStatuses: ['Monitoring'], permissions: [Permissions.VERIFY_PROGRESS, Permissions.APPROVE_PROJECT] },
  { value: 'archive', label: 'Archive', fromStatuses: ['Completed'], permissions: [Permissions.APPROVE_PROJECT] },
  { value: 'reject', label: 'Return to Draft', fromStages: ['Submitted', 'Ministry Review', 'Planning Review'], permissions: [Permissions.APPROVE_PROJECT], requiresNote: true },
  { value: 'suspend', label: 'Suspend', fromStatuses: ['Approved', 'Procurement', 'Implementation', 'Monitoring'], permissions: [Permissions.APPROVE_PROJECT], requiresNote: true },
  { value: 'resume', label: 'Resume', fromStatuses: ['Suspended'], permissions: [Permissions.APPROVE_PROJECT], requiresNote: true },
  { value: 'cancel', label: 'Cancel', blockedStatuses: ['Completed', 'Cancelled'], permissions: [Permissions.APPROVE_PROJECT], requiresNote: true }
];

function actionLabel(value) {
  return actions.find((item) => item.value === value)?.label || value;
}

function actorName(actor) {
  if (!actor) return 'System';
  if (typeof actor === 'string') return actor;
  return actor.name || actor.email || 'User';
}

function actionAllowed(user, project, item) {
  const hasActionPermission = hasPermission(user, ...(item.permissions || []));
  const matchesStage = !item.fromStages || item.fromStages.includes(project.approvalStage);
  const matchesStatus = !item.fromStatuses || item.fromStatuses.includes(project.status);
  const notBlocked = !item.blockedStatuses?.includes(project.status);

  return hasActionPermission && matchesStage && matchesStatus && notBlocked;
}

export function WorkflowModal({ project, onClose, embedded = false }) {
  const { user } = useAuth();
  const [action, setAction] = useState('submit');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const updateWorkflow = useUpdateProjectWorkflow(project?.rawId);
  const availableActions = useMemo(() => (project ? actions.filter((item) => actionAllowed(user, project, item)) : []), [project, user]);
  const selectedAction = availableActions.find((item) => item.value === action);

  useEffect(() => {
    if (availableActions.length && !availableActions.some((item) => item.value === action)) {
      setAction(availableActions[0].value);
    }
  }, [action, availableActions]);

  if (!project) {
    return null;
  }

  const workflowHistory = [...(project.source?.workflowHistory || [])].sort((a, b) => new Date(b.actedAt || 0) - new Date(a.actedAt || 0));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedAction) {
      setError('No workflow action is available for this project stage and your role.');
      return;
    }

    if (selectedAction.requiresNote && !note.trim()) {
      setError('A note is required for this workflow action.');
      return;
    }

    try {
      await updateWorkflow.mutateAsync({ action, note });
      setNote('');
      if (!embedded) onClose();
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Workflow update failed. Check permissions and project scope.');
    }
  };

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8'}>
      <form className={embedded ? 'rounded border border-slate-200 bg-white shadow-sm' : 'mx-auto max-w-xl rounded border border-slate-200 bg-white shadow-xl'} onSubmit={submit}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Approval Workflow</h2>
            <p className="text-sm text-slate-500">{project.name}</p>
          </div>
          {!embedded ? <button className="rounded p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button" title="Close">
            <X size={20} />
          </button> : null}
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold text-slate-600">Current Status</p>
              <p>{project.status}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600">Approval Stage</p>
              <p>{project.approvalStage}</p>
            </div>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Workflow Action
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={action} onChange={(event) => setAction(event.target.value)}>
              {availableActions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          {!availableActions.length ? (
            <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              No workflow action is available for this project status, approval stage, or your role.
            </p>
          ) : null}

          <label className="block text-sm font-semibold text-slate-700">
            Note {selectedAction?.requiresNote ? <span className="text-red-600">*</span> : null}
            <textarea className="mt-1 min-h-24 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" required={Boolean(selectedAction?.requiresNote)} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>

          {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}

          <div className="rounded border border-slate-200">
            <div className="border-b border-slate-200 px-3 py-2">
              <h3 className="text-sm font-semibold text-slate-700">Workflow History</h3>
            </div>
            <div className="max-h-64 overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Stage</th>
                    <th className="px-3 py-2">By</th>
                    <th className="px-3 py-2">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workflowHistory.map((item, index) => (
                    <tr key={`${item.actedAt || index}-${item.action}`}>
                      <td className="px-3 py-2">{item.actedAt ? new Date(item.actedAt).toLocaleString() : '-'}</td>
                      <td className="px-3 py-2 font-semibold">{actionLabel(item.action)}</td>
                      <td className="px-3 py-2">{item.fromStatus || '-'} {'->'} {item.toStatus || '-'}</td>
                      <td className="px-3 py-2">{item.fromStage || '-'} {'->'} {item.toStage || '-'}</td>
                      <td className="px-3 py-2">{actorName(item.actor)}</td>
                      <td className="px-3 py-2">{item.note || '-'}</td>
                    </tr>
                  ))}
                  {!workflowHistory.length ? (
                    <tr>
                      <td className="px-3 py-5 text-center text-slate-500" colSpan="6">No workflow history recorded yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          {!embedded ? <button className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={onClose} type="button">Cancel</button> : null}
          <button className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={updateWorkflow.isPending || !availableActions.length} type="submit">
            <GitPullRequestArrow size={16} />
            {updateWorkflow.isPending ? 'Saving...' : 'Update Workflow'}
          </button>
        </div>
      </form>
    </div>
  );
}
