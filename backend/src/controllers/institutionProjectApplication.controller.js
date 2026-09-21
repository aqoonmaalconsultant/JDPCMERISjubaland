import { z } from 'zod';

import {
  ProjectApplication,
} from '../models/ProjectApplication.js';

import {
  InstitutionProfile,
} from '../models/InstitutionProfile.js';

import NumberSequence from '../models/NumberSequence.js';

import {
  Roles,
  PortalRoles
} from '../security/roles.js';

import {
  HttpError,
} from '../utils/httpError.js';

const focalPointSchema = z
  .object({
    name: z
      .string()
      .trim()
      .optional(),

    position: z
      .string()
      .trim()
      .optional(),

    phone: z
      .string()
      .trim()
      .optional(),

    email: z
      .string()
      .trim()
      .email()
      .optional()
      .or(z.literal('')),
  })
  .optional();

const beneficiarySchema = z
  .object({
    householdCount: z
      .number()
      .min(0)
      .optional(),

    individuals: z
      .number()
      .min(0)
      .optional(),

    male: z
      .number()
      .min(0)
      .optional(),

    female: z
      .number()
      .min(0)
      .optional(),

    disabilityStatus: z
      .number()
      .min(0)
      .optional(),
  })
  .optional();

const locationSchema = z.object({
  region: z
    .string()
    .min(1),

  district: z
    .string()
    .min(1),

  village: z
    .string()
    .trim()
    .optional(),

  siteName: z
    .string()
    .trim()
    .optional(),

  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),

  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
});

const institutionReferenceSchema = z.object({
  institutionName: z
    .string()
    .trim()
    .min(2),
});

const draftSchema = z.object({
  /*
   * Project Identification
   */

  projectName: z
    .string()
    .min(2)
    .trim(),

  description: z
    .string()
    .trim()
    .optional(),

  objectives: z
    .array(
      z.string().trim()
    )
    .optional(),

  components: z
    .array(
      z.string().trim()
    )
    .optional(),

  projectType: z.enum([
    'Development',
    'Humanitarian',
    'Emergency Response',
    'Infrastructure',
    'Technical Assistance',
    'Capacity Building',
    'Research / Assessment',
    'Other',
  ]),

  implementationStatus: z.enum([
    'Planned',
    'Not Started',
    'Ongoing',
    'On Hold',
    'Completed',
    'Cancelled',
  ]).optional(),

  /*
   * Stakeholders
   */

  fundedBy:
 institutionReferenceSchema,

  supportedBy: z
    .array(institutionReferenceSchema)
    .optional(),

  implementedBy: z
    .array(institutionReferenceSchema)
    .min(1),

  endUsers: z
  .array(institutionReferenceSchema)
  .optional(),

  /*
   * Funding
   */

  fundingSource: z
    .string()
    .trim()
    .optional(),

  budget: z
    .number()
    .min(0),

  currency: z
    .string()
    .trim(),

  /*
   * Classification
   */

  sector: z
    .string()
    .trim(),

  subSector: z
    .string()
    .trim()
    .optional(),

  /*
   * Duration
   */

  startDate: z
    .string(),

  endDate: z
    .string(),

  /*
   * Geographic Coverage
   */

  locations: z
    .array(locationSchema)
    .min(1),

  /*
   * Project Contact
   */

 projectContact:
  focalPointSchema,

  /*
   * Beneficiaries
   */

  beneficiaries:
    beneficiarySchema,

  

  /*
   * Visibility
   */
  visibility: z
    .enum([
      'internal',
      'public',
      'confidential',
    ])
    .optional(),
});

function ensureInstitutionAccount(
  user
) {
  if (
    user.role !==
    PortalRoles.ORGANIZATION_USER
  ) {
    throw new HttpError(
      403,
      'This portal is only available to institution accounts.'
    );
  }
}

async function getVerifiedInstitution(
  userId
) {
  const institution =
    await InstitutionProfile.findOne({
      accountUser: userId,
    });

  if (!institution) {
    throw new HttpError(
      404,
      'Institution profile not found.'
    );
  }

  if (
    institution.verificationStatus !==
    'Verified'
  ) {
    throw new HttpError(
      403,
      'Your institution must be verified before registering projects.'
    );
  }

  return institution;
}

