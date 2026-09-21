// import { Project } from '../models/Project.js';
// import { NGOApplication } from '../models/NGOApplication.js';
// import NumberSequence from '../models/NumberSequence.js';

// import {
//   deleteStoredOrganizationApplicationFile,
//   storeOrganizationApplicationFile,
// } from '../services/fileStorageService.js';

// function escapeRegex(value) {
//   return String(value).replace(
//     /[.*+?^${}()|[\]\\]/g,
//     '\\$&'
//   );
// }

// function escapeCsv(value) {
//   if (
//     value === null ||
//     value === undefined
//   ) {
//     return '';
//   }

//   const text =
//     String(value);

//   return /[",\n]/.test(text)
//     ? `"${text.replace(/"/g, '""')}"`
//     : text;
// }

// function locationNames(
//   locations = [],
//   field
// ) {
//   return locations
//     .map(
//       (location) =>
//         location[field]?.name
//     )
//     .filter(Boolean)
//     .join('; ');
// }

// function villageNames(
//   locations = []
// ) {
//   return locations
//     .map(
//       (location) =>
//         location.village
//     )
//     .filter(Boolean)
//     .join('; ');
// }

// function buildPublicProjectQuery(
//   req
// ) {
//   const query = {
//     visibility: 'public',

//     status: {
//       $in: [
//         'Approved',
//         'Implementation',
//         'Monitoring',
//         'Completed',
//       ],
//     },
//   };

//   if (req.query.status) {
//     query.status =
//       req.query.status;
//   }

//   if (req.query.region) {
//     query['locations.region'] =
//       req.query.region;
//   }

//   if (req.query.district) {
//     query['locations.district'] =
//       req.query.district;
//   }

//   if (req.query.q) {
//     const pattern =
//       new RegExp(
//         escapeRegex(
//           req.query.q
//         ),
//         'i'
//       );

//     query.$or = [
//       {
//         projectName:
//           pattern,
//       },

//       {
//         projectCode:
//           pattern,
//       },

//       {
//         description:
//           pattern,
//       },

//       {
//         sector:
//           pattern,
//       },
//     ];
//   }

//   return query;
// }

// function publicProjectQuery(
//   req
// ) {
//   return Project.find(
//     buildPublicProjectQuery(
//       req
//     )
//   )
//     .select(
//       'projectName projectCode description sector status physicalProgress timelineProgress beneficiaries locations ministry supportingMinistries donor updatedAt'
//     )

//     .populate(
//       'locations.region locations.district ministry supportingMinistries donor'
//     )

//     .sort({
//       updatedAt: -1,
//     });
// }

// function normalizeStringArray(
//   values = []
// ) {
//   if (
//     !Array.isArray(values)
//   ) {
//     return [];
//   }

//   return [
//     ...new Set(
//       values
//         .map(
//           (value) =>
//             String(
//               value || ''
//             ).trim()
//         )
//         .filter(Boolean)
//     ),
//   ];
// }

// function parseStringArrayField(
//   value
// ) {
//   if (
//     Array.isArray(value)
//   ) {
//     return normalizeStringArray(
//       value
//     );
//   }

//   if (
//     value === null ||
//     value === undefined ||
//     value === ''
//   ) {
//     return [];
//   }

//   const text =
//     String(value).trim();

//   if (!text) {
//     return [];
//   }

//   try {
//     const parsed =
//       JSON.parse(text);

//     if (
//       Array.isArray(parsed)
//     ) {
//       return normalizeStringArray(
//         parsed
//       );
//     }
//   } catch {
//     // If the value is not JSON,
//     // fall back to comma-separated text.
//   }

//   return normalizeStringArray(
//     text
//       .split(',')
//       .map(
//         (item) =>
//           item.trim()
//       )
//   );
// }

// async function generateOrganizationApplicationNumber() {
//   const year =
//     new Date().getFullYear();

//   const sequence =
//     await NumberSequence.getNextValue(
//       `ORGANIZATION-APPLICATION-${year}`
//     );

//   return `JAIMS-ORG-${year}-${String(
//     sequence
//   ).padStart(6, '0')}`;
// }

// const organizationDocumentDefinitions =
//   [
//     {
//       key:
//         'registrationCertificate',

//       label:
//         'Registration Certificate',

//       required:
//         true,
//     },

//     {
//       key:
//         'constitution',

//       label:
//         'Constitution / Bylaws',

//       required:
//         true,
//     },

//     {
//       key:
//         'organizationProfile',

//       label:
//         'Organization Profile',

//       required:
//         true,
//     },

//     {
//       key:
//         'leadershipList',

//       label:
//         'Leadership / Board List',

//       required:
//         true,
//     },

//     {
//       key:
//         'otherSupportingDocument',

//       label:
//         'Other Supporting Document',

//       required:
//         false,
//     },
//   ];

// function getUploadedFile(
//   req,
//   fieldName
// ) {
//   const files =
//     req.files?.[fieldName];

//   if (
//     !Array.isArray(files) ||
//     files.length === 0
//   ) {
//     return null;
//   }

//   return files[0];
// }

// function getMissingRequiredDocuments(
//   req
// ) {
//   return organizationDocumentDefinitions
//     .filter(
//       (definition) =>
//         definition.required &&
//         !getUploadedFile(
//           req,
//           definition.key
//         )
//     )
//     .map(
//       (definition) =>
//         definition.label
//     );
// }

// export async function listPublicProjects(
//   req,
//   res
// ) {
//   const data =
//     await publicProjectQuery(
//       req
//     );

//   return res.json({
//     data,
//   });
// }

// export async function exportPublicProjectsCsv(
//   req,
//   res
// ) {
//   const projects =
//     await publicProjectQuery(
//       req
//     );

//   const rows = [
//     [
//       'Project Code',
//       'Project Name',
//       'Sector',
//       'Status',
//       'Ministry',
//       'Donor',
//       'Region',
//       'District',
//       'Village',
//       'Physical Progress',
//       'Timeline Progress',
//       'Beneficiaries',
//       'Updated At',
//     ],

//     ...projects.map(
//       (project) => [
//         project.projectCode,
//         project.projectName,
//         project.sector,
//         project.status,
//         project.ministry?.name,
//         project.donor?.name,

//         locationNames(
//           project.locations,
//           'region'
//         ),

