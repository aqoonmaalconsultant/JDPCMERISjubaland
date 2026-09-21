import { useState } from 'react';
import { Edit3, ExternalLink, FileUp, Trash2, X } from 'lucide-react';
import {
  openProjectDocument,
  useDeleteProjectDocument,
  useProjectDocuments,
  useUpdateProjectDocument,
  useUploadProjectDocument,
} from "../api/documents.js";
const categories = ['Contract', 'Agreement', 'Report', 'Photo', 'Video', 'Completion Certificate', 'Other'];

export function DocumentModal({ project, onClose, embedded = false }) {
  const [form, setForm] = useState({ title: '', category: 'Report', file: null });
  const [editingId, setEditingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState('');
  const documents = useProjectDocuments(project?.rawId);
  const uploadDocument = useUploadProjectDocument(project?.rawId);
  const updateDocument = useUpdateProjectDocument(project?.rawId);
  const deleteDocument = useDeleteProjectDocument(project?.rawId);

  if (!project) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!editingId && !form.file) {
      setError('Please choose a file to upload.');
      return;
    }

    try {
      if (editingId) {
        await updateDocument.mutateAsync({
          documentId: editingId,
          payload: { title: form.title, category: form.category }
        });
      } else {
        await uploadDocument.mutateAsync(form);
        event.target.reset();
      }
      setForm({ title: '', category: 'Report', file: null });
      setEditingId(null);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Document save failed. Check permissions, file size, and storage settings.');
    }
  };

  const editDocument = (document) => {
    setEditingId(document._id);
    setForm({ title: document.title || '', category: document.category || 'Report', file: null });
    setError('');
  };

  const resetForm = () => {
    setForm({ title: '', category: 'Report', file: null });
    setEditingId(null);
    setError('');
  };

  const removeDocument = async (document) => {
    if (!window.confirm(`Delete document "${document.title}"?`)) return;
    await deleteDocument.mutateAsync(document._id);
  };

  const openDocument = async (document) => {
    setOpeningId(document._id);
    setError('');

    try {
      await openProjectDocument(project.rawId, document._id, document.fileName || document.title);
    } catch (openError) {
      setError(openError.response?.data?.message || 'Could not open this document. Check storage access and permissions.');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className={embedded ? '' : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8'}>
      <div className={embedded ? 'rounded border border-slate-200 bg-white shadow-sm' : 'mx-auto max-w-4xl rounded border border-slate-200 bg-white shadow-xl'}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Project Documents</h2>
            <p className="text-sm text-slate-500">{project.name}</p>
          </div>
          {!embedded ? (
            <button className="rounded p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} type="button" title="Close">
              <X size={20} />
            </button>
          ) : null}
        </div>

        <form className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-[1fr_220px_1fr_auto]" onSubmit={submit}>
          <label className="block text-sm font-semibold text-slate-700">
            Title
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Category
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            File
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-1.5 text-sm font-normal outline-none focus:border-civic" disabled={Boolean(editingId)} onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} type="file" required={!editingId} />
          </label>
          <div className="flex items-end gap-2">
            {editingId ? (
              <button className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={resetForm} type="button">
                Cancel
              </button>
            ) : null}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70" disabled={uploadDocument.isPending || updateDocument.isPending} type="submit">
              <FileUp size={16} />
              {uploadDocument.isPending || updateDocument.isPending ? 'Saving...' : editingId ? 'Update' : 'Upload'}
            </button>
          </div>
          {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-4">{error}</p> : null}
        </form>

        <div className="p-5">
          {documents.isFetching ? <p className="text-sm font-medium text-slate-500">Loading documents...</p> : null}
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Storage</th>
                  <th className="px-4 py-3">Open</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(documents.data || []).map((document) => (
                  <tr key={document._id}>
                    <td className="px-4 py-3 font-medium">{document.title}</td>
                    <td className="px-4 py-3">{document.category}</td>
                    <td className="px-4 py-3">{document.fileName}</td>
                    <td className="px-4 py-3 capitalize">{document.storageType}</td>
                    <td className="px-4 py-3">
                      <button className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60" disabled={openingId === document._id} onClick={() => openDocument(document)} type="button">
                        <ExternalLink size={13} />
                        {openingId === document._id ? 'Opening...' : 'Open'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button className="mr-2 inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100" onClick={() => editDocument(document)} type="button">
                        <Edit3 size={13} />
                        Edit
                      </button>
                      <button className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => removeDocument(document)} type="button">
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!documents.isFetching && !documents.data?.length ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan="6">No documents uploaded yet.</td>
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
