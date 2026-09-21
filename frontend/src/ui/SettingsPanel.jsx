import { useState } from 'react';
import { Settings, Trash2, X } from 'lucide-react';
import { useDeleteSetting, useSettings, useUpsertSetting } from '../api/settings.js';

const initialSetting = {
  key: '',
  value: '',
  category: 'system',
  description: '',
  isPublic: false
};

function parseSettingValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);

  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
}

export function SettingsPanel() {
  const settings = useSettings();
  const upsertSetting = useUpsertSetting();
  const deleteSetting = useDeleteSetting();
  const [form, setForm] = useState(initialSetting);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const update = (field) => (event) => {
    const value = field === 'isPublic' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await upsertSetting.mutateAsync({
        ...form,
        value: parseSettingValue(form.value)
      });
      setForm(initialSetting);
      setEditingId(null);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Could not save setting.');
    }
  };

  const edit = (setting) => {
    setEditingId(setting._id);
    setForm({
      key: setting.key,
      value: typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value),
      category: setting.category,
      description: setting.description || '',
      isPublic: Boolean(setting.isPublic)
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialSetting);
    setError('');
  };

  const removeSetting = async (setting) => {
    if (!window.confirm(`Delete setting "${setting.key}"?`)) return;
    await deleteSetting.mutateAsync(setting._id);
    if (editingId === setting._id) {
      cancelEdit();
    }
  };

  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Settings className="text-civic" />
        <div>
          <h3 className="font-semibold">System Settings</h3>
          <p className="text-sm text-slate-500">Manage configurable system values, public portal flags, and alert thresholds.</p>
        </div>
      </div>

      <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_160px_1fr_auto]" onSubmit={submit}>
        <input className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-civic" placeholder="key" value={form.key} onChange={update('key')} required />
        <input className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-civic" placeholder="value" value={form.value} onChange={update('value')} required />
        <input className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-civic" placeholder="category" value={form.category} onChange={update('category')} required />
        <input className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-civic" placeholder="description" value={form.description} onChange={update('description')} />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input checked={form.isPublic} onChange={update('isPublic')} type="checkbox" />
          Public
        </label>
        {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700 lg:col-span-5">{error}</p> : null}
        <div className="flex gap-2 lg:col-span-5">
          {editingId ? (
            <button className="inline-flex items-center gap-2 rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={cancelEdit} type="button">
              <X size={16} />
              Cancel
            </button>
          ) : null}
          <button className="rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={upsertSetting.isPending} type="submit">
            {upsertSetting.isPending ? 'Saving...' : editingId ? 'Update Setting' : 'Save Setting'}
          </button>
        </div>
      </form>

      <div className="mt-5 overflow-hidden rounded border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Public</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(settings.data || []).map((setting) => (
              <tr key={setting._id}>
                <td className="px-4 py-3 font-medium">{setting.key}</td>
                <td className="px-4 py-3">{typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value)}</td>
                <td className="px-4 py-3">{setting.category}</td>
                <td className="px-4 py-3">{setting.isPublic ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-100" onClick={() => edit(setting)} type="button">
                    Edit
                  </button>
                  <button className="ml-2 inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => removeSetting(setting)} type="button">
                    <Trash2 size={13} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {settings.isFetching ? <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">Loading settings...</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
