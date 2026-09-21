import mongoose from 'mongoose';

export const InstitutionTypes = Object.freeze([
  'Government Line Ministry',
  'Government Agency',
  'Other Government Institution',
  'UN Agency',
  'INGO',
  'LNGO',
  'Development Partner',
  'Private Company',
  'Consultant',
  'CBO',
  'Other',
]);

export const InstitutionVerificationStatuses =
  Object.freeze([
    'Incomplete',
    'Pending Verification',
    'Verified',
    'Returned for Update',
    'Suspended',
  ]);

const contactPersonSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      position: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
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
    },
    {
      _id: false,
    }
  );

const institutionProfileSchema =
  new mongoose.Schema(
    {
      accountUser: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
      },

      institutionName: {
        type: String,
        required: true,
        trim: true,
      },

      /*
       * Optional at database level.
       *
       * Government accounts do not need
       * an Institution Type in their
       * profile.
       *
       * Non-Governmental requirements
       * are enforced by the controller.
       */
      institutionType: {
        type: String,
        enum: InstitutionTypes,
      },

      country: {
        type: String,
        trim: true,
      },

      address: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      website: {
        type: String,
        trim: true,
      },

      registrationNumber: {
        type: String,
        trim: true,
      },

      registrationAuthority: {
        type: String,
        trim: true,
      },

      registrationCountry: {
        type: String,
        trim: true,
      },

      contactPerson: {
        type: contactPersonSchema,
        required: true,
      },

      verificationStatus: {
        type: String,
        enum:
          InstitutionVerificationStatuses,
        default: 'Incomplete',
        index: true,
      },

      verificationNotes: {
        type: String,
        trim: true,
      },

      submittedForVerificationAt:
        Date,

      verifiedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
      },

      verifiedAt:
        Date,

      suspendedAt:
        Date,
    },
    {
      timestamps: true,
    }
  );

institutionProfileSchema.index({
  institutionName: 'text',
  institutionType: 'text',
});

institutionProfileSchema.index({
  institutionType: 1,
  verificationStatus: 1,
});

export const InstitutionProfile =
  mongoose.model(
    'InstitutionProfile',
    institutionProfileSchema
  );