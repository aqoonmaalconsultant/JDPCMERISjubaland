import { ProjectApplication } from '../models/ProjectApplication.js';
import { OrganizationApplication } from '../models/OrganizationApplication.js';

/*
|--------------------------------------------------------------------------
| Executive KPIs
|--------------------------------------------------------------------------
*/

export async function getExecutiveSummary() {
  const [
    totalProjects,
    totalOrganizations,

    draftProjects,
    submittedProjects,
    verifiedProjects,
    returnedProjects,
    registeredProjects,

    plannedProjects,
    notStartedProjects,
    ongoingProjects,
    onHoldProjects,
    completedProjects,
    cancelledProjects,

    budgetAggregation,
  ] = await Promise.all([

    ProjectApplication.countDocuments(),

    OrganizationApplication.countDocuments(),

    ProjectApplication.countDocuments({
      registrationStatus: 'Draft',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Submitted',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Verified',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Returned for Revision',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Registered',
    }),

    ProjectApplication.countDocuments({
      implementationStatus: 'Planned',
    }),

    ProjectApplication.countDocuments({
      implementationStatus: 'Not Started',
    }),

    ProjectApplication.countDocuments({
      implementationStatus: 'Ongoing',
    }),

    ProjectApplication.countDocuments({
      implementationStatus: 'On Hold',
    }),

    ProjectApplication.countDocuments({
      implementationStatus: 'Completed',
    }),

    ProjectApplication.countDocuments({
      implementationStatus: 'Cancelled',
    }),

    ProjectApplication.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: {
            $sum: {
              $ifNull: ['$budget', 0],
            },
          },
        },
      },
    ]),
  ]);

  return {
    totalProjects,
    totalOrganizations,

    totalBudget:
      budgetAggregation[0]?.totalBudget ??
      0,

    registration: {
      draft: draftProjects,
      submitted: submittedProjects,
      verified: verifiedProjects,
      returned: returnedProjects,
      registered: registeredProjects,
    },

    implementation: {
      planned: plannedProjects,
      notStarted: notStartedProjects,
      ongoing: ongoingProjects,
      onHold: onHoldProjects,
      completed: completedProjects,
      cancelled: cancelledProjects,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Institution Workflow
|--------------------------------------------------------------------------
*/

export async function getInstitutionWorkflow() {
  const [
    pending,
    verified,
    approved,
  ] = await Promise.all([

    OrganizationApplication.countDocuments({
      registrationStatus: 'Submitted',
    }),

    OrganizationApplication.countDocuments({
      registrationStatus: 'Verified',
    }),

    OrganizationApplication.countDocuments({
      registrationStatus: 'Registered',
    }),

  ]);

  return {
    pending,
    verified,
    approved,
  };
}

/*
|--------------------------------------------------------------------------
| Project Workflow
|--------------------------------------------------------------------------
*/

export async function getProjectWorkflow() {
  const [
    draft,
    submitted,
    verified,
    returned,
    registered,
  ] = await Promise.all([

    ProjectApplication.countDocuments({
      registrationStatus: 'Draft',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Submitted',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Verified',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Returned for Revision',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Registered',
    }),

  ]);

  return {
    draft,
    submitted,
    verified,
    returned,
    registered,
  };
}

/*
|--------------------------------------------------------------------------
| Implementation Status
|--------------------------------------------------------------------------
*/

export async function getImplementationStatus() {
  return ProjectApplication.aggregate([
    {
      $group: {
        _id: '$implementationStatus',
        total: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        total: -1,
      },
    },
  ]);
}

/*
|--------------------------------------------------------------------------
| Sector Distribution
|--------------------------------------------------------------------------
*/

export async function getSectorDistribution() {
  return ProjectApplication.aggregate([
    {
      $group: {
        _id: '$sector',
        total: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        total: -1,
      },
    },
  ]);
}

/*
|--------------------------------------------------------------------------
| Region Distribution
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Region Distribution
|--------------------------------------------------------------------------
*/

export async function getRegionDistribution() {
  return ProjectApplication.aggregate([
    {
      $unwind: "$locations",
    },

    {
      $lookup: {
        from: "regions",
        localField: "locations.region",
        foreignField: "_id",
        as: "region",
      },
    },

    {
      $unwind: "$region",
    },

    {
      $group: {
        _id: "$region.name",
        total: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        total: -1,
      },
    },
  ]);
}
/*
|--------------------------------------------------------------------------
| District Distribution
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| District Distribution
|--------------------------------------------------------------------------
*/

export async function getDistrictDistribution() {
  return ProjectApplication.aggregate([
    {
      $unwind: "$locations",
    },

    {
      $lookup: {
        from: "districts",
        localField: "locations.district",
        foreignField: "_id",
        as: "district",
      },
    },

    {
      $unwind: "$district",
    },

    {
      $group: {
        _id: "$district.name",
        total: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        total: -1,
      },
    },
  ]);
}
/*
|--------------------------------------------------------------------------
| Recent Activities
|--------------------------------------------------------------------------
*/

export async function getRecentActivities() {
  return ProjectApplication.find()
    .sort({ updatedAt: -1 })
    .limit(10)
    .select(
      "projectName registrationStatus implementationStatus updatedAt"
    )
    .lean();
}