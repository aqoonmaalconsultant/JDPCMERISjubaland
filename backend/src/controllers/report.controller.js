import {
  ProjectApplication,
} from '../models/ProjectApplication.js';

import {
  getRolePermissions,
  Permissions,
} from '../security/roles.js';
import { buildProjectScope } from '../middleware/scope.js';
import { Document } from '../models/Document.js';
import { Evaluation } from '../models/Evaluation.js';
import { FinancialTransaction } from '../models/FinancialTransaction.js';
import { Indicator } from '../models/Indicator.js';
import { MonitoringReport } from '../models/MonitoringReport.js';
import { Project } from '../models/Project.js';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function locationNames(locations = [], field) {
  return locations.map((location) => location[field]?.name).filter(Boolean).join('; ');
}

async function groupedReport(scope, field, collection, localFieldName) {
  const locationMatch = Object.fromEntries(
    ['locations.region', 'locations.district']
      .filter((key) => scope[key])
      .map((key) => [key, scope[key]])
  );
  const ministryStages = field === 'ministry' ? [
    {
      $addFields: {
        reportMinistries: {
          $setUnion: [
            { $cond: [{ $ifNull: ['$ministry', false] }, ['$ministry'], []] },
            { $ifNull: ['$supportingMinistries', []] }
          ]
        }
      }
    },
    { $unwind: { path: '$reportMinistries', preserveNullAndEmptyArrays: true } }
  ] : [];
  const groupField = field === 'ministry' ? '$reportMinistries' : `$${field}`;

  return Project.aggregate([
    { $match: scope },
    ...ministryStages,
    ...(field.includes('.') ? [
      { $unwind: '$locations' },
      ...(Object.keys(locationMatch).length ? [{ $match: locationMatch }] : [])
    ] : []),
    { $group: { _id: groupField, projects: { $sum: 1 }, budget: { $sum: '$budget' }, beneficiaries: { $sum: '$beneficiaries.individuals' } } },
    { $lookup: { from: collection, localField: '_id', foreignField: '_id', as: localFieldName } },
    { $unwind: { path: `$${localFieldName}`, preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: [`$${localFieldName}.name`, `$${localFieldName}.organizationName`, 'Unassigned'] }, projects: 1, budget: 1, beneficiaries: 1 } },
    { $sort: { budget: -1 } }
  ]);
}

function scopedProjectMatch(scope) {
  function prefix(value) {
    if (Array.isArray(value)) return value.map(prefix);
    if (!value || typeof value !== 'object' || value instanceof mongoose.Types.ObjectId || value instanceof Date) return value;

    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
      key.startsWith('$') ? key : `projectDoc.${key}`,
      prefix(entry)
    ]));
  }

  return prefix(scope);
}

function objectId(value) {
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;
}

function buildProjectExportFilter(req) {
  const filter = { ...buildProjectScope(req.user) };
  const allowedFields = new Set(['ministry', 'donor', 'sector', 'status', 'locations.region', 'locations.district']);
  const objectIdFields = new Set(['ministry', 'donor', 'locations.region', 'locations.district']);

  if (req.query.status) filter.status = req.query.status;
  if (req.query.ministry) {
    const ministryId = objectId(req.query.ministry);
    const ministryCondition = {
      $or: [
        { ministry: ministryId },
        { supportingMinistries: ministryId }
      ]
    };

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, ministryCondition];
      delete filter.$or;
    } else {
      filter.$and = [...(filter.$and || []), ministryCondition];
    }
  }
  if (req.query.donor) filter.donor = objectId(req.query.donor);
  if (req.query.sector) filter.sector = req.query.sector;
  if (req.query.region) filter['locations.region'] = objectId(req.query.region);
  if (req.query.district) filter['locations.district'] = objectId(req.query.district);

  if (req.query.field && req.query.value && allowedFields.has(req.query.field)) {
    const value = objectIdFields.has(req.query.field) ? objectId(req.query.value) : req.query.value;
    if (req.query.field === 'ministry') {
      filter.$and = [...(filter.$and || []), { $or: [{ ministry: value }, { supportingMinistries: value }] }];
    } else {
      filter[req.query.field] = value;
    }
  }

  return filter;
}

