import {
  Project,
} from '../models/Project.js';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getDisplayName(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return (
    value.institutionName ||
    value.name ||
    value.title ||
    ''
  );
}

function sanitizeBeneficiaries(
  beneficiaries
) {
  return {
    householdCount:
      Number(
        beneficiaries
          ?.householdCount || 0
      ),

    individuals:
      Number(
        beneficiaries
          ?.individuals || 0
      ),

    male:
      Number(
        beneficiaries?.male || 0
      ),

    female:
      Number(
        beneficiaries?.female || 0
      ),

    disabilityStatus:
      Number(
        beneficiaries
          ?.disabilityStatus || 0
      ),
  };
}

function sanitizeLocations(
  locations = []
) {
  return locations.map(
    (location) => ({
      region:
        getDisplayName(
          location.region
        ),

      district:
        getDisplayName(
          location.district
        ),

      village:
        location.village || '',

      siteName:
        location.siteName || '',

      /*
      |--------------------------------------------------------------------------
      | React Leaflet Position
      |--------------------------------------------------------------------------
      |
      | Leaflet expects:
      | [latitude, longitude]
      |
      */

      coordinates:
        Number.isFinite(
          location.latitude
        ) &&
        Number.isFinite(
          location.longitude
        )
          ? [
              location.latitude,
              location.longitude,
            ]
          : null,
    })
  );
}

function sanitizeStakeholders(
  application
) {
  const fundedBy =
    application?.fundedBy
      ?.institutionName ||
    getDisplayName(
      application?.fundedBy
        ?.donor
    ) ||
    getDisplayName(
      application?.donor
    ) ||
    '';

  const implementedBy =
    (
      application
        ?.implementedBy || []
    )
      .map(
        (item) =>
          item.institutionName ||
          getDisplayName(
            item.institutionProfile
          ) ||
          getDisplayName(
            item.ministry
          ) ||
          getDisplayName(
            item.partner
          )
      )
      .filter(Boolean);

  return {
    fundedBy,
    implementedBy,
  };
}

/*
|--------------------------------------------------------------------------
| Public Project Mapper
|--------------------------------------------------------------------------
|
| SECURITY:
|
| Only fields explicitly returned here are exposed publicly.
|
| DO NOT spread the Project or ProjectApplication documents into this
| response because those documents contain budget, contacts, users,
| workflow history and other internal information.
|
*/

