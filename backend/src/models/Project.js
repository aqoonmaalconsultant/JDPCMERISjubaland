import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Source Application
    |--------------------------------------------------------------------------
    */

    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectApplication',
      required: true,
      unique: true,
      index: true,
    },

    applicationNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Official Government Project Code
    |--------------------------------------------------------------------------
    */

    projectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Basic Information
    |--------------------------------------------------------------------------
    */

    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    sector: String,

    projectType: String,

    fundingSource: String,

    budget: Number,

    currency: {
      type: String,
      default: 'USD',
    },

    /*
    |--------------------------------------------------------------------------
    | Ownership
    |--------------------------------------------------------------------------
    */

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstitutionProfile',
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    /*
    |--------------------------------------------------------------------------
    | Timeline
    |--------------------------------------------------------------------------
    */

    startDate: Date,

    endDate: Date,

    /*
    |--------------------------------------------------------------------------
    | Implementation
    |--------------------------------------------------------------------------
    */

    implementationStatus: {
      type: String,
      default: 'Planning',
      enum: [
        'Planning',
        'Active',
        'On Hold',
        'Completed',
        'Cancelled',
      ],
    },

    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    */

    registeredAt: Date,

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Project =
  mongoose.model(
    'Project',
    projectSchema
  );