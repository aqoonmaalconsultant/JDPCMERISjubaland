import {
  createProjectLocationService,
  getProjectLocationsService,
  getProjectLocationByIdService,
  updateProjectLocationService,
  deleteProjectLocationService,
  getLocationsByProjectService,
  getLocationsByRegionService,
  getLocationsByDistrictService,
  findNearbyLocationsService,
  getProjectLocationStatisticsService,
} from '../services/projectLocation.service.js';

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export async function createProjectLocation(req, res, next) {
  try {
    const location = await createProjectLocationService({
      ...req.body,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project location created successfully.',
      data: location,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get All
|--------------------------------------------------------------------------
*/

export async function getProjectLocations(req, res, next) {
  try {
    const locations = await getProjectLocationsService(req.query);

    res.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Get By Id
|--------------------------------------------------------------------------
*/

export async function getProjectLocationById(req, res, next) {
  try {
    const location = await getProjectLocationByIdService(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Project location not found.',
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateProjectLocation(req, res, next) {
  try {
    const location = await updateProjectLocationService(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?._id,
      }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Project location not found.',
      });
    }

    res.json({
      success: true,
      message: 'Project location updated successfully.',
      data: location,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

export async function deleteProjectLocation(req, res, next) {
  try {
    const location = await deleteProjectLocationService(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Project location not found.',
      });
    }

    res.json({
      success: true,
      message: 'Project location deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| By Project
|--------------------------------------------------------------------------
*/

export async function getLocationsByProject(req, res, next) {
  try {
    const data = await getLocationsByProjectService(
      req.params.projectId
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| By Region
|--------------------------------------------------------------------------
*/

export async function getLocationsByRegion(req, res, next) {
  try {
    const data = await getLocationsByRegionService(
      req.params.regionId
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| By District
|--------------------------------------------------------------------------
*/

export async function getLocationsByDistrict(req, res, next) {
  try {
    const data = await getLocationsByDistrictService(
      req.params.districtId
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Nearby Locations
|--------------------------------------------------------------------------
*/

export async function getNearbyLocations(req, res, next) {
  try {
    const {
      longitude,
      latitude,
      maxDistance,
    } = req.query;

    const data = await findNearbyLocationsService(
      Number(longitude),
      Number(latitude),
      Number(maxDistance || 5000)
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

export async function getProjectLocationStatistics(req, res, next) {
  try {
    const data =
      await getProjectLocationStatisticsService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}