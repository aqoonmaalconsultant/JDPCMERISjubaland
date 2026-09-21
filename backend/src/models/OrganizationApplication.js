import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    passportNumber: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const organizationContactSchema =
  new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      website: {
        type: String,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

const supportingDocumentSchema =
  new mongoose.Schema(
    {
      documentType: {
        type: String,
        required: true,

        enum: [
           'registrationCertificate',
          'constitution',
          'organizationProfile',
          'leadershipList',
          'otherSupportingDocument',
        ],
      },

      label: {
        type: String,
        required: true,
        trim: true,
      },

      fileName: {
        type: String,
        required: true,
        trim: true,
      },

      mimeType: {
        type: String,
        required: true,
        trim: true,
      },

      storageType: {
        type: String,

        enum: [
          'local',
          'cloud',
        ],

        required: true,
      },

      storageKey: {
        type: String,
        required: true,
        trim: true,
      },

      url: {
        type: String,
        required: true,
        trim: true,
      },

      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  );

const registrationFeeSchema =
  new mongoose.Schema(
    {
      amount: {
        type: Number,
        min: 0,
        default: 500,
      },

      currency: {
        type: String,
        uppercase: true,
        trim: true,
        default: 'USD',
      },

      revenueCode: {
        type: String,
        trim: true,
        default: '142212',
      },

      /*
       * Applicant-provided payment reference /
       * transaction ID after making payment.
       */
      paymentReference: {
        type: String,
        trim: true,
      },

      /*
       * Date the applicant reports the payment
       * was made.
       */
      paymentDate: {
        type: Date,
      },

      /*
       * Payment receipt metadata.
       *
       * The receipt itself is stored using the
       * existing file-storage architecture.
       * Only its metadata/storage reference is
       * kept in MongoDB.
       */
      receiptFileName: {
        type: String,
        trim: true,
      },

      receiptMimeType: {
        type: String,
        trim: true,
      },

      receiptStorageType: {
        type: String,

        enum: [
          'local',
          'cloud',
        ],
      },

      receiptStorageKey: {
        type: String,
        trim: true,
      },

      receiptUrl: {
        type: String,
        trim: true,
      },

      /*
       * Timestamp when the applicant uploaded
       * payment proof and submitted it for
       * Ministry payment review.
       */
      submittedForReviewAt: {
        type: Date,
      },

      /*
       * Payment workflow:
       *
       * Pending
       *   Applicant has not submitted proof yet.
       *
       * Paid
       *   Applicant says payment was made and
       *   receipt has been submitted for review.
       *
       * Verified
       *   Ministry Finance verified payment.
       *
       * Rejected
       *   Submitted payment evidence was rejected.
       */
      paymentStatus: {
  type: String,

  enum: [
    'Pending',
    'Paid',
    'Verified',
    'Rejected',
    'Exempt',
  ],

  default: 'Pending',
},
paymentRequired: {
  type: Boolean,
  default: true,
},

exemptionReason: {
  type: String,
  trim: true,
},

exemptedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
},

exemptedAt: {
  type: Date,
},
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      verifiedAt: {
        type: Date,
      },
    },
    {
      _id: false,
    }
  );

const workflowHistorySchema =
  new mongoose.Schema(
    {
      action: {
        type: String,
        required: true,
        trim: true,
      },

      note: {
        type: String,
        trim: true,
      },

      fromStatus: {
        type: String,
      },

      toStatus: {
        type: String,
      },

      fromStage: {
        type: String,
      },

      toStage: {
        type: String,
      },

      actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      actedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  );

const organizationApplicationSchema =
  new mongoose.Schema(
    {
      applicationNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
      },

      applicationType: {
        type: String,

        enum: [
          'New Registration',
          'Renewal',
        ],

        default: 'New Registration',
      },

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

        default: 'Local NGO',
      },

      establishmentDate: {
        type: Date,
        required: true,
      },

      registrationCountry: {
        type: String,
        trim: true,
        default: 'Somalia',
      },

      applicant: {
        type: applicantSchema,
        required: true,
      },

      organizationContact: {
        type:
          organizationContactSchema,

        required: true,
      },

      sectors: [
        {
          type: String,
          trim: true,
        },
      ],

    activityAreas: [
  {
    type: String,
    trim: true,
  },
],


jubalandOperationsStartDate: {
  type: Date,
},

activeProjectsInJubaland: {
  type: Number,
  min: 0,
},


      supportingDocuments: {
        type: [
          supportingDocumentSchema,
        ],

        default: [],
      },

      registrationFee: {
        type:
          registrationFeeSchema,

        default: () => ({}),
      },

      existingNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NGO',
      },

      previousRegistrationNumber: {
        type: String,
        uppercase: true,
        trim: true,
      },

      status: {
        type: String,

        enum: [
          'Draft',
          'Submitted',
          'Under Review',
          'Returned for Revision',
          'Approved',
          'Rejected',
          'Cancelled',
        ],

        default: 'Draft',
      },

      approvalStage: {
  type: String,

  enum: [
    'Draft',
    'Submitted',
    'Document Verification',
    'Registration Review',
    'Awaiting Registration Fee',
    'Payment Verification',
    'Director General Review',
    'Approved',
    'Rejected',
  ],

  default: 'Draft',
},

      workflowHistory: [
        workflowHistorySchema,
      ],

      submittedAt: {
        type: Date,
      },

      reviewedAt: {
        type: Date,
      },

      approvedAt: {
        type: Date,
      },

      rejectedAt: {
        type: Date,
      },

      rejectionReason: {
        type: String,
        trim: true,
      },
revisionReason: {
  type: String,
  trim: true,
},

revisionRequestedAt: {
  type: Date,
},

revisionRequestedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
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

organizationApplicationSchema.index({
  organizationName: 'text',

  applicationNumber:
    'text',

  'applicant.fullName':
    'text',

  'applicant.email':
    'text',
});


organizationApplicationSchema.index({
  status: 1,

  approvalStage: 1,
});


organizationApplicationSchema.index({
  applicationType: 1,

  createdAt: -1,
});





organizationApplicationSchema.index({
  existingNGO: 1,

  applicationType: 1,
});


organizationApplicationSchema.pre(
  'validate',

  function validateRenewal(
    next
  ) {
    if (
      this.applicationType ===
        'Renewal' &&
      !this.existingNGO &&
      !this.previousRegistrationNumber
    ) {
      this.invalidate(
        'previousRegistrationNumber',

        'Renewal applications require an existing NGO or previous registration number.'
      );
    }

    next();
  }
);


export const OrganizationApplication =
  mongoose.model(
    'OrganizationApplication',
    organizationApplicationSchema
  );