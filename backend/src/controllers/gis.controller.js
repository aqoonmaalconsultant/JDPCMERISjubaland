import { Roles } from '../security/roles.js';
import { Project } from '../models/Project.js';

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function stakeholderNames(items = []) {
  return items
    .map((item) => item?.institutionName)
    .filter(Boolean)
    .join('; ');
}

function stakeholderMinistryIds(items = []) {
  return items
    .map((item) => item?.ministry)
    .filter(Boolean);
}

function stakeholderDonorId(item) {
  return item?.donor || null;
}

/*
|--------------------------------------------------------------------------
| Internal GIS Roles
|--------------------------------------------------------------------------
*/

const INTERNAL_GIS_ROLES = [
  Roles.IT_OFFICE,
  Roles.SUPER_ADMIN,
  Roles.ADMIN_OFFICER,
  Roles.DIRECTOR_GENERAL,
  Roles.VIEWER,
  Roles.FINANCE_OFFICER,
  Roles.PROJECTS_MANAGER,
];

/*
|--------------------------------------------------------------------------
| GIS Project Filter
|--------------------------------------------------------------------------
|
| Project-level fields are filtered directly on Project.
| Registration, geographic and stakeholder fields are filtered against
| the linked ProjectApplication.
|
*/

function buildProjectFilter(req) {
  const filter = {};

  if (req.query.status) {
    filter.implementationStatus =
      req.query.status;
  }

  if (req.query.sector) {
    filter.sector =
      req.query.sector;
  }

  if (req.query.year) {
    const year =
      Number(req.query.year);

    if (!Number.isNaN(year)) {
      const start =
        new Date(
          Date.UTC(
            year,
            0,
            1
          )
        );

      const end =
        new Date(
          Date.UTC(
            year + 1,
            0,
            1
          )
        );

      filter.startDate = {
        $lt: end,
      };

      filter.endDate = {
        $gte: start,
      };
    }
  }

  return filter;
}

/*
|--------------------------------------------------------------------------
| Internal GIS Access
|--------------------------------------------------------------------------
|
| All seven internal Ministry roles may view GIS information.
|
| This function only controls VIEW access.
| It does not provide create/update/delete permissions.
|
*/

function applicationMatchesUserScope(
  application,
  user
) {
  if (!application || !user) {
    return false;
  }

  return INTERNAL_GIS_ROLES.includes(
    user.role
  );
}

/*
|--------------------------------------------------------------------------
| Application-level Filters
|--------------------------------------------------------------------------
*/

