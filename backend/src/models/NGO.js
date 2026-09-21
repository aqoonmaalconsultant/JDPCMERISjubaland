import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
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

const ngoSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    organizationName: {
      type: String,
      required: true,
      unique: true,
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

    contact: {
      type: contactSchema,
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

    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },

    latestApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationApplication',
    },

    currentCertificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGOCertificate',
    },

    registrationStatus: {
      type: String,
      enum: [
        'Active',
        'Expired',
        'Suspended',
        'Revoked',
        'Inactive',
      ],
      default: 'Active',
    },

    complianceStatus: {
      type: String,
      enum: [
        'Compliant',
        'Pending Review',
        'Non-Compliant',
      ],
      default: 'Pending Review',
    },

    visibility: {
      type: String,
      enum: [
        'internal',
        'public',
        'confidential',
      ],
      default: 'internal',
    },

    remarks: {
      type: String,
      trim: true,
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

ngoSchema.index({
  organizationName: 'text',
  registrationNumber: 'text',
});

ngoSchema.index({
  registrationStatus: 1,
});

ngoSchema.index({
  complianceStatus: 1,
});

ngoSchema.index({
  partner: 1,
});

const NGO = mongoose.model('NGO', ngoSchema);

export default NGO;