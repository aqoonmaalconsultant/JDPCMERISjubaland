import { useMemo, useState } from 'react';

import {
  useGisHeatmap,
  useGisProjects
} from '../api/gis.js';

import { useReferenceData } from '../api/projects.js';

import GISStatistics from '../components/dashboard/gis/GISStatistics.jsx';
import GISSearch from '../components/dashboard/gis/GISSearch.jsx';
import GISFilters from '../components/dashboard/gis/GISFilters.jsx';
import GISMap from '../components/dashboard/gis/GISMap.jsx';

const INITIAL_FILTERS = {
  ministry: '',
  donor: '',
  region: '',
  district: '',
  sector: '',
  status: '',
  year: ''
};

export default function ProjectMap() {
  const [filters, setFilters] =
    useState(INITIAL_FILTERS);

  const [search, setSearch] = useState('');

  /*
   * These filters are sent to the backend.
   * Empty values are removed from the request.
   */
  const queryFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== ''
        )
      ),
    [filters]
  );

  /*
   * Backend GIS queries
   */
  const gisProjects =
    useGisProjects(queryFilters);

  const heatmap =
    useGisHeatmap(queryFilters);

  /*
   * Reference data for filter dropdowns
   */
  const ministries =
    useReferenceData('ministries');

  const donors =
    useReferenceData('donors');

  const regions =
    useReferenceData('regions');

  const districts =
    useReferenceData('districts');

  /*
   * GeoJSON features returned by backend
   */
  const features =
    gisProjects.data?.features || [];

  /*
   * Search remains client-side because the current
   * GIS backend does not expose a search parameter.
   *
   * All structured filters remain server-side.
   */
  const visibleFeatures = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return features;
    }

    return features.filter((feature) => {
      const props =
        feature?.properties || {};

      const searchableText = [
        props.projectName,
        props.projectCode,
        props.ministry,
        props.supportingMinistries,
        props.donor,
        props.region,
        props.district,
        props.village,
        props.sector,
        props.status
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [features, search]);

  const referenceLoading =
    ministries.isLoading ||
    donors.isLoading ||
    regions.isLoading ||
    districts.isLoading;

  return (
    <div className="space-y-5">

      {/* PAGE HEADER */}

      <div>
        <h2 className="text-lg font-semibold">
          GIS Map Dashboard
        </h2>

        <p className="text-sm text-slate-500">
          Interactive project mapping by ministry,
          donor, region, district, sector, and status.
        </p>

        {gisProjects.isFetching && (
          <p className="mt-1 text-xs font-medium text-slate-400">
            Refreshing map locations...
          </p>
        )}
      </div>

      {/* ERROR */}

      {gisProjects.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load GIS project data.
        </div>
      )}

      {/* STATISTICS */}

      <GISStatistics
        features={visibleFeatures}
      />

      {/* SEARCH */}

      <GISSearch
  value={search}
  onChange={setSearch}
  onClear={() => setSearch('')}
/>

      {/* FILTERS */}

      {referenceLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          Loading GIS filters...
        </div>
      ) : (
        <GISFilters
          filters={filters}
          setFilters={setFilters}
          regions={regions.data || []}
          districts={districts.data || []}
          ministries={ministries.data || []}
          donors={donors.data || []}
        />
      )}

      {/* MAP + HEATMAP */}

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">

        <GISMap
          features={visibleFeatures}
          height="640px"
        />

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div>
            <h3 className="font-semibold text-slate-800">
              Location Heatmap
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              District-level concentration from backend GIS aggregation.
            </p>
          </div>

          <div className="mt-4 space-y-2">

            {(heatmap.data || [])
              .slice(0, 12)
              .map((row) => (
                <div
                  key={`${row.region}-${row.district}`}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-2">

                    <p className="font-medium text-slate-800">
                      {row.district ||
                        'Unassigned district'}
                    </p>

                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">
                      {row.projects} projects
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {row.region ||
                      'Unassigned region'}
                    {' / '}
                    {Math.round(
                      row.avgProgress || 0
                    )}
                    % avg progress
                  </p>

                </div>
              ))}

            {heatmap.isFetching && (
              <p className="py-4 text-center text-sm text-slate-500">
                Loading heatmap...
              </p>
            )}

            {heatmap.isError && (
              <p className="py-4 text-center text-sm text-red-600">
                Unable to load heatmap data.
              </p>
            )}

            {!heatmap.isFetching &&
              !heatmap.isError &&
              !heatmap.data?.length && (
                <p className="py-4 text-center text-sm text-slate-500">
                  No heatmap data yet.
                </p>
              )}

          </div>

        </section>

      </div>

      {/* RESULT COUNT */}

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">

        <span>
          Showing{' '}
          <strong className="text-slate-700">
            {visibleFeatures.length}
          </strong>{' '}
          GPS point
          {visibleFeatures.length === 1
            ? ''
            : 's'}
        </span>

        <span>
          {gisProjects.data?.count ??
            features.length}{' '}
          points returned by GIS
        </span>

      </div>

    </div>
  );
}