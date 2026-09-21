import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useReferenceData } from '../api/projects.js';

const config = {
  ministries: {
    title: 'Ministries',
    description: 'Government ministries and institutional contact details.',
    columns: ['name', 'code', 'minister', 'directorGeneral']
  },
  regions: {
    title: 'Regions',
    description: 'Jubaland regional administration records.',
    columns: ['name', 'code']
  },
  districts: {
    title: 'Districts',
    description: 'District records linked to regions.',
    columns: ['name', 'code', 'region']
  },
  villages: {
    title: 'Villages',
    description: 'Village records linked to districts and regions.',
    columns: ['name', 'code', 'district']
  },
  donors: {
    title: 'Donors',
    description: 'Development partners and donor contact records.',
    columns: ['name', 'country', 'contactPerson', 'email', 'phone']
  },
  partners: {
    title: 'Implementing Partners',
    description: 'NGOs, UN agencies, contractors, and implementation organizations.',
    columns: ['organizationName', 'type']
  }
};

function displayValue(row, column) {
  const value = row[column];

  if (!value) return '-';

  if (typeof value === 'object') {
    return value.name || value.organizationName || value.code || value._id || '-';
  }

  return value;
}

export function ReferenceData() {
  const { resource = 'ministries' } = useParams();
  const resourceConfig = config[resource] || config.ministries;
  const rows = useReferenceData(resource);
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const data = rows.data || [];

    if (!term) return data;

    return data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(term)
    );
  }, [rows.data, search]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{resourceConfig.title}</h2>
        <p className="text-sm text-slate-500">{resourceConfig.description}</p>
      </div>

      <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Reference data is currently available in view-only mode. Create, edit, and delete controls will be enabled after their backend endpoints are verified.
      </div>

      <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search size={18} className="text-slate-400" />
        <input
          className="w-full outline-none"
          placeholder={`Search ${resourceConfig.title.toLowerCase()}`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              {resourceConfig.columns.map((column) => (
                <th key={column} className="px-4 py-3">
                  {column.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((row) => (
              <tr key={row._id} className="hover:bg-slate-50">
                {resourceConfig.columns.map((column) => (
                  <td key={column} className="px-4 py-3">
                    {displayValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}

            {rows.isFetching ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-500"
                  colSpan={resourceConfig.columns.length}
                >
                  Loading records...
                </td>
              </tr>
            ) : null}

            {!rows.isFetching && !filteredRows.length ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-slate-500"
                  colSpan={resourceConfig.columns.length}
                >
                  No records found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