function sendCsv(res, fileName, rows) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(rows.map((row) => row.map(escapeCsv).join(',')).join('\n'));
}

async function scopedProjectIds(req) {
  const projects = await Project.find(buildProjectExportFilter(req)).select('_id');
  return projects.map((project) => project._id);
}

function projectColumns(item) {
  const project = item.project || item;
  return [
    project?.projectCode,
    project?.projectName,
    project?.status,
    project?.approvalStage,
    project?.trafficLight
  ];
}
/*
|--------------------------------------------------------------------------
| Current Registered Project Reporting
|--------------------------------------------------------------------------
|
| Official Project contains the registered portfolio record.
|
| ProjectApplication contains:
| - Locations
| - Beneficiaries
| - Funding institution
| - Implementing institutions
| - Stakeholders
|
| Legacy Project fields are intentionally NOT used by these helpers.
|
*/

function canViewReportFinancials(req) {
  const permissions =
    getRolePermissions(
      req.user?.role
    );

  return permissions.includes(
    Permissions.VIEW_FINANCIALS
  );
}

function stakeholderName(
  stakeholder
) {
  if (!stakeholder) {
    return '';
  }

  return (
    stakeholder.institutionName ||
    stakeholder
      .institutionProfile
      ?.institutionName ||
    stakeholder.ministry?.name ||
    stakeholder.donor?.name ||
    stakeholder.partner
      ?.organizationName ||
    ''
  );
}

function stakeholderNames(
  stakeholders = []
) {
  return stakeholders
    .map(stakeholderName)
    .filter(Boolean)
    .join('; ');
}

function locationName(
  location,
  field
) {
  const value =
    location?.[field];

  if (!value) {
    return '';
  }

  if (
    typeof value === 'string'
  ) {
    return value;
  }

  return value.name || '';
}

function uniqueLocationNames(
  locations = [],
  field
) {
  return [
    ...new Set(
      locations
        .map((location) =>
          locationName(
            location,
            field
          )
        )
        .filter(Boolean)
    ),
  ].join('; ');
}

function distributionFromMap(
  map
) {
  return [
    ...map.entries(),
  ]
    .map(
      ([
        name,
        projects,
      ]) => ({
        _id:
          name ||
          'Unassigned',

        name:
          name ||
          'Unassigned',

        projects,

        total: projects,
      })
    )
    .sort(
      (a, b) =>
        b.projects -
        a.projects
    );
}

function incrementDistribution(
  map,
  value
) {
  const key =
    value ||
    'Unassigned';

  map.set(
    key,
    (map.get(key) || 0) +
      1
  );
}

function incrementUniqueDistribution(
  map,
  values = []
) {
  const uniqueValues = [
    ...new Set(
      values.filter(Boolean)
    ),
  ];

  if (!uniqueValues.length) {
    incrementDistribution(
      map,
      'Unassigned'
    );

    return;
  }

  for (
    const value of
    uniqueValues
  ) {
    incrementDistribution(
      map,
      value
    );
  }
}

/*
|--------------------------------------------------------------------------
| Load Current Registered Portfolio
|--------------------------------------------------------------------------
*/

