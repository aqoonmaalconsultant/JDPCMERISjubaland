import { Router } from "express";

import {
  createProjectLocation,
  getProjectLocations,
  getProjectLocationById,
  updateProjectLocation,
  deleteProjectLocation,
  getLocationsByProject,
  getLocationsByRegion,
  getLocationsByDistrict,
  getNearbyLocations,
  getProjectLocationStatistics,
} from "../controllers/projectLocation.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

export const projectLocationRouter = Router();

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

projectLocationRouter.get(
  "/statistics",
  authenticate,
  authorize("projectLocation.view"),
  getProjectLocationStatistics
);

/*
|--------------------------------------------------------------------------
| Nearby Locations
|--------------------------------------------------------------------------
*/

projectLocationRouter.get(
  "/nearby",
  authenticate,
  authorize("projectLocation.view"),
  getNearbyLocations
);

/*
|--------------------------------------------------------------------------
| Project Locations By Project
|--------------------------------------------------------------------------
*/

projectLocationRouter.get(
  "/project/:projectId",
  authenticate,
  authorize("projectLocation.view"),
  getLocationsByProject
);

/*
|--------------------------------------------------------------------------
| Project Locations By Region
|--------------------------------------------------------------------------
*/

projectLocationRouter.get(
  "/region/:regionId",
  authenticate,
  authorize("projectLocation.view"),
  getLocationsByRegion
);

/*
|--------------------------------------------------------------------------
| Project Locations By District
|--------------------------------------------------------------------------
*/

projectLocationRouter.get(
  "/district/:districtId",
  authenticate,
  authorize("projectLocation.view"),
  getLocationsByDistrict
);

/*
|--------------------------------------------------------------------------
| CRUD
|--------------------------------------------------------------------------
*/

projectLocationRouter.get(
  "/",
  authenticate,
  authorize("projectLocation.view"),
  getProjectLocations
);

projectLocationRouter.get(
  "/:id",
  authenticate,
  authorize("projectLocation.view"),
  getProjectLocationById
);

projectLocationRouter.post(
  "/",
  authenticate,
  authorize("projectLocation.create"),
  createProjectLocation
);

projectLocationRouter.put(
  "/:id",
  authenticate,
  authorize("projectLocation.update"),
  updateProjectLocation
);

projectLocationRouter.delete(
  "/:id",
  authenticate,
  authorize("projectLocation.delete"),
  deleteProjectLocation
);