import mongoose from 'mongoose';

import { Project } from '../models/Project.js';
import { ProjectApplication } from '../models/ProjectApplication.js';
import { ProjectLocation } from '../models/ProjectLocation.js';

import { HttpError } from '../utils/httpError.js';
import { Roles } from '../security/roles.js';

function ensureFinalRegistrationOfficer(user) {
 const allowed = [
  Roles.SUPER_ADMIN,
  Roles.PROJECTS_MANAGER,
];

  if (!allowed.includes(user.role)) {
    throw new HttpError(
      403,
      'You are not authorised to complete final registration.'
    );
  }
}

function populateApplication(query) {
  return query
    .populate(
      'submittingInstitution',
      'institutionName institutionType verificationStatus'
    )
    .populate(
      'locations.region',
      'name'
    )
    .populate(
      'locations.district',
      'name'
    )
    .populate(
      'projectVerifiedBy',
      'name email'
    )
    .populate(
      'registeredBy',
      'name email'
    )
    .populate(
      'submittedBy',
      'name email'
    );
}

async function generateProjectCode() {
  const year =
    new Date().getFullYear();

  const total =
    await Project.countDocuments();

  const sequence =
    String(total + 1).padStart(
      5,
      '0'
    );

  return `JL-PROJ-${year}-${sequence}`;
}

/*
|--------------------------------------------------------------------------
| Synchronize Approved Application Locations
|--------------------------------------------------------------------------
*/

async function synchronizeProjectLocations(
  officialProject,
  application,
  userId
) {
  const applicationLocations =
    Array.isArray(application.locations)
      ? application.locations
      : [];

  for (
    let index = 0;
    index < applicationLocations.length;
    index += 1
  ) {
    const location =
      applicationLocations[index];

    if (
      !location.region ||
      !location.district ||
      location.latitude === undefined ||
      location.latitude === null ||
      location.longitude === undefined ||
      location.longitude === null
    ) {
      continue;
    }

    const latitude =
      Number(location.latitude);

    const longitude =
      Number(location.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      continue;
    }

    /*
     * Prevent duplicate operational
     * ProjectLocation records.
     */
    const existingLocation =
      await ProjectLocation.findOne({
        project: officialProject._id,
        region: location.region,
        district: location.district,
        latitude,
        longitude,
      });

    if (existingLocation) {
      continue;
    }

    const payload = {
      project:
        officialProject._id,

      region:
        location.region,

      district:
        location.district,

      siteName:
        location.siteName ||
        `${application.projectName} Site ${index + 1}`,

      latitude,

      longitude,

      locationType:
        'Project Site',

      status:
        'Active',

      createdBy:
        userId,

      updatedBy:
        userId,
    };

    /*
     * ProjectLocation expects Village
     * to be a Village ObjectId.
     *
     * Only transfer it when the
     * application contains a valid ID.
     */
    const villageId =
      typeof location.village === 'object'
        ? location.village?._id
        : location.village;

    if (
      villageId &&
      mongoose.isValidObjectId(
        villageId
      )
    ) {
      payload.village =
        villageId;
    }

    await ProjectLocation.create(
      payload
    );
  }
}

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export async function finalRegistrationStatistics(
  req,
  res
) {
  ensureFinalRegistrationOfficer(
    req.user
  );

  const [
    verified,
    registered,
  ] = await Promise.all([
    ProjectApplication.countDocuments({
      registrationStatus:
        'Verified',
    }),

    ProjectApplication.countDocuments({
      registrationStatus:
        'Registered',
    }),
  ]);

  res.json({
    data: {
      verified,
      registered,
    },
  });
}

/*
|--------------------------------------------------------------------------
| List Verified Projects
|--------------------------------------------------------------------------
*/

export async function listVerifiedProjects(
  req,
  res
) {
  ensureFinalRegistrationOfficer(
    req.user
  );

  const projects =
    await populateApplication(
      ProjectApplication.find({
        registrationStatus:
          'Verified',

        registrationStage:
          'Final Registration',
      }).sort({
        projectVerificationAt:
          -1,
      })
    );

  res.json({
    data: projects,
  });
}

/*
|--------------------------------------------------------------------------
| Get Project
|--------------------------------------------------------------------------
*/

export async function getProjectForRegistration(
  req,
  res
) {
  ensureFinalRegistrationOfficer(
    req.user
  );

  const project =
    await populateApplication(
      ProjectApplication.findById(
        req.params.id
      )
    );

  if (!project) {
    throw new HttpError(
      404,
      'Project not found.'
    );
  }

  res.json({
    data: project,
  });
}
/*
|--------------------------------------------------------------------------
| Register Project
|--------------------------------------------------------------------------
*/

export async function registerProject(
  req,
  res
) {
  ensureFinalRegistrationOfficer(
    req.user
  );

  const project =
    await ProjectApplication.findById(
      req.params.id
    );

  if (!project) {
    throw new HttpError(
      404,
      'Project not found.'
    );
  }

  if (
    project.registrationStatus !==
      'Verified' ||
    project.registrationStage !==
      'Final Registration'
  ) {
    throw new HttpError(
      409,
      `Only verified projects can be registered.
Current Status: ${project.registrationStatus}
Current Stage: ${project.registrationStage}`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Find or Create Official Project
  |--------------------------------------------------------------------------
  */

  let officialProject =
    await Project.findOne({
      application:
        project._id,
    });

  if (!officialProject) {
    const projectCode =
      await generateProjectCode();

    officialProject =
      await Project.create({
        application:
          project._id,

        applicationNumber:
          project.applicationNumber,

        projectCode,

        projectName:
          project.projectName,

        description:
          project.description,

        sector:
          project.sector,

        projectType:
          project.projectType,

        fundingSource:
          project.fundingSource,

        budget:
          project.budget,

        currency:
          project.currency,

        institution:
          project.submittingInstitution,

        submittedBy:
          project.submittedBy,

        startDate:
          project.startDate,

        endDate:
          project.endDate,

        implementationStatus:
          'Planning',

        overallProgress:
          0,

        registeredAt:
          new Date(),

        registeredBy:
          req.user._id,
      });
  }

  /*
  |--------------------------------------------------------------------------
  | Automatically Create Operational GPS Locations
  |--------------------------------------------------------------------------
  */

  await synchronizeProjectLocations(
    officialProject,
    project,
    req.user._id
  );

  /*
  |--------------------------------------------------------------------------
  | Complete Application Registration
  |--------------------------------------------------------------------------
  */

  project.registrationStatus =
    'Registered';

  project.registrationStage =
    'Registered';

  project.registeredAt =
    new Date();

  project.registeredBy =
    req.user._id;

  project.updatedBy =
    req.user._id;

  project.registrationHistory.push({
    action:
      'Project Registered',

    fromStatus:
      'Verified',

    toStatus:
      'Registered',

    fromStage:
      'Final Registration',

    toStage:
      'Registered',

    actor:
      req.user._id,

    actedAt:
      new Date(),
  });

  await project.save();

  res.json({
    message:
      'Project registered successfully.',

    data: project,
  });
}