async function loadRegisteredPortfolio(
  req
) {
  const filter = {
    active: true,
  };

  /*
  |--------------------------------------------------------------------------
  | Current Project Filters
  |--------------------------------------------------------------------------
  */

  if (req.query.status) {
    filter.implementationStatus =
      req.query.status;
  }

  if (req.query.sector) {
    filter.sector =
      req.query.sector;
  }

  const projects =
    await Project.find(filter)
      .populate(
        'institution',
        'institutionName institutionType'
      )
      .populate({
        path: 'application',

        select: [
          'applicationNumber',
          'submittingInstitution',
          'locations',
          'beneficiaries',
          'fundedBy',
          'implementedBy',
          'supportedBy',
          'endUsers',
          'fundingSource',
          'budget',
          'currency',
          'sector',
          'subSector',
          'projectType',
          'startDate',
          'endDate',
          'registeredAt',
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

            select: 'name',
          },

          {
            path:
              'locations.district',

            select: 'name',
          },

          {
            path:
              'fundedBy.institutionProfile',

            select:
              'institutionName institutionType',
          },

          {
            path:
              'fundedBy.ministry',

            select: 'name',
          },

          {
            path:
              'fundedBy.donor',

            select: 'name',
          },

          {
            path:
              'fundedBy.partner',

            select:
              'organizationName',
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

            select: 'name',
          },

          {
            path:
              'implementedBy.donor',

            select: 'name',
          },

          {
            path:
              'implementedBy.partner',

            select:
              'organizationName',
          },
        ],
      })
      .sort({
        registeredAt: -1,
      });

  /*
  |--------------------------------------------------------------------------
  | Location Filters
  |--------------------------------------------------------------------------
  |
  | Location data belongs to ProjectApplication.
  |
  */

  return projects.filter(
    (project) => {
      const locations =
        project.application
          ?.locations || [];

      if (
        req.query.region &&
        !locations.some(
          (location) =>
            String(
              location.region
                ?._id ||
                location.region ||
                ''
            ) ===
            String(
              req.query.region
            )
        )
      ) {
        return false;
      }

      if (
        req.query.district &&
        !locations.some(
          (location) =>
            String(
              location.district
                ?._id ||
                location.district ||
                ''
            ) ===
            String(
              req.query.district
            )
        )
      ) {
        return false;
      }

      return true;
    }
  );
}
async function reportSummaryData(
  req
) {
  const projects =
    await loadRegisteredPortfolio(
      req
    );

  const byStatus =
    new Map();

  const bySector =
    new Map();

  const byRegion =
    new Map();

  const byDistrict =
    new Map();

  const byInstitution =
    new Map();

  const byFunder =
    new Map();

  const byImplementer =
    new Map();

  let totalBeneficiaries = 0;

  let totalProgress = 0;

  let totalBudget = 0;

  const currencies =
    new Map();

  for (
    const project of
    projects
  ) {
    const application =
      project.application;

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    incrementDistribution(
      byStatus,
      project.implementationStatus
    );

    /*
    |--------------------------------------------------------------------------
    | Sector
    |--------------------------------------------------------------------------
    */

    incrementDistribution(
      bySector,
      project.sector ||
        application?.sector
    );

    /*
    |--------------------------------------------------------------------------
    | Institution
    |--------------------------------------------------------------------------
    */

    const institutionName =
      project.institution
        ?.institutionName ||
      application
        ?.submittingInstitution
        ?.institutionName ||
      'Unassigned';

    incrementDistribution(
      byInstitution,
      institutionName
    );

    /*
    |--------------------------------------------------------------------------
    | Beneficiaries
    |--------------------------------------------------------------------------
    */

    totalBeneficiaries +=
      Number(
        application
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
    */

    const locations =
      application?.locations ||
      [];

    incrementUniqueDistribution(
      byRegion,

      locations.map(
        (location) =>
          locationName(
            location,
            'region'
          )
      )
    );

    incrementUniqueDistribution(
      byDistrict,

      locations.map(
        (location) =>
          locationName(
            location,
            'district'
          )
      )
    );

    /*
    |--------------------------------------------------------------------------
    | Funding Institution
    |--------------------------------------------------------------------------
    */

    incrementDistribution(
      byFunder,
      stakeholderName(
        application?.fundedBy
      ) || 'Unassigned'
    );

    /*
    |--------------------------------------------------------------------------
    | Implementers
    |--------------------------------------------------------------------------
    */

    const implementers =
      (
        application?.implementedBy ||
        []
      )
        .map(stakeholderName)
        .filter(Boolean);

    incrementUniqueDistribution(
      byImplementer,
      implementers
    );

    /*
    |--------------------------------------------------------------------------
    | Financial Summary
    |--------------------------------------------------------------------------
    |
    | Only returned for authorized roles.
    |
    */

    if (
      canViewReportFinancials(
        req
      )
    ) {
      const budget =
        Number(
          application?.budget ??
            project.budget ??
            0
        );

      const currency =
        application?.currency ||
        project.currency ||
        'USD';

      totalBudget += budget;

      currencies.set(
        currency,
        (currencies.get(
          currency
        ) || 0) + budget
      );
    }
  }

  const implementation = {
    planned: 0,
    active: 0,
    completed: 0,
    onHold: 0,
    cancelled: 0,
  };

  for (
    const [
      status,
      count,
    ] of byStatus
  ) {
    if (
      status === 'Planning'
    ) {
      implementation.planned +=
        count;
    }

    if (
      status === 'Active'
    ) {
      implementation.active +=
        count;
    }

    if (
      status === 'Completed'
    ) {
      implementation.completed +=
        count;
    }

    if (
      status === 'On Hold'
    ) {
      implementation.onHold +=
        count;
    }

    if (
      status === 'Cancelled'
    ) {
      implementation.cancelled +=
        count;
    }
  }

  const averageProgress =
    projects.length
      ? Math.round(
          totalProgress /
            projects.length
        )
      : 0;

  const data = {
    overview: {
      totalProjects:
        projects.length,

      implementation,

      totalBeneficiaries,

      averageProgress,

      totalOrganizations:
        byInstitution.size,
    },

    portfolio: {
      implementationStatus:
        distributionFromMap(
          byStatus
        ),

      sectorDistribution:
        distributionFromMap(
          bySector
        ),

      regionDistribution:
        distributionFromMap(
          byRegion
        ),

      districtDistribution:
        distributionFromMap(
          byDistrict
        ),

      institutionDistribution:
        distributionFromMap(
          byInstitution
        ),

      fundingDistribution:
        distributionFromMap(
          byFunder
        ),

      implementerDistribution:
        distributionFromMap(
          byImplementer
        ),
    },
  };

  if (
    canViewReportFinancials(
      req
    )
  ) {
    data.financial = {
      totalBudget,

      byCurrency: [
        ...currencies.entries(),
      ].map(
        ([
          currency,
          amount,
        ]) => ({
          currency,
          amount,
        })
      ),
    };
  }

  return data;
}

export async function getReportSummary(req, res) {
  res.json(await reportSummaryData(req));
}

function summarySectionRows(title, rows, columns) {
  return [
    [title],
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => column.value(row))),
    []
  ];
}