//         locationNames(
//           project.locations,
//           'district'
//         ),

//         villageNames(
//           project.locations
//         ),

//         project.physicalProgress,

//         project.timelineProgress,

//         project.beneficiaries
//           ?.individuals,

//         project.updatedAt
//           ?.toISOString(),
//       ]
//     ),
//   ];

//   res.setHeader(
//     'Content-Type',
//     'text/csv'
//   );

//   res.setHeader(
//     'Content-Disposition',
//     'attachment; filename="jdpcmeris-public-projects.csv"'
//   );

//   return res.send(
//     rows
//       .map(
//         (row) =>
//           row
//             .map(escapeCsv)
//             .join(',')
//       )
//       .join('\n')
//   );
// }

// export async function submitOrganizationApplication(
//   req,
//   res
// ) {
//   const {
//     organizationType,
//     organizationName,
//     establishmentDate,
//     registrationCountry,

//     organizationEmail,
//     organizationPhone,
//     organizationAddress,
//     website,

//     applicantFullName,
//     applicantEmail,
//     applicantPhone,
//     applicantAddress,
//     passportNumber,

//     primarySector,
//     activityAreas,
//   } = req.body;

//   if (!organizationType) {
//     return res.status(400).json({
//       message:
//         'Organization type is required.',
//     });
//   }

//   if (
//     !organizationName?.trim()
//   ) {
//     return res.status(400).json({
//       message:
//         'Organization name is required.',
//     });
//   }

//   if (!establishmentDate) {
//     return res.status(400).json({
//       message:
//         'Establishment date is required.',
//     });
//   }

//   if (
//     !organizationEmail?.trim() ||
//     !organizationPhone?.trim() ||
//     !organizationAddress?.trim()
//   ) {
//     return res.status(400).json({
//       message:
//         'Organization email, phone and address are required.',
//     });
//   }

//   if (
//     !applicantFullName?.trim() ||
//     !applicantEmail?.trim() ||
//     !applicantPhone?.trim() ||
//     !applicantAddress?.trim()
//   ) {
//     return res.status(400).json({
//       message:
//         'Applicant name, email, phone and address are required.',
//     });
//   }

//   const allowedOrganizationTypes =
//     [
//       'Local NGO',
//       'International NGO',
//       'Consultant',
//       'Civil Society Organization',
//       'Community Based Organization',
//       'Network',
//       'Association',
//     ];

//   if (
//     !allowedOrganizationTypes.includes(
//       organizationType
//     )
//   ) {
//     return res.status(400).json({
//       message:
//         'Invalid organization type.',
//     });
//   }

//   const parsedEstablishmentDate =
//     new Date(
//       establishmentDate
//     );

//   if (
//     Number.isNaN(
//       parsedEstablishmentDate.getTime()
//     )
//   ) {
//     return res.status(400).json({
//       message:
//         'Invalid establishment date.',
//     });
//   }

//   const missingRequiredDocuments =
//     getMissingRequiredDocuments(
//       req
//     );

//   if (
//     missingRequiredDocuments.length >
//     0
//   ) {
//     return res.status(422).json({
//       message:
//         `The following required supporting documents are missing: ${missingRequiredDocuments.join(', ')}.`,
//     });
//   }

//   const sectors =
//     parseStringArrayField(
//       req.body.sectors
//     );

//   const normalizedSectors =
//     normalizeStringArray([
//       primarySector,
//       ...sectors,
//     ]);

//   const normalizedActivityAreas =
//     Array.isArray(
//       activityAreas
//     )
//       ? normalizeStringArray(
//           activityAreas
//         )
//       : String(
//           activityAreas || ''
//         )
//           .split(',')
//           .map(
//             (value) =>
//               value.trim()
//           )
//           .filter(Boolean);

//   const applicationNumber =
//     await generateOrganizationApplicationNumber();

//   const storedDocuments =
//     [];

//   try {
//     for (
//       const definition
//       of organizationDocumentDefinitions
//     ) {
//       const file =
//         getUploadedFile(
//           req,
//           definition.key
//         );

//       if (!file) {
//         continue;
//       }

//       const storedFile =
//         await storeOrganizationApplicationFile(
//           {
//             applicationNumber,

//             documentType:
//               definition.key,

//             file,
//           }
//         );

//       storedDocuments.push({
//         documentType:
//           definition.key,

//         label:
//           definition.label,

//         fileName:
//           storedFile.fileName,

//         mimeType:
//           storedFile.mimeType,

//         storageType:
//           storedFile.storageType,

//         storageKey:
//           storedFile.key,

//         url:
//           storedFile.url,

//         uploadedAt:
//           new Date(),
//       });
//     }

//     const now =
//       new Date();

//     const application =
//       await NGOApplication.create({
//         applicationNumber,

//         applicationType:
//           'New Registration',

//         organizationName:
//           organizationName.trim(),

//         organizationType,

//         establishmentDate:
//           parsedEstablishmentDate,

//         registrationCountry:
//           registrationCountry?.trim() ||
//           'Somalia',

//         applicant: {
//           fullName:
//             applicantFullName.trim(),

//           email:
//             applicantEmail.trim(),

//           phone:
//             applicantPhone.trim(),

//           address:
//             applicantAddress.trim(),

//           passportNumber:
//             passportNumber?.trim() ||
//             undefined,
//         },

//         organizationContact: {
//           email:
//             organizationEmail.trim(),

//           phone:
//             organizationPhone.trim(),

//           address:
//             organizationAddress.trim(),

//           website:
//             website?.trim() ||
//             undefined,
//         },

//         sectors:
//           normalizedSectors,

//         activityAreas:
//           normalizedActivityAreas,

//         /*
//          * Operational locations remain intentionally
//          * excluded until the public website is connected
//          * to existing Region/District ObjectIds.
//          */

//         supportingDocuments:
//           storedDocuments,

//         status:
//           'Submitted',

//         approvalStage:
//           'Submitted',

//         submittedAt:
//           now,

//         workflowHistory: [
//           {
//             action:
//               'Application Submitted',

//             note:
//               'Organization registration application submitted through the public JAIMS portal with supporting documents.',

//             fromStatus:
//               'Draft',

//             toStatus:
//               'Submitted',

//             fromStage:
//               'Draft',

//             toStage:
//               'Submitted',

//             actedAt:
//               now,
//           },
//         ],
//       });

