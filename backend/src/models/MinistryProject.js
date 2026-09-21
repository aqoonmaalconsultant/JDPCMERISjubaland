import mongoose from 'mongoose';

/*
|--------------------------------------------------------------------------
| Reusable Schemas
|--------------------------------------------------------------------------
*/

const projectLocationSchema =
  new mongoose.Schema(
    {
      region: {
        type: String,
        trim: true,
      },

      district: {
        type: String,
        trim: true,
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
      _id: true,
    }
  );

const objectiveSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      order: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: true,
    }
  );

const componentSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      order: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: true,
    }
  );

const achievementSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      status: {
        type: String,
        enum: [
          'Not Started',
          'In Progress',
          'Completed',
        ],
        default: 'Not Started',
      },

      order: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: true,
    }
  );

const stakeholderSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: [
          'Funded By',
          'Implemented By',
          'Supported By',
          'Facilitated By',
          'Partner',
          'Other',
        ],
        required: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      logoUrl: {
        type: String,
        trim: true,
      },

      website: {
        type: String,
        trim: true,
      },

      order: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: true,
    }
  );

const galleryImageSchema =
  new mongoose.Schema(
    {
      url: {
        type: String,
        required: true,
        trim: true,
      },

      caption: {
        type: String,
        trim: true,
      },

      altText: {
        type: String,
        trim: true,
      },

      order: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: true,
    }
  );

/*
|--------------------------------------------------------------------------
| Ministry Project Schema
|--------------------------------------------------------------------------
*/

const ministryProjectSchema =
  new mongoose.Schema(
    {
      /*
      |--------------------------------------------------------------------------
      | Basic Information
      |--------------------------------------------------------------------------
      */

     projectCode: {
  type: String,
  trim: true,
  unique: true,
  sparse: true,
  index: true,

  set: (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return undefined;
    }

    const normalized =
      String(value).trim();

    return normalized ||
      undefined;
  },
},
      title: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      shortTitle: {
        type: String,
        trim: true,
      },

      slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true,
      },

      overview: {
        type: String,
        required: true,
        trim: true,
      },

      goal: {
        type: String,
        trim: true,
      },

      /*
      |--------------------------------------------------------------------------
      | Classification
      |--------------------------------------------------------------------------
      */

      primarySector: {
        type: String,
        trim: true,
        index: true,
      },

      sectors: [
        {
          type: String,
          trim: true,
        },
      ],

      projectType: {
        type: String,
        trim: true,
      },

      /*
      |--------------------------------------------------------------------------
      | Project Status
      |--------------------------------------------------------------------------
      */

      status: {
        type: String,
        enum: [
          'Planned',
          'Ongoing',
          'Completed',
          'On Hold',
          'Cancelled',
        ],
        default: 'Planned',
        index: true,
      },

      overallProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      startDate: {
        type: Date,
      },

      endDate: {
        type: Date,
      },

      /*
      |--------------------------------------------------------------------------
      | Geographic Coverage
      |--------------------------------------------------------------------------
      */

      geographicCoverage: {
        description: {
          type: String,
          trim: true,
        },

        locations: [
          projectLocationSchema
        ],
      },

      /*
      |--------------------------------------------------------------------------
      | Target Groups
      |--------------------------------------------------------------------------
      */

      targetGroups: [
        {
          type: String,
          trim: true,
        },
      ],

      /*
      |--------------------------------------------------------------------------
      | Objectives
      |--------------------------------------------------------------------------
      */

      objectives: [
        objectiveSchema
      ],

      /*
      |--------------------------------------------------------------------------
      | Project Components
      |--------------------------------------------------------------------------
      */

      components: [
        componentSchema
      ],

      /*
      |--------------------------------------------------------------------------
      | Ministry Role
      |--------------------------------------------------------------------------
      */

      ministryRole: [
        {
          type: String,
          trim: true,
        },
      ],

      /*
      |--------------------------------------------------------------------------
      | Key Output Areas
      |--------------------------------------------------------------------------
      */

      keyOutputs: [
        {
          type: String,
          trim: true,
        },
      ],

      /*
      |--------------------------------------------------------------------------
      | Achievements
      |--------------------------------------------------------------------------
      */

      achievements: [
        achievementSchema
      ],

      /*
      |--------------------------------------------------------------------------
      | Project Media
      |--------------------------------------------------------------------------
      */

      media: {
        coverImage: {
          type: String,
          trim: true,
        },

        geographyImage: {
          type: String,
          trim: true,
        },

        objectiveImage: {
          type: String,
          trim: true,
        },

        gallery: [
          galleryImageSchema
        ],
      },

      /*
      |--------------------------------------------------------------------------
      | Project Stakeholders
      |--------------------------------------------------------------------------
      */

      stakeholders: [
        stakeholderSchema
      ],

      /*
      |--------------------------------------------------------------------------
      | Optional Financial Information
      |--------------------------------------------------------------------------
      */

      budget: {
        type: Number,
        min: 0,
      },

      currency: {
        type: String,
        trim: true,
        uppercase: true,
        default: 'USD',
      },

      showBudgetPublicly: {
        type: Boolean,
        default: false,
      },

      /*
      |--------------------------------------------------------------------------
      | Publication
      |--------------------------------------------------------------------------
      */

      publicationStatus: {
        type: String,
        enum: [
          'Draft',
          'Published',
          'Archived',
        ],
        default: 'Draft',
        index: true,
      },

      featured: {
        type: Boolean,
        default: false,
        index: true,
      },

      publishedAt: {
        type: Date,
      },

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      active: {
        type: Boolean,
        default: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

ministryProjectSchema.index({
  publicationStatus: 1,
  status: 1,
});

ministryProjectSchema.index({
  primarySector: 1,
  status: 1,
});

ministryProjectSchema.index({
  featured: 1,
  publishedAt: -1,
});

ministryProjectSchema.index({
  title: 'text',
  shortTitle: 'text',
  overview: 'text',
  goal: 'text',
});

/*
|--------------------------------------------------------------------------
| Automatic Publication Date
|--------------------------------------------------------------------------
*/

ministryProjectSchema.pre(
  'save',
  function setPublicationDate(next) {
    if (
      this.publicationStatus ===
        'Published' &&
      !this.publishedAt
    ) {
      this.publishedAt =
        new Date();
    }

    next();
  }
);

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

export const MinistryProject =
  mongoose.models.MinistryProject ||
  mongoose.model(
    'MinistryProject',
    ministryProjectSchema
  );