import { useState } from 'react';
import { Edit3, Trash2, Wallet, X } from 'lucide-react';
import {
  useCreateFinancialTransaction,
  useDeleteFinancialTransaction,
  useProjectFinancials,
  useUpdateFinancialTransaction,
} from "../api/financials.js";

const initialForm = {
  type: 'Disbursement',
  amount: '',
  currency: 'USD',
  transactionDate: '',
  fundingSource: '',
  description: ''
};

function toDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function FinancialModal({ project, onClose, embedded = false }) {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const financials = useProjectFinancials(project?.rawId);
  const createTransaction = useCreateFinancialTransaction(project?.rawId);
  const updateTransaction = useUpdateFinancialTransaction(project?.rawId);
  const deleteTransaction = useDeleteFinancialTransaction(project?.rawId);

  if (!project) return null;

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const summary = financials.data?.summary || {};

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await updateTransaction.mutateAsync({ transactionId: editingId, payload });
      } else {
        await createTransaction.mutateAsync(payload);
      }
      setForm(initialForm);
      setEditingId(null);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Financial transaction save failed. Check values and permissions.');
    }
  };

  const editTransaction = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      type: transaction.type || 'Disbursement',
      amount: transaction.amount ?? '',
      currency: transaction.currency || 'USD',
      transactionDate: toDateInput(transaction.transactionDate),
      fundingSource: transaction.fundingSource || '',
      description: transaction.description || ''
    });
    setError('');
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
  };

  const removeTransaction = async (transaction) => {
    if (!window.confirm('Delete this financial transaction?')) return;
    await deleteTransaction.mutateAsync(transaction._id);
  };

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8'}>
      <div className={embedded ? 'rounded border border-slate-200 bg-white shadow-sm' : 'mx-auto max-w-6xl rounded border border-slate-200 bg-white shadow-xl'}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Financial Tracking</h2>
            <p className="text-sm text-slate-500">{project.name}</p>
          </div>
          {!embedded ? <button className="rounded p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button" title="Close">
            <X size={20} />
          </button> : null}
        </div>

        <div className="grid gap-3 border-b border-slate-200 p-5 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ['Budget', summary.budget],
            ['Disbursed', summary.disbursements],
            ['Spent', summary.expenditures],
            ['Balance', summary.remainingBalance],
            ['Over Budget', summary.overBudgetAmount],
            ['Utilization', `${summary.utilizationPercentage || 0}%`]
          ].map(([label, value]) => (
            <div key={label} className={`rounded border p-3 ${label === 'Over Budget' && value > 0 ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className={`mt-1 text-lg font-semibold ${label === 'Over Budget' && value > 0 ? 'text-red-700' : ''}`}>{typeof value === 'number' ? `$${value.toLocaleString()}` : value}</p>
            </div>
          ))}
        </div>

        <form className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-3" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">
            Type
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.type} onChange={update('type')}>
              {['Budget', 'Disbursement', 'Expenditure'].map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Amount
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" min="0" type="number" value={form.amount} onChange={update('amount')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Date
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" type="date" value={form.transactionDate} onChange={update('transactionDate')} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Currency
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.currency} onChange={update('currency')}>
              <option>USD</option>
              <option>SOS</option>
              <option>EUR</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Funding Source
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.fundingSource} onChange={update('fundingSource')} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Description
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.description} onChange={update('description')} />
          </label>
          {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-3">{error}</p> : null}
          <div className="flex justify-end md:col-span-3">
            {editingId ? (
              <button className="mr-3 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={resetForm} type="button">
                Cancel Edit
              </button>
            ) : null}
            <button className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={createTransaction.isPending || updateTransaction.isPending} type="submit">
              <Wallet size={16} />
              {createTransaction.isPending || updateTransaction.isPending ? 'Saving...' : editingId ? 'Update Transaction' : 'Save Transaction'}
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
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(financials.data?.data || []).map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-4 py-3">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{transaction.type}</td>
                    <td className="px-4 py-3">{transaction.currency} {transaction.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{transaction.fundingSource || '-'}</td>
                    <td className="px-4 py-3">
                      <button className="mr-2 inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" onClick={() => editTransaction(transaction)} type="button">
                        <Edit3 size={13} />
                        Edit
                      </button>
                      <button className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => removeTransaction(transaction)} type="button">
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {financials.isFetching ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">Loading financials...</td></tr> : null}
                {!financials.isFetching && !financials.data?.data?.length ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">No financial transactions yet.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