//     return res.status(201).json({
//       message:
//         'Organization registration application submitted successfully.',

//       data: {
//         id:
//           application._id,

//         applicationNumber:
//           application.applicationNumber,

//         organizationName:
//           application.organizationName,

//         organizationType:
//           application.organizationType,

//         status:
//           application.status,

//         approvalStage:
//           application.approvalStage,

//         submittedAt:
//           application.submittedAt,

//         supportingDocumentCount:
//           application.supportingDocuments
//             .length,
//       },
//     });
//   } catch (error) {
//     /*
//      * If any later storage/database operation fails,
//      * remove files that were already stored so that
//      * we do not leave orphaned documents behind.
//      */
//     for (
//       const storedDocument
//       of storedDocuments
//     ) {
//       try {
//         await deleteStoredOrganizationApplicationFile(
//           {
//             storageType:
//               storedDocument.storageType,

//             storageKey:
//               storedDocument.storageKey,
//           }
//         );
//       } catch (
//         cleanupError
//       ) {
//         console.warn(
//           `Unable to clean up organization application file ${storedDocument.storageKey}: ${cleanupError.message}`
//         );
//       }
//     }

//     throw error;
//   }
// }

// /**
//  * @desc    Publicly track an organization registration application
//  * @route   GET /api/v1/public/organization-applications/:applicationNumber
//  * @access  Public
//  */
// export async function trackOrganizationApplication(
//   req,
//   res
// ) {
//   const applicationNumber =
//     String(
//       req.params
//         .applicationNumber ||
//         ''
//     )
//       .trim()
//       .toUpperCase();

//   if (!applicationNumber) {
//     return res.status(400).json({
//       message:
//         'Application number is required.',
//     });
//   }

//   const application =
//     await NGOApplication.findOne(
//       {
//         applicationNumber,
//       }
//     )
//       .select(
//         [
//           'applicationNumber',
//           'applicationType',
//           'organizationName',
//           'organizationType',
//           'status',
//           'approvalStage',
//           'submittedAt',
//           'reviewedAt',
//           'approvedAt',
//           'rejectedAt',
//         ].join(' ')
//       )
//       .lean();

//   if (!application) {
//     return res.status(404).json({
//       message:
//         'Organization application not found.',
//     });
//   }

//   return res.status(200).json({
//     data: {
//       applicationNumber:
//         application.applicationNumber,

//       applicationType:
//         application.applicationType,

//       organizationName:
//         application.organizationName,

//       organizationType:
//         application.organizationType,

//       status:
//         application.status,

//       approvalStage:
//         application.approvalStage,

//       submittedAt:
//         application.submittedAt,

//       reviewedAt:
//         application.reviewedAt,

//       approvedAt:
//         application.approvedAt,

//       rejectedAt:
//         application.rejectedAt,
//     },
//   });
// }


import { Project } from '../models/Project.js';
import { OrganizationApplication } from '../models/OrganizationApplication.js';
import NGOCertificate from '../models/NGOCertificate.js';
import NumberSequence from '../models/NumberSequence.js';

/**
 * @desc    Publicly verify an approved organization registration
 * @route   GET /api/v1/public/organization-registry/:jaimsNumber
 * @access  Public
 */
export async function verifyPublicOrganizationRegistration(
  req,
  res
) {
  const certificateNumber =
    String(
      req.params.certificateNumber ||
        ''
    )
      .trim()
      .toUpperCase();

  if (!certificateNumber) {
    return res
      .status(400)
      .json({
        message:
          'Certificate number is required.',
      });
  }

  const validFormat =
    /^CERT-\d{4}-\d{6}$/.test(
      certificateNumber
    );

  if (!validFormat) {
    return res
      .status(400)
      .json({
        message:
          'Invalid certificate number. Example: CERT-2026-000001',
      });
  }

  const certificate =
    await NGOCertificate.findOne({
      certificateNumber,
    })
      .select(
        [
          'certificateNumber',
          'organizationSnapshot',
          'issueDate',
          'expiryDate',
          'status',
        ].join(' ')
      )
      .lean();

  if (!certificate) {
    return res
      .status(404)
      .json({
        message:
          'No approved organization registration was found for this certificate number.',
      });
  }

  const expiryDate =
    certificate.expiryDate
      ? new Date(
          certificate.expiryDate
        )
      : null;

  const hasExpired =
    expiryDate &&
    !Number.isNaN(
      expiryDate.getTime()
    ) &&
    expiryDate.getTime() <
      Date.now();

  let publicStatus =
    'EXPIRED';

  if (
    certificate.status ===
    'Suspended'
  ) {
    publicStatus =
      'SUSPENDED';
  } else if (
    certificate.status ===
    'Revoked'
  ) {
    publicStatus =
      'REVOKED';
  } else if (
    certificate.status ===
    'Active' &&
    !hasExpired
  ) {
    publicStatus =
      'VALID';
  }

  return res
    .status(200)
    .json({
      data: {
        organizationName:
          certificate
            .organizationSnapshot
            ?.organizationName ||
          '—',

        certificateNumber:
          certificate.certificateNumber,

        issueDate:
          certificate.issueDate,

        expiryDate:
          certificate.expiryDate,

        status:
          publicStatus,
      },
    });
}
import {
  deleteStoredOrganizationApplicationFile,
  deleteStoredOrganizationPaymentReceipt,
  storeOrganizationApplicationFile,
  storeOrganizationPaymentReceipt,
} from '../services/fileStorageService.js';

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