function toPublicProject(
  project
) {
  const application =
    project.application || {};

  const locations =
    sanitizeLocations(
      application.locations || []
    );

  const stakeholders =
    sanitizeStakeholders(
      application
    );

  const institutionName =
    project.institution
      ?.institutionName ||
    application
      ?.submittingInstitution
      ?.institutionName ||
    '';

  const locationSummary =
    locations
      .map((location) =>
        [
          location.district,
          location.region,
        ]
          .filter(Boolean)
          .join(', ')
      )
      .filter(Boolean)
      .filter(
        (
          value,
          index,
          values
        ) =>
          values.indexOf(
            value
          ) === index
      )
      .join(' • ');

  return {
    rawId:
      project._id.toString(),

    id:
      project.projectCode,

    applicationNumber:
      project.applicationNumber,

    name:
      project.projectName,

    description:
      project.description || '',

    sector:
      project.sector || '',

    projectType:
      project.projectType || '',

    status:
      project.implementationStatus,

    progress:
      Number(
        project.overallProgress || 0
      ),

    institution:
      institutionName,

    institutionSummary:
      institutionName,

    ministry:
      institutionName,

    ministrySummary:
      institutionName,

    donor:
      stakeholders.fundedBy,

    fundedBy:
      stakeholders.fundedBy,

    implementedBy:
      stakeholders.implementedBy,

    startDate:
      project.startDate || null,

    endDate:
      project.endDate || null,

    beneficiaries:
      sanitizeBeneficiaries(
        application.beneficiaries
      ),

    locations,

    locationSummary,

    region:
      locations[0]?.region || '',

    district:
      locations[0]?.district || '',
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/v1/public/projects
|--------------------------------------------------------------------------
*/

export async function getPublicProjects(
  _req,
  res
) {
  const projects =
    await Project.find({
      active: true,
    })
      .select(
        [
          'application',
          'applicationNumber',
          'projectCode',
          'projectName',
          'description',
          'sector',
          'projectType',
          'institution',
          'startDate',
          'endDate',
          'implementationStatus',
          'overallProgress',
          'registeredAt',
        ].join(' ')
      )
      .populate({
        path: 'institution',

        select:
          'institutionName institutionType',
      })
      .populate({
        path: 'application',

        select: [
          'submittingInstitution',
          'locations',
          'beneficiaries',
          'fundedBy',
          'implementedBy',
          'donor',
        ].join(' '),

        populate: [
          {
            path:
              'submittingInstitution',

            select:
              'institutionName institutionType',
          },

          {
            path:
              'locations.region',

            select:
              'name',
          },

          {
            path:
              'locations.district',

            select:
              'name',
          },

          {
            path:
              'fundedBy.donor',

            select:
              'name',
          },

          {
            path:
              'fundedBy.institutionProfile',

            select:
              'institutionName institutionType',
          },

          {
            path:
              'implementedBy.institutionProfile',

            select:
              'institutionName institutionType',
          },

          {
            path:
              'implementedBy.ministry',

            select:
              'name',
          },

          {
            path:
              'implementedBy.partner',

            select:
              'name',
          },

          {
            path:
              'donor',

            select:
              'name',
          },
        ],
      })
      .sort({
        registeredAt: -1,
        createdAt: -1,
      })
      .lean();

  const data =
    projects.map(
      toPublicProject
    );

  res.json({
    success: true,

    count:
      data.length,

    data,
  });
}

/*
|--------------------------------------------------------------------------
| GET /api/v1/public/projects/statistics
|--------------------------------------------------------------------------
*/

export async function getPublicProjectStatistics(
  _req,
  res
) {
  const projects =
    await Project.find({
      active: true,
    })
      .select(
        [
          'application',
          'implementationStatus',
          'overallProgress',
          'sector',
          'institution',
        ].join(' ')
      )
      .populate({
        path: 'institution',
        select:
          'institutionName institutionType',
      })
      .populate({
        path: 'application',

        select:
          'beneficiaries locations',

        populate: [
          {
            path:
              'locations.region',
            select: 'name',
          },
          {
            path:
              'locations.district',
            select: 'name',
          },
        ],
      })
      .lean();

  const statusMap =
    new Map();

  const sectorMap =
    new Map();

  const regionMap =
    new Map();

  const districtMap =
    new Map();

  const institutionMap =
    new Map();

  let totalBeneficiaries = 0;
  let totalProgress = 0;

  /*
  |--------------------------------------------------------------------------
  | Aggregate Public Project Information
  |--------------------------------------------------------------------------
  */

  for (const project of projects) {
    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    const status =
      project.implementationStatus ||
      'Unknown';

    statusMap.set(
      status,
      (statusMap.get(status) || 0) +
        1
    );

    /*
    |--------------------------------------------------------------------------
    | Sector
    |--------------------------------------------------------------------------
    */

    const sector =
      project.sector ||
      'Unspecified';

    sectorMap.set(
      sector,
      (sectorMap.get(sector) || 0) +
        1
    );

    /*
    |--------------------------------------------------------------------------
    | Institution / Organization
    |--------------------------------------------------------------------------
    */

    const institutionName =
      project.institution
        ?.institutionName;

    if (institutionName) {
      institutionMap.set(
        institutionName,
        (
          institutionMap.get(
            institutionName
          ) || 0
        ) + 1
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Beneficiaries
    |--------------------------------------------------------------------------
    */

    totalBeneficiaries +=
      Number(
        project.application
          ?.beneficiaries
          ?.individuals || 0
      );

    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    */

    totalProgress +=
      Number(
        project.overallProgress ||
          0
      );

    /*
    |--------------------------------------------------------------------------
    | Geography
    |--------------------------------------------------------------------------
    |
    | A project can cover multiple locations.
    |
    | We count a project once per unique region and district instead of
    | counting every individual site as another project.
    |
    */

    const projectRegions =
      new Set();

    const projectDistricts =
      new Set();

    for (
      const location of
      project.application
        ?.locations || []
    ) {
      const regionName =
        location.region?.name ||
        location.region
          ?.regionName ||
        '';

      const districtName =
        location.district?.name ||
        location.district
          ?.districtName ||
        '';

      if (regionName) {
        projectRegions.add(
          regionName
        );
      }

      if (districtName) {
        projectDistricts.add(
          districtName
        );
      }
    }

    for (
      const regionName of
      projectRegions
    ) {
      regionMap.set(
        regionName,
        (
          regionMap.get(
            regionName
          ) || 0
        ) + 1
      );
    }

    for (
      const districtName of
      projectDistricts
    ) {
      districtMap.set(
        districtName,
        (
          districtMap.get(
            districtName
          ) || 0
        ) + 1
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const toDistribution =
    (map) =>
      [...map.entries()]
        .map(
          ([
            name,
            total,
          ]) => ({
            _id: name,
            total,
          })
        )
        .sort(
          (a, b) =>
            b.total -
            a.total
        );

  /*
  |--------------------------------------------------------------------------
  | Public Statistics
  |--------------------------------------------------------------------------
  */

  const totalProjects =
    projects.length;

  const averageProgress =
    totalProjects
      ? Math.round(
          totalProgress /
            totalProjects
        )
      : 0;

  const planning =
    statusMap.get('Planning') ||
    statusMap.get('Planned') ||
    0;

  const active =
    statusMap.get('Active') ||
    statusMap.get('Ongoing') ||
    0;

  const completed =
    statusMap.get(
      'Completed'
    ) || 0;

  const onHold =
    statusMap.get(
      'On Hold'
    ) || 0;

  const cancelled =
    statusMap.get(
      'Cancelled'
    ) || 0;

  res.json({
    success: true,

    data: {
      /*
      |--------------------------------------------------------------------------
      | Public KPI Summary
      |--------------------------------------------------------------------------
      */

      overview: {
        totalProjects,

        implementation: {
          planned:
            planning,

          ongoing:
            active,

          completed,

          onHold,

          cancelled,
        },

        totalBeneficiaries,

        averageProgress,

        totalOrganizations:
          institutionMap.size,
      },

      /*
      |--------------------------------------------------------------------------
      | Public Portfolio Reports
      |--------------------------------------------------------------------------
      */

      portfolio: {
        implementationStatus:
          toDistribution(
            statusMap
          ),

        sectorDistribution:
          toDistribution(
            sectorMap
          ),

        regionDistribution:
          toDistribution(
            regionMap
          ),

        districtDistribution:
          toDistribution(
            districtMap
          ),

        institutionDistribution:
          toDistribution(
            institutionMap
          ),
      },
    },
  });
}