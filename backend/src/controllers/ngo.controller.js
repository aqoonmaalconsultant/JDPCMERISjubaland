import mongoose from 'mongoose';

import NGO from '../models/NGO.js';
import NGOCertificate from '../models/NGOCertificate.js';

import {
  generateAndStoreNGOCertificate,
} from '../services/ngoCertificateService.js';

import {
  OrganizationApplication,
} from '../models/OrganizationApplication.js';

import OrganizationNotification from '../models/OrganizationNotification.js';

import {
  deleteStoredNGOCertificateFile,
  readStoredNGOCertificateFile,
} from '../services/fileStorageService.js';

import {
  writeAudit,
} from '../services/auditService.js';

/**
 * @desc    Get all NGOs
 * @route   GET /api/v1/ngos
 * @access  Private
 */
export const listNGOs =
  async (
    req,
    res
  ) => {
    const {
      page = 1,
      limit = 20,
      search = '',
      registrationStatus,
      complianceStatus,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        {
          organizationName: {
            $regex:
              search,

            $options:
              'i',
          },
        },

        {
          registrationNumber: {
            $regex:
              search,

            $options:
              'i',
          },
        },
      ];
    }

    if (
      registrationStatus
    ) {
      filter.registrationStatus =
        registrationStatus;
    }

    if (
      complianceStatus
    ) {
      filter.complianceStatus =
        complianceStatus;
    }

    const pageNumber =
      Math.max(
        Number(page) ||
          1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) ||
            20,
          1
        ),
        100
      );

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
        NGO.find(
          filter
        )
          .sort({
            createdAt:
              -1,
          })

          .skip(
            skip
          )

          .limit(
            limitNumber
          )

          .populate(
            'partner',
            'organizationName'
          )

          .populate(
            'latestApplication',
            'applicationNumber'
          )

          .populate(
            'currentCertificate',
            'certificateNumber registrationNumber registrationType issueDate expiryDate status verificationCode verificationPath certificateFile'
          ),

        NGO.countDocuments(
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
 * @desc    Get NGO by ID
 * @route   GET /api/v1/ngos/:id
 * @access  Private
 */
export const getNGO =
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
            'Invalid NGO ID.',
        });
    }

    const ngo =
      await NGO.findById(
        id
      )
        .populate(
          'partner'
        )

        .populate(
          'latestApplication'
        )

        .populate({
          path:
            'currentCertificate',

          populate: [
            {
              path:
                'approvedBy',

              select:
                'name email role',
            },

            {
              path:
                'application',

              select:
                'applicationNumber applicationType organizationName status approvalStage',
            },
          ],
        });

    if (!ngo) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'NGO not found.',
        });
    }

    return res
      .status(200)
      .json({
        success:
          true,

        data:
          ngo,
      });
  };

/**
 * @desc    Create NGO
 * @route   POST /api/v1/ngos
 * @access  Private
 */
export const createNGO =
  async (
    req,
    res
  ) => {
    const ngo =
      await NGO.create({
        ...req.body,

        createdBy:
          req.user._id,

        updatedBy:
          req.user._id,
      });

    return res
      .status(201)
      .json({
        success:
          true,

        message:
          'NGO created successfully.',

        data:
          ngo,
      });
  };

/**
 * @desc    Update NGO
 * @route   PATCH /api/v1/ngos/:id
 * @access  Private
 */
