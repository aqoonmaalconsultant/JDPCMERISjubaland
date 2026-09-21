import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

import { OrganizationApplication } from '../models/OrganizationApplication.js';
import NGO from '../models/NGO.js';
import NGOCertificate from '../models/NGOCertificate.js';
import NumberSequence from '../models/NumberSequence.js';

import {
  readStoredOrganizationApplicationFile,
  readStoredOrganizationPaymentReceipt,
} from '../services/fileStorageService.js';

import { writeAudit } from '../services/auditService.js';

// const REQUIRED_SUPPORTING_DOCUMENT_TYPES = [
//   'registrationCertificate',
//   'constitution',
//   'organizationProfile',
//   'leadershipList',
// ];

// const ALLOWED_SUPPORTING_DOCUMENT_TYPES = [
//   ...REQUIRED_SUPPORTING_DOCUMENT_TYPES,
//   'otherSupportingDocument',
// ];

// function hasRequiredSupportingDocuments(
//   application
// ) {
//   const availableTypes =
//     new Set(
//       (
//         application.supportingDocuments ||
//         []
//       )
//         .map(
//           (document) =>
//             document.documentType
//         )
//         .filter(Boolean)
//     );

//   return REQUIRED_SUPPORTING_DOCUMENT_TYPES.every(
//     (documentType) =>
//       availableTypes.has(
//         documentType
//       )
//   );
// }

// function getMissingRequiredSupportingDocuments(
//   application
// ) {
//   const availableTypes =
//     new Set(
//       (
//         application.supportingDocuments ||
//         []
//       )
//         .map(
//           (document) =>
//             document.documentType
//         )
//         .filter(Boolean)
//     );

//   return REQUIRED_SUPPORTING_DOCUMENT_TYPES.filter(
//     (documentType) =>
//       !availableTypes.has(
//         documentType
//       )
//   );
// }

const NEW_REGISTRATION_REQUIRED_DOCUMENT_TYPES =
  [
    'constitution',
    'organizationProfile',
    'leadershipList',
  ];

const RENEWAL_REQUIRED_DOCUMENT_TYPES =
  [
    'registrationCertificate',
  ];

const ALLOWED_SUPPORTING_DOCUMENT_TYPES =
  [
    'registrationCertificate',
    'constitution',
    'organizationProfile',
    'leadershipList',
    'otherSupportingDocument',
  ];


function getRequiredSupportingDocumentTypes(
  application
) {
  if (
    application?.applicationType ===
    'Renewal'
  ) {
    return RENEWAL_REQUIRED_DOCUMENT_TYPES;
  }

  return NEW_REGISTRATION_REQUIRED_DOCUMENT_TYPES;
}


function hasRequiredSupportingDocuments(
  application
) {
  const availableTypes =
    new Set(
      (
        application.supportingDocuments ||
        []
      )
        .map(
          (document) =>
            document.documentType
        )
        .filter(Boolean)
    );

  const requiredDocumentTypes =
    getRequiredSupportingDocumentTypes(
      application
    );

  return requiredDocumentTypes.every(
    (documentType) =>
      availableTypes.has(
        documentType
      )
  );
}


function getMissingRequiredSupportingDocuments(
  application
) {
  const availableTypes =
    new Set(
      (
        application.supportingDocuments ||
        []
      )
        .map(
          (document) =>
            document.documentType
        )
        .filter(Boolean)
    );

  const requiredDocumentTypes =
    getRequiredSupportingDocumentTypes(
      application
    );

  return requiredDocumentTypes.filter(
    (documentType) =>
      !availableTypes.has(
        documentType
      )
  );
}

/**
 * @desc    Get organization registration applications
 * @route   GET /api/v1/ngo-applications
 * @access  Private
 */
/**
 * Generate the organization's public Ministry
 * registration / License No.
 *
 * Format:
 * 00001
 * 00002
 * 00003
 *
 * Existing numbers are checked so previously
 * imported registry numbers are not reused.
 */
async function generateOrganizationRegistrationNumber() {
  for (
    let attempt = 0;
    attempt < 1000;
    attempt += 1
  ) {
    const sequence =
      await NumberSequence.getNextValue(
        'ORGANIZATION-REGISTRATION'
      );

    const registrationNumber =
      String(
        sequence
      ).padStart(
        5,
        '0'
      );

    const alreadyExists =
      await NGO.exists({
        registrationNumber,
      });

    if (
      !alreadyExists
    ) {
      return registrationNumber;
    }
  }

  throw new Error(
    'Unable to generate a unique organization registration number.'
  );
}

/**
 * Generate the unique internal certificate number.
 *
 * The certificate number is separate from the
 * public Ministry License No.
 *
 * Example:
 * CERT-2026-000001
 */
async function generateNGOCertificateNumber() {
  const year =
    new Date().getUTCFullYear();

  const sequence =
    await NumberSequence.getNextValue(
      `NGO-CERTIFICATE-${year}`
    );

  return `CERT-${year}-${String(
    sequence
  ).padStart(
    6,
    '0'
  )}`;
}

/**
 * Ministry certificate validity:
 *
 * Issue date:
 * 15/07/2026
 *
 * Expiry date:
 * 14/07/2027
 *
 * Therefore:
 * one calendar year minus one day.
 */
function calculateCertificateExpiryDate(
  issueDate
) {
  const expiryDate =
    new Date(
      issueDate
    );

  expiryDate.setUTCFullYear(
    expiryDate.getUTCFullYear() +
      1
  );

  expiryDate.setUTCDate(
    expiryDate.getUTCDate() -
      1
  );

  return expiryDate;
}

/**
 * Build the Organization Activity text used
 * on the registration certificate.
 */
function getCertificateActivity(
  application
) {
  if (
    Array.isArray(
      application.activityAreas
    ) &&
    application.activityAreas.length
  ) {
    return application.activityAreas.join(
      ', '
    );
  }

  if (
    Array.isArray(
      application.sectors
    ) &&
    application.sectors.length
  ) {
    return application.sectors.join(
      ', '
    );
  }

  return 'General humanitarian and development activities';
}

