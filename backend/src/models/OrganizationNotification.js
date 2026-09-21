import mongoose from 'mongoose';

const organizationNotificationSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          'User',

        required:
          true,

        index:
          true,
      },

      ngo: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          'NGO',

        index:
          true,
      },

      certificate: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          'NGOCertificate',
      },

      type: {
        type:
          String,

        enum: [
          'CERTIFICATE_SUSPENDED',
          'CERTIFICATE_REVOKED',
        ],

        required:
          true,
      },

      title: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      message: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      reason: {
        type:
          String,

        trim:
          true,
      },

      certificateNumber: {
        type:
          String,

        trim:
          true,

        uppercase:
          true,
      },

      isRead: {
        type:
          Boolean,

        default:
          false,

        index:
          true,
      },

      readAt: {
        type:
          Date,
      },

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          'User',
      },
    },
    {
      timestamps:
        true,
    }
  );

organizationNotificationSchema.index({
  user: 1,
  createdAt: -1,
});

organizationNotificationSchema.index({
  user: 1,
  isRead: 1,
  createdAt: -1,
});

const OrganizationNotification =
  mongoose.models
    .OrganizationNotification ||
  mongoose.model(
    'OrganizationNotification',
    organizationNotificationSchema
  );

export default OrganizationNotification;