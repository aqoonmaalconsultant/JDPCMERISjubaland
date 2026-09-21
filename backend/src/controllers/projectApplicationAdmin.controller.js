import { z } from 'zod';

import {
  ProjectApplication,
} from '../models/ProjectApplication.js';

import {
  Project,
} from '../models/Project.js';

import NumberSequence from '../models/NumberSequence.js';

import {
  writeAudit,
} from '../services/auditService.js';

import {
  HttpError,
} from '../utils/httpError.js';

const returnForRevisionSchema =
  z.object({
    reason: z
      .string()
      .trim()
      .min(
        5,
        'Revision reason is required.'
      ),
  });

function populateApplication(
  query
) {
  return query
    .populate(
      'submittingInstitution',
      'institutionName institutionType verificationStatus country email phone'
    )
    .populate(
      'submittedBy',
      'name email role'
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
      'name organizationName'
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
      'name organizationName'
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
      'finalReviewBy',
      'name email'
    )
    .populate(
      'registeredBy',
      'name email'
    )
    .populate(
      'registeredProject',
      'projectName projectCode implementationStatus status approvalStage'
    )
    .populate(
      'registrationHistory.actor',
      'name email role'
    );
}

function objectIdValue(
  value
) {
  if (!value) {
    return undefined;
  }

  if (value._id) {
    return value._id;
  }

  return value;
}

function objectIdArray(
  values = []
) {
  return values
    .map(
      objectIdValue
    )
    .filter(Boolean);
}

function copyLocations(
  locations = []
) {
  return locations.map(
    (location) => ({
      region:
        objectIdValue(
          location.region
        ),

      district:
        objectIdValue(
          location.district
        ),

      village:
        location.village,

      siteName:
        location.siteName,

      latitude:
        location.latitude,

      longitude:
        location.longitude,
    })
  );
}

function copyFocalPoint(
  focalPoint
) {
  if (!focalPoint) {
    return undefined;
  }

  return {
    name:
      focalPoint.name,

    position:
      focalPoint.position,

    phone:
      focalPoint.phone,

    email:
      focalPoint.email,
  };
}

function copyBeneficiaries(
  beneficiaries
) {
  if (!beneficiaries) {
    return {
      householdCount: 0,
      individuals: 0,
      male: 0,
      female: 0,
      disabilityStatus: 0,
    };
  }

  return {
    householdCount:
      beneficiaries.householdCount ??
      0,

    individuals:
      beneficiaries.individuals ??
      0,

    male:
      beneficiaries.male ??
      0,

    female:
      beneficiaries.female ??
      0,

    disabilityStatus:
      beneficiaries.disabilityStatus ??
      0,
  };
}

async function generateProjectCode() {
  const year =
    new Date()
      .getUTCFullYear();

  const sequence =
    await NumberSequence.getNextValue(
      `JAIMS-PROJECT-${year}`
    );

  return `JAIMS-PRJ-${year}-${String(
    sequence
  ).padStart(5, '0')}`;
}

/*
 * GET /project-applications
 *
 * Internal MoPIIC list.
 */
export async function listProjectApplicationsForReview(
  req,
  res
) {
  const {
    search = '',
    status = '',
    stage = '',
    page = 1,
    limit = 20,
  } = req.query;

  const query = {};

  if (
    String(status).trim()
  ) {
    query.registrationStatus =
      String(status).trim();
  }

  if (
    String(stage).trim()
  ) {
    query.registrationStage =
      String(stage).trim();
  }

  if (
    String(search).trim()
  ) {
    const searchText =
      String(search).trim();

    query.$or = [
      {
        applicationNumber: {
          $regex:
            searchText,

          $options:
            'i',
        },
      },

      {
        projectName: {
          $regex:
            searchText,

          $options:
            'i',
        },
      },

      {
        sector: {
          $regex:
            searchText,

          $options:
            'i',
        },
      },
    ];
  }

  const pageNumber =
    Math.max(
      Number(page) || 1,
      1
    );

  const pageSize =
    Math.min(
      Math.max(
        Number(limit) || 20,
        1
      ),
      100
    );

  const [
    total,
    applications,
  ] =
    await Promise.all([
      ProjectApplication.countDocuments(
        query
      ),

      populateApplication(
        ProjectApplication.find(
          query
        )
      )
        .sort({
          submittedAt: -1,
          updatedAt: -1,
        })
        .skip(
          (pageNumber - 1) *
            pageSize
        )
        .limit(
          pageSize
        ),
    ]);

  res.json({
    data:
      applications,

    pagination: {
      page:
        pageNumber,

      limit:
        pageSize,

      total,

      totalPages:
        Math.max(
          Math.ceil(
            total /
              pageSize
          ),
          1
        ),
    },
  });
}