export async function exportReportSummaryCsv(
  req,
  res
) {
  const data =
    await reportSummaryData(
      req
    );

  const overview =
    data.overview;

  const rows = [
    [
      'JAIMS Registered Projects Report',
    ],

    [
      'Generated At',
      new Date().toISOString(),
    ],

    [],

    ['PORTFOLIO OVERVIEW'],

    [
      'Indicator',
      'Value',
    ],

    [
      'Total Registered Projects',
      overview.totalProjects,
    ],

    [
      'Planning',
      overview
        .implementation
        .planned,
    ],

    [
      'Active',
      overview
        .implementation
        .active,
    ],

    [
      'Completed',
      overview
        .implementation
        .completed,
    ],

    [
      'On Hold',
      overview
        .implementation
        .onHold,
    ],

    [
      'Cancelled',
      overview
        .implementation
        .cancelled,
    ],

    [
      'Total Beneficiaries',
      overview.totalBeneficiaries,
    ],

    [
      'Average Progress',
      `${overview.averageProgress}%`,
    ],

    [
      'Organizations',
      overview.totalOrganizations,
    ],

    [],

    ...summarySectionRows(
      'PROJECT STATUS DISTRIBUTION',

      data.portfolio
        .implementationStatus,

      [
        {
          label: 'Status',

          value: (row) =>
            row.name ||
            row._id ||
            'Unassigned',
        },

        {
          label: 'Projects',

          value: (row) =>
            row.projects || 0,
        },
      ]
    ),

    ...summarySectionRows(
      'SECTOR DISTRIBUTION',

      data.portfolio
        .sectorDistribution,

      [
        {
          label: 'Sector',

          value: (row) =>
            row.name ||
            'Unassigned',
        },

        {
          label: 'Projects',

          value: (row) =>
            row.projects || 0,
        },
      ]
    ),

    ...summarySectionRows(
      'REGION DISTRIBUTION',

      data.portfolio
        .regionDistribution,

      [
        {
          label: 'Region',

          value: (row) =>
            row.name ||
            'Unassigned',
        },

        {
          label: 'Projects',

          value: (row) =>
            row.projects || 0,
        },
      ]
    ),

    ...summarySectionRows(
      'DISTRICT DISTRIBUTION',

      data.portfolio
        .districtDistribution,

      [
        {
          label: 'District',

          value: (row) =>
            row.name ||
            'Unassigned',
        },

        {
          label: 'Projects',

          value: (row) =>
            row.projects || 0,
        },
      ]
    ),

    ...summarySectionRows(
      'INSTITUTION / ORGANIZATION DISTRIBUTION',

      data.portfolio
        .institutionDistribution,

      [
        {
          label:
            'Institution / Organization',

          value: (row) =>
            row.name ||
            'Unassigned',
        },

        {
          label: 'Projects',

          value: (row) =>
            row.projects || 0,
        },
      ]
    ),

    ...summarySectionRows(
      'FUNDING INSTITUTION DISTRIBUTION',

      data.portfolio
        .fundingDistribution,

      [
        {
          label:
            'Funded By',

          value: (row) =>
            row.name ||
            'Unassigned',
        },

        {
          label: 'Projects',

          value: (row) =>
            row.projects || 0,
        },
      ]
    ),

    ...summarySectionRows(
      'IMPLEMENTING INSTITUTION DISTRIBUTION',

      data.portfolio
        .implementerDistribution,

      [
        {
          label:
            'Implemented By',

          value: (row) =>
            row.name ||
            'Unassigned',
        },

        {
          label: 'Projects',

          value: (row) =>
            row.projects || 0,
        },
      ]
    ),
  ];

  /*
  |--------------------------------------------------------------------------
  | Authorized Financial Section
  |--------------------------------------------------------------------------
  */

  if (data.financial) {
    rows.push(
      ['FINANCIAL SUMMARY'],

      [
        'Total Budget',
        data.financial
          .totalBudget,
      ],

      [
        'Currency',
        'Amount',
      ],

      ...data.financial
        .byCurrency
        .map(
          (item) => [
            item.currency,
            item.amount,
          ]
        ),

      []
    );
  }

  sendCsv(
    res,
    'jaims-registered-projects-summary.csv',
    rows
  );
}
async function projectExportRows(
  req
) {
  const projects =
    await loadRegisteredPortfolio(
      req
    );

  const includeFinancials =
    canViewReportFinancials(
      req
    );

  return projects.map(
    (project) => {
      const application =
        project.application;

      const locations =
        application
          ?.locations || [];

      const row = {
        projectCode:
          project.projectCode ||
          '',

        applicationNumber:
          project.applicationNumber ||
          application
            ?.applicationNumber ||
          '',

        projectName:
          project.projectName ||
          '',

        institution:
          project.institution
            ?.institutionName ||
          application
            ?.submittingInstitution
            ?.institutionName ||
          '',

        sector:
          project.sector ||
          application?.sector ||
          '',

        subSector:
          application
            ?.subSector ||
          '',

        projectType:
          project.projectType ||
          application
            ?.projectType ||
          '',

        implementationStatus:
          project
            .implementationStatus ||
          '',

        overallProgress:
          Number(
            project
              .overallProgress ||
              0
          ),

        regions:
          uniqueLocationNames(
            locations,
            'region'
          ),

        districts:
          uniqueLocationNames(
            locations,
            'district'
          ),

        villages: [
          ...new Set(
            locations
              .map(
                (location) =>
                  location.village
              )
              .filter(Boolean)
          ),
        ].join('; '),

        sites: [
          ...new Set(
            locations
              .map(
                (location) =>
                  location.siteName
              )
              .filter(Boolean)
          ),
        ].join('; '),

        beneficiaries:
          Number(
            application
              ?.beneficiaries
              ?.individuals ||
              0
          ),

        households:
          Number(
            application
              ?.beneficiaries
              ?.householdCount ||
              0
          ),

        fundedBy:
          stakeholderName(
            application?.fundedBy
          ),

        implementedBy:
          stakeholderNames(
            application
              ?.implementedBy
          ),

        startDate:
          (
            project.startDate ||
            application?.startDate
          )
            ?.toISOString()
            ?.slice(0, 10) ||
          '',

        endDate:
          (
            project.endDate ||
            application?.endDate
          )
            ?.toISOString()
            ?.slice(0, 10) ||
          '',

        registeredAt:
          (
            project.registeredAt ||
            application
              ?.registeredAt
          )
            ?.toISOString()
            ?.slice(0, 10) ||
          '',
      };

      if (includeFinancials) {
        row.fundingSource =
          application
            ?.fundingSource ||
          project.fundingSource ||
          '';

        row.budget =
          application?.budget ??
          project.budget ??
          0;

        row.currency =
          application?.currency ||
          project.currency ||
          'USD';
      }

      return row;
    }
  );
}
export async function exportProjectsXlsx(req, res) {
  const rows = await projectExportRows(req);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="jdpcmeris-projects.xlsx"');
  res.send(buffer);
}

