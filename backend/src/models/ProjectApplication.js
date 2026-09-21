import mongoose from 'mongoose';

const locationSchema =
  new mongoose.Schema(
    {
      region: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'Region',
        required: true,
      },

      district: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'District',
        required: true,
      },

      village: {
        type: String,
        trim: true,
      },

      siteName: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    {
      _id: false,
    }
  );

const beneficiarySchema =
  new mongoose.Schema(
    {
      householdCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      individuals: {
        type: Number,
        default: 0,
        min: 0,
      },

      male: {
        type: Number,
        default: 0,
        min: 0,
      },

      female: {
        type: Number,
        default: 0,
        min: 0,
      },

      disabilityStatus: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

const focalPointSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        trim: true,
      },

      position: {
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
    },
    {
      _id: false,
    }
  );

/*
 * Reusable stakeholder structure.
 *
 * A stakeholder may already exist in
 * one of the JAIMS master-data sources,
 * or it may be entered by name only.
 *
 * This allows projects such as:
 *
 * Funded By:
 * World Bank
 *
 * Supported By:
 * Federal Ministry of Energy
 *
 * Implemented By:
 * Jubaland Ministry of Energy
 *
 * End User:
 * Ministry of Health
 */
const institutionReferenceSchema =
  new mongoose.Schema(
    {
      institutionName: {
        type: String,
        required: true,
        trim: true,
      },

      institutionProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstitutionProfile',
      },

      ministry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ministry',
      },

      donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
      },

      partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
      },
    },
    {
      _id: false,
    }
  );

const registrationHistorySchema =
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
        trim: true,
      },

      toStatus: {
        type: String,
        trim: true,
      },

      fromStage: {
        type: String,
        trim: true,
      },

      toStage: {
        type: String,
        trim: true,
      },

      actor: {
        type:
          mongoose.Schema.Types
            .ObjectId,
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

const projectApplicationSchema =
  new mongoose.Schema(
    {
      /*
       * APPLICATION IDENTITY
       */
      applicationNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
      },

      /*
       * Institution account that created
       * and submitted this application.
       *
       * This identifies portal ownership.
       * It does not automatically mean
       * that the institution implements
       * the project.
       */
      submittingInstitution: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'InstitutionProfile',
        required: true,
        index: true,
      },

      submittedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
        required: true,
      },

      /*
       * =================================
       * 1. PROJECT IDENTIFICATION
       * =================================
       */
      projectName: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      objectives: [
        {
          type: String,
          trim: true,
        },
      ],

      components: [
        {
          type: String,
          trim: true,
        },
      ],

      projectType: {
        type: String,

        enum: [
          'Development',
          'Humanitarian',
          'Emergency Response',
          'Infrastructure',
          'Technical Assistance',
          'Capacity Building',
          'Research / Assessment',
          'Other',
        ],
      },

      /*
       * =================================
       * 2. PROJECT STAKEHOLDERS
       * =================================
       *
       * The stakeholder model replaces
       * the old rigid separation between:
       *
       * - Government Coordination
       * - Lead Implementer
       * - Partner
       * - Co-Implementer
       *
       * A project may therefore have:
       *
       * Funded By + Implemented By
       *
       * or:
       *
       * Funded By
       * Supported By
       * Implemented By
       * End User
       */

      /*
       * Required when the application is
       * submitted.
       *
       * Example:
       * World Bank
       */
      fundedBy: {
    type: institutionReferenceSchema,
},

      /*
       * Optional.
       * Multiple institutions allowed.
       */
      supportedBy: [
         institutionReferenceSchema,
      ],

      /*
       * Required when submitted.
       * Multiple implementing
       * institutions are allowed.
       */
      implementedBy: [
         institutionReferenceSchema,
      ],

      /*
       * Optional.
       *
       * Examples:
       * Ministry of Health
       * Hospital
       * Municipality
       * Water utility
       */
      endUsers: [
        institutionReferenceSchema,
      ],

      /*
       * =================================
       * 3. FUNDING
       * =================================
       *
       * The Funding Institution is already
       * represented by fundedBy.
       *
       * This section therefore stores only
       * financial information.
       */
      fundingSource: {
        type: String,
        trim: true,
      },

      budget: {
        type: Number,
        min: 0,
      },

      currency: {
        type: String,
        default: 'USD',
        trim: true,
        uppercase: true,
      },

      /*
       * =================================
       * 4. PROJECT CLASSIFICATION
       * =================================
       */
      sector: {
        type: String,
        trim: true,
      },

      subSector: {
        type: String,
        trim: true,
      },

      /*
       * =================================
       * 5. PROJECT DURATION
       * =================================
       */
      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
      },

      /*
       * =================================
       * 6. GEOGRAPHIC COVERAGE
       * =================================
       */
      locations: [
        locationSchema,
      ],

      /*
       * =================================
       * 7. PROJECT CONTACT
       * =================================
       *
       * One primary project-specific
       * contact person.
       *
       * This is different from the
       * institution account contact.
       */
      

      /*
       * =================================
       * 8. TARGET BENEFICIARIES
       * =================================
       *
       * Planned beneficiary targets.
       * Actual achievements belong to
       * Project Management later.
       */
      beneficiaries:
        beneficiarySchema,

      /*
       * =================================
       * LEGACY COMPATIBILITY FIELDS
       * =================================
       *
       * DO NOT use these for new project
       * registration forms.
       *
       * They remain temporarily so that
       * existing applications and the
       * current Final Registration logic
       * do not break while the rest of
       * JAIMS is migrated.
       */

      /*
       * Legacy Government Coordination
       */
      ministry: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'Ministry',
      },

      supportingMinistries: [
        {
          type:
            mongoose.Schema.Types
              .ObjectId,
          ref: 'Ministry',
        },
      ],

      federalLineMinistry: {
        type: String,
        trim: true,
      },

      /*
       * Legacy donor reference.
       *
       * New applications use fundedBy.
       */
      donor: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'Donor',
      },

      /*
       * Legacy Implementation Arrangement
       */
      submittingInstitutionIsLeadImplementer:
        {
          type: Boolean,
          default: false,
        },

      leadImplementerType: {
        type: String,

        enum: [
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
        ],
      },

      leadImplementingInstitution: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'InstitutionProfile',
      },

      leadImplementerName: {
        type: String,
        trim: true,
      },

      leadImplementerMinistry: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'Ministry',
      },

      partner: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'Partner',
      },

      coImplementingInstitutions: [
        {
          type:
            mongoose.Schema.Types
              .ObjectId,
          ref: 'InstitutionProfile',
        },
      ],

      coImplementingMinistries: [
        {
          type:
            mongoose.Schema.Types
              .ObjectId,
          ref: 'Ministry',
        },
      ],

      coImplementingPartners: [
        {
          type:
            mongoose.Schema.Types
              .ObjectId,
          ref: 'Partner',
        },
      ],

      contractor: {
        type: String,
        trim: true,
      },

      consultant: {
        type: String,
        trim: true,
      },

      /*
       * Legacy focal points.
       *
       * New applications use
       * projectContact.
       */
      

   projectContact:
  focalPointSchema,

      /*
       * Legacy visibility field.
       *
       * New institution applications
       * should not choose project
       * publication visibility.
       *
       * MoPIIC will control publication
       * later.
       */
      visibility: {
        type: String,

        enum: [
          'internal',
          'public',
          'confidential',
        ],

        default: 'internal',
      },

      /*
       * Legacy implementation status.
       *
       * New project registration does not
       * request this from the institution.
       *
       * Project Management will maintain
       * it after registration.
       */
      implementationStatus: {
        type: String,

        enum: [
          'Planned',
          'Not Started',
          'Ongoing',
          'On Hold',
          'Completed',
          'Cancelled',
        ],

        default: 'Planned',
      },
            /*
       * =================================
       * PROJECT REGISTRATION WORKFLOW
       * =================================
       *
       * Draft
       *   ↓
       * Submitted
       *   ↓
       * Project Verification
       *   ↓
       * Final Review
       *   ↓
       * Registered
       */
      registrationStatus: {
        type: String,

        enum: [
  'Draft',
  'Submitted',
  'Under Review',
  'Verified',
  'Returned for Revision',
  'Registered',
],

        default: 'Draft',
        index: true,
      },

      registrationStage: {
        type: String,
enum: [
  'Draft',
  'Submitted',
  'Project Verification',
  'Final Registration',
  'Registered',
],

        default: 'Draft',
        index: true,
      },

      revisionReason: {
        type: String,
        trim: true,
      },

      submittedAt: {
        type: Date,
      },

      projectVerificationAt: {
        type: Date,
      },

      projectVerifiedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
      },

      returnedForRevisionAt: {
        type: Date,
      },

      finalReviewAt: {
        type: Date,
      },

      finalReviewBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
      },

      registeredAt: {
        type: Date,
      },

      registeredProject: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'Project',
      },

      registeredBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
      },

      /*
       * FULL REGISTRATION AUDIT TRAIL
       */
      registrationHistory: [
        registrationHistorySchema,
      ],

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
      },

      updatedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: 'User',
      },
    },
    {
      timestamps: true,
    }
  );