export const listNGOApplications =
  async (
    req,
    res
  ) => {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      approvalStage,
      applicationType,
      organizationType,
    } = req.query;

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1
        ),
        100
      );

    const filter = {};

    if (
      search.trim()
    ) {
      const searchRegex = {
        $regex:
          search.trim(),

        $options:
          'i',
      };

      filter.$or = [
        {
          applicationNumber:
            searchRegex,
        },

        {
          organizationName:
            searchRegex,
        },

        {
          'applicant.fullName':
            searchRegex,
        },

        {
          'applicant.email':
            searchRegex,
        },

        {
          'organizationContact.email':
            searchRegex,
        },
      ];
    }

    if (status) {
      filter.status =
        status;
    }

    if (
      approvalStage
    ) {
      filter.approvalStage =
        approvalStage;
    }

    if (
      applicationType
    ) {
      filter.applicationType =
        applicationType;
    }

    if (
      organizationType
    ) {
      filter.organizationType =
        organizationType;
    }

    const skip =
      (
        pageNumber -
        1
      ) *
      limitNumber;

    const [
      items,
      total,
    ] =
      await Promise.all([
        OrganizationApplication.find(
          filter
        )
          .sort({
            submittedAt:
              -1,

            createdAt:
              -1,
          })

          .skip(skip)

          .limit(
            limitNumber
          )

          .select(
            [
              'applicationNumber',
              'applicationType',
              'organizationName',
              'organizationType',
              'registrationCountry',
              'applicant',
              'organizationContact',
              'status',
              'approvalStage',
              'submittedAt',
              'reviewedAt',
              'approvedAt',
              'rejectedAt',
              'createdAt',
              'updatedAt',
            ].join(' ')
          )

          .lean(),

        OrganizationApplication.countDocuments(
          filter
        ),
      ]);

    return res
      .status(200)
      .json({
        success:
          true,

        total,

        page:
          pageNumber,

        pages:
          Math.ceil(
            total /
              limitNumber
          ),

        limit:
          limitNumber,

        data:
          items,
      });
  };


/**
 * @desc    Get Organization Registration Dashboard statistics
 * @route   GET /api/v1/organization-applications/dashboard
 * @access  Private
 */
export const getOrganizationRegistrationDashboard =
  async (
    _req,
    res
  ) => {
    const now =
      new Date();

    const [
      totalApplications,
      submittedApplications,
      underReviewApplications,
      returnedForRevisionApplications,
      approvedApplications,
      newRegistrations,
      renewals,

      paymentRequired,
      paymentPending,
      paymentPaid,
      paymentVerified,
      paymentExempt,

      feeTotals,

      totalRegisteredOrganizations,

      activeCertificates,
      expiredCertificates,
      suspendedCertificates,
      revokedCertificates,

      applicationsByOrganizationType,
      applicationsByApprovalStage,
      applicationsByApplicationType,
      applicationsByPaymentStatus,

      recentApplications,
      recentCertificates,
    ] =
      await Promise.all([
        OrganizationApplication.countDocuments({}),

        OrganizationApplication.countDocuments({
          status:
            'Submitted',
        }),

        OrganizationApplication.countDocuments({
          status:
            'Under Review',
        }),

        OrganizationApplication.countDocuments({
          status:
            'Returned for Revision',
        }),

        OrganizationApplication.countDocuments({
          status:
            'Approved',
        }),

        OrganizationApplication.countDocuments({
          applicationType:
            'New Registration',
        }),

        OrganizationApplication.countDocuments({
          applicationType:
            'Renewal',
        }),


        OrganizationApplication.countDocuments({
          'registrationFee.paymentRequired':
            true,
        }),

        OrganizationApplication.countDocuments({
          'registrationFee.paymentStatus':
            'Pending',
        }),

        OrganizationApplication.countDocuments({
          'registrationFee.paymentStatus':
            'Paid',
        }),

        OrganizationApplication.countDocuments({
          'registrationFee.paymentStatus':
            'Verified',
        }),

        OrganizationApplication.countDocuments({
          'registrationFee.paymentStatus':
            'Exempt',
        }),


        OrganizationApplication.aggregate([
          {
            $match: {
              'registrationFee.paymentStatus':
                'Verified',
            },
          },

          {
            $group: {
              _id:
                null,

              total:
                {
                  $sum: {
                    $ifNull: [
                      '$registrationFee.amount',
                      0,
                    ],
                  },
                },
            },
          },
        ]),


        NGO.countDocuments({}),


        NGOCertificate.countDocuments({
          status:
            'Active',

          $or: [
            {
              expiryDate: {
                $gte:
                  now,
              },
            },

            {
              expiryDate: {
                $exists:
                  false,
              },
            },

            {
              expiryDate:
                null,
            },
          ],
        }),

        NGOCertificate.countDocuments({
          $or: [
            {
              status:
                'Expired',
            },

            {
              status:
                'Active',

              expiryDate: {
                $lt:
                  now,
              },
            },
          ],
        }),

        NGOCertificate.countDocuments({
          status:
            'Suspended',
        }),

        NGOCertificate.countDocuments({
          status:
            'Revoked',
        }),


        OrganizationApplication.aggregate([
          {
            $group: {
              _id: {
                $ifNull: [
                  '$organizationType',
                  'Not Specified',
                ],
              },

              count: {
                $sum:
                  1,
              },
            },
          },

          {
            $sort: {
              count:
                -1,
            },
          },
        ]),

        OrganizationApplication.aggregate([
          {
            $group: {
              _id: {
                $ifNull: [
                  '$approvalStage',
                  'Not Specified',
                ],
              },

              count: {
                $sum:
                  1,
              },
            },
          },

          {
            $sort: {
              count:
                -1,
            },
          },
        ]),

        OrganizationApplication.aggregate([
          {
            $group: {
              _id: {
                $ifNull: [
                  '$applicationType',
                  'Not Specified',
                ],
              },

              count: {
                $sum:
                  1,
              },
            },
          },

          {
            $sort: {
              count:
                -1,
            },
          },
        ]),

        OrganizationApplication.aggregate([
          {
            $group: {
              _id: {
                $ifNull: [
                  '$registrationFee.paymentStatus',
                  'Not Set',
                ],
              },

              count: {
                $sum:
                  1,
              },
            },
          },

          {
            $sort: {
              count:
                -1,
            },
          },
        ]),

        OrganizationApplication.find({})
          .sort({
            submittedAt:
              -1,

            createdAt:
              -1,
          })
          .limit(6)
          .select(
            [
              'applicationNumber',
              'organizationName',
              'applicationType',
              'status',
              'approvalStage',
              'submittedAt',
              'createdAt',
            ].join(' ')
          )
          .lean(),

        NGOCertificate.find({})
          .sort({
            issueDate:
              -1,

            createdAt:
              -1,
          })
          .limit(6)
          .select(
            [
              'certificateNumber',
              'registrationNumber',
              'registrationType',
              'organizationSnapshot',
              'issueDate',
              'expiryDate',
              'status',
              'createdAt',
            ].join(' ')
          )
          .lean(),
      ]);


    const totalFeesCollected =
      feeTotals[0]?.total ||
      0;


    return res
      .status(200)
      .json({
        success:
          true,

        data: {
          applications: {
            total:
              totalApplications,

            submitted:
              submittedApplications,

            underReview:
              underReviewApplications,

            returnedForRevision:
              returnedForRevisionApplications,

            approved:
              approvedApplications,

            newRegistrations,

            renewals,
          },

          payments: {
            required:
              paymentRequired,

            pending:
              paymentPending,

            paid:
              paymentPaid,

            verified:
              paymentVerified,

            exempt:
              paymentExempt,

            totalFeesCollected,

            currency:
              'USD',
          },

          registry: {
            totalRegisteredOrganizations,
          },

          certificates: {
            active:
              activeCertificates,

            expired:
              expiredCertificates,

            suspended:
              suspendedCertificates,

            revoked:
              revokedCertificates,
          },

          recentActivity: {
            applications:
              recentApplications.map(
                (application) => ({
                  id:
                    application._id,

                  applicationNumber:
                    application.applicationNumber,

                  organizationName:
                    application.organizationName,

                  applicationType:
                    application.applicationType,

                  status:
                    application.status,

                  approvalStage:
                    application.approvalStage,

                  submittedAt:
                    application.submittedAt ||
                    application.createdAt,
                })
              ),

            certificates:
              recentCertificates.map(
                (certificate) => ({
                  id:
                    certificate._id,

                  certificateNumber:
                    certificate.certificateNumber,

                  registrationNumber:
                    certificate.registrationNumber,

                  organizationName:
                    certificate.organizationSnapshot
                      ?.organizationName ||
                    'Not available',

                  registrationType:
                    certificate.registrationType,

                  status:
                    certificate.status,

                  issueDate:
                    certificate.issueDate ||
                    certificate.createdAt,

                  expiryDate:
                    certificate.expiryDate,
                })
              ),
          },

          breakdowns: {
            organizationType:
              applicationsByOrganizationType.map(
                (item) => ({
                  name:
                    item._id,

                  count:
                    item.count,
                })
              ),

            approvalStage:
              applicationsByApprovalStage.map(
                (item) => ({
                  name:
                    item._id,

                  count:
                    item.count,
                })
              ),

            applicationType:
              applicationsByApplicationType.map(
                (item) => ({
                  name:
                    item._id,

                  count:
                    item.count,
                })
              ),

            paymentStatus:
              applicationsByPaymentStatus.map(
                (item) => ({
                  name:
                    item._id,

                  count:
                    item.count,
                })
              ),
          },
        },
      });
  };