export async function exportProjectsPdf(
  req,
  res
) {
  const rows =
    await projectExportRows(
      req
    );

  const financial =
    canViewReportFinancials(
      req
    );

  const doc =
    new PDFDocument({
      margin: 36,
      size: 'A4',
    });

  res.setHeader(
    'Content-Type',
    'application/pdf'
  );

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="jaims-registered-projects.pdf"'
  );

  doc.pipe(res);

  doc
    .fontSize(16)
    .text(
      'JAIMS Registered Projects Report',
      {
        align: 'center',
      }
    );

  doc.moveDown();

  doc
    .fontSize(9)
    .text(
      `Generated: ${new Date().toLocaleString()}`
    );

  doc.text(
    `Registered Projects: ${rows.length}`
  );

  doc.moveDown();

  for (const row of rows) {
    doc
      .fontSize(11)
      .text(
        `${row.projectCode || '-'} - ${row.projectName}`,
        {
          underline: true,
        }
      );

    doc
      .fontSize(9)
      .text(
        `Institution: ${row.institution || '-'}`
      );

    doc.text(
      `Sector: ${row.sector || '-'} | Type: ${row.projectType || '-'}`
    );

    doc.text(
      `Status: ${row.implementationStatus || '-'} | Progress: ${row.overallProgress}%`
    );

    doc.text(
      `Region: ${row.regions || '-'} | District: ${row.districts || '-'}`
    );

    doc.text(
      `Beneficiaries: ${Number(
        row.beneficiaries || 0
      ).toLocaleString()} | Households: ${Number(
        row.households || 0
      ).toLocaleString()}`
    );

    doc.text(
      `Funded By: ${row.fundedBy || '-'}`
    );

    doc.text(
      `Implemented By: ${row.implementedBy || '-'}`
    );

    doc.text(
      `Period: ${row.startDate || '-'} to ${row.endDate || '-'}`
    );

    if (financial) {
      doc.text(
        `Budget: ${row.currency || ''} ${Number(
          row.budget || 0
        ).toLocaleString()} | Funding Source: ${row.fundingSource || '-'}`
      );
    }

    doc.moveDown(0.8);
  }

  doc.end();
}

