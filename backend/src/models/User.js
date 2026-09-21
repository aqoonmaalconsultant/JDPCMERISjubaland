import bcrypt from 'bcryptjs';

import mongoose from 'mongoose';

import {
  Roles,
  getRolePermissions,
} from '../security/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(Roles),
      required: true,
    },

    institutionCategory: {
      type: String,
      enum: [
        'Government',
        'Non-Governmental',
      ],
    },

    permissions: [
      {
        type: String,
      },
    ],

    ministry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ministry',
    },

    region: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
    },

    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
    },

    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: Date,
  },

  {
    timestamps: true,
  }
);

userSchema.pre(
  'validate',
  function setRolePermissions(next) {
    if (
      this.role &&
      (
        this.isNew ||
        this.isModified('role') ||
        !this.permissions?.length
      )
    ) {
      this.permissions =
        getRolePermissions(
          this.role
        );
    }

    next();
  }
);

userSchema.methods.setPassword =
  async function setPassword(
    password
  ) {
    this.passwordHash =
      await bcrypt.hash(
        password,
        12
      );
  };

userSchema.methods.verifyPassword =
  function verifyPassword(
    password
  ) {
    return bcrypt.compare(
      password,
      this.passwordHash
    );
  };

export const User =
  mongoose.model(
    'User',
    userSchema
  );