/*
 * Project end date cannot be earlier
 * than project start date.
 */
projectApplicationSchema.pre(
  'validate',
  function validateDates(next) {
    if (
      this.startDate &&
      this.endDate &&
      this.endDate <
        this.startDate
    ) {
      return next(
        new Error(
          'Project end date cannot be earlier than the start date.'
        )
      );
    }

    return next();
  }
);

/*
 * Search
 */
projectApplicationSchema.index({
  projectName: 'text',
  description: 'text',
  sector: 'text',
});

/*
 * Institution Portal applications
 */
projectApplicationSchema.index({
  submittingInstitution: 1,
  registrationStatus: 1,
});

/*
 * Internal MoPIIC registration
 * workflow.
 */
projectApplicationSchema.index({
  registrationStage: 1,
  submittedAt: -1,
});

/*
 * New stakeholder reporting indexes.
 */
projectApplicationSchema.index({
  'fundedBy.donor': 1,
  registrationStatus: 1,
});

projectApplicationSchema.index({
  'fundedBy.institutionProfile': 1,
  registrationStatus: 1,
});

projectApplicationSchema.index({
  'implementedBy.institutionProfile': 1,
  registrationStatus: 1,
});

projectApplicationSchema.index({
  'implementedBy.ministry': 1,
  registrationStatus: 1,
});

/*
 * Legacy indexes retained temporarily.
 */
projectApplicationSchema.index({
  ministry: 1,
  registrationStage: 1,
});

projectApplicationSchema.index({
  donor: 1,
  registrationStatus: 1,
});

projectApplicationSchema.index({
  leadImplementingInstitution: 1,
  registrationStatus: 1,
});

projectApplicationSchema.index({
  leadImplementerMinistry: 1,
  registrationStatus: 1,
});

/*
 * Geographic reporting
 */
projectApplicationSchema.index({
  'locations.region': 1,
  'locations.district': 1,
});

export const ProjectApplication =
  mongoose.model(
    'ProjectApplication',
    projectApplicationSchema
  );