export async function exportProjectsCsv(
  req,
  res
) {
  const data =
    await projectExportRows(
      req
    );

  const financial =
    canViewReportFinancials(
      req
    );

  const headers = [
    'Project Code',
    'Application Number',
    'Project Name',
    'Institution / Organization',
    'Sector',
    'Sub-Sector',
    'Project Type',
    'Implementation Status',
    'Overall Progress %',
    'Region',
    'District',
    'Village',
    'Site',
    'Beneficiaries',
    'Households',
    'Funded By',
    'Implemented By',
    'Start Date',
    'End Date',
    'Registered At',
  ];

  if (financial) {
    headers.push(
      'Funding Source',
      'Budget',
      'Currency'
    );
  }

  const rows = [
    headers,

    ...data.map((item) => {
      const row = [
        item.projectCode,
        item.applicationNumber,
        item.projectName,
        item.institution,
        item.sector,
        item.subSector,
        item.projectType,
        item.implementationStatus,
        item.overallProgress,
        item.regions,
        item.districts,
        item.villages,
        item.sites,
        item.beneficiaries,
        item.households,
        item.fundedBy,
        item.implementedBy,
        item.startDate,
        item.endDate,
        item.registeredAt,
      ];

      if (financial) {
        row.push(
          item.fundingSource,
          item.budget,
          item.currency
        );
      }

      return row;
    }),
  ];

  sendCsv(
    res,
    'jaims-registered-projects.csv',
    rows
  );
}
export async function exportEvaluationsCsv(req, res) {
  const projectIds = await scopedProjectIds(req);
  const evaluations = await Evaluation.find({ project: { $in: projectIds } })
    .populate('project', 'projectCode projectName status approvalStage trafficLight')
    .populate('submittedBy', 'name email')
    .sort({ evaluationDate: -1 });

  const rows = [
    ['Project Code', 'Project Name', 'Project Status', 'Approval Stage', 'Traffic Light', 'Evaluation Type', 'Evaluation Date', 'Evaluator', 'Score', 'Findings', 'Lessons Learned', 'Recommendations', 'Submitted By', 'Created At'],
    ...evaluations.map((evaluation) => [
      ...projectColumns(evaluation),
      evaluation.evaluationType,
      evaluation.evaluationDate?.toISOString().slice(0, 10),
      evaluation.evaluatorName,
      evaluation.score,
      evaluation.findings,
      evaluation.lessonsLearned,
      evaluation.recommendations,
      evaluation.submittedBy?.name || evaluation.submittedBy?.email,
      evaluation.createdAt?.toISOString()
    ])
  ];

  sendCsv(res, 'jdpcmeris-evaluations.csv', rows);
}