export const updateNGO =
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
            'Invalid NGO ID.',
        });
    }

    const existingNGO =
      await NGO.findById(
        id
      );

    if (!existingNGO) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'NGO not found.',
        });
    }

    const {
      statusReason:
        rawStatusReason,

      ...ngoUpdates
    } =
      req.body || {};

    const statusReason =
      String(
        rawStatusReason ||
          ''
      ).trim();

    const previousRegistrationStatus =
      existingNGO.registrationStatus;

    const requestedRegistrationStatus =
      ngoUpdates
        .registrationStatus;

    const statusChanged =
      Boolean(
        requestedRegistrationStatus
      ) &&
      requestedRegistrationStatus !==
        previousRegistrationStatus;

    if (
      statusChanged &&
      [
        'Suspended',
        'Revoked',
      ].includes(
        requestedRegistrationStatus
      ) &&
      !statusReason
    ) {
      return res
        .status(422)
        .json({
          success:
            false,

          message:
            requestedRegistrationStatus ===
            'Suspended'
              ? 'Suspension reason is required.'
              : 'Revocation reason is required.',
        });
    }

    const ngo =
      await NGO.findByIdAndUpdate(
        id,

        {
          ...ngoUpdates,

          updatedBy:
            req.user._id,
        },

        {
          new:
            true,

          runValidators:
            true,
        }
      );

    if (
      requestedRegistrationStatus &&
      ngo.currentCertificate
    ) {
      const certificate =
        await NGOCertificate.findById(
          ngo.currentCertificate
        );

      if (certificate) {
        const certificateStatusChanged =
          certificate.status !==
          requestedRegistrationStatus;

        const shouldSyncCertificateStatus =
          statusChanged ||
          certificateStatusChanged;

        if (
          shouldSyncCertificateStatus
        ) {
          const now =
            new Date();

          switch (
            requestedRegistrationStatus
          ) {
            case 'Suspended':
              certificate.status =
                'Suspended';

              certificate.suspendedAt =
                now;

              certificate.suspendedBy =
                req.user._id;

              if (statusReason) {
                certificate.suspensionReason =
                  statusReason;
              }

              certificate.revokedAt =
                undefined;

              certificate.revokedBy =
                undefined;

              certificate.revocationReason =
                undefined;

              break;

            case 'Revoked':
              certificate.status =
                'Revoked';

              certificate.revokedAt =
                now;

              certificate.revokedBy =
                req.user._id;

              if (statusReason) {
                certificate.revocationReason =
                  statusReason;
              }

              certificate.suspendedAt =
                undefined;

              certificate.suspendedBy =
                undefined;

              certificate.suspensionReason =
                undefined;

              break;

            case 'Expired':
              certificate.status =
                'Expired';

              break;

            case 'Active':
              certificate.status =
                'Active';

              certificate.suspendedAt =
                undefined;

              certificate.suspendedBy =
                undefined;

              certificate.suspensionReason =
                undefined;

              certificate.revokedAt =
                undefined;

              certificate.revokedBy =
                undefined;

              certificate.revocationReason =
                undefined;

              break;

            default:
              break;
          }

          certificate.updatedBy =
            req.user._id;

          await certificate.save();

          if (
            statusChanged &&
            [
              'Suspended',
              'Revoked',
            ].includes(
              requestedRegistrationStatus
            )
          ) {
            let ownerApplication =
              null;

            if (
              certificate.application
            ) {
              ownerApplication =
                await OrganizationApplication.findById(
                  certificate.application
                )
                  .select(
                    'createdBy'
                  )
                  .lean();
            }

            if (
              !ownerApplication
                ?.createdBy &&
              ngo.latestApplication
            ) {
              ownerApplication =
                await OrganizationApplication.findById(
                  ngo.latestApplication
                )
                  .select(
                    'createdBy'
                  )
                  .lean();
            }

            if (
              ownerApplication
                ?.createdBy
            ) {
              const isSuspended =
                requestedRegistrationStatus ===
                'Suspended';

              await OrganizationNotification.create(
                {
                  user:
                    ownerApplication.createdBy,

                  ngo:
                    ngo._id,

                  certificate:
                    certificate._id,

                  certificateNumber:
                    certificate.certificateNumber,

                  type:
                    isSuspended
                      ? 'CERTIFICATE_SUSPENDED'
                      : 'CERTIFICATE_REVOKED',

                  title:
                    isSuspended
                      ? 'Certificate Suspended'
                      : 'Certificate Revoked',

                  message:
                    isSuspended
                      ? `Your organization registration certificate ${certificate.certificateNumber} has been suspended by the Ministry.`
                      : `Your organization registration certificate ${certificate.certificateNumber} has been revoked by the Ministry.`,

                  reason:
                    statusReason,

                  createdBy:
                    req.user._id,
                }
              );
            }
          }
        }
      }
    }

    const updatedNGO =
      await NGO.findById(
        id
      )
        .populate(
          'currentCertificate',
          'certificateNumber registrationNumber registrationType issueDate expiryDate status verificationCode verificationPath certificateFile suspensionReason revocationReason'
        );

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          'NGO updated successfully.',

        data:
          updatedNGO,
      });
  };

/**
 * @desc    Delete NGO
 * @route   DELETE /api/v1/ngos/:id
 * @access  Private
 */
