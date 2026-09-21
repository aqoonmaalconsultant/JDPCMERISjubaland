import { useEffect, useMemo, useState } from 'react';
import {
  LocateFixed,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import LocationPickerMap from '../components/dashboard/maps/LocationPickerMap.jsx';

import {
  useReferenceData,
} from '../api/projects.js';

import {
  createLocation,
  deleteLocation,
  getProjectLocations,
  updateLocation,
} from '../api/projectLocation.js';

const LOCATION_TYPES = [
  'Project Site',
  'Office',
  'Warehouse',
  'Hospital',
  'School',
  'Water Point',
  'Borehole',
  'Road',
  'Bridge',
  'Solar Plant',
  'Camp',
  'Other',
];

const emptyLocation = {
  _id: null,
  region: '',
  district: '',
  village: '',
  siteName: '',
  latitude: '',
  longitude: '',
  locationType: 'Project Site',
  status: 'Active',
  remarks: '',
};

function getReferenceId(value) {
  if (!value) return '';

  if (typeof value === 'object') {
    return value._id || '';
  }

  return value;
}

function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          'Geolocation is not supported by this browser.'
        )
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      reject,
      {
        enableHighAccuracy: true,
        timeout: 15000,
      }
    );
  });
}

export function LocationModal({
  project,
  onClose,
  embedded = false,
}) {
  const projectId = project?.rawId || project?._id;

  const regions = useReferenceData('regions');
  const districts = useReferenceData('districts');
  const villages = useReferenceData('villages');

  const [locations, setLocations] = useState([
    { ...emptyLocation },
  ]);

  const [originalIds, setOriginalIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /*
  |--------------------------------------------------------------------------
  | Load existing operational ProjectLocation records
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      if (!projectId) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response =
          await getProjectLocations(projectId);

        const rows = response.data?.data || [];

        if (cancelled) return;

        if (!rows.length) {
          setLocations([
            { ...emptyLocation },
          ]);

          setOriginalIds([]);
          return;
        }

        setOriginalIds(
          rows.map((row) => row._id)
        );

        setLocations(
          rows.map((row) => ({
            _id: row._id,

            region:
              getReferenceId(row.region),

            district:
              getReferenceId(row.district),

            village:
              getReferenceId(row.village),

            siteName:
              row.siteName || '',

            latitude:
              row.latitude ?? '',

            longitude:
              row.longitude ?? '',

            locationType:
              row.locationType ||
              'Project Site',

            status:
              row.status || 'Active',

            remarks:
              row.remarks || '',
          }))
        );
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError.response?.data?.message ||
              'Could not load project locations.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  /*
  |--------------------------------------------------------------------------
  | District grouping
  |--------------------------------------------------------------------------
  */

  const districtsByRegion = useMemo(() => {
    const groups = new Map();

    for (const district of districts.data || []) {
      const regionId =
        getReferenceId(district.region);

      const key = String(regionId);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(district);
    }

    return groups;
  }, [districts.data]);

  /*
  |--------------------------------------------------------------------------
  | Village grouping
  |--------------------------------------------------------------------------
  */

  const villagesByDistrict = useMemo(() => {
    const groups = new Map();

    for (const village of villages.data || []) {
      const districtId =
        getReferenceId(village.district);

      const key = String(districtId);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(village);
    }

    return groups;
  }, [villages.data]);

  const getDistricts = (regionId) =>
    districtsByRegion.get(
      String(regionId)
    ) || [];

  const getVillages = (districtId) =>
    villagesByDistrict.get(
      String(districtId)
    ) || [];

  /*
  |--------------------------------------------------------------------------
  | Form helpers
  |--------------------------------------------------------------------------
  */

  const update =
    (index, field) =>
    (event) => {
      const value = event.target.value;

      setLocations((current) =>
        current.map(
          (location, locationIndex) => {
            if (locationIndex !== index) {
              return location;
            }

            if (field === 'region') {
              return {
                ...location,
                region: value,
                district: '',
                village: '',
              };
            }

            if (field === 'district') {
              return {
                ...location,
                district: value,
                village: '',
              };
            }

            return {
              ...location,
              [field]: value,
            };
          }
        )
      );
    };

  const updateCoordinates = (
    index,
    latitude,
    longitude
  ) => {
    setLocations((current) =>
      current.map((location, i) =>
        i === index
          ? {
              ...location,
              latitude,
              longitude,
            }
          : location
      )
    );
  };

  const useCurrentLocation = async (
    index
  ) => {
    try {
      const coords =
        await getCurrentLocation();

      updateCoordinates(
        index,
        coords.latitude.toFixed(6),
        coords.longitude.toFixed(6)
      );
    } catch {
      setError(
        'Unable to obtain the current location.'
      );
    }
  };

  const addLocation = () => {
    setLocations((current) => [
      ...current,
      { ...emptyLocation },
    ]);
  };

  const removeLocation = (index) => {
    setLocations((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (_, locationIndex) =>
          locationIndex !== index
      );
    });
  };
    /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const submit = async (event) => {
    event.preventDefault();

    if (!projectId) {
      setError(
        'Official project ID is missing.'
      );

      return;
    }

    setSaving(true);
    setError('');

    try {
      const currentIds = locations
        .map((location) => location._id)
        .filter(Boolean);

      /*
       * Delete records that existed before
       * but were removed from the form.
       */
      const deletedIds =
        originalIds.filter(
          (id) =>
            !currentIds.includes(id)
        );

      for (const id of deletedIds) {
        await deleteLocation(id);
      }

      /*
       * Create new records and update
       * existing operational locations.
       */
      for (const location of locations) {
        const payload = {
          project: projectId,
          region: location.region,
          district: location.district,

          village:
            location.village || undefined,

          siteName:
            location.siteName.trim(),

          latitude:
            Number(location.latitude),

          longitude:
            Number(location.longitude),

          locationType:
            location.locationType,

          status:
            location.status,

          remarks:
            location.remarks.trim() ||
            undefined,
        };

        if (location._id) {
          await updateLocation(
            location._id,
            payload
          );
        } else {
          await createLocation(payload);
        }
      }

      /*
       * Reload saved records so newly
       * created MongoDB IDs are available.
       */
      const response =
        await getProjectLocations(
          projectId
        );

      const rows =
        response.data?.data || [];

      setOriginalIds(
        rows.map((row) => row._id)
      );

      setLocations(
        rows.length
          ? rows.map((row) => ({
              _id: row._id,

              region:
                getReferenceId(
                  row.region
                ),

              district:
                getReferenceId(
                  row.district
                ),

              village:
                getReferenceId(
                  row.village
                ),

              siteName:
                row.siteName || '',

              latitude:
                row.latitude ?? '',

              longitude:
                row.longitude ?? '',

              locationType:
                row.locationType ||
                'Project Site',

              status:
                row.status || 'Active',

              remarks:
                row.remarks || '',
            }))
          : [{ ...emptyLocation }]
      );

      if (!embedded) {
        onClose();
      }
    } catch (mutationError) {
      setError(
        mutationError.response?.data?.message ||
          'Could not save project locations. Check the required fields and your permissions.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!project) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={
        embedded
          ? ''
          : 'fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-8'
      }
    >
      <form
        className={
          embedded
            ? 'rounded border border-slate-200 bg-white shadow-sm'
            : 'mx-auto max-w-4xl rounded border border-slate-200 bg-white shadow-xl'
        }
        onSubmit={submit}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">
              Project Locations / GPS
            </h2>

            <p className="text-sm text-slate-500">
              {project.name ||
                project.projectName ||
                project.id}
            </p>
          </div>

          {!embedded ? (
            <button
              className="rounded p-2 text-slate-500 hover:bg-slate-100"
              onClick={onClose}
              type="button"
              title="Close"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-500">
            Loading project locations...
          </div>
        ) : (
          <div className="space-y-5 p-5">
            {locations.map(
              (location, index) => (
                <div
                  className="space-y-4 rounded border border-slate-200 p-4"
                  key={
                    location._id ||
                    `location-${index}`
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        Location {index + 1}
                      </p>

                      {location._id ? (
                        <p className="text-xs text-slate-400">
                          Existing location
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">
                          New location
                        </p>
                      )}
                    </div>

                    <button
                      className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      disabled={
                        locations.length === 1
                      }
                      onClick={() =>
                        removeLocation(index)
                      }
                      type="button"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Region
                      <select
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        value={
                          location.region
                        }
                        onChange={update(
                          index,
                          'region'
                        )}
                        required
                      >
                        <option value="">
                          Select region
                        </option>

                        {(regions.data || []).map(
                          (region) => (
                            <option
                              key={region._id}
                              value={region._id}
                            >
                              {region.name}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      District
                      <select
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        value={
                          location.district
                        }
                        onChange={update(
                          index,
                          'district'
                        )}
                        required
                      >
                        <option value="">
                          Select district
                        </option>

                        {getDistricts(
                          location.region
                        ).map((district) => (
                          <option
                            key={district._id}
                            value={district._id}
                          >
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Village
                      <select
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        value={
                          location.village
                        }
                        onChange={update(
                          index,
                          'village'
                        )}
                      >
                        <option value="">
                          Select village (optional)
                        </option>

                        {getVillages(
                          location.district
                        ).map((village) => (
                          <option
                            key={village._id}
                            value={village._id}
                          >
                            {village.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Site Name
                      <input
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        value={
                          location.siteName
                        }
                        onChange={update(
                          index,
                          'siteName'
                        )}
                        placeholder="Example: Kismayo Hospital"
                        required
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Location Type
                      <select
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        value={
                          location.locationType
                        }
                        onChange={update(
                          index,
                          'locationType'
                        )}
                      >
                        {LOCATION_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Status
                      <select
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        value={
                          location.status
                        }
                        onChange={update(
                          index,
                          'status'
                        )}
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Inactive">
                          Inactive
                        </option>
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Latitude
                      <input
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        min="-90"
                        max="90"
                        step="any"
                        type="number"
                        value={
                          location.latitude
                        }
                        onChange={update(
                          index,
                          'latitude'
                        )}
                        required
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700">
                      Longitude
                      <input
                        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        min="-180"
                        max="180"
                        step="any"
                        type="number"
                        value={
                          location.longitude
                        }
                        onChange={update(
                          index,
                          'longitude'
                        )}
                        required
                      />
                    </label>

                    <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
                      Remarks
                      <textarea
                        className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2 font-normal outline-none focus:border-civic"
                        value={
                          location.remarks
                        }
                        onChange={update(
                          index,
                          'remarks'
                        )}
                        placeholder="Optional remarks"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        useCurrentLocation(
                          index
                        )
                      }
                      className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <LocateFixed
                        size={16}
                      />
                      Use Current Location
                    </button>
                  </div>

                  <LocationPickerMap
                    latitude={
                      location.latitude
                    }
                    longitude={
                      location.longitude
                    }
                    onChange={(
                      latitude,
                      longitude
                    ) =>
                      updateCoordinates(
                        index,
                        latitude.toFixed(6),
                        longitude.toFixed(6)
                      )
                    }
                  />
                </div>
              )
            )}

            <button
              className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100"
              onClick={addLocation}
              type="button"
            >
              <Plus size={16} />
              Add Location
            </button>
          </div>
        )}

        {error ? (
          <p className="mx-5 mb-4 rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          {!embedded ? (
            <button
              className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
          ) : null}

          <button
            className="inline-flex items-center gap-2 rounded bg-civic px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
            disabled={
              saving || loading
            }
            type="submit"
          >
            <MapPin size={16} />

            {saving
              ? 'Saving...'
              : 'Save Locations'}
          </button>
        </div>
      </form>
    </div>
  );
}