/**
 * @desc    Get organization registration application by ID
 * @route   GET /api/v1/ngo-applications/:id
 * @access  Private
 */
export const getNGOApplication =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    const application =
      await OrganizationApplication.findById(
        id
      )
        .populate(
          'existingNGO'
        )

        .populate(
          'registrationFee.verifiedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'createdBy',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    return res
      .status(200)
      .json({
        success:
          true,

        data:
          application,
      });
  };

/**
 * @desc    Download/view organization application supporting document
 * @route   GET /api/v1/ngo-applications/:id/documents/:documentType
 * @access  Private
 */
export const getNGOApplicationDocument =
  async (
    req,
    res
  ) => {
    const {
      id,
      documentType,
    } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    if (
      !ALLOWED_SUPPORTING_DOCUMENT_TYPES.includes(
        documentType
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid supporting document type.',
        });
    }

    const application =
      await OrganizationApplication.findById(
        id
      )
        .select(
          'applicationNumber supportingDocuments'
        )

        .lean();

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    const document =
      (
        application.supportingDocuments ||
        []
      ).find(
        (item) =>
          item.documentType ===
          documentType
      );

    if (
      !document
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Supporting document not found.',
        });
    }

    const fileBuffer =
      await readStoredOrganizationApplicationFile(
        {
          storageType:
            document.storageType,

          storageKey:
            document.storageKey,
        }
      );

    res.setHeader(
      'Content-Type',

      document.mimeType ||
        'application/octet-stream'
    );

    res.setHeader(
      'Content-Length',

      fileBuffer.length
    );

    const safeFileName =
      String(
        document.fileName ||
          `${documentType}-document`
      ).replace(
        /["\r\n]/g,
        ''
      );

    const disposition =
      req.query.download ===
      '1'
        ? 'attachment'
        : 'inline';

    res.setHeader(
      'Content-Disposition',

      `${disposition}; filename="${safeFileName}"`
    );

    res.setHeader(
      'Cache-Control',
      'private, no-store'
    );

    return res.send(
      fileBuffer
    );
  };

/**
 * @desc    Start Ministry review
 * @route   PATCH /api/v1/ngo-applications/:id/start-review
 * @access  Private
 */
