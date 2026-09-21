import {
  createProjectLocation,
  getProjectLocations,
  getProjectLocationById,
  updateProjectLocation,
  deleteProjectLocation,
  getLocationsByProject,
  getLocationsByRegion,
  getLocationsByDistrict,
  findNearbyLocations,
  getProjectLocationStatistics,
} from '../repositories/projectLocation.repository.js';

/*
|--------------------------------------------------------------------------
| Create Project Location
|--------------------------------------------------------------------------
*/

export async function createProjectLocationService(payload) {
  return createProjectLocation(payload);
}

/*
|--------------------------------------------------------------------------
| Get All Locations
|--------------------------------------------------------------------------
*/

export async function getProjectLocationsService(filters) {
  return getProjectLocations(filters);
}

/*
|--------------------------------------------------------------------------
| Get One Location
|--------------------------------------------------------------------------
*/

export async function getProjectLocationByIdService(id) {
  return getProjectLocationById(id);
}

/*
|--------------------------------------------------------------------------
| Update Location
|--------------------------------------------------------------------------
*/

export async function updateProjectLocationService(
  id,
  payload
) {
  return updateProjectLocation(id, payload);
}

/*
|--------------------------------------------------------------------------
| Delete Location
|--------------------------------------------------------------------------
*/

export async function deleteProjectLocationService(id) {
  return deleteProjectLocation(id);
}

/*
|--------------------------------------------------------------------------
| Locations By Project
|--------------------------------------------------------------------------
*/

export async function getLocationsByProjectService(projectId) {
  return getLocationsByProject(projectId);
}

/*
|--------------------------------------------------------------------------
| Locations By Region
|--------------------------------------------------------------------------
*/

export async function getLocationsByRegionService(regionId) {
  return getLocationsByRegion(regionId);
}

/*
|--------------------------------------------------------------------------
| Locations By District
|--------------------------------------------------------------------------
*/

export async function getLocationsByDistrictService(districtId) {
  return getLocationsByDistrict(districtId);
}

/*
|--------------------------------------------------------------------------
| Nearby Locations
|--------------------------------------------------------------------------
*/

export async function findNearbyLocationsService(
  longitude,
  latitude,
  maxDistance
) {
  return findNearbyLocations(
    longitude,
    latitude,
    maxDistance
  );
}

/*
|--------------------------------------------------------------------------
| GIS Dashboard Statistics
|--------------------------------------------------------------------------
*/

export async function getProjectLocationStatisticsService() {
  return getProjectLocationStatistics();
}