export async function exportIndicatorsCsv(req, res) {
  const projectIds = await scopedProjectIds(req);
  const indicators = await Indicator.find({ project: { $in: projectIds } })
    .populate('project', 'projectCode projectName status approvalStage trafficLight')
    .populate('updatedBy', 'name email')
    .sort({ updatedAt: -1 });

  const rows = [
    ['Project Code', 'Project Name', 'Project Status', 'Approval Stage', 'Traffic Light', 'Level', 'Code', 'Name', 'Description', 'Unit', 'Baseline', 'Target', 'Actual', 'Achievement %', 'Indicator Status', 'Updated By', 'Updated At'],
    ...indicators.map((indicator) => [
      ...projectColumns(indicator),
      indicator.level,
      indicator.code,
      indicator.name,
      indicator.description,
      indicator.unit,
      indicator.baseline,
      indicator.target,
      indicator.actual,
      indicator.achievementPercentage,
      indicator.status,
      indicator.updatedBy?.name || indicator.updatedBy?.email,
      indicator.updatedAt?.toISOString()
    ])
  ];

  sendCsv(res, 'jdpcmeris-indicators.csv', rows);
}

export async function exportFinancialsCsv(req, res) {
  const projectIds = await scopedProjectIds(req);
  const projects = await Project.find({ _id: { $in: projectIds } })
    .select('projectCode projectName status approvalStage trafficLight budget')
    .sort({ projectCode: 1 });
  const transactions = await FinancialTransaction.find({ project: { $in: projectIds } })
    .populate('project', 'projectCode projectName status approvalStage trafficLight')
    .populate('recordedBy', 'name email')
    .sort({ transactionDate: -1 });
  const projectFinance = new Map(projects.map((project) => [project._id.toString(), {
    project,
    budgetAdjustments: 0,
    disbursements: 0,
    expenditures: 0
  }]));

  for (const transaction of transactions) {
    const projectId = transaction.project?._id?.toString() || transaction.project?.toString();
    const summary = projectFinance.get(projectId);
    if (!summary) continue;
    if (transaction.type === 'Budget') summary.budgetAdjustments += transaction.amount || 0;
    if (transaction.type === 'Disbursement') summary.disbursements += transaction.amount || 0;
    if (transaction.type === 'Expenditure') summary.expenditures += transaction.amount || 0;
  }

  const rows = [
    ['Project Finance Summary'],
    ['Project Code', 'Project Name', 'Project Status', 'Approval Stage', 'Traffic Light', 'Original Budget', 'Budget Adjustments', 'Available Budget', 'Disbursed', 'Spent', 'Balance', 'Over Budget', 'Utilization %'],
    ...[...projectFinance.values()].map((summary) => {
      const availableBudget = (summary.project.budget || 0) + summary.budgetAdjustments;
      const balance = Math.max(availableBudget - summary.expenditures, 0);
      const overBudget = Math.max(summary.expenditures - availableBudget, 0);
      const utilization = availableBudget > 0 ? Math.round((summary.expenditures / availableBudget) * 100) : 0;

      return [
        summary.project.projectCode,
        summary.project.projectName,
        summary.project.status,
        summary.project.approvalStage,
        summary.project.trafficLight,
        summary.project.budget,
        summary.budgetAdjustments,
        availableBudget,
        summary.disbursements,
        summary.expenditures,
        balance,
        overBudget,
        utilization
      ];
    }),
    [],
    ['Financial Transaction Register'],
    ['Project Code', 'Project Name', 'Project Status', 'Approval Stage', 'Traffic Light', 'Type', 'Amount', 'Currency', 'Transaction Date', 'Funding Source', 'Description', 'Recorded By', 'Created At'],
    ...transactions.map((transaction) => [
      ...projectColumns(transaction),
      transaction.type,
      transaction.amount,
      transaction.currency,
      transaction.transactionDate?.toISOString().slice(0, 10),
      transaction.fundingSource,
      transaction.description,
      transaction.recordedBy?.name || transaction.recordedBy?.email,
      transaction.createdAt?.toISOString()
    ])
  ];

  sendCsv(res, 'jdpcmeris-financials.csv', rows);
}