export const startNGOApplicationReview =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    const application =
      await OrganizationApplication.findById(
        id
      );

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    if (
      application.status !==
        'Submitted' ||
      application.approvalStage !==
        'Submitted'
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Only submitted applications at the Submitted review stage can be started for review.',

          data: {
            status:
              application.status,

            approvalStage:
              application.approvalStage,
          },
        });
    }

    const previousValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        reviewedAt:
          application.reviewedAt ||
          null,
      };

    const now =
      new Date();

    application.status =
      'Under Review';

    application.approvalStage =
      'Document Verification';

    application.reviewedAt =
      now;

    application.updatedBy =
      req.user._id;

    application.workflowHistory.push(
      {
        action:
          'Review Started',

        note:
          'Admin/HR & Finance review started. Application moved to Document Verification.',

        fromStatus:
          'Submitted',

        toStatus:
          'Under Review',

        fromStage:
          'Submitted',

        toStage:
          'Document Verification',

        actor:
          req.user._id,

        actedAt:
          now,
      }
    );

    await application.save();

    const newValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        reviewedAt:
          application.reviewedAt,
      };

    await writeAudit(
      req,

      'START_ORGANIZATION_APPLICATION_REVIEW',

      'OrganizationApplication',

      application._id,

      previousValue,

      newValue
    );

    const updatedApplication =
      await OrganizationApplication.findById(
        application._id
      )
        .populate(
          'registrationFee.verifiedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          'Organization application review started successfully.',

        data:
          updatedApplication,
      });
  };


/**
 * @desc    Complete document verification
 * @route   PATCH /api/v1/ngo-applications/:id/complete-document-verification
 * @access  Private
 */
export const completeDocumentVerification =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    const paymentDecision =
      String(
        req.body?.paymentDecision ||
        ''
      )
        .trim()
        .toLowerCase();

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    /*
     * Admin must explicitly decide whether
     * the application proceeds to payment
     * or is exempted from the registration fee.
     */
    if (
      ![
        'payment',
        'exempt',
      ].includes(
        paymentDecision
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Payment decision is required. Choose either submit for payment or submit with payment exemption.',
        });
    }

    /*
     * Payment decision is recorded in the
     * workflow and audit history.
     */
    const application =
      await OrganizationApplication.findById(
        id
      );

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    if (
      application.status !==
        'Under Review' ||
      application.approvalStage !==
        'Document Verification'
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Document verification can only be completed for applications currently at the Document Verification stage.',

          data: {
            status:
              application.status,

            approvalStage:
              application.approvalStage,
          },
        });
    }

    if (
      !hasRequiredSupportingDocuments(
        application
      )
    ) {
      const missingDocuments =
        getMissingRequiredSupportingDocuments(
          application
        );

      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Document verification cannot be completed because one or more required supporting documents are missing.',

          data: {
            missingDocuments,
          },
        });
    }

    if (
      !application.registrationFee
    ) {
      application.registrationFee =
        {};
    }

    const previousValue = {
      status:
        application.status,

      approvalStage:
        application.approvalStage,

      registrationFee: {
        amount:
          application.registrationFee
            ?.amount ??
          null,

        paymentRequired:
          application.registrationFee
            ?.paymentRequired ??
          true,

        paymentStatus:
          application.registrationFee
            ?.paymentStatus ||
          'Pending',

        exemptionReason:
          application.registrationFee
            ?.exemptionReason ||
          null,
      },
    };

    const now =
      new Date();

    /*
     * Common cleanup.
     * This prevents old payment information
     * from remaining when an application
     * reaches this decision point again.
     */
    application.registrationFee.paymentReference =
      undefined;

    application.registrationFee.paymentDate =
      undefined;

    application.registrationFee.receiptFileName =
      undefined;

    application.registrationFee.receiptMimeType =
      undefined;

    application.registrationFee.receiptStorageType =
      undefined;

    application.registrationFee.receiptStorageKey =
      undefined;

    application.registrationFee.receiptUrl =
      undefined;

    application.registrationFee.submittedForReviewAt =
      undefined;

    application.registrationFee.verifiedBy =
      undefined;

    application.registrationFee.verifiedAt =
      undefined;

    application.status =
      'Under Review';

    let workflowAction;
    let workflowNote;
    let nextStage;

    /*
     * =========================================
     * OPTION 1: SUBMIT FOR PAYMENT
     * =========================================
     */
    if (
      paymentDecision ===
      'payment'
    ) {
      application.registrationFee.amount =
        500;

      application.registrationFee.currency =
        application.registrationFee.currency ||
        'USD';

      application.registrationFee.revenueCode =
        application.registrationFee.revenueCode ||
        '142212';

      application.registrationFee.paymentRequired =
        true;

      application.registrationFee.paymentStatus =
        'Pending';

      application.registrationFee.exemptionReason =
        undefined;

      application.registrationFee.exemptedBy =
        undefined;

      application.registrationFee.exemptedAt =
        undefined;

      nextStage =
        'Awaiting Registration Fee';

      application.approvalStage =
        nextStage;

      workflowAction =
        'Document Verification Completed - Payment Required';

      workflowNote =
        `Required registration documents and organization information were reviewed. Application moved to Awaiting Registration Fee. Registration fee: ${application.registrationFee.amount} ${application.registrationFee.currency}; revenue code: ${application.registrationFee.revenueCode}.`;
    }

    /*
     * =========================================
     * OPTION 2: PAYMENT EXEMPTION
     * =========================================
     */
    if (
      paymentDecision ===
      'exempt'
    ) {
      application.registrationFee.amount =
        0;

      application.registrationFee.currency =
        application.registrationFee.currency ||
        'USD';

      application.registrationFee.revenueCode =
        application.registrationFee.revenueCode ||
        '142212';

      application.registrationFee.paymentRequired =
        false;

      application.registrationFee.paymentStatus =
        'Exempt';

      application.registrationFee.exemptionReason =
        undefined;

      application.registrationFee.exemptedBy =
        req.user._id;

      application.registrationFee.exemptedAt =
        now;

      /*
       * Exempt applications do not need
       * applicant payment or Finance
       * payment verification.
       */
      nextStage =
        'Director General Review';

      application.approvalStage =
        nextStage;

      workflowAction =
        'Document Verification Completed - Payment Exempt';

      workflowNote =
        `Required registration documents and organization information were reviewed. Registration fee payment was exempted. Amount due: 0 ${application.registrationFee.currency}. Application moved directly to Director General Review for final approval.`;
    }

    application.updatedBy =
      req.user._id;

    application.workflowHistory.push(
      {
        action:
          workflowAction,

        note:
          workflowNote,

        fromStatus:
          'Under Review',

        toStatus:
          'Under Review',

        fromStage:
          'Document Verification',

        toStage:
          nextStage,

        actor:
          req.user._id,

        actedAt:
          now,
      }
    );

    await application.save();

    const newValue = {
      status:
        application.status,

      approvalStage:
        application.approvalStage,

      registrationFee: {
        amount:
          application.registrationFee
            .amount,

        currency:
          application.registrationFee
            .currency,

        revenueCode:
          application.registrationFee
            .revenueCode,

        paymentRequired:
          application.registrationFee
            .paymentRequired,

        paymentStatus:
          application.registrationFee
            .paymentStatus,

        exemptionReason:
          application.registrationFee
            .exemptionReason ||
          null,

        exemptedBy:
          application.registrationFee
            .exemptedBy ||
          null,

        exemptedAt:
          application.registrationFee
            .exemptedAt ||
          null,
      },
    };

    await writeAudit(
      req,

      paymentDecision ===
        'exempt'
        ? 'COMPLETE_ORGANIZATION_DOCUMENT_VERIFICATION_PAYMENT_EXEMPT'
        : 'COMPLETE_ORGANIZATION_DOCUMENT_VERIFICATION_PAYMENT_REQUIRED',

      'OrganizationApplication',

      application._id,

      previousValue,

      newValue
    );

    const updatedApplication =
      await OrganizationApplication.findById(
        application._id
      )
        .populate(
          'registrationFee.verifiedBy',
          'name email role'
        )

        .populate(
          'registrationFee.exemptedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          paymentDecision ===
          'exempt'
            ? 'Document verification completed successfully. The registration fee has been exempted and the application is now awaiting Final Review.'
            : 'Document verification completed successfully. The application is now awaiting the registration fee.',

        data:
          updatedApplication,
      });
  };