export const deleteNGO =
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
            'Invalid NGO ID.',
        });
    }

    const ngo =
      await NGO.findById(
        id
      );

    if (!ngo) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'NGO not found.',
        });
    }

    await ngo.deleteOne();

    return res
      .status(200)
      .json({
                success:
          true,

        message:
          'NGO deleted successfully.',
      });
  };

/**
 * @desc    Generate and store the NGO's current certificate PDF
 * @route   POST /api/v1/ngos/:id/certificate/generate
 * @access  Private
 */
export const generateNGOCertificate =
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
            'Invalid NGO ID.',
        });
    }

    const ngo =
      await NGO.findById(
        id
      );

    if (!ngo) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'NGO not found.',
        });
    }

    if (
      !ngo.currentCertificate
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'This organization does not have a current certificate record.',
        });
    }

    const certificate =
      await NGOCertificate.findById(
        ngo.currentCertificate
      );

    if (!certificate) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Current NGO certificate record not found.',
        });
    }

    if (
      certificate.certificateFile
        ?.storageKey
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'The certificate PDF has already been generated.',

          data: {
            certificateNumber:
              certificate.certificateNumber,

            certificateFile:
              certificate.certificateFile,
          },
        });
    }

    const before = {
      certificateFile:
        certificate.certificateFile ||
        null,
    };

    const certificateFile =
      await generateAndStoreNGOCertificate(
        certificate
      );

    certificate.certificateFile =
      certificateFile;

    certificate.updatedBy =
      req.user._id;

    await certificate.save();

    await writeAudit(
      req,

      'GENERATE_NGO_REGISTRATION_CERTIFICATE',

      'NGOCertificate',

      certificate._id,

      before,

      {
        certificateFile:
          certificate.certificateFile,
      }
    );

    const updatedCertificate =
      await NGOCertificate.findById(
        certificate._id
      )
        .populate(
          'ngo',
          'registrationNumber organizationName organizationType registrationStatus'
        )

        .populate(
          'application',
          'applicationNumber applicationType'
        )

        .populate(
          'approvedBy',
          'name email role'
        )

        .lean();

    return res
      .status(201)
      .json({
        success:
          true,

        message:
          'NGO registration certificate generated successfully.',

        data:
          updatedCertificate,
      });
  };

/**
 * @desc    Regenerate and replace the NGO's current certificate PDF
 * @route   POST /api/v1/ngos/:id/certificate/regenerate
 * @access  Private
 */