export async function exportDocumentsCsv(req, res) {
  const projectIds = await scopedProjectIds(req);
  const documents = await Document.find({ project: { $in: projectIds } })
    .populate('project', 'projectCode projectName status approvalStage trafficLight')
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  const rows = [
    ['Project Code', 'Project Name', 'Project Status', 'Approval Stage', 'Traffic Light', 'Title', 'Category', 'File Name', 'MIME Type', 'Storage Type', 'Storage Key', 'Uploaded By', 'Uploaded At'],
    ...documents.map((document) => [
      ...projectColumns(document),
      document.title,
      document.category,
      document.fileName,
      document.mimeType,
      document.storageType,
      document.storageKey,
      document.uploadedBy?.name || document.uploadedBy?.email,
      document.createdAt?.toISOString()
    ])
  ];

  sendCsv(res, 'jdpcmeris-documents.csv', rows);
}

export async function exportWorkflowCsv(req, res) {
  const projects = await Project.find(buildProjectExportFilter(req))
    .populate('ministry supportingMinistries donor partner locations.region locations.district')
    .sort({ updatedAt: -1 });

  const rows = [
    ['Project Code', 'Project Name', 'Lead Ministry', 'Supporting Ministries', 'Donor', 'Partner', 'Status', 'Approval Stage', 'Visibility', 'Physical %', 'Financial %', 'Timeline %', 'Traffic Light', 'Region', 'District', 'Updated At'],
    ...projects.map((project) => [
        project.projectCode,
        project.projectName,
        project.ministry?.name,
        project.supportingMinistries?.map((ministry) => ministry.name).join('; '),
        project.donor?.name,
        project.partner?.organizationName,
        project.status,
        project.approvalStage,
        project.visibility,
        project.physicalProgress,
        project.financialProgress,
        project.timelineProgress,
        project.trafficLight,
        locationNames(project.locations, 'region'),
        locationNames(project.locations, 'district'),
        project.updatedAt?.toISOString()
      ])
  ];

  sendCsv(res, 'jdpcmeris-workflow.csv', rows);
}
