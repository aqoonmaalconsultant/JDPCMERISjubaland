import mongoose from "mongoose";

const projectLocationSchema = new mongoose.Schema(
  {
    project: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Project",
  required: true,
  index: true,
},

    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Region",
      required: true,
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },

    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
    },

    siteName: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    locationType: {
      type: String,
      enum: [
        "Project Site",
        "Office",
        "Warehouse",
        "Hospital",
        "School",
        "Water Point",
        "Borehole",
        "Road",
        "Bridge",
        "Solar Plant",
        "Camp",
        "Other",
      ],
      default: "Project Site",
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Completed",
        "Inactive",
      ],
      default: "Active",
    },

    remarks: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// GeoJSON field
projectLocationSchema.add({
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
});

// Spatial index
projectLocationSchema.index({
  location: "2dsphere",
});

// Automatically keep GeoJSON synchronized
projectLocationSchema.pre("save", function (next) {
  this.location = {
    type: "Point",
    coordinates: [
      this.longitude,
      this.latitude,
    ],
  };

  next();
});

export const ProjectLocation = mongoose.model(
  "ProjectLocation",
  projectLocationSchema
);