function escapeCsv(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  const text =
    String(value);

  return /[",\n]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

function locationNames(
  locations = [],
  field
) {
  return locations
    .map(
      (location) =>
        location[field]?.name
    )
    .filter(Boolean)
    .join('; ');
}

function villageNames(
  locations = []
) {
  return locations
    .map(
      (location) =>
        location.village
    )
    .filter(Boolean)
    .join('; ');
}

function buildPublicProjectQuery(
  req
) {
  const query = {
    visibility: 'public',

    status: {
      $in: [
        'Approved',
        'Implementation',
        'Monitoring',
        'Completed',
      ],
    },
  };

  if (req.query.status) {
    query.status =
      req.query.status;
  }

  if (req.query.region) {
    query['locations.region'] =
      req.query.region;
  }

  if (req.query.district) {
    query['locations.district'] =
      req.query.district;
  }

  if (req.query.q) {
    const pattern =
      new RegExp(
        escapeRegex(
          req.query.q
        ),
        'i'
      );

    query.$or = [
      {
        projectName:
          pattern,
      },

      {
        projectCode:
          pattern,
      },

      {
        description:
          pattern,
      },

      {
        sector:
          pattern,
      },
    ];
  }

  return query;
}

function publicProjectQuery(
  req
) {
  return Project.find(
    buildPublicProjectQuery(
      req
    )
  )
    .select(
      'projectName projectCode description sector status physicalProgress timelineProgress beneficiaries locations ministry supportingMinistries donor updatedAt'
    )

    .populate(
      'locations.region locations.district ministry supportingMinistries donor'
    )

    .sort({
      updatedAt: -1,
    });
}

function normalizeStringArray(
  values = []
) {
  if (
    !Array.isArray(values)
  ) {
    return [];
  }

  return [
    ...new Set(
      values
        .map(
          (value) =>
            String(
              value || ''
            ).trim()
        )
        .filter(Boolean)
    ),
  ];
}

function parseStringArrayField(
  value
) {
  if (
    Array.isArray(value)
  ) {
    return normalizeStringArray(
      value
    );
  }

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return [];
  }

  const text =
    String(value).trim();

  if (!text) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(text);

    if (
      Array.isArray(parsed)
    ) {
      return normalizeStringArray(
        parsed
      );
    }
  } catch {
    // Fall back to comma-separated text.
  }

  return normalizeStringArray(
    text
      .split(',')
      .map(
        (item) =>
          item.trim()
      )
  );
}

async function generateOrganizationApplicationNumber() {
  const year =
    new Date().getFullYear();

  const sequence =
    await NumberSequence.getNextValue(
      `ORGANIZATION-APPLICATION-${year}`
    );

  return `JAIMS-ORG-${year}-${String(
    sequence
  ).padStart(6, '0')}`;
}

const organizationDocumentDefinitions =
  [
    {
  key:
    'registrationCertificate',

  label:
    'Registration Certificate',

  required:
    false,
},

    {
      key:
        'constitution',

      label:
        'Constitution / Bylaws',

      required:
        true,
    },

    {
      key:
        'organizationProfile',

      label:
        'Organization Profile',

      required:
        true,
    },

    {
      key:
        'leadershipList',

      label:
        'Leadership / Board List',

      required:
        true,
    },

    {
      key:
        'otherSupportingDocument',

      label:
        'Other Supporting Document',

      required:
        false,
    },
  ];

function getUploadedFile(
  req,
  fieldName
) {
  const files =
    req.files?.[fieldName];

  if (
    !Array.isArray(files) ||
    files.length === 0
  ) {
    return null;
  }

  return files[0];
}

function getMissingRequiredDocuments(
  req
) {
  return organizationDocumentDefinitions
    .filter(
      (definition) =>
        definition.required &&
        !getUploadedFile(
          req,
          definition.key
        )
    )
    .map(
      (definition) =>
        definition.label
    );
}

export async function listPublicProjects(
  req,
  res
) {
  const data =
    await publicProjectQuery(
      req
    );

  return res.json({
    data,
  });
}

export async function exportPublicProjectsCsv(
  req,
  res
) {
  const projects =
    await publicProjectQuery(
      req
    );

  const rows = [
    [
      'Project Code',
      'Project Name',
      'Sector',
      'Status',
      'Ministry',
      'Donor',
      'Region',
      'District',
      'Village',
      'Physical Progress',
      'Timeline Progress',
      'Beneficiaries',
      'Updated At',
    ],

    ...projects.map(
      (project) => [
        project.projectCode,
        project.projectName,
        project.sector,
        project.status,
        project.ministry?.name,
        project.donor?.name,

        locationNames(
          project.locations,
          'region'
        ),

        locationNames(
          project.locations,
          'district'
        ),

        villageNames(
          project.locations
        ),

        project.physicalProgress,

        project.timelineProgress,

        project.beneficiaries
          ?.individuals,

        project.updatedAt
          ?.toISOString(),
      ]
    ),
  ];

  res.setHeader(
    'Content-Type',
    'text/csv'
  );

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="jdpcmeris-public-projects.csv"'
  );

  return res.send(
    rows
      .map(
        (row) =>
          row
            .map(escapeCsv)
            .join(',')
      )
      .join('\n')
  );
}