export const regenerateNGOCertificate =
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
            'Invalid NGO ID.',
        });
    }

    const ngo =
      await NGO.findById(
        id
      );

    if (!ngo) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'NGO not found.',
        });
    }

    if (
      !ngo.currentCertificate
    ) {
      return res
        .status(409)
        .json({
          success:
            false,

          message:
            'This organization does not have a current certificate record.',
        });
    }

    const certificate =
      await NGOCertificate.findById(
        ngo.currentCertificate
      );

    if (!certificate) {
      return res
        .status(404)
        .json({
          success:
            false,

          message:
            'Current NGO certificate record not found.',
        });
    }

    const previousCertificateFile =
      certificate.certificateFile
        ?.storageKey
        ? {
            fileName:
              certificate.certificateFile
                .fileName ||
              null,

            mimeType:
              certificate.certificateFile
                .mimeType ||
              null,

            storageType:
              certificate.certificateFile
                .storageType ||
              null,

            storageKey:
              certificate.certificateFile
                .storageKey ||
              null,

            url:
              certificate.certificateFile
                .url ||
              null,

            generatedAt:
              certificate.certificateFile
                .generatedAt ||
              null,
          }
        : null;

    const before = {
      certificateNumber:
        certificate.certificateNumber,

      registrationNumber:
        certificate.registrationNumber,

      organizationSnapshot:
        certificate.organizationSnapshot
          ? {
              organizationName:
                certificate.organizationSnapshot
                  .organizationName,

              organizationType:
                certificate.organizationSnapshot
                  .organizationType,

              address:
                certificate.organizationSnapshot
                  .address,

              activity:
                certificate.organizationSnapshot
                  .activity,
            }
          : null,

      certificateFile:
        previousCertificateFile,
    };

    /*
     * Refresh the certificate snapshot from the
     * CURRENT permanent Organization Registry record.
     *
     * Corrected Ministry edits will therefore appear
     * when the certificate is regenerated.
     */
    certificate.organizationSnapshot = {
      organizationName:
        ngo.organizationName ||
        certificate.organizationSnapshot
          ?.organizationName ||
        '',

      organizationType:
        ngo.organizationType ||
        certificate.organizationSnapshot
          ?.organizationType ||
        '',

      address:
        ngo.contact?.address ||
        certificate.organizationSnapshot
          ?.address ||
        '',

      activity:
        Array.isArray(
          ngo.activityAreas
        ) &&
        ngo.activityAreas.length
          ? ngo.activityAreas.join(
              ', '
            )
          : Array.isArray(
                ngo.sectors
              ) &&
              ngo.sectors.length
            ? ngo.sectors.join(
                ', '
              )
            : certificate.organizationSnapshot
                ?.activity ||
              '',
    };

    /*
     * Certificate number is preserved.
     * Only current organization information and
     * the generated PDF are refreshed.
     */
    certificate.updatedBy =
      req.user._id;

    /*
     * Store the replacement first.
     * The previous file remains available
     * if PDF generation fails.
     */
    const replacementCertificateFile =
      await generateAndStoreNGOCertificate(
        certificate
      );

    certificate.certificateFile =
      replacementCertificateFile;

    certificate.updatedBy =
      req.user._id;

    try {
      await certificate.save();
    } catch (error) {
      try {
        await deleteStoredNGOCertificateFile({
          storageType:
            replacementCertificateFile
              .storageType,

          storageKey:
            replacementCertificateFile
              .storageKey,
        });
      } catch (
        cleanupError
      ) {
        console.error(
          'Failed to delete the replacement certificate after database save failure:',
          cleanupError
        );
      }

      throw error;
    }

    /*
     * The certificate record now points
     * to the replacement PDF.
     * The previous PDF can therefore
     * be removed safely.
     */
    if (
      previousCertificateFile
        ?.storageKey
    ) {
      try {
        await deleteStoredNGOCertificateFile({
          storageType:
            previousCertificateFile
              .storageType,

          storageKey:
            previousCertificateFile
              .storageKey,
        });
      } catch (
        deletionError
      ) {
        console.error(
          'Old NGO certificate file could not be deleted:',
          deletionError
        );
      }
    }

    await writeAudit(
      req,

      'REGENERATE_NGO_REGISTRATION_CERTIFICATE',

      'NGOCertificate',

      certificate._id,

      before,

      {
        certificateNumber:
          certificate.certificateNumber,

        registrationNumber:
          certificate.registrationNumber,

        organizationSnapshot:
          certificate.organizationSnapshot,

        certificateFile:
          certificate.certificateFile,
      }
    );

    const updatedCertificate =
      await NGOCertificate.findById(
        certificate._id
      )
        .populate(
          'ngo',
          'registrationNumber organizationName organizationType registrationStatus'
        )

        .populate(
          'application',
          'applicationNumber applicationType'
        )

        .populate(
          'approvedBy',
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
          'NGO registration certificate regenerated successfully.',

        data:
          updatedCertificate,
      });
  };

/**
 * Shared certificate file response.
 */
async function sendNGOCertificateFile({
  req,
  res,
  download,
}) {
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
          'Invalid NGO ID.',
      });
  }

  const ngo =
    await NGO.findById(
      id
    )
      .select(
        'organizationName registrationNumber currentCertificate'
      )

      .lean();

  if (!ngo) {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          'NGO not found.',
      });
  }

  if (
    !ngo.currentCertificate
  ) {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          'This organization does not have a current certificate.',
      });
  }

  const certificate =
    await NGOCertificate.findById(
      ngo.currentCertificate
    )
      .select(
        'certificateNumber certificateFile'
      )

      .lean();

  if (!certificate) {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          'Current NGO certificate record not found.',
      });
  }

  if (
    !certificate.certificateFile
      ?.storageKey
  ) {
    return res
      .status(404)
      .json({
        success:
          false,

        message:
          'The certificate PDF has not been generated yet.',
      });
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

/**
 * @desc    View NGO current certificate PDF
 * @route   GET /api/v1/ngos/:id/certificate
 * @access  Private
 */
export const getNGOCertificate =
  async (
    req,
    res
  ) =>
    sendNGOCertificateFile({
      req,
      res,

      download:
        false,
    });

/**
 * @desc    Download NGO current certificate PDF
 * @route   GET /api/v1/ngos/:id/certificate/download
 * @access  Private
 */
export const downloadNGOCertificate =
  async (
    req,
    res
  ) =>
    sendNGOCertificateFile({
      req,
      res,

      download:
        true,
    });