import { ProjectLocation } from '../models/ProjectLocation.js';

const projectPopulate = {
  path: 'project',
  select:
    'projectCode projectName implementationStatus overallProgress application',
};

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export async function createProjectLocation(payload) {
  const location = await ProjectLocation.create(payload);

  return ProjectLocation.findById(location._id)
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .populate('createdBy', 'fullName')
    .populate('updatedBy', 'fullName')
    .lean();
}

/*
|--------------------------------------------------------------------------
| Get All
|--------------------------------------------------------------------------
*/

export async function getProjectLocations(filters = {}) {
  const query = {};

  if (filters.project) {
    query.project = filters.project;
  }

  if (filters.region) {
    query.region = filters.region;
  }

  if (filters.district) {
    query.district = filters.district;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.locationType) {
    query.locationType = filters.locationType;
  }

  return ProjectLocation.find(query)
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .populate('createdBy', 'fullName')
    .populate('updatedBy', 'fullName')
    .sort({
      createdAt: -1,
    })
    .lean();
}

/*
|--------------------------------------------------------------------------
| Get By Id
|--------------------------------------------------------------------------
*/

export async function getProjectLocationById(id) {
  return ProjectLocation.findById(id)
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .populate('createdBy', 'fullName')
    .populate('updatedBy', 'fullName')
    .lean();
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateProjectLocation(id, payload) {
  const location =
    await ProjectLocation.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    );

  if (!location) {
    return null;
  }

  return ProjectLocation.findById(location._id)
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .populate('createdBy', 'fullName')
    .populate('updatedBy', 'fullName')
    .lean();
}

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export async function deleteProjectLocation(id) {
  return ProjectLocation.findByIdAndDelete(id);
}

/*
|--------------------------------------------------------------------------
| Get Locations By Project
|--------------------------------------------------------------------------
*/

export async function getLocationsByProject(
  projectId
) {
  return ProjectLocation.find({
    project: projectId,
  })
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .sort({
      createdAt: -1,
    })
    .lean();
}
/*
|--------------------------------------------------------------------------
| Get Locations By Region
|--------------------------------------------------------------------------
*/

export async function getLocationsByRegion(
  regionId
) {
  return ProjectLocation.find({
    region: regionId,
  })
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .lean();
}

/*
|--------------------------------------------------------------------------
| Get Locations By District
|--------------------------------------------------------------------------
*/

export async function getLocationsByDistrict(
  districtId
) {
  return ProjectLocation.find({
    district: districtId,
  })
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .lean();
}

/*
|--------------------------------------------------------------------------
| Find Nearby Locations
|--------------------------------------------------------------------------
*/

export async function findNearbyLocations(
  longitude,
  latitude,
  maxDistance = 5000
) {
  return ProjectLocation.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [
            longitude,
            latitude,
          ],
        },
        $maxDistance: maxDistance,
      },
    },
  })
    .populate(projectPopulate)
    .populate('region', 'name code')
    .populate('district', 'name code')
    .populate('village', 'name code')
    .lean();
}

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export async function getProjectLocationStatistics() {
  const [
    totalLocations,
    activeLocations,
    completedLocations,
    inactiveLocations,
  ] = await Promise.all([
    ProjectLocation.countDocuments(),

    ProjectLocation.countDocuments({
      status: 'Active',
    }),

    ProjectLocation.countDocuments({
      status: 'Completed',
    }),

    ProjectLocation.countDocuments({
      status: 'Inactive',
    }),
  ]);

  return {
    totalLocations,
    activeLocations,
    completedLocations,
    inactiveLocations,
  };
}