/*
 * GET /project-applications/:id
 *
 * Internal MoPIIC review view.
 */
export async function getProjectApplicationForReview(
  req,
  res
) {
  const application =
    await populateApplication(
      ProjectApplication.findById(
        req.params.id
      )
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
 * PATCH
 * /project-applications/:id/return-for-revision
 *
 * Project Verification
 * → Returned for Revision
 */
export async function returnProjectApplicationForRevision(
  req,
  res
) {
  const {
    reason,
  } =
    returnForRevisionSchema.parse(
      req.body
    );

  const application =
    await ProjectApplication.findById(
      req.params.id
    );

  if (!application) {
    throw new HttpError(
      404,
      'Project application not found.'
    );
  }

  if (
    application.registrationStage !==
      'Project Verification' ||
    ![
      'Submitted',
      'Under Review',
    ].includes(
      application.registrationStatus
    )
  ) {
    throw new HttpError(
      409,
      `This application cannot be returned for revision while its status is "${application.registrationStatus}" and stage is "${application.registrationStage}".`
    );
  }

  const previousStatus =
    application.registrationStatus;

  const previousStage =
    application.registrationStage;

  application.registrationStatus =
    'Returned for Revision';

  application.registrationStage =
    'Project Verification';

  application.revisionReason =
    reason;

  application.returnedForRevisionAt =
    new Date();

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
      'Returned for Revision',

    note:
      reason,

    fromStatus:
      previousStatus,

    toStatus:
      'Returned for Revision',

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
      'Project application returned to the institution for revision.',

    data:
      populated,
  });
}

/*
 * PATCH
 * /project-applications/:id/submit-final-review
 *
 * Project Verification
 * → Final Review
 */
export async function submitProjectApplicationForFinalReview(
  req,
  res
) {
  const application =
    await ProjectApplication.findById(
      req.params.id
    );

  if (!application) {
    throw new HttpError(
      404,
      'Project application not found.'
    );
  }

  if (
    application.registrationStage !==
      'Project Verification' ||
    ![
      'Submitted',
      'Under Review',
    ].includes(
      application.registrationStatus
    )
  ) {
    throw new HttpError(
      409,
      `This application cannot be submitted for Final Review while its status is "${application.registrationStatus}" and stage is "${application.registrationStage}".`
    );
  }

  const previousStatus =
    application.registrationStatus;

  const previousStage =
    application.registrationStage;

  application.registrationStatus =
    'Under Review';

  application.registrationStage =
    'Final Review';

  application.projectVerificationAt =
    new Date();

  application.projectVerifiedBy =
    req.user._id;

  application.revisionReason =
    undefined;

  application.returnedForRevisionAt =
    undefined;

  application.updatedBy =
    req.user._id;

  application.registrationHistory.push({
    action:
      'Submitted for Final Review',

    fromStatus:
      previousStatus,

    toStatus:
      'Under Review',

    fromStage:
      previousStage,

    toStage:
      'Final Review',

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
      'Project application submitted for Final Review successfully.',

    data:
      populated,
  });
}
/*
 * PATCH
 * /project-applications/:id/register
 *
 * FINAL REVIEW
 * → REGISTERED
 *
 * Creates the normal JAIMS Project
 * record and directly links it back to
 * this Project Application.
 */