function populateApplication(
  query
) {
  return query
    .populate(
      'submittingInstitution',
      'institutionName institutionType verificationStatus'
    )
    .populate(
      'ministry',
      'name'
    )
    .populate(
      'supportingMinistries',
      'name'
    )
    .populate(
      'donor',
      'name'
    )
    .populate(
      'leadImplementingInstitution',
      'institutionName institutionType verificationStatus'
    )
    .populate(
      'leadImplementerMinistry',
      'name'
    )
    .populate(
      'partner',
      'name'
    )
    .populate(
      'coImplementingInstitutions',
      'institutionName institutionType verificationStatus'
    )
    .populate(
      'coImplementingMinistries',
      'name'
    )
    .populate(
      'coImplementingPartners',
      'name'
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
      'registeredProject',
      'projectName projectCode implementationStatus'
    );
}

async function generateApplicationNumber() {
  const year =
    new Date().getFullYear();

  const sequence =
    await NumberSequence.getNextValue(
      `PROJECT-APPLICATION-${year}`
    );

  return `JAIMS-PRJ-APP-${year}-${String(
    sequence
  ).padStart(5, '0')}`;
}

/*
 * Remove incompatible lead-implementer
 * references whenever the implementation
 * arrangement changes.
 *
 * This prevents an old Partner or Ministry
 * reference from remaining attached after
 * the user changes the lead implementer.
 */
function normalizeImplementationArrangement(
  application
) {
  if (
    application
      .submittingInstitutionIsLeadImplementer
  ) {
    application.leadImplementingInstitution =
      undefined;

    application.leadImplementerMinistry =
      undefined;

    application.partner =
      undefined;

    application.leadImplementerName =
      undefined;

    return;
  }

  if (
    application.leadImplementerType ===
    'Government Line Ministry'
  ) {
    application.leadImplementingInstitution =
      undefined;

    application.partner =
      undefined;

    return;
  }

  /*
   * For non-ministry implementers,
   * an InstitutionProfile or Partner may
   * be used. Remove an old ministry ref.
   */
  application.leadImplementerMinistry =
    undefined;
}

/*
 * POST /institution-portal/project-applications
 *
 * Create a new project application Draft.
 */
export async function createProjectApplicationDraft(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const data =
    draftSchema.parse(
      req.body
    );

  const institution =
    await getVerifiedInstitution(
      req.user._id
    );

  const applicationNumber =
    await generateApplicationNumber();

  const application =
    new ProjectApplication({
      ...data,

      applicationNumber,

      submittingInstitution:
        institution._id,

      submittedBy:
        req.user._id,

      createdBy:
        req.user._id,

      updatedBy:
        req.user._id,

      registrationStatus:
        'Draft',

      registrationStage:
        'Draft',

      registrationHistory: [
        {
          action:
            'Draft Created',

          toStatus:
            'Draft',

          toStage:
            'Draft',

          actor:
            req.user._id,

          actedAt:
            new Date(),
        },
      ],
    });

  normalizeImplementationArrangement(
    application
  );

  await application.save();

  const populated =
    await populateApplication(
      ProjectApplication.findById(
        application._id
      )
    );

  res.status(201).json({
    message:
      'Project application draft created successfully.',

    data:
      populated,
  });
}

/*
 * PUT /institution-portal/project-applications/:id
 *
 * Save/update a Draft or an application
 * returned to the institution for revision.
 */
export async function saveProjectApplicationDraft(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const data =
    draftSchema.parse(
      req.body
    );

  const institution =
    await getVerifiedInstitution(
      req.user._id
    );

  const application =
    await ProjectApplication.findOne({
      _id: req.params.id,

      submittingInstitution:
        institution._id,
    });

  if (!application) {
    throw new HttpError(
      404,
      'Project application not found.'
    );
  }

  if (
    ![
      'Draft',
      'Returned for Revision',
    ].includes(
      application.registrationStatus
    )
  ) {
    throw new HttpError(
      409,
      `This project application cannot be edited while its registration status is "${application.registrationStatus}".`
    );
  }

  Object.assign(
    application,
    data
  );

  normalizeImplementationArrangement(
    application
  );

  application.updatedBy =
    req.user._id;

  await application.save();

  const populated =
    await populateApplication(
      ProjectApplication.findById(
        application._id
      )
    );

  res.json({
    message:
      'Project application draft saved successfully.',

    data:
      populated,
  });
}

/*
 * GET /institution-portal/project-applications
 *
 * List only applications belonging to
 * the currently logged-in institution.
 */
