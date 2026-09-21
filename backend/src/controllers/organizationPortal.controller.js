import { OrganizationApplication } from '../models/OrganizationApplication.js';
import NGO from '../models/NGO.js';
import NumberSequence from '../models/NumberSequence.js';
import { HttpError } from '../utils/httpError.js';
import OrganizationNotification from '../models/OrganizationNotification.js';
import {
  deleteStoredOrganizationApplicationFile,
  storeOrganizationApplicationFile,readStoredNGOCertificateFile,
} from '../services/fileStorageService.js';
import NGOCertificate from '../models/NGOCertificate.js';
function calculateRenewalReminder(
  expiryDateValue
) {
  if (!expiryDateValue) {
    return null;
  }

  const expiryDate =
    new Date(expiryDateValue);

  if (
    Number.isNaN(
      expiryDate.getTime()
    )
  ) {
    return null;
  }

  /*
   * Compare calendar dates only.
   * This avoids hours/minutes causing
   * an incorrect day difference.
   */
  const today =
    new Date();

  const todayUtc =
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

  const expiryUtc =
    Date.UTC(
      expiryDate.getUTCFullYear(),
      expiryDate.getUTCMonth(),
      expiryDate.getUTCDate()
    );

  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  const daysRemaining =
    Math.round(
      (
        expiryUtc -
        todayUtc
      ) /
        millisecondsPerDay
    );

  /*
   * Reminder 1:
   * exactly 20 days before expiry.
   */
  if (daysRemaining === 20) {
    return {
      type:
        'RENEWAL_20_DAYS',

      daysRemaining:
        20,

      message:
        'Your organization registration will expire in 20 days. Please prepare your renewal application.',

      expiryDate,
    };
  }

  /*
   * Reminder 2:
   * exactly 5 days before expiry.
   */
  if (daysRemaining === 5) {
    return {
      type:
        'RENEWAL_5_DAYS',

      daysRemaining:
        5,

      message:
        'Urgent: Your organization registration will expire in 5 days. Please submit your renewal application.',

      expiryDate,
    };
  }

  /*
   * Reminder 3:
   * exact expiry date.
   */
  if (daysRemaining === 0) {
    return {
      type:
        'RENEWAL_EXPIRY_DATE',

      daysRemaining:
        0,

      message:
        'Your organization registration expires today. Renewal is required.',

      expiryDate,
    };
  }

  /*
   * No other reminder is shown.
   */
  return null;
}


