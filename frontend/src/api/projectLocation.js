import { api } from './client.js';

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

export const getLocationStatistics = () =>
  api.get("/project-locations/statistics");

/*
|--------------------------------------------------------------------------
| All Locations
|--------------------------------------------------------------------------
*/

export const getLocations = (params = {}) =>
  api.get("/project-locations", {
    params,
  });

/*
|--------------------------------------------------------------------------
| Single Location
|--------------------------------------------------------------------------
*/

export const getLocation = (id) =>
  api.get(`/project-locations/${id}`);

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const createLocation = (payload) =>
  api.post("/project-locations", payload);

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const updateLocation = (id, payload) =>
  api.put(`/project-locations/${id}`, payload);

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export const deleteLocation = (id) =>
  api.delete(`/project-locations/${id}`);

/*
|--------------------------------------------------------------------------
| GIS Filters
|--------------------------------------------------------------------------
*/

export const getProjectLocations = (projectId) =>
  api.get(`/project-locations/project/${projectId}`);

export const getRegionLocations = (regionId) =>
  api.get(`/project-locations/region/${regionId}`);

export const getDistrictLocations = (districtId) =>
  api.get(`/project-locations/district/${districtId}`);

export const getNearbyLocations = (params) =>
  api.get("/project-locations/nearby", {
    params,
  });