export async function registerProjectApplication(
  req,
  res
) {
  const application =
    await ProjectApplication.findById(
      req.params.id
    );

  if (!application) {
    throw new HttpError(
      404,
      'Project application not found.'
    );
  }

  /*
   * Idempotency protection:
   *
   * If this application has already
   * completed registration, do not create
   * another Project.
   */
  if (
    application.registeredProject
  ) {
    const existingProject =
      await Project.findById(
        application.registeredProject
      );

    if (existingProject) {
      const populated =
        await populateApplication(
          ProjectApplication.findById(
            application._id
          )
        );

      return res.json({
        message:
          'This project application is already registered.',

        data:
          populated,
      });
    }
  }

  /*
   * Additional duplicate protection:
   *
   * A Project may already have been
   * created using sourceProjectApplication
   * even if the application link was not
   * saved because of an interrupted
   * previous request.
   */
  const projectAlreadyCreated =
    await Project.findOne({
      sourceProjectApplication:
        application._id,
    });

  if (
    projectAlreadyCreated
  ) {
    application.registeredProject =
      projectAlreadyCreated._id;

    application.registrationStatus =
      'Registered';

    application.registrationStage =
      'Registered';

    application.registeredAt =
      application.registeredAt ||
      new Date();

    application.registeredBy =
      application.registeredBy ||
      req.user._id;

    application.finalReviewBy =
      application.finalReviewBy ||
      req.user._id;

    application.updatedBy =
      req.user._id;

    await application.save();

    const populated =
      await populateApplication(
        ProjectApplication.findById(
          application._id
        )
      );

    return res.json({
      message:
        'Project registration link restored successfully.',

      data:
        populated,
    });
  }

  /*
   * Registration is only permitted from
   * Final Review.
   */
  if (
    application.registrationStage !==
      'Final Review' ||
    application.registrationStatus !==
      'Under Review'
  ) {
    throw new HttpError(
      409,
      `This project application cannot be registered while its status is "${application.registrationStatus}" and stage is "${application.registrationStage}".`
    );
  }

  /*
   * Final validation before creating a
   * normal Project record.
   */
  const missingFields = [];

  if (
    !application.projectName
      ?.trim()
  ) {
    missingFields.push(
      'Project Name'
    );
  }

  if (
    !application.ministry
  ) {
    missingFields.push(
      'Primary Government Line Ministry'
    );
  }

  if (
    application.budget ===
      undefined ||
    application.budget ===
      null
  ) {
    missingFields.push(
      'Total Project Budget'
    );
  }

  if (
    !application.startDate
  ) {
    missingFields.push(
      'Start Date'
    );
  }

  if (
    !application.endDate
  ) {
    missingFields.push(
      'End Date'
    );
  }

  if (
    application.endDate <
    application.startDate
  ) {
    throw new HttpError(
      400,
      'Project end date cannot be earlier than the start date.'
    );
  }

  if (
    !application.locations
      ?.length
  ) {
    missingFields.push(
      'At least one Project Location'
    );
  }

  if (
    missingFields.length
  ) {
    throw new HttpError(
      400,
      `Complete the following required fields before registration: ${missingFields.join(
        ', '
      )}.`
    );
  }

  const projectCode =
    await generateProjectCode();

  /*
   * The registered application has
   * already completed MoPIIC registration
   * review.
   *
   * Therefore the normal Project record
   * enters Project Management as:
   *
   * status        = Approved
   * approvalStage = Approved
   *
   * Actual implementation status starts
   * as Planned because Project
   * Registration does not yet collect
   * implementationStatus.
   */
  let project;

  try {
    project =
      await Project.create({
        projectName:
          application.projectName,

        projectCode,

        description:
          application.description,

        objectives:
          application.objectives ||
          [],

        components:
          application.components ||
          [],

        projectType:
          application.projectType,

        implementationStatus:
          'Planned',

        /*
         * Government Coordination
         */
        ministry:
          objectIdValue(
            application.ministry
          ),

        supportingMinistries:
          objectIdArray(
            application.supportingMinistries
          ),

        federalLineMinistry:
          application.federalLineMinistry,

        /*
         * Funding
         */
        donor:
          objectIdValue(
            application.donor
          ),

        fundingSource:
          application.fundingSource,

        budget:
          application.budget,

        currency:
          application.currency ||
          'USD',

        /*
         * Implementation Arrangement
         */
        leadImplementerType:
          application.leadImplementerType,

        leadImplementingInstitution:
          objectIdValue(
            application
              .leadImplementingInstitution
          ),

        leadImplementerName:
          application.leadImplementerName,

        leadImplementerMinistry:
          objectIdValue(
            application
              .leadImplementerMinistry
          ),

        partner:
          objectIdValue(
            application.partner
          ),

        coImplementingInstitutions:
          objectIdArray(
            application
              .coImplementingInstitutions
          ),

        coImplementingMinistries:
          objectIdArray(
            application
              .coImplementingMinistries
          ),

        coImplementingPartners:
          objectIdArray(
            application
              .coImplementingPartners
          ),

        contractor:
          application.contractor,

        consultant:
          application.consultant,

        /*
         * Classification
         */
        sector:
          application.sector,

        subSector:
          application.subSector,

        /*
         * Duration
         */
        startDate:
          application.startDate,

        endDate:
          application.endDate,

        /*
         * Contacts
         */
        governmentFocalPoint:
          copyFocalPoint(
            application.governmentFocalPoint
          ),

        implementerFocalPoint:
          copyFocalPoint(
            application.implementerFocalPoint
          ),

        /*
         * Visibility
         */
        visibility:
          application.visibility ||
          'internal',

        /*
         * Geographic Coverage
         */
        locations:
          copyLocations(
            application.locations
          ),

        /*
         * Planned beneficiary targets
         */
        beneficiaries:
          copyBeneficiaries(
            application.beneficiaries
          ),

        /*
         * Project Management workflow
         */
        status:
          'Approved',

        approvalStage:
          'Approved',

        workflowHistory: [
          {
            action:
              'registered-from-project-application',

            note:
              `Created from Project Registration Application ${application.applicationNumber}.`,

            toStatus:
              'Approved',

            toStage:
              'Approved',

            actor:
              req.user._id,

            actedAt:
              new Date(),
          },
        ],

        /*
         * Registration connection
         */
        sourceProjectApplication:
          application._id,

        submittingInstitution:
          objectIdValue(
            application
              .submittingInstitution
          ),

        createdBy:
          req.user._id,

        updatedBy:
          req.user._id,
      });
  } catch (
    createError
  ) {
    /*
     * If two registration requests happen
     * at nearly the same time, the unique
     * sourceProjectApplication field
     * prevents duplicate Project records.
     */
    if (
      createError?.code ===
      11000
    ) {
      const existingProject =
        await Project.findOne({
          sourceProjectApplication:
            application._id,
        });

      if (
        existingProject
      ) {
        application.registeredProject =
          existingProject._id;

        application.registrationStatus =
          'Registered';

        application.registrationStage =
          'Registered';

        application.registeredAt =
          new Date();

        application.registeredBy =
          req.user._id;

        application.finalReviewAt =
          new Date();

        application.finalReviewBy =
          req.user._id;

        application.updatedBy =
          req.user._id;

        await application.save();

        const populated =
          await populateApplication(
            ProjectApplication.findById(
              application._id
            )
          );

        return res.json({
          message:
            'Project application registered successfully.',

          data:
            populated,
        });
      }
    }

    throw createError;
  }

  const previousStatus =
    application.registrationStatus;

  const previousStage =
    application.registrationStage;

  const registrationDate =
    new Date();

  application.registeredProject =
    project._id;

  application.registrationStatus =
    'Registered';

  application.registrationStage =
    'Registered';

  application.registeredAt =
    registrationDate;

  application.registeredBy =
    req.user._id;

  application.finalReviewAt =
    registrationDate;

  application.finalReviewBy =
    req.user._id;

  application.revisionReason =
    undefined;

  application.updatedBy =
    req.user._id;

  application.registrationHistory.push({
    action:
      'Project Registered',

    note:
      `Registered as ${project.projectCode}.`,

    fromStatus:
      previousStatus,

    toStatus:
      'Registered',

    fromStage:
      previousStage,

    toStage:
      'Registered',

    actor:
      req.user._id,

    actedAt:
      registrationDate,
  });

  await application.save();

  /*
   * Normal JAIMS audit record.
   */
  await writeAudit(
    req,
    'PROJECT_REGISTERED_FROM_APPLICATION',
    'Project',
    project._id,
    null,
    {
      ...project.toObject(),

      sourceApplicationNumber:
        application.applicationNumber,
    }
  );

  const populated =
    await populateApplication(
      ProjectApplication.findById(
        application._id
      )
    );

  res.status(201).json({
    message:
      `Project registered successfully as ${project.projectCode}.`,

    data:
      populated,
  });
}