export async function listMyOrganizationApplications(
  req,
  res
) {
  const applications =
    await OrganizationApplication.find({
      createdBy: req.user._id,
    })
      .select(
        [
          'applicationNumber',
          'applicationType',
          'organizationName',
          'organizationType',
          'status',
          'approvalStage',
          'submittedAt',
          'approvedAt',
          'createdAt',
          'updatedAt',
          'registrationFee',
        ].join(' ')
      )
      .sort({
        submittedAt: -1,
        createdAt: -1,
      })
      .lean();

  return res.status(200).json({
    success: true,
    data: applications,
  });
}
async function sendMyOrganizationCertificate({
  req,
  res,
  download,
}) {
  const applicationId =
    String(
      req.params.applicationId ||
        ''
    ).trim();

  if (
    !applicationId
  ) {
    throw new HttpError(
      400,
      'Application ID is required.'
    );
  }

  /*
   * Security:
   * The application must belong to the
   * currently authenticated organization user.
   */
  const application =
    await OrganizationApplication.findOne({
      _id:
        applicationId,

      createdBy:
        req.user._id,

      status:
        'Approved',
    })
      .select(
        '_id existingNGO applicationNumber organizationName'
      )
      .lean();

  if (!application) {
    throw new HttpError(
      404,
      'Approved organization application not found.'
    );
  }

  let organization =
    null;

  if (
    application.existingNGO
  ) {
    organization =
      await NGO.findById(
        application.existingNGO
      )
        .select(
          'organizationName currentCertificate latestApplication'
        )
        .lean();
  }

  /*
   * Fallback for older approved records.
   */
  if (!organization) {
    organization =
      await NGO.findOne({
        latestApplication:
          application._id,
      })
        .select(
          'organizationName currentCertificate latestApplication'
        )
        .lean();
  }

  if (
    !organization
  ) {
    throw new HttpError(
      404,
      'Registered organization record not found.'
    );
  }

  if (
    !organization.currentCertificate
  ) {
    throw new HttpError(
      404,
      'This organization does not have a current certificate.'
    );
  }

  const certificate =
    await NGOCertificate.findById(
      organization.currentCertificate
    )
      .select(
        'certificateNumber certificateFile'
      )
      .lean();

  if (!certificate) {
    throw new HttpError(
      404,
      'Current organization certificate record not found.'
    );
  }

  if (
    !certificate.certificateFile
      ?.storageKey
  ) {
    throw new HttpError(
      404,
      'The certificate PDF has not been generated yet.'
    );
  }

  const fileBuffer =
    await readStoredNGOCertificateFile({
      storageType:
        certificate.certificateFile
          .storageType,

      storageKey:
        certificate.certificateFile
          .storageKey,
    });

  const safeFileName =
    String(
      certificate.certificateFile
        .fileName ||
        `${certificate.certificateNumber}.pdf`
    ).replace(
      /["\r\n]/g,
      ''
    );

  res.setHeader(
    'Content-Type',
    certificate.certificateFile
      .mimeType ||
      'application/pdf'
  );

  res.setHeader(
    'Content-Length',
    fileBuffer.length
  );

  res.setHeader(
    'Content-Disposition',
    `${
      download
        ? 'attachment'
        : 'inline'
    }; filename="${safeFileName}"`
  );

  res.setHeader(
    'Cache-Control',
    'private, no-store'
  );

  return res.send(
    fileBuffer
  );
}

export async function viewMyOrganizationCertificate(
  req,
  res
) {
  return sendMyOrganizationCertificate({
    req,
    res,
    download:
      false,
  });
}

export async function downloadMyOrganizationCertificate(
  req,
  res
) {
  return sendMyOrganizationCertificate({
    req,
    res,
    download:
      true,
  });
}
export async function listMyOrganizationNotifications(
  req,
  res
) {
  const notifications =
    await OrganizationNotification.find({
      user:
        req.user._id,
    })
      .select(
        [
          '_id',
          'type',
          'title',
          'message',
          'reason',
          'certificateNumber',
          'isRead',
          'readAt',
          'createdAt',
        ].join(' ')
      )
      .sort({
        createdAt:
          -1,
      })
      .lean();

  return res
    .status(200)
    .json({
      success:
        true,

      data:
        notifications,
    });
}
export async function markOrganizationNotificationRead(
  req,
  res
) {
  const notification =
    await OrganizationNotification.findOne({
      _id:
        req.params.notificationId,

      user:
        req.user._id,
    });

  if (!notification) {
    throw new HttpError(
      404,
      'Notification not found.'
    );
  }

  notification.isRead =
    true;

  notification.readAt =
    new Date();

  await notification.save();

  return res
    .status(200)
    .json({
      success:
        true,

      data:
        notification,
    });
}
export async function verifyOrganizationForRenewal(
  req,
  res
) {
  const jaimsNumber =
    String(
      req.params.jaimsNumber || ''
    )
      .trim()
      .toUpperCase();

  if (!jaimsNumber) {
    throw new HttpError(
      400,
      'JAIMS number is required.'
    );
  }

  const validJAIMSNumber =
    /^JAIMS-ORG-\d{4}-\d{6}$/.test(
      jaimsNumber
    );

  if (!validJAIMSNumber) {
    throw new HttpError(
      400,
      'Please enter a valid JAIMS number. Example: JAIMS-ORG-2026-000001.'
    );
  }

  /*
   * STEP 1
   * Find the approved application using
   * the public JAIMS number.
   */
  const approvedApplication =
    await OrganizationApplication.findOne({
      applicationNumber:
        jaimsNumber,

      status:
        'Approved',
    })
      .select(
        [
          '_id',
          'applicationNumber',
          'applicationType',
          'organizationName',
          'organizationType',
          'existingNGO',
          'approvedAt',
          'createdBy',
        ].join(' ')
      )
      .lean();

  if (!approvedApplication) {
    throw new HttpError(
      404,
      'No approved organization registration was found with this JAIMS number.'
    );
  }

  /*
   * STEP 2
   * Confirm that the approved registration
   * belongs to this organization account.
   */
  const applicationOwnerId =
    approvedApplication.createdBy
      ? String(
          approvedApplication.createdBy
        )
      : null;

  const currentUserId =
    req.user?._id
      ? String(
          req.user._id
        )
      : null;

  if (
    !applicationOwnerId ||
    !currentUserId ||
    applicationOwnerId !==
      currentUserId
  ) {
    throw new HttpError(
      403,
      'This JAIMS registration is not linked to the current organization account.'
    );
  }

  /*
   * STEP 3
   * Find the permanent Organization Registry
   * record created from the approved application.
   */
  let organization = null;

  if (
    approvedApplication.existingNGO
  ) {
    organization =
      await NGO.findById(
        approvedApplication.existingNGO
      )
        .select(
          [
            'registrationNumber',
            'organizationName',
            'organizationType',
            'establishmentDate',
            'contact',
            'sectors',
            'activityAreas',
           
            'registrationStatus',
            'complianceStatus',
            'latestApplication',
            'currentCertificate',
          ].join(' ')
        )
        .populate(
          'currentCertificate',
          [
            'certificateNumber',
            'issueDate',
            'expiryDate',
            'status',
            'applicationNumber',
          ].join(' ')
        )
        .lean();
  }

  /*
   * Fallback for older approved records.
   */
  if (!organization) {
    organization =
      await NGO.findOne({
        latestApplication:
          approvedApplication._id,
      })
        .select(
          [
            'registrationNumber',
            'organizationName',
            'organizationType',
            'establishmentDate',
            'contact',
            'sectors',
            'activityAreas',
            
            'registrationStatus',
            'complianceStatus',
            'latestApplication',
            'currentCertificate',
          ].join(' ')
        )
       
        .populate(
          'currentCertificate',
          [
            'certificateNumber',
            'issueDate',
            'expiryDate',
            'status',
     'applicationNumber',
          ].join(' ')
        )
        .lean();
  }

  if (!organization) {
    throw new HttpError(
      404,
      'The approved application was found, but its permanent Organization Registry record could not be found.'
    );
  }

  /*
   * STEP 4
   * Calculate one of the three allowed
   * renewal reminders.
   */
  const renewalReminder =
    calculateRenewalReminder(
      organization.currentCertificate
        ?.expiryDate
    );

  return res.status(200).json({
    success: true,

    data: {
      organizationId:
        organization._id,

      jaimsNumber:
        approvedApplication.applicationNumber,

      registrationNumber:
        organization.registrationNumber,

      organizationName:
        organization.organizationName,

      organizationType:
        organization.organizationType,

      establishmentDate:
        organization.establishmentDate,

      contact:
        organization.contact,

      sectors:
        organization.sectors || [],

      activityAreas:
        organization.activityAreas ||
        [],

      

      registrationStatus:
        organization.registrationStatus,

      complianceStatus:
        organization.complianceStatus,

      latestApplication:
        organization.latestApplication ||
        null,

      currentCertificate:
        organization.currentCertificate ||
        null,

      approvedAt:
        approvedApplication.approvedAt ||
        null,

      eligibleForRenewal:
        true,

      renewalReminder,
    },
  });
}
export async function submitOrganizationRenewal(
  req,
  res
) {
  const jaimsNumber =
    String(
      req.body.jaimsNumber || ''
    )
      .trim()
      .toUpperCase();

  if (!jaimsNumber) {
    throw new HttpError(
      400,
      'JAIMS number is required for renewal.'
    );
  }

  if (
    !/^JAIMS-ORG-\d{4}-\d{6}$/.test(
      jaimsNumber
    )
  ) {
    throw new HttpError(
      400,
      'Please provide a valid JAIMS number.'
    );
  }

  const previousApplication =
    await OrganizationApplication.findOne({
      applicationNumber:
        jaimsNumber,

      status:
        'Approved',
    });

  if (!previousApplication) {
    throw new HttpError(
      404,
      'No approved organization registration was found with this JAIMS number.'
    );
  }

  const ownerId =
    previousApplication.createdBy
      ? String(
          previousApplication.createdBy
        )
      : null;

  const currentUserId =
    req.user?._id
      ? String(req.user._id)
      : null;

  if (
    !ownerId ||
    !currentUserId ||
    ownerId !== currentUserId
  ) {
    throw new HttpError(
      403,
      'This registration is not linked to the current organization account.'
    );
  }

  let organization = null;

  if (
    previousApplication.existingNGO
  ) {
    organization =
      await NGO.findById(
        previousApplication.existingNGO
      );
  }

  if (!organization) {
    organization =
      await NGO.findOne({
        latestApplication:
          previousApplication._id,
      });
  }

  if (!organization) {
    throw new HttpError(
      404,
      'The permanent Organization Registry record could not be found.'
    );
  }

  const existingRenewal =
    await OrganizationApplication.findOne({
      applicationType:
        'Renewal',

      existingNGO:
        organization._id,

      status: {
        $in: [
          'Submitted',
          'Under Review',
          'Returned for Revision',
        ],
      },
    }).select(
      'applicationNumber status approvalStage'
    );

  if (existingRenewal) {
    throw new HttpError(
      409,
      `A renewal application is already in progress: ${existingRenewal.applicationNumber}.`
    );
  }

  const certificateFiles =
    req.files
      ?.registrationCertificate;

  const previousCertificate =
    Array.isArray(
      certificateFiles
    )
      ? certificateFiles[0]
      : null;

  if (!previousCertificate) {
    throw new HttpError(
      422,
      'Previous Registration Certificate is required for renewal.'
    );
  }

  /*
   * Editable renewal values.
   * If the applicant does not change a value,
   * the existing registry value is retained.
   */
  const organizationName =
    String(
      req.body.organizationName ||
      organization.organizationName ||
      ''
    ).trim();

  const organizationType =
    String(
      req.body.organizationType ||
      organization.organizationType ||
      ''
    ).trim();

  const email =
    String(
      req.body.email ||
      organization.contact?.email ||
      ''
    ).trim();

  const phone =
    String(
      req.body.phone ||
      organization.contact?.phone ||
      ''
    ).trim();

  const address =
    String(
      req.body.address ??
      organization.contact?.address ??
      ''
    ).trim();

  const website =
    String(
      req.body.website ??
      organization.contact?.website ??
      ''
    ).trim();

  if (!organizationName) {
    throw new HttpError(
      422,
      'Organization Name is required.'
    );
  }

  if (!organizationType) {
    throw new HttpError(
      422,
      'Organization Type is required.'
    );
  }

  if (!email) {
    throw new HttpError(
      422,
      'Organization contact email is required.'
    );
  }

  if (!phone) {
    throw new HttpError(
      422,
      'Organization contact phone is required.'
    );
  }
if (!address) {
  throw new HttpError(
    422,
    'Organization contact address is required.'
  );
}
  function parseArrayField(
    value,
    fallback = []
  ) {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return fallback;
    }

    if (Array.isArray(value)) {
      return value;
    }

    try {
      const parsed =
        JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : fallback;
    } catch {
      return fallback;
    }
  }

  const sectors =
    parseArrayField(
      req.body.sectors,
      organization.sectors || []
    );

  const activityAreas =
    parseArrayField(
      req.body.activityAreas,
      organization.activityAreas || []
    );

 
  /*
   * Reuse approved supporting documents
   * from the previous application.
   *
   * The old registration certificate is not
   * reused because the applicant uploads
   * the current certificate again.
   */
  const reusedSupportingDocuments =
    (
      previousApplication.supportingDocuments ||
      []
    )
      .filter(
        (document) =>
          document.documentType !==
          'registrationCertificate'
      )
      .map(
        (document) => ({
          documentType:
            document.documentType,

          label:
            document.label,

          fileName:
            document.fileName,

          mimeType:
            document.mimeType,

          storageType:
            document.storageType,

          storageKey:
            document.storageKey,

          url:
            document.url,

          uploadedAt:
            document.uploadedAt,
        })
      );

  const year =
    new Date().getFullYear();

  const sequence =
    await NumberSequence.getNextValue(
      `ORGANIZATION-APPLICATION-${year}`
    );

  const applicationNumber =
    `JAIMS-ORG-${year}-${String(
      sequence
    ).padStart(6, '0')}`;

  let storedCertificate = null;

  try {
    storedCertificate =
      await storeOrganizationApplicationFile(
        {
          applicationNumber,

          documentType:
            'registrationCertificate',

          file:
            previousCertificate,
        }
      );

    const now =
      new Date();

    const renewalSupportingDocuments =
      [
        {
          documentType:
            'registrationCertificate',

          label:
            'Previous Registration Certificate',

          fileName:
            storedCertificate.fileName,

          mimeType:
            storedCertificate.mimeType,

          storageType:
            storedCertificate.storageType,

          storageKey:
            storedCertificate.key,

          url:
            storedCertificate.url,

          uploadedAt:
            now,
        },

        ...reusedSupportingDocuments,
      ];

    const renewalApplication =
      await OrganizationApplication.create({
        applicationNumber,

        applicationType:
          'Renewal',

        existingNGO:
          organization._id,

        previousRegistrationNumber:
          organization.registrationNumber,

        organizationName,

        organizationType,

        establishmentDate:
          organization.establishmentDate,

        registrationCountry:
          previousApplication.registrationCountry ||
          'Somalia',

        applicant:
          previousApplication.applicant,

        organizationContact: {
          email,
          phone,
          address,
          website,
        },

        sectors,

        activityAreas,
        
        jubalandOperationsStartDate:
          previousApplication
            .jubalandOperationsStartDate,

        activeProjectsInJubaland:
          previousApplication
            .activeProjectsInJubaland,

        supportingDocuments:
          renewalSupportingDocuments,

        status:
          'Submitted',

        approvalStage:
          'Submitted',

        submittedAt:
          now,

        createdBy:
          req.user._id,

        updatedBy:
          req.user._id,

        workflowHistory: [
          {
            action:
              'Renewal Application Submitted',

            note:
              `Organization renewal application submitted for existing JAIMS registration ${jaimsNumber}. Existing approved supporting documents were reused automatically.`,

            fromStatus:
              'Draft',

            toStatus:
              'Submitted',

            fromStage:
              'Draft',

            toStage:
              'Submitted',

            actor:
              req.user._id,

            actedAt:
              now,
          },
        ],
      });

    return res
      .status(201)
      .json({
        success: true,

        message:
          'Organization renewal application submitted successfully.',

        data: {
          id:
            renewalApplication._id,

          applicationNumber:
            renewalApplication.applicationNumber,

          applicationType:
            renewalApplication.applicationType,

          previousJAIMSNumber:
            jaimsNumber,

          organizationName:
            renewalApplication.organizationName,

          status:
            renewalApplication.status,

          approvalStage:
            renewalApplication.approvalStage,

          submittedAt:
            renewalApplication.submittedAt,
        },
      });

  } catch (error) {
    if (
      storedCertificate?.key
    ) {
      try {
        await deleteStoredOrganizationApplicationFile(
          {
            storageType:
              storedCertificate.storageType,

            storageKey:
              storedCertificate.key,
          }
        );
      } catch (
        cleanupError
      ) {
        console.warn(
          `Unable to clean up renewal certificate ${storedCertificate.key}: ${cleanupError.message}`
        );
      }
    }

    throw error;
  }
}