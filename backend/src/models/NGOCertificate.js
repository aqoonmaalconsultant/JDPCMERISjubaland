import mongoose from 'mongoose';

/*
 * Certificate organization snapshot
 *
 * These values are copied from the approved application /
 * registered NGO when the certificate is issued.
 *
 * Keeping a snapshot is important because the organization
 * record may later be edited, while an already-issued
 * certificate must preserve the information that appeared
 * on it at the time of issuance.
 */
const organizationSnapshotSchema =
  new mongoose.Schema(
    {
      organizationName: {
        type: String,
        required: true,
        trim: true,
      },

      organizationType: {
        type: String,

        enum: [
          'Local NGO',
          'International NGO',
          'Consultant',
          'Civil Society Organization',
          'Community Based Organization',
          'Network',
          'Association',
        ],

        required: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      /*
       * Used for the "Organization Activity"
       * section of the Ministry certificate.
       *
       * For now this can be derived from the
       * approved application's activityAreas /
       * sectors when certificate generation
       * is implemented.
       */
      activity: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/*
 * Generated PDF metadata.
 *
 * The actual PDF will use the existing local/R2
 * file-storage architecture. MongoDB stores only
 * the storage reference and document metadata.
 */
const certificateFileSchema =
  new mongoose.Schema(
    {
      fileName: {
        type: String,
        trim: true,
      },

      mimeType: {
        type: String,
        trim: true,
        default: 'application/pdf',
      },

      storageType: {
        type: String,

        enum: [
          'local',
          'cloud',
        ],
      },

      storageKey: {
        type: String,
        trim: true,
      },

      url: {
        type: String,
        trim: true,
      },

      generatedAt: {
        type: Date,
      },
    },
    {
      _id: false,
    }
  );

const ngoCertificateSchema =
  new mongoose.Schema(
    {
      /*
       * Human-readable certificate identifier.
       *
       * We will generate the actual format later
       * using NumberSequence after confirming the
       * Ministry's preferred numbering format.
       */
     applicationNumber: {
  type: String,
  trim: true,
},
      certificateNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
      },

      /*
       * License / organization registration number.
       *
       * The sample Ministry certificate displays:
       *
       * License No: 00312
       *
       * This should match the registrationNumber
       * of the corresponding NGO registry record.
       */
      registrationNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true,
      },

      /*
       * Registered organization receiving
       * this certificate.
       */
      ngo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
        required: true,
        index: true,
      },

      /*
       * Application whose DG approval caused
       * this certificate to be issued.
       */
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizationApplication',
        required: true,
        index: true,
      },

      /*
       * New Registration or Renewal.
       *
       * This will drive the certificate status
       * text similar to the Ministry sample:
       * "Status: Renewal Registration".
       */
      registrationType: {
        type: String,

        enum: [
          'New Registration',
          'Renewal',
        ],

        required: true,
        default: 'New Registration',
      },

      organizationSnapshot: {
        type: organizationSnapshotSchema,
        required: true,
      },

      /*
       * Certificate validity.
       *
       * Current Ministry sample shows one-year
       * validity:
       *
       * 15/07/2026 -> 14/07/2027
       *
       * The generation service will calculate
       * these dates when DG approval succeeds.
       */
      issueDate: {
        type: Date,
        required: true,
      },

      expiryDate: {
        type: Date,
        required: true,
        index: true,
      },

      /*
       * Certificate lifecycle.
       *
       * Expired will later be applied automatically
       * when expiryDate has passed.
       */
      status: {
        type: String,

        enum: [
          'Active',
          'Expired',
          'Suspended',
          'Revoked',
        ],

        default: 'Active',

        index: true,
      },

      /*
       * Unique public verification identifier used
       * by the QR code.
       *
       * The QR itself should resolve to the public
       * JAIMS verification page, not contain private
       * organization/application data.
       */
      verificationCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },

      /*
       * Optional public verification path.
       *
       * Example later:
       * /verify/ngo-certificate/<verificationCode>
       *
       * We keep this separate from the host/domain
       * so deployment domain changes do not require
       * changing the certificate identity.
       */
      verificationPath: {
        type: String,
        trim: true,
      },

      /*
       * Metadata of the generated certificate PDF.
       */
      certificateFile: {
        type: certificateFileSchema,
        default: () => ({}),
      },

      /*
       * Director General who approved the
       * underlying organization registration.
       */
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      approvedAt: {
        type: Date,
        required: true,
      },

      /*
       * Lifecycle management.
       */
      suspendedAt: {
        type: Date,
      },

      suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      suspensionReason: {
        type: String,
        trim: true,
      },

      revokedAt: {
        type: Date,
      },

      revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      revocationReason: {
        type: String,
        trim: true,
      },

      /*
       * Renewal relationship.
       *
       * When a new certificate replaces an older
       * certificate, these fields allow us to retain
       * complete certificate history.
       */
      previousCertificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGOCertificate',
      },

      replacedByCertificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGOCertificate',
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    {
      timestamps: true,
    }
  );

/*
 * One application must not accidentally generate
 * several certificates.
 */
ngoCertificateSchema.index(
  {
    application: 1,
  },
  {
    unique: true,
  }
);

/*
 * Registry / certificate lookup.
 */
ngoCertificateSchema.index({
  ngo: 1,
  status: 1,
  expiryDate: -1,
});

/*
 * Expiry monitoring.
 *
 * Later used by:
 * - 10 days before expiry notification
 * - expiry-day notification
 * - 10 days after expiry notification
 * - automatic Active -> Expired update
 */
ngoCertificateSchema.index({
  status: 1,
  expiryDate: 1,
});

/*
 * Public lookup by registration / license number.
 */
ngoCertificateSchema.index({
  registrationNumber: 1,
  status: 1,
});

/*
 * Prevent an invalid certificate validity period.
 */
ngoCertificateSchema.pre(
  'validate',

  function validateCertificateDates(
    next
  ) {
    if (
      this.issueDate &&
      this.expiryDate &&
      this.expiryDate <=
        this.issueDate
    ) {
      this.invalidate(
        'expiryDate',

        'Certificate expiry date must be after the issue date.'
      );
    }

    next();
  }
);

const NGOCertificate =
  mongoose.models.NGOCertificate ||
  mongoose.model(
    'NGOCertificate',
    ngoCertificateSchema
  );

export default NGOCertificate;