function applicationMatchesFilters(
  application,
  query
) {
  if (!application) {
    return false;
  }

  /*
  |--------------------------------------------------------------------------
  | Region
  |--------------------------------------------------------------------------
  */

  if (query.region) {
    const found =
      (
        application.locations ||
        []
      ).some((location) => {
        const regionId =
          location.region?._id ||
          location.region;

        return (
          String(regionId) ===
          String(query.region)
        );
      });

    if (!found) {
      return false;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | District
  |--------------------------------------------------------------------------
  */

  if (query.district) {
    const found =
      (
        application.locations ||
        []
      ).some((location) => {
        const districtId =
          location.district?._id ||
          location.district;

        return (
          String(districtId) ===
          String(query.district)
        );
      });

    if (!found) {
      return false;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Ministry
  |--------------------------------------------------------------------------
  */

  if (query.ministry) {
    const ministryId =
      String(query.ministry);

    const legacyLead =
      application.ministry?._id ||
      application.ministry;

    const legacySupporting =
      application
        .supportingMinistries ||
      [];

    const newImplemented =
      stakeholderMinistryIds(
        application.implementedBy
      );

    const newSupported =
      stakeholderMinistryIds(
        application.supportedBy
      );

    const ministryIds = [
      legacyLead,

      ...legacySupporting.map(
        (item) =>
          item?._id || item
      ),

      ...newImplemented.map(
        (item) =>
          item?._id || item
      ),

      ...newSupported.map(
        (item) =>
          item?._id || item
      ),
    ]
      .filter(Boolean)
      .map(String);

    if (
      !ministryIds.includes(
        ministryId
      )
    ) {
      return false;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Donor
  |--------------------------------------------------------------------------
  */

  if (query.donor) {
    const donorId =
      String(query.donor);

    const legacyDonor =
      application.donor?._id ||
      application.donor;

    const fundedByDonor =
      stakeholderDonorId(
        application.fundedBy
      );

    const donorIds = [
      legacyDonor,

      fundedByDonor?._id ||
        fundedByDonor,
    ]
      .filter(Boolean)
      .map(String);

    if (
      !donorIds.includes(
        donorId
      )
    ) {
      return false;
    }
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| GIS Projects
|--------------------------------------------------------------------------
*/

export async function getGisProjects(
  req,
  res
) {
  const filter =
    buildProjectFilter(req);

  const projects =
    await Project.find(filter)
      .populate({
        path: 'application',

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
              'ministry',

            select:
              'name',
          },

          {
            path:
              'supportingMinistries',

            select:
              'name',
          },

          {
            path:
              'donor',

            select:
              'name',
          },

          {
            path:
              'fundedBy.ministry',

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
              'institutionName',
          },

          {
            path:
              'supportedBy.ministry',

            select:
              'name',
          },

          {
            path:
              'supportedBy.donor',

            select:
              'name',
          },

          {
            path:
              'supportedBy.institutionProfile',

            select:
              'institutionName',
          },
                    {
            path:
              'implementedBy.ministry',

            select:
              'name',
          },

          {
            path:
              'implementedBy.donor',

            select:
              'name',
          },

          {
            path:
              'implementedBy.institutionProfile',

            select:
              'institutionName',
          },
        ],
      })
      .limit(1000);

  const features = [];

  for (const project of projects) {
    const application =
      project.application;

    if (
      !application ||
      !applicationMatchesUserScope(
        application,
        req.user
      ) ||
      !applicationMatchesFilters(
        application,
        req.query
      )
    ) {
      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | Organization
    |--------------------------------------------------------------------------
    */

    const organization =
      application
        .submittingInstitution
        ?.institutionName ||
      '';

    /*
    |--------------------------------------------------------------------------
    | Implementing Ministry / Institution
    |--------------------------------------------------------------------------
    */

    const implementingNames =
      stakeholderNames(
        application.implementedBy
      );

    const ministry =
      implementingNames ||
      application.ministry?.name ||
      '';

    /*
    |--------------------------------------------------------------------------
    | Supporting Institutions
    |--------------------------------------------------------------------------
    */

    const supportingNames =
      stakeholderNames(
        application.supportedBy
      );

    const legacySupporting =
      (
        application
          .supportingMinistries ||
        []
      )
        .map(
          (item) =>
            item?.name
        )
        .filter(Boolean)
        .join('; ');

    const supportingMinistries =
      supportingNames ||
      legacySupporting ||
      '';

    /*
    |--------------------------------------------------------------------------
    | Donor / Funding Institution
    |--------------------------------------------------------------------------
    */

    const donor =
      application.fundedBy
        ?.institutionName ||

      application.fundedBy
        ?.institutionProfile
        ?.institutionName ||

      application.fundedBy
        ?.donor?.name ||

      application.donor?.name ||

      '';

    /*
    |--------------------------------------------------------------------------
    | Beneficiaries
    |--------------------------------------------------------------------------
    */

    const beneficiaries =
      application.beneficiaries
        ?.individuals ||
      0;

    /*
    |--------------------------------------------------------------------------
    | GeoJSON Locations
    |--------------------------------------------------------------------------
    |
    | One GeoJSON feature is generated for each valid GPS point.
    |
    */

    for (
      const location of
        application.locations ||
        []
    ) {
      const latitude =
        Number(
          location.latitude
        );

      const longitude =
        Number(
          location.longitude
        );

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        continue;
      }

      features.push({
        type:
          'Feature',

        geometry: {
          type:
            'Point',

          coordinates: [
            longitude,
            latitude,
          ],
        },

        properties: {
          projectId:
            project._id,

          projectCode:
            project.projectCode,

          projectName:
            project.projectName,

          organization,

          status:
            project
              .implementationStatus,

          sector:
            project.sector,

          ministry,

          supportingMinistries,

          donor,

          region:
            location.region
              ?.name ||
            '',

          district:
            location.district
              ?.name ||
            '',

          village:
            location.village ||
            '',

          siteName:
            location.siteName ||
            '',

          progress:
            project
              .overallProgress ||
            0,

          budget:
            project.budget ||
            0,

          beneficiaries,
        },
      });
    }
  }

  res.json({
    type:
      'FeatureCollection',

    count:
      features.length,

    features,
  });
}

/*
|--------------------------------------------------------------------------
| GIS Heatmap
|--------------------------------------------------------------------------
*/

export async function getGisHeatmap(
  req,
  res
) {
  const filter =
    buildProjectFilter(req);

  const projects =
    await Project.find(filter)
      .populate({
        path:
          'application',

        populate: [
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
              'ministry',

            select:
              'name',
          },

          {
            path:
              'supportingMinistries',

            select:
              'name',
          },

          {
            path:
              'donor',

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
              'supportedBy.ministry',

            select:
              'name',
          },

          {
            path:
              'implementedBy.ministry',

            select:
              'name',
          },
        ],
      })
      .limit(1000);

  const groups =
    new Map();

  for (const project of projects) {
    const application =
      project.application;

    if (
      !application ||
      !applicationMatchesUserScope(
        application,
        req.user
      ) ||
      !applicationMatchesFilters(
        application,
        req.query
      )
    ) {
      continue;
    }

    for (
      const location of
        application.locations ||
        []
    ) {
      const latitude =
        Number(
          location.latitude
        );

      const longitude =
        Number(
          location.longitude
        );

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        continue;
      }

      const region =
        location.region
          ?.name ||
        'Unassigned region';

      const district =
        location.district
          ?.name ||
        'Unassigned district';

      const key =
        `${region}::${district}`;

      if (!groups.has(key)) {
        groups.set(
          key,
          {
            region,
            district,

            projectIds:
              new Set(),

            budget: 0,

            beneficiaries: 0,

            progressTotal: 0,

            progressCount: 0,
          }
        );
      }

      const group =
        groups.get(key);

      const projectId =
        String(
          project._id
        );

      /*
      |--------------------------------------------------------------------------
      | Prevent Duplicate Project Counts
      |--------------------------------------------------------------------------
      |
      | A project may have several GPS locations in the same district.
      | It must only be counted once per district.
      |
      */

      if (
        !group.projectIds.has(
          projectId
        )
      ) {
        group.projectIds.add(
          projectId
        );

        group.budget +=
          Number(
            project.budget ||
            0
          );

        group.beneficiaries +=
          Number(
            application
              .beneficiaries
              ?.individuals ||
            0
          );

        group.progressTotal +=
          Number(
            project
              .overallProgress ||
            0
          );

        group.progressCount +=
          1;
      }
    }
  }
    /*
  |--------------------------------------------------------------------------
  | Prepare Heatmap Response
  |--------------------------------------------------------------------------
  */

  const data =
    Array.from(
      groups.values()
    )
      .map((group) => ({
        region:
          group.region,

        district:
          group.district,

        projects:
          group
            .projectIds
            .size,

        budget:
          group.budget,

        beneficiaries:
          group.beneficiaries,

        avgProgress:
          group.progressCount
            ? group.progressTotal /
              group.progressCount
            : 0,
      }))
      .sort(
        (a, b) =>
          b.projects -
          a.projects
      );

  res.json({
    data,
  });
}