export async function listMyProjectApplications(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const institution =
    await InstitutionProfile.findOne({
      accountUser:
        req.user._id,
    });

  if (!institution) {
    return res.json({
      data: [],
    });
  }

  const applications =
    await populateApplication(
      ProjectApplication.find({
        submittingInstitution:
          institution._id,
      })
    ).sort({
      updatedAt: -1,
    });

  res.json({
    data:
      applications,
  });
}

/*
 * GET /institution-portal/project-applications/:id
 *
 * Return one application belonging to
 * the currently logged-in institution.
 */
export async function getMyProjectApplication(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const institution =
    await InstitutionProfile.findOne({
      accountUser:
        req.user._id,
    });

  if (!institution) {
    throw new HttpError(
      404,
      'Institution profile not found.'
    );
  }

  const application =
    await populateApplication(
      ProjectApplication.findOne({
        _id:
          req.params.id,

        submittingInstitution:
          institution._id,
      })
    );

  if (!application) {
    throw new HttpError(
      404,
      'Project application not found.'
    );
  }

  res.json({
    data:
      application,
  });
}
/*
 * POST
 * /institution-portal/project-applications/:id/submit
 *
 * Submit a completed application to
 * MoPIIC Project Verification.
 *
 * Workflow:
 *
 * Draft
 *   ↓
 * Submitted
 *   ↓
 * Project Verification
 *
 * Returned for Revision applications
 * may also be resubmitted through this
 * same endpoint.
 */
export async function submitProjectApplication(
  req,
  res
) {
  ensureInstitutionAccount(req.user);

  const institution =
    await getVerifiedInstitution(
      req.user._id
    );

  const application =
    await ProjectApplication.findOne({
      _id: req.params.id,
      submittingInstitution:
        institution._id,
    });

  if (!application) {
    throw new HttpError(
      404,
      'Project application not found.'
    );
  }

  if (
    ![
      'Draft',
      'Returned for Revision',
    ].includes(
      application.registrationStatus
    )
  ) {
    throw new HttpError(
      409,
      `This project application cannot be submitted while its registration status is "${application.registrationStatus}".`
    );
  }

  const missingFields = [];

  /*
   * Project Identification
   */

  if (!application.projectName?.trim()) {
    missingFields.push(
      'Project Name'
    );
  }

  if (!application.description?.trim()) {
    missingFields.push(
      'Project Description'
    );
  }

  if (!application.projectType) {
    missingFields.push(
      'Project Type'
    );
  }

  /*
   * Stakeholders
   */

 if (
    !application.fundedBy ||
    !application.fundedBy.institutionName?.trim()
) {
    missingFields.push(
        'Funded By'
    );
}

if (
    !application
        .projectContact?.name
        ?.trim()
) {
    missingFields.push(
        'Project Contact Name'
    );
}

if (
    !application
        .projectContact?.phone
        ?.trim()
) {
    missingFields.push(
        'Project Contact Phone'
    );
}

if (
    !application
        .projectContact?.email
        ?.trim()
) {
    missingFields.push(
        'Project Contact Email'
    );
}

  if (missingFields.length) {
    throw new HttpError(
      400,
      `Complete the following required fields before submission: ${missingFields.join(
        ', '
      )}.`
    );
  }

  const previousStatus =
    application.registrationStatus;

  const previousStage =
    application.registrationStage;

  application.registrationStatus =
    'Submitted';

  application.registrationStage =
    'Project Verification';

  application.submittedAt =
    new Date();

  application.revisionReason =
    undefined;

  application.returnedForRevisionAt =
    undefined;

  application.projectVerificationAt =
    undefined;

  application.projectVerifiedBy =
    undefined;

  application.finalReviewAt =
    undefined;

  application.finalReviewBy =
    undefined;

  application.updatedBy =
    req.user._id;

  application.registrationHistory.push({
    action:
      previousStatus ===
      'Returned for Revision'
        ? 'Project Application Resubmitted'
        : 'Project Application Submitted',

    fromStatus:
      previousStatus,

    toStatus:
      'Submitted',

    fromStage:
      previousStage,

    toStage:
      'Project Verification',

    actor:
      req.user._id,

    actedAt:
      new Date(),
  });

  await application.save();

  const populated =
    await populateApplication(
      ProjectApplication.findById(
        application._id
      )
    );

  res.json({
    message:
      'Project application submitted to MoPIIC successfully.',
    data:
      populated,
  });
}