export const returnNGOApplicationForRevision =
  async (
    req,
    res
  ) => {

    const {
      id,
    } =
      req.params;

    const reason =
      String(
        req.body?.reason ||
        ''
      ).trim();


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            'Invalid organization application ID.',
        });
    }


    if (!reason) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            'A revision reason is required.',
        });
    }


    const application =
      await OrganizationApplication.findById(
        id
      );


    if (!application) {
      return res
        .status(404)
        .json({
          success: false,

          message:  'Organization application not found.',
        });
    }


    if (
      application.status !==
        'Under Review' ||
      application.approvalStage !==
        'Document Verification'
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            'Only applications currently at Document Verification can be returned for revision.',

          data: {
            status:
              application.status,

            approvalStage:
              application.approvalStage,
          },
        });
    }


    const previousValue = {
      status:
        application.status,

      approvalStage:
        application.approvalStage,

      revisionReason:
        application.revisionReason ||
        null,
    };


    const now =
      new Date();


    application.status =
      'Returned for Revision';

    application.approvalStage =
      'Document Verification';

    application.revisionReason =
      reason;

    application.revisionRequestedAt =
      now;

    application.revisionRequestedBy =
      req.user._id;

    application.updatedBy =
      req.user._id;


    application.workflowHistory.push(
      {
        action:
          'Returned for Revision',

        note:
          `Application returned to applicant for revision. Reason: ${reason}`,

        fromStatus:
          'Under Review',

        toStatus:
          'Returned for Revision',

        fromStage:
          'Document Verification',

        toStage:
          'Document Verification',

        actor:
          req.user._id,

        actedAt:
          now,
      }
    );


    await application.save();


    const newValue = {
      status:
        application.status,

      approvalStage:
        application.approvalStage,

      revisionReason:
        application.revisionReason,

      revisionRequestedAt:
        application.revisionRequestedAt,
    };


    await writeAudit(
      req,

      'RETURN_ORGANIZATION_APPLICATION_FOR_REVISION',

      'OrganizationApplication',

      application._id,

      previousValue,

      newValue
    );


    const updatedApplication =
      await OrganizationApplication.findById(
        application._id
      )
        .populate(
          'revisionRequestedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();


    return res
      .status(200)
      .json({
        success: true,

        message:
          'Application returned to the applicant for revision successfully.',

        data:
          updatedApplication,
      });
  };

/**
 * @desc    Complete Registration / Compliance Review
 * @route   PATCH /api/v1/ngo-applications/:id/complete-registration-review
 * @access  Private
 */
export const completeRegistrationReview =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    const application =
      await OrganizationApplication.findById(
        id
      );

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    if (
      application.status !==
        'Under Review' ||
      application.approvalStage !==
        'Registration Review'
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Registration / Compliance Review can only be completed for applications currently at the Registration Review stage.',

          data: {
            status:
              application.status,

            approvalStage:
              application.approvalStage,
          },
        });
    }

    if (
      !hasRequiredSupportingDocuments(
        application
      )
    ) {
      const missingDocuments =
        getMissingRequiredSupportingDocuments(
          application
        );

      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Registration / Compliance Review cannot be completed because one or more required supporting documents are missing.',

          data: {
            missingDocuments,
          },
        });
    }

    const previousValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        registrationFee:
          {
            amount:
              application.registrationFee
                ?.amount,

            currency:
              application.registrationFee
                ?.currency,

            revenueCode:
              application.registrationFee
                ?.revenueCode,

            paymentStatus:
              application.registrationFee
                ?.paymentStatus,
          },
      };

    const now =
      new Date();

    application.status =
      'Under Review';

    application.approvalStage =
      'Awaiting Registration Fee';

    if (
      !application.registrationFee
    ) {
      application.registrationFee =
        {};
    }

    if (
      application.registrationFee
        .amount ===
        undefined ||
      application.registrationFee
        .amount ===
        null
    ) {
      application.registrationFee.amount =
        500;
    }

    if (
      !application.registrationFee
        .currency
    ) {
      application.registrationFee.currency =
        'USD';
    }

    if (
      !application.registrationFee
        .revenueCode
    ) {
      application.registrationFee.revenueCode =
        '142212';
    }

    application.registrationFee.paymentStatus =
      'Pending';

    application.registrationFee.paymentReference =
      undefined;

    application.registrationFee.paymentDate =
      undefined;

    application.registrationFee.verifiedBy =
      undefined;

    application.registrationFee.verifiedAt =
      undefined;

    application.updatedBy =
      req.user._id;

    application.workflowHistory.push(
      {
        action:
          'Registration / Compliance Review Completed',

        note:
          `Registration and compliance review completed. Application moved to Awaiting Registration Fee. Registration fee: ${application.registrationFee.amount} ${application.registrationFee.currency}; revenue code: ${application.registrationFee.revenueCode}.`,

        fromStatus:
          'Under Review',

        toStatus:
          'Under Review',

        fromStage:
          'Registration Review',

        toStage:
          'Awaiting Registration Fee',

        actor:
          req.user._id,

        actedAt:
          now,
      }
    );

    await application.save();

    const newValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        registrationFee:
          {
            amount:
              application.registrationFee
                .amount,

            currency:
              application.registrationFee
                .currency,

            revenueCode:
              application.registrationFee
                .revenueCode,

            paymentStatus:
              application.registrationFee
                .paymentStatus,
          },
      };

    await writeAudit(
      req,

      'COMPLETE_ORGANIZATION_REGISTRATION_REVIEW',

      'OrganizationApplication',

      application._id,

      previousValue,

      newValue
    );

    const updatedApplication =
      await OrganizationApplication.findById(
        application._id
      )
        .populate(
          'registrationFee.verifiedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          'Registration / Compliance Review completed successfully. The applicant can now proceed with the registration fee payment.',

        data:
          updatedApplication,
      });
  };
  /**
 * @desc    View/download registration fee payment receipt
 * @route   GET /api/v1/ngo-applications/:id/payment-receipt
 * @access  Private
 */
export const getNGOApplicationPaymentReceipt =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    const application =
      await OrganizationApplication.findById(
        id
      )
        .select(
          'applicationNumber registrationFee'
        )

        .lean();

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    const registrationFee =
      application.registrationFee;

    if (
      !registrationFee
        ?.receiptStorageKey
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Payment receipt not found.',
        });
    }

    const fileBuffer =
      await readStoredOrganizationPaymentReceipt(
        {
          storageType:
            registrationFee
              .receiptStorageType,

          storageKey:
            registrationFee
              .receiptStorageKey,
        }
      );

    res.setHeader(
      'Content-Type',

      registrationFee
        .receiptMimeType ||
        'application/octet-stream'
    );

    res.setHeader(
      'Content-Length',

      fileBuffer.length
    );

    const safeFileName =
      String(
        registrationFee
          .receiptFileName ||
          'payment-receipt'
      ).replace(
        /["\r\n]/g,
        ''
      );

    const disposition =
      req.query.download ===
      '1'
        ? 'attachment'
        : 'inline';

    res.setHeader(
      'Content-Disposition',

      `${disposition}; filename="${safeFileName}"`
    );

    res.setHeader(
      'Cache-Control',
      'private, no-store'
    );

    return res.send(
      fileBuffer
    );
  };

/**
 * @desc    Verify registration fee payment
 * @route   PATCH /api/v1/ngo-applications/:id/verify-payment
 * @access  Private
 */
export const verifyNGOApplicationPayment =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    const application =
      await OrganizationApplication.findById(
        id
      );

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    if (
      application.status !==
        'Under Review' ||
      application.approvalStage !==
        'Payment Verification' ||
      application.registrationFee
        ?.paymentStatus !==
        'Paid'
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Payment can only be verified for applications currently at Payment Verification with submitted payment proof.',

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

    if (
      !application.registrationFee
        ?.receiptStorageKey ||
      !application.registrationFee
        ?.paymentReference ||
      !application.registrationFee
        ?.paymentDate
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Payment cannot be verified because the payment proof is incomplete.',
        });
    }

    const previousValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        registrationFee:
          {
            paymentStatus:
              application.registrationFee
                .paymentStatus,

            verifiedBy:
              application.registrationFee
                .verifiedBy ||
              null,

            verifiedAt:
              application.registrationFee
                .verifiedAt ||
              null,
          },
      };

    const now =
      new Date();

    application.registrationFee.paymentStatus =
      'Verified';

    application.registrationFee.verifiedBy =
      req.user._id;

    application.registrationFee.verifiedAt =
      now;

    application.status =
      'Under Review';

    application.approvalStage =
      'Director General Review';

    application.updatedBy =
      req.user._id;

    application.workflowHistory.push(
      {
        action:
          'Registration Fee Verified',

        note:
          `Registration fee payment verified by Admin/HR & Finance. Payment reference: ${application.registrationFee.paymentReference}. Application moved to Director General Review for final approval.`,

        fromStatus:
          'Under Review',

        toStatus:
          'Under Review',

        fromStage:
          'Payment Verification',

        toStage:
          'Director General Review',

        actor:
          req.user._id,

        actedAt:
          now,
      }
    );

    await application.save();

    const newValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        registrationFee:
          {
            paymentStatus:
              application.registrationFee
                .paymentStatus,

            verifiedBy:
              application.registrationFee
                .verifiedBy,

            verifiedAt:
              application.registrationFee
                .verifiedAt,
          },
      };

    await writeAudit(
      req,

      'VERIFY_ORGANIZATION_REGISTRATION_PAYMENT',

      'OrganizationApplication',

      application._id,

      previousValue,

      newValue
    );

    const updatedApplication =
      await OrganizationApplication.findById(
        application._id
      )
        .populate(
          'registrationFee.verifiedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          'Registration fee payment verified successfully. The application is now awaiting final approval by the Director General.',

        data:
          updatedApplication,
      });
  };

/**
 * @desc    Reject registration fee payment proof
 * @route   PATCH /api/v1/ngo-applications/:id/reject-payment
 * @access  Private
 */
export const rejectNGOApplicationPayment =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    const reason =
      String(
        req.body?.reason ||
          ''
      ).trim();

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    if (!reason) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'A payment rejection reason is required.',
        });
    }

    const application =
      await OrganizationApplication.findById(
        id
      );

    if (
      !application
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    if (
      application.status !==
        'Under Review' ||
      application.approvalStage !==
        'Payment Verification' ||
      application.registrationFee
        ?.paymentStatus !==
        'Paid'
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Payment can only be rejected for applications currently at Payment Verification with submitted payment proof.',

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

    const previousValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        registrationFee:
          {
            paymentStatus:
              application.registrationFee
                .paymentStatus,

            paymentReference:
              application.registrationFee
                .paymentReference,

            paymentDate:
              application.registrationFee
                .paymentDate,
          },
      };

    const now =
      new Date();

    application.registrationFee.paymentStatus =
      'Rejected';

    application.registrationFee.verifiedBy =
      undefined;

    application.registrationFee.verifiedAt =
      undefined;

    application.status =
      'Under Review';

    application.approvalStage =
      'Awaiting Registration Fee';

    application.updatedBy =
      req.user._id;

    application.workflowHistory.push(
      {
        action:
          'Registration Fee Rejected',

        note:
          `Submitted payment proof was rejected by Admin/HR & Finance. Reason: ${reason}`,

        fromStatus:
          'Under Review',

        toStatus:
          'Under Review',

        fromStage:
          'Payment Verification',

        toStage:
          'Awaiting Registration Fee',

        actor:
          req.user._id,

        actedAt:
          now,
      }
    );

    await application.save();

    const newValue =
      {
        status:
          application.status,

        approvalStage:
          application.approvalStage,

        registrationFee:
          {
            paymentStatus:
              application.registrationFee
                .paymentStatus,
          },

        paymentRejectionReason:
          reason,
      };

    await writeAudit(
      req,

      'REJECT_ORGANIZATION_REGISTRATION_PAYMENT',

      'OrganizationApplication',

      application._id,

      previousValue,

      newValue
    );

    const updatedApplication =
      await OrganizationApplication.findById(
        application._id
      )
        .populate(
          'registrationFee.verifiedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          'Payment proof rejected. The applicant can now submit corrected payment proof.',

        data:
          updatedApplication,
      });
  };

/**
 * @desc    Director General final approval
 * @route   PATCH /api/v1/ngo-applications/:id/director-general-approve
 * @access  Private - Director General
 */