export async function submitOrganizationApplication(
  req,
  res
) {
  const {
  organizationType,
  organizationName,
  establishmentDate,
  registrationCountry,

  organizationEmail,
  organizationPhone,
  organizationAddress,
  website,

  applicantFullName,
  applicantEmail,
  applicantPhone,
  applicantAddress,
  title,

  primarySector,
activityAreas,

jubalandOperationsStartDate,
activeProjectsInJubaland,
} = req.body;

  if (!organizationType) {
    return res.status(400).json({
      message:
        'Organization type is required.',
    });
  }

  if (
    !organizationName?.trim()
  ) {
    return res.status(400).json({
      message:
        'Organization name is required.',
    });
  }

  if (!establishmentDate) {
    return res.status(400).json({
      message:
        'Establishment date is required.',
    });
  }

  if (
    !organizationEmail?.trim() ||
    !organizationPhone?.trim() ||
    !organizationAddress?.trim()
  ) {
    return res.status(400).json({
      message:
        'Organization email, phone and address are required.',
    });
  }

  if (
    !applicantFullName?.trim() ||
    !applicantEmail?.trim() ||
    !applicantPhone?.trim() ||
    !applicantAddress?.trim()
  ) {
    return res.status(400).json({
      message:
        'Applicant name, email, phone and address are required.',
    });
  }

  const allowedOrganizationTypes =
    [
      'Local NGO',
      'International NGO',
      'Consultant',
      'Civil Society Organization',
      'Community Based Organization',
      'Network',
      'Association',
    ];

  if (
    !allowedOrganizationTypes.includes(
      organizationType
    )
  ) {
    return res.status(400).json({
      message:
        'Invalid organization type.',
    });
  }

  const parsedEstablishmentDate =
    new Date(
      establishmentDate
    );

  if (
    Number.isNaN(
      parsedEstablishmentDate.getTime()
    )
  ) {
    return res.status(400).json({
      message:
        'Invalid establishment date.',
    });
  }

  const missingRequiredDocuments =
    getMissingRequiredDocuments(
      req
    );

  if (
    missingRequiredDocuments.length >
    0
  ) {
    return res.status(422).json({
      message:
        `The following required supporting documents are missing: ${missingRequiredDocuments.join(', ')}.`,
    });
  }

  const sectors =
    parseStringArrayField(
      req.body.sectors
    );

  const normalizedSectors =
    normalizeStringArray([
      primarySector,
      ...sectors,
    ]);

  const normalizedActivityAreas =
    Array.isArray(
      activityAreas
    )
      ? normalizeStringArray(
          activityAreas
        )
      : String(
          activityAreas || ''
        )
          .split(',')
          .map(
            (value) =>
              value.trim()
          )
          .filter(Boolean);

  const applicationNumber =
    await generateOrganizationApplicationNumber();

  const storedDocuments =
    [];

  try {
    for (
      const definition
      of organizationDocumentDefinitions
    ) {
      const file =
        getUploadedFile(
          req,
          definition.key
        );

      if (!file) {
        continue;
      }

      const storedFile =
        await storeOrganizationApplicationFile(
          {
            applicationNumber,

            documentType:
              definition.key,

            file,
          }
        );

      storedDocuments.push({
        documentType:
          definition.key,

        label:
          definition.label,

        fileName:
          storedFile.fileName,

        mimeType:
          storedFile.mimeType,

        storageType:
          storedFile.storageType,

        storageKey:
          storedFile.key,

        url:
          storedFile.url,

        uploadedAt:
          new Date(),
      });
    }

    const now =
      new Date();

    const application =
  await OrganizationApplication.create({
    applicationNumber,

    applicationType:
      'New Registration',

    createdBy:
      req.user?._id,

    updatedBy:
      req.user?._id,

    organizationName:
      organizationName.trim(),

        organizationType,

        establishmentDate:
          parsedEstablishmentDate,

        registrationCountry:
          registrationCountry?.trim() ||
          'Somalia',

       applicant: {
  fullName:
    applicantFullName.trim(),

  email:
    applicantEmail.trim(),

  phone:
    applicantPhone.trim(),

  address:
    applicantAddress.trim(),

  title:
    title?.trim() ||
    undefined,
},
createdBy:
  req.user?._id ||
  req.user?.id ||
  undefined,

updatedBy:
  req.user?._id ||
  req.user?.id ||
  undefined,
        organizationContact: {
          email:
            organizationEmail.trim(),

          phone:
            organizationPhone.trim(),

          address:
            organizationAddress.trim(),

          website:
            website?.trim() ||
            undefined,
        },

        sectors:
          normalizedSectors,

      activityAreas:
  normalizedActivityAreas,

jubalandOperationsStartDate:
  jubalandOperationsStartDate
    ? new Date(
        jubalandOperationsStartDate
      )
    : undefined,

activeProjectsInJubaland:
  activeProjectsInJubaland !==
    undefined &&
  activeProjectsInJubaland !==
    ''
    ? Number(
        activeProjectsInJubaland
      )
    : undefined,

        supportingDocuments:
          storedDocuments,

        status:
          'Submitted',

        approvalStage:
          'Submitted',

        submittedAt:
          now,

        workflowHistory: [
          {
            action:
              'Application Submitted',

            note:
              'Organization registration application submitted through the public JAIMS portal with supporting documents.',

            fromStatus:
              'Draft',

            toStatus:
              'Submitted',

            fromStage:
              'Draft',

            toStage:
              'Submitted',

            actedAt:
              now,
          },
        ],
      });

    return res.status(201).json({
      message:
        'Organization registration application submitted successfully.',

      data: {
        id:
          application._id,

        applicationNumber:
          application.applicationNumber,

        organizationName:
          application.organizationName,

        organizationType:
          application.organizationType,

        status:
          application.status,

        approvalStage:
          application.approvalStage,

        submittedAt:
          application.submittedAt,

        supportingDocumentCount:
          application.supportingDocuments
            .length,
      },
    });
  } catch (error) {
    for (
      const storedDocument
      of storedDocuments
    ) {
      try {
        await deleteStoredOrganizationApplicationFile(
          {
            storageType:
              storedDocument.storageType,

            storageKey:
              storedDocument.storageKey,
          }
        );
      } catch (
        cleanupError
      ) {
        console.warn(
          `Unable to clean up organization application file ${storedDocument.storageKey}: ${cleanupError.message}`
        );
      }
    }

    throw error;
  }
}

/**
 * @desc    Submit registration fee payment proof
 * @route   POST /api/v1/public/organization-applications/:applicationNumber/payment
 * @access  Public
 */
export async function submitOrganizationPayment(
  req,
  res
) {
  const applicationNumber =
    String(
      req.params.applicationNumber ||
        ''
    )
      .trim()
      .toUpperCase();

  const paymentReference =
    String(
      req.body.paymentReference ||
        ''
    ).trim();

  const paymentDateValue =
    req.body.paymentDate;

  const receipt =
    req.file;

  if (!applicationNumber) {
    return res.status(400).json({
      message:
        'Application number is required.',
    });
  }

  if (!paymentReference) {
    return res.status(400).json({
      message:
        'Payment reference / transaction ID is required.',
    });
  }

  if (!paymentDateValue) {
    return res.status(400).json({
      message:
        'Payment date is required.',
    });
  }

  const paymentDate =
    new Date(
      paymentDateValue
    );

  if (
    Number.isNaN(
      paymentDate.getTime()
    )
  ) {
    return res.status(400).json({
      message:
        'Invalid payment date.',
    });
  }

  if (!receipt) {
    return res.status(422).json({
      message:
        'Payment receipt is required.',
    });
  }

  const application =
    await OrganizationApplication.findOne({
      applicationNumber,
    });

  if (!application) {
    return res.status(404).json({
      message:
        'Organization application not found.',
    });
  }

  if (
    application.status !==
      'Under Review' ||
    application.approvalStage !==
      'Awaiting Registration Fee'
  ) {
    return res.status(409).json({
      message:
        'Payment proof can only be submitted when the application is awaiting the registration fee.',

      data: {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        paymentStatus:
          application.registrationFee
            ?.paymentStatus,
      },
    });
  }

  const currentPaymentStatus =
    application.registrationFee
      ?.paymentStatus ||
    'Pending';

  if (
    ![
      'Pending',
      'Rejected',
    ].includes(
      currentPaymentStatus
    )
  ) {
    return res.status(409).json({
      message:
        'Payment proof has already been submitted or verified for this application.',

      data: {
        paymentStatus:
          currentPaymentStatus,
      },
    });
  }

  const previousReceipt = {
    storageType:
      application.registrationFee
        ?.receiptStorageType,

    storageKey:
      application.registrationFee
        ?.receiptStorageKey,
  };

  let storedReceipt =
    null;

  try {
    storedReceipt =
      await storeOrganizationPaymentReceipt(
        {
          applicationNumber:
            application.applicationNumber,

          file:
            receipt,
        }
      );

    const now =
      new Date();

    application.registrationFee.paymentReference =
      paymentReference;

    application.registrationFee.paymentDate =
      paymentDate;

    application.registrationFee.receiptFileName =
      storedReceipt.fileName;

    application.registrationFee.receiptMimeType =
      storedReceipt.mimeType;

    application.registrationFee.receiptStorageType =
      storedReceipt.storageType;

    application.registrationFee.receiptStorageKey =
      storedReceipt.key;

    application.registrationFee.receiptUrl =
      storedReceipt.url;

    application.registrationFee.submittedForReviewAt =
      now;

    /*
     * Paid means proof has been submitted.
     * Ministry verification has NOT yet happened.
     */
    application.registrationFee.paymentStatus =
      'Paid';

    application.registrationFee.verifiedBy =
      undefined;

    application.registrationFee.verifiedAt =
      undefined;

    application.status =
      'Under Review';

    application.approvalStage =
      'Payment Verification';

    application.workflowHistory.push(
      {
        action:
          'Registration Fee Submitted for Review',

        note:
          `Applicant submitted payment proof for ${application.registrationFee.amount} ${application.registrationFee.currency}. Payment reference: ${paymentReference}.`,

        fromStatus:
          'Under Review',

        toStatus:
          'Under Review',

        fromStage:
          'Awaiting Registration Fee',

        toStage:
          'Payment Verification',

        actedAt:
          now,
      }
    );

    await application.save();

    if (
      previousReceipt.storageKey &&
      previousReceipt.storageKey !==
        storedReceipt.key
    ) {
      try {
        await deleteStoredOrganizationPaymentReceipt(
          {
            storageType:
              previousReceipt.storageType,

            storageKey:
              previousReceipt.storageKey,
          }
        );
      } catch (
        cleanupError
      ) {
        console.warn(
          `Unable to remove previous payment receipt ${previousReceipt.storageKey}: ${cleanupError.message}`
        );
      }
    }

    return res.status(200).json({
      message:
        'Payment proof submitted successfully. The payment is now awaiting Ministry review.',

      data: {
        applicationNumber:
          application.applicationNumber,

        status:
          application.status,

        approvalStage:
          application.approvalStage,

        registrationFee: {
          amount:
            application.registrationFee.amount,

          currency:
            application.registrationFee.currency,

          revenueCode:
            application.registrationFee.revenueCode,

          paymentReference:
            application.registrationFee.paymentReference,

          paymentDate:
            application.registrationFee.paymentDate,

          paymentStatus:
            application.registrationFee.paymentStatus,

          submittedForReviewAt:
            application.registrationFee.submittedForReviewAt,
        },
      },
    });
  } catch (error) {
    if (
      storedReceipt?.key
    ) {
      try {
        await deleteStoredOrganizationPaymentReceipt(
          {
            storageType:
              storedReceipt.storageType,

            storageKey:
              storedReceipt.key,
          }
        );
      } catch (
        cleanupError
      ) {
        console.warn(
          `Unable to clean up payment receipt ${storedReceipt.key}: ${cleanupError.message}`
        );
      }
    }

    throw error;
  }
}
export async function verifyOrganizationRevisionAccess(
  req,
  res
) {
  const applicationNumber =
    String(
      req.params.applicationNumber ||
      ''
    )
      .trim()
      .toUpperCase();

  const applicantEmail =
    String(
      req.body?.applicantEmail ||
      ''
    )
      .trim()
      .toLowerCase();

  const applicantPhone =
    String(
      req.body?.applicantPhone ||
      ''
    ).trim();


  if (!applicationNumber) {
    return res
      .status(400)
      .json({
        message:
          'Application number is required.',
      });
  }


  if (!applicantEmail) {
    return res
      .status(400)
      .json({
        message:
          'Applicant email is required.',
      });
  }


  if (!applicantPhone) {
    return res
      .status(400)
      .json({
        message:
          'Applicant phone is required.',
      });
  }


  const application =
    await OrganizationApplication.findOne({
      applicationNumber,
    })
      .select(
        [
          'applicationNumber',
'applicationType',
'organizationName',
'organizationType',
'establishmentDate',
'registrationCountry',
'organizationContact',
'applicant',
'sectors',
'activityAreas',
'jubalandOperationsStartDate',
'activeProjectsInJubaland',
'supportingDocuments',
'status',
'approvalStage',
'revisionReason',
'revisionRequestedAt',
        ].join(' ')
      )
      .lean();


  if (!application) {
    return res
      .status(404)
      .json({
        message:
          'Organization application not found.',
      });
  }


  if (
    application.status !==
      'Returned for Revision' ||
    application.approvalStage !==
      'Document Verification'
  ) {
    return res
      .status(409)
      .json({
        message:
          'This application is not currently available for revision.',

        data: {
          status:
            application.status,

          approvalStage:
            application.approvalStage,
        },
      });
  }


  const storedEmail =
    String(
      application.applicant?.email ||
      ''
    )
      .trim()
      .toLowerCase();

  const storedPhone =
    String(
      application.applicant?.phone ||
      ''
    ).trim();


  if (
    storedEmail !==
      applicantEmail ||
    storedPhone !==
      applicantPhone
  ) {
    return res
      .status(403)
      .json({
        message:
          'Applicant verification failed. Please confirm the email address and phone number used in the original application.',
      });
  }


  return res
    .status(200)
    .json({
      message:
        'Applicant verified successfully.',

      data: {
        applicationNumber:
          application.applicationNumber,

        applicationType:
          application.applicationType,

        organizationName:
          application.organizationName,

        organizationType:
          application.organizationType,

        establishmentDate:
          application.establishmentDate,

        registrationCountry:
          application.registrationCountry,

        organizationContact:
          application.organizationContact,

        applicant:
          application.applicant,

        sectors:
  application.sectors || [],

activityAreas:
  application.activityAreas || [],

jubalandOperationsStartDate:
  application.jubalandOperationsStartDate,

activeProjectsInJubaland:
  application.activeProjectsInJubaland,

supportingDocuments:
  application.supportingDocuments || [],

status:
  application.status,

approvalStage:
  application.approvalStage,

revisionReason:
  application.revisionReason,

revisionRequestedAt:
  application.revisionRequestedAt,
     },
    });
}
export async function resubmitOrganizationRevision(
  req,
  res
) {
  const applicationNumber =
    String(
      req.params.applicationNumber ||
      ''
    )
      .trim()
      .toUpperCase();

  const {
  organizationType,
  organizationName,
  establishmentDate,
  registrationCountry,

  organizationEmail,
  organizationPhone,
  organizationAddress,
  website,

  applicantFullName,
  applicantEmail,
  applicantPhone,
  applicantAddress,
 title,

 primarySector,
activityAreas,

operationalAddress,
jubalandOperationsStartDate,
activeProjectsInJubaland,

revisionAccessEmail,
revisionAccessPhone,
} = req.body;

  if (!applicationNumber) {
    return res
      .status(400)
      .json({
        message:
          'Application number is required.',
      });
  }


 const verificationEmail =
  String(
    revisionAccessEmail || ''
  )
    .trim()
    .toLowerCase();

const verificationPhone =
  String(
    revisionAccessPhone || ''
  ).trim();


  if (!verificationEmail) {
    return res
      .status(400)
      .json({
        message:
          'Applicant email is required.',
      });
  }


  if (!verificationPhone) {
    return res
      .status(400)
      .json({
        message:
          'Applicant phone is required.',
      });
  }


  const application =
    await OrganizationApplication.findOne({
      applicationNumber,
    });


  if (!application) {
    return res
      .status(404)
      .json({
        message:
          'Organization application not found.',
      });
  }


  if (
    application.status !==
      'Returned for Revision' ||
    application.approvalStage !==
      'Document Verification'
  ) {
    return res
      .status(409)
      .json({
        message:
          'This application is not currently available for revision.',

        data: {
          status:
            application.status,

          approvalStage:
            application.approvalStage,
        },
      });
  }


  const storedEmail =
    String(
      application.applicant?.email ||
      ''
    )
      .trim()
      .toLowerCase();

  const storedPhone =
    String(
      application.applicant?.phone ||
      ''
    ).trim();


  if (
    storedEmail !==
      verificationEmail ||
    storedPhone !==
      verificationPhone
  ) {
    return res
      .status(403)
      .json({
        message:
          'Applicant verification failed. Please confirm the email address and phone number used in the original application.',
      });
  }


  if (!organizationType) {
    return res
      .status(400)
      .json({
        message:
          'Organization type is required.',
      });
  }


  if (
    !organizationName?.trim()
  ) {
    return res
      .status(400)
      .json({
        message:
          'Organization name is required.',
      });
  }


  if (!establishmentDate) {
    return res
      .status(400)
      .json({
        message:
          'Establishment date is required.',
      });
  }


  if (
    !organizationEmail?.trim() ||
    !organizationPhone?.trim() ||
    !organizationAddress?.trim()
  ) {
    return res
      .status(400)
      .json({
        message:
          'Organization email, phone and address are required.',
      });
  }


 if (
  !applicantFullName?.trim() ||
  !applicantEmail?.trim() ||
  !applicantPhone?.trim() ||
  !applicantAddress?.trim()
) {
  return res
    .status(400)
    .json({
      message:
        'Applicant name, email, phone and address are required.',
    });
}


  const allowedOrganizationTypes =
    [
      'Local NGO',
      'International NGO',
      'Consultant',
      'Civil Society Organization',
      'Community Based Organization',
      'Network',
      'Association',
    ];


  if (
    !allowedOrganizationTypes.includes(
      organizationType
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          'Invalid organization type.',
      });
  }


  const parsedEstablishmentDate =
    new Date(
      establishmentDate
    );


  if (
    Number.isNaN(
      parsedEstablishmentDate.getTime()
    )
  ) {
    return res
      .status(400)
      .json({
        message:
          'Invalid establishment date.',
      });
  }


  const sectors =
    parseStringArrayField(
      req.body.sectors
    );

  const normalizedSectors =
    normalizeStringArray([
      primarySector,
      ...sectors,
    ]);


  const normalizedActivityAreas =
    Array.isArray(
      activityAreas
    )
      ? normalizeStringArray(
          activityAreas
        )
      : String(
          activityAreas || ''
        )
          .split(',')
          .map(
            (value) =>
              value.trim()
          )
          .filter(Boolean);


  const existingDocuments =
    Array.isArray(
      application.supportingDocuments
    )
      ? application.supportingDocuments
      : [];


  const missingRequiredDocuments =
    organizationDocumentDefinitions
      .filter(
        (definition) => {
          if (
            !definition.required
          ) {
            return false;
          }

          const existingDocument =
            existingDocuments.find(
              (document) =>
                document.documentType ===
                  definition.key
            );

          const replacementFile =
            getUploadedFile(
              req,
              definition.key
            );

          return (
            !existingDocument &&
            !replacementFile
          );
        }
      )
      .map(
        (definition) =>
          definition.label
      );


  if (
    missingRequiredDocuments.length >
    0
  ) {
    return res
      .status(422)
      .json({
        message:
          `The following required supporting documents are missing: ${missingRequiredDocuments.join(', ')}.`,
      });
  }


  const newlyStoredDocuments =
    [];

  const oldDocumentsToDelete =
    [];


  try {
    const updatedDocuments =
      [...existingDocuments];


    for (
      const definition
      of organizationDocumentDefinitions
    ) {
      const file =
        getUploadedFile(
          req,
          definition.key
        );


      if (!file) {
        continue;
      }


      const storedFile =
        await storeOrganizationApplicationFile(
          {
            applicationNumber,

            documentType:
              definition.key,

            file,
          }
        );


      const replacementDocument =
        {
          documentType:
            definition.key,

          label:
            definition.label,

          fileName:
            storedFile.fileName,

          mimeType:
            storedFile.mimeType,

          storageType:
            storedFile.storageType,

          storageKey:
            storedFile.key,

          url:
            storedFile.url,

          uploadedAt:
            new Date(),
        };


      newlyStoredDocuments.push(
        replacementDocument
      );


      const existingIndex =
        updatedDocuments.findIndex(
          (document) =>
            document.documentType ===
              definition.key
        );


      if (
        existingIndex >= 0
      ) {
        const oldDocument =
          updatedDocuments[
            existingIndex
          ];


        if (
          oldDocument?.storageKey
        ) {
          oldDocumentsToDelete.push({
            storageType:
              oldDocument.storageType,

            storageKey:
              oldDocument.storageKey,
          });
        }


        updatedDocuments[
          existingIndex
        ] =
          replacementDocument;

      } else {
        updatedDocuments.push(
          replacementDocument
        );
      }
    }


    const now =
      new Date();

    const previousStatus =
      application.status;

    const previousStage =
      application.approvalStage;


    application.organizationName =
      organizationName.trim();

    application.organizationType =
      organizationType;

    application.establishmentDate =
      parsedEstablishmentDate;

    application.registrationCountry =
      registrationCountry?.trim() ||
      'Somalia';


    application.organizationContact = {
      email:
        organizationEmail.trim(),

      phone:
        organizationPhone.trim(),

      address:
        organizationAddress.trim(),

      website:
        website?.trim() ||
        undefined,
    };


   application.applicant = {
  fullName:
    applicantFullName.trim(),

  email:
    applicantEmail
      .trim()
      .toLowerCase(),

  phone:
    applicantPhone.trim(),

  address:
    applicantAddress.trim(),

  title:
  title?.trim() ||
  undefined,
};


  application.sectors =
  normalizedSectors;

application.activityAreas =
  normalizedActivityAreas;

application.jubalandOperationsStartDate =
  jubalandOperationsStartDate
    ? new Date(
        jubalandOperationsStartDate
      )
    : undefined;

application.activeProjectsInJubaland =
  activeProjectsInJubaland !==
    undefined &&
  activeProjectsInJubaland !==
    ''
    ? Number(
        activeProjectsInJubaland
      )
    : undefined;

application.supportingDocuments =
  updatedDocuments;

application.status =
  'Under Review';

application.approvalStage =
  'Document Verification';

application.revisionReason =
  undefined;

application.revisionRequestedAt =
  undefined;

application.revisionRequestedBy =
  undefined;

application.workflowHistory.push({
  action:
    'Revision Resubmitted',

  note:
    'Applicant corrected and resubmitted the organization application through the public JAIMS portal.',

  fromStatus:
    previousStatus,

  toStatus:
    'Under Review',

  fromStage:
    previousStage,

  toStage:
    'Document Verification',

  actedAt:
    now,
});

    await application.save();


    for (
      const oldDocument
      of oldDocumentsToDelete
    ) {
      try {
        await deleteStoredOrganizationApplicationFile(
          {
            storageType:
              oldDocument.storageType,

            storageKey:
              oldDocument.storageKey,
          }
        );
      } catch (
        cleanupError
      ) {
        console.warn(
          `Unable to delete replaced organization application file ${oldDocument.storageKey}: ${cleanupError.message}`
        );
      }
    }


    return res
      .status(200)
      .json({
        message:
          'Organization application revision resubmitted successfully.',

        data: {
          applicationNumber:
            application.applicationNumber,

          organizationName:
            application.organizationName,

          organizationType:
            application.organizationType,

          status:
            application.status,

          approvalStage:
            application.approvalStage,

          supportingDocumentCount:
            application
              .supportingDocuments
              .length,
        },
      });

  } catch (error) {
    for (
      const storedDocument
      of newlyStoredDocuments
    ) {
      try {
        await deleteStoredOrganizationApplicationFile(
          {
            storageType:
              storedDocument.storageType,

            storageKey:
              storedDocument.storageKey,
          }
        );
      } catch (
        cleanupError
      ) {
        console.warn(
          `Unable to clean up replacement organization application file ${storedDocument.storageKey}: ${cleanupError.message}`
        );
      }
    }


    throw error;
  }
}
/**
 * @desc    Publicly track an organization registration application
 * @route   GET /api/v1/public/organization-applications/:applicationNumber
 * @access  Public
 */
export async function trackOrganizationApplication(
  req,
  res
) {
  const applicationNumber =
    String(
      req.params
        .applicationNumber ||
        ''
    )
      .trim()
      .toUpperCase();

  if (!applicationNumber) {
    return res.status(400).json({
      message:
        'Application number is required.',
    });
  }

  const application =
    await OrganizationApplication.findOne(
      {
        applicationNumber,
      }
    )
      .select(
  [
    'applicationNumber',
    'applicationType',
    'organizationName',
    'organizationType',
    'status',
    'approvalStage',
    'submittedAt',
    'reviewedAt',
    'approvedAt',
    'rejectedAt',
    'revisionReason',
    'revisionRequestedAt',
    'registrationFee',
  ].join(' ')
)
      .lean();

  if (!application) {
    return res.status(404).json({
      message:
        'Organization application not found.',
    });
  }

  return res.status(200).json({
    data: {
      applicationNumber:
        application.applicationNumber,

      applicationType:
        application.applicationType,

      organizationName:
        application.organizationName,

      organizationType:
        application.organizationType,

      status:
        application.status,

      approvalStage:
        application.approvalStage,

      submittedAt:
        application.submittedAt,

      reviewedAt:
        application.reviewedAt,

      approvedAt:
        application.approvedAt,

     rejectedAt:
  application.rejectedAt,

revisionReason:
  application.revisionReason,

revisionRequestedAt:
  application.revisionRequestedAt,

registrationFee:
        application.registrationFee
          ? {
              amount:
                application.registrationFee.amount,

              currency:
                application.registrationFee.currency,

              revenueCode:
                application.registrationFee.revenueCode,

              paymentReference:
                application.registrationFee.paymentReference,

              paymentDate:
                application.registrationFee.paymentDate,

              paymentStatus:
                application.registrationFee.paymentStatus,

              submittedForReviewAt:
                application.registrationFee.submittedForReviewAt,
            }
          : null,
    },
  });
}