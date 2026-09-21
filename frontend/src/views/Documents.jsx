import { useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, Search } from 'lucide-react';
import { downloadDocumentSearchCsv, openProjectDocument, useDocumentSearch } from '../api/documents.js';

const categories = ['Contract', 'Agreement', 'Report', 'Photo', 'Video', 'Completion Certificate', 'Other'];

function projectLocation(project) {
  const locations = (project?.locations || [])
    .map((location) => {
      const region = location?.region?.name || '';
      const district = location?.district?.name || '';
      return [district, region].filter(Boolean).join(', ');
    })
    .filter(Boolean);

  return locations.length ? locations.join(' + ') : 'Unassigned location';
}

export function Documents() {
  const [filters, setFilters] = useState({ q: '', category: '' });
  const [openingId, setOpeningId] = useState(null);
  const [openError, setOpenError] = useState('');
  const [exporting, setExporting] = useState(false);
  const queryFilters = useMemo(
    () => Object.fromEntries(Object.entries({ ...filters, limit: 200 }).filter(([, value]) => value)),
    [filters]
  );
  const documents = useDocumentSearch(queryFilters);

  const exportCsv = async () => {
    setExporting(true);
    setOpenError('');

    try {
      await downloadDocumentSearchCsv(queryFilters);
    } catch (error) {
      setOpenError(error.response?.data?.message || 'Could not export document search results.');
    } finally {
      setExporting(false);
    }
  };

  const openDocument = async (document) => {
    setOpeningId(document._id);
    setOpenError('');

    try {
      await openProjectDocument(document.project._id, document._id, document.fileName || document.title);
    } catch (error) {
      setOpenError(error.response?.data?.message || 'Could not open this document. Check storage access and permissions.');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Document Management</h2>
          <p className="text-sm text-slate-500">Search official project files stored through Cloudflare R2 or local backend storage.</p>
          {documents.isFetching ? <p className="mt-1 text-xs font-medium text-slate-400">Refreshing document index...</p> : null}
        </div>
        <button className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60" disabled={exporting} onClick={exportCsv} type="button">
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <section className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full outline-none"
              placeholder="Search title or file content"
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
            />
          </label>
          <select
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-civic"
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        {openError ? <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{openError}</p> : null}
      </section>

      <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(documents.data || []).map((document) => (
              <tr key={document._id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-civic" />
                    <div>
                      <p className="font-medium">{document.title}</p>
                      <p className="text-xs text-slate-500">{document.category} / {document.storageType}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{document.project?.projectName || 'Unassigned project'}</p>
                  <p className="text-xs text-slate-500">{document.project?.projectCode || '-'}</p>
                </td>
                <td className="px-4 py-3">{projectLocation(document.project)}</td>
                <td className="px-4 py-3">
                  <p>{new Date(document.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500">{document.uploadedBy?.name || 'System'}</p>
                </td>
                <td className="px-4 py-3">
                  {document.project?._id ? (
                    <button className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-100 disabled:opacity-60" disabled={openingId === document._id} onClick={() => openDocument(document)} type="button">
                      <ExternalLink size={14} />
                      {openingId === document._id ? 'Opening...' : 'Open'}
                    </button>
                  ) : '-'}
                </td>
              </tr>
            ))}
            {documents.isFetching ? (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">Loading documents...</td></tr>
            ) : null}
            {!documents.isFetching && !documents.data?.length ? (
              <tr><td className="px-4 py-6 text-center text-slate-500" colSpan="5">No documents found.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