export const approveNGOApplicationByDirectorGeneral =
  async (
    req,
    res
  ) => {
    const {
      id,
    } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success:
            false,

          message:
            'Invalid organization application ID.',
        });
    }

    /*
     * Validate the application before opening
     * the approval transaction.
     */
    const existingApplication =
      await OrganizationApplication.findById(
        id
      );

    if (
      !existingApplication
    ) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Organization application not found.',
        });
    }

    if (
      existingApplication.status !==
        'Under Review' ||
      existingApplication.approvalStage !==
        'Director General Review'
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'This application is not currently awaiting Director General approval.',

          data: {
            status:
              existingApplication.status,

            approvalStage:
              existingApplication.approvalStage,
          },
        });
    }

    if (
      ![
        'Verified',
        'Exempt',
      ].includes(
        existingApplication.registrationFee
          ?.paymentStatus
      )
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'Director General approval requires either a verified registration fee payment or an approved payment exemption.',

          data: {
            paymentStatus:
              existingApplication.registrationFee
                ?.paymentStatus ||
              'Pending',
          },
        });
    }

    /*
     * Each application can issue only one
     * certificate.
     */
    const existingCertificate =
      await NGOCertificate.findOne({
        application:
          existingApplication._id,
      }).lean();

    if (
      existingCertificate
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'A certificate record has already been issued for this application.',
        });
    }

    const previousValue = {
      status:
        existingApplication.status,

      approvalStage:
        existingApplication.approvalStage,

      approvedAt:
        existingApplication.approvedAt ||
        null,

      existingNGO:
        existingApplication.existingNGO ||
        null,

      paymentStatus:
        existingApplication.registrationFee
          ?.paymentStatus ||
        null,
    };

    const now =
      new Date();

    const expiryDate =
      calculateCertificateExpiryDate(
        now
      );

    /*
     * Unique certificate identity.
     *
     * This is separate from the public
     * Ministry License No.
     */
    const certificateNumber =
      await generateNGOCertificateNumber();

    /*
     * Public QR verification identity.
     */
    const verificationCode =
      randomUUID();

    const session =
      await mongoose.startSession();

    let application;
    let ngo;
    let certificate;

    try {
      await session.withTransaction(
        async () => {
          application =
            await OrganizationApplication.findById(
              id
            ).session(
              session
            );

          if (
            !application
          ) {
            const error =
              new Error(
                'Organization application not found during approval transaction.'
              );

            error.statusCode =
              404;

            throw error;
          }

          /*
           * Re-check the workflow state inside
           * the transaction.
           */
          if (
            application.status !==
              'Under Review' ||
            application.approvalStage !==
              'Director General Review' ||
            ![
              'Verified',
              'Exempt',
            ].includes(
              application.registrationFee
                ?.paymentStatus
            )
          ) {
            const error =
              new Error(
                'The application workflow changed before Director General approval could be completed.'
              );

            error.statusCode =
              409;

            throw error;
          }

          /*
           * =========================================
           * REGISTERED ORGANIZATION
           * =========================================
           */

          if (
            application.applicationType ===
            'Renewal'
          ) {
            /*
             * Renewal keeps the original Ministry
             * registration / License No.
             */
            if (
              application.existingNGO
            ) {
              ngo =
                await NGO.findById(
                  application.existingNGO
                ).session(
                  session
                );
            }

            if (
              !ngo &&
              application.previousRegistrationNumber
            ) {
              ngo =
                await NGO.findOne({
                  registrationNumber:
                    application.previousRegistrationNumber,
                }).session(
                  session
                );
            }

            if (
              !ngo
            ) {
              const error =
                new Error(
                  'The existing registered organization could not be found for this renewal application.'
                );

              error.statusCode =
                409;

              throw error;
            }

            ngo.organizationName =
              application.organizationName;

            ngo.organizationType =
              application.organizationType;

            ngo.establishmentDate =
              application.establishmentDate;

            ngo.contact = {
              email:
                application.organizationContact
                  .email,

              phone:
                application.organizationContact
                  .phone,

              address:
                application.organizationContact
                  .address,

              website:
                application.organizationContact
                  .website ||
                '',
            };

            ngo.sectors =
              application.sectors ||
              [];

            ngo.activityAreas =
              application.activityAreas ||
              [];

            ngo.latestApplication =
              application._id;

            ngo.registrationStatus =
              'Active';

            ngo.complianceStatus =
              'Compliant';

            ngo.visibility =
              'public';

            ngo.updatedBy =
              req.user._id;

            await ngo.save({
              session,
            });
          } else {
            /*
             * NEW REGISTRATION
             */

            const duplicateOrganization =
              await NGO.findOne({
                organizationName:
                  application.organizationName,
              }).session(
                session
              );

            if (
              duplicateOrganization
            ) {
              const error =
                new Error(
                  'A registered organization with this organization name already exists.'
                );

              error.statusCode =
                409;

              throw error;
            }

            const registrationNumber =
              await generateOrganizationRegistrationNumber();

            const createdNGOs =
              await NGO.create(
                [
                  {
                    registrationNumber,

                    organizationName:
                      application.organizationName,

                    organizationType:
                      application.organizationType,

                    establishmentDate:
                      application.establishmentDate,

                    contact: {
                      email:
                        application.organizationContact
                          .email,

                      phone:
                        application.organizationContact
                          .phone,

                      address:
                        application.organizationContact
                          .address,

                      website:
                        application.organizationContact
                          .website ||
                        '',
                    },

                    sectors:
                      application.sectors ||
                      [],

                    activityAreas:
                      application.activityAreas ||
                      [],

                    latestApplication:
                      application._id,

                    registrationStatus:
                      'Active',

                    complianceStatus:
                      'Compliant',

                    visibility:
                      'public',

                    createdBy:
                      req.user._id,

                    updatedBy:
                      req.user._id,
                  },
                ],

                {
                  session,
                }
              );

            ngo =
              createdNGOs[0];
          }

          /*
           * =========================================
           * CERTIFICATE RECORD
           * =========================================
           */

          const previousCertificate =
            ngo.currentCertificate ||
            null;

          const createdCertificates =
            await NGOCertificate.create(
              [
                {
                  certificateNumber,

                  applicationNumber:
                    application.applicationNumber,

                  registrationNumber:
                    ngo.registrationNumber,

                  ngo:
                    ngo._id,

                  application:
                    application._id,

                  registrationType:
                    application.applicationType,

                  organizationSnapshot: {
                    organizationName:
                      application.organizationName,

                    organizationType:
                      application.organizationType,

                    address:
                      application.organizationContact
                        .address,

                    activity:
                      getCertificateActivity(
                        application
                      ),
                  },

                  issueDate:
                    now,

                  expiryDate,

                  status:
                    'Active',

                  verificationCode,

                  verificationPath:
                    `/verify/ngo-certificate/${verificationCode}`,

                  certificateFile:
                    {},

                  approvedBy:
                    req.user._id,

                  approvedAt:
                    now,

                  previousCertificate,

                  createdBy:
                    req.user._id,

                  updatedBy:
                    req.user._id,
                },
              ],

              {
                session,
              }
            );

          certificate =
            createdCertificates[0];

          /*
           * Preserve renewal certificate history.
           */
          if (
            previousCertificate
          ) {
            await NGOCertificate.findByIdAndUpdate(
              previousCertificate,

              {
                replacedByCertificate:
                  certificate._id,

                updatedBy:
                  req.user._id,
              },

              {
                session,

                runValidators:
                  true,
              }
            );
          }

          /*
           * Make this the NGO's current certificate.
           */
          ngo.currentCertificate =
            certificate._id;

          ngo.latestApplication =
            application._id;

          ngo.registrationStatus =
            'Active';

          ngo.complianceStatus =
            'Compliant';

          ngo.visibility =
            'public';

          ngo.updatedBy =
            req.user._id;

          await ngo.save({
            session,
          });

          /*
           * =========================================
           * FINAL APPLICATION APPROVAL
           * =========================================
           */

          application.status =
            'Approved';

          application.approvalStage =
            'Approved';

          application.approvedAt =
            now;

          application.existingNGO =
            ngo._id;

          application.updatedBy =
            req.user._id;

          application.workflowHistory.push(
            {
              action:
                'Director General Approval',

              note:
                `Organization registration application received final approval from the Director General. License No: ${ngo.registrationNumber}. Certificate record: ${certificate.certificateNumber}.`,

              fromStatus:
                'Under Review',

              toStatus:
                'Approved',

              fromStage:
                'Director General Review',

              toStage:
                'Approved',

              actor:
                req.user._id,

              actedAt:
                now,
            }
          );

          await application.save({
            session,
          });
        }
      );
    } catch (error) {
      if (
        error?.statusCode
      ) {
        return res
          .status(
            error.statusCode
          )
          .json({
            success:
              false,

            message:
              error.message,
          });
      }

      throw error;
    } finally {
      await session.endSession();
    }

    const newValue = {
      status:
        application.status,

      approvalStage:
        application.approvalStage,

      approvedAt:
        application.approvedAt,

      existingNGO:
        ngo._id,

      registrationNumber:
        ngo.registrationNumber,

      certificateNumber:
        certificate.certificateNumber,

      certificateIssueDate:
        certificate.issueDate,

      certificateExpiryDate:
        certificate.expiryDate,

      paymentStatus:
        application.registrationFee
          ?.paymentStatus ||
        null,
    };

    await writeAudit(
      req,

      'DIRECTOR_GENERAL_APPROVE_ORGANIZATION_REGISTRATION',

      'OrganizationApplication',

      application._id,

      previousValue,

      newValue
    );

    const updatedApplication =
      await OrganizationApplication.findById(
        application._id
      )
        .populate(
          'existingNGO'
        )

        .populate(
          'registrationFee.verifiedBy',
          'name email role'
        )

        .populate(
          'workflowHistory.actor',
          'name email role'
        )

        .populate(
          'createdBy',
          'name email role'
        )

        .populate(
          'updatedBy',
          'name email role'
        )

        .lean();

    const issuedCertificate =
      await NGOCertificate.findById(
        certificate._id
      )
        .populate(
          'approvedBy',
          'name email role'
        )

        .lean();

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          'Organization registration approved successfully by the Director General. The organization has been added to the Registered Organizations registry and its certificate record has been created.',

        data:
          updatedApplication,

        organization: {
          id:
            ngo._id,

          registrationNumber:
            ngo.registrationNumber,

          organizationName:
            ngo.organizationName,

          registrationStatus:
            ngo.registrationStatus,
        },

        certificate:
          issuedCertificate,
      });
  };

