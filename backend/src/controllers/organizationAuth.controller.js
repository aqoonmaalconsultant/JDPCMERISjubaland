import { z } from 'zod';

import {
  User,
} from '../models/User.js';

import {
  Roles,
  PortalRoles
} from '../security/roles.js';

import {
  HttpError,
} from '../utils/httpError.js';

const organizationSignupSchema =
  z.object({
    name: z
      .string()
      .min(2)
      .trim(),

    email: z
      .string()
      .email()
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8),

    institutionCategory:
      z.enum([
        'Government',
        'Non-Governmental',
      ]),
  });

export async function organizationSignup(
  req,
  res
) {
  const data =
    organizationSignupSchema.parse(
      req.body
    );

  const existingUser =
    await User.findOne({
      email:
        data.email,
    });

  if (existingUser) {
    throw new HttpError(
      409,
      'Email already registered'
    );
  }

  const user =
    new User({
      name:
        data.name,

      email:
        data.email,

      role:
        PortalRoles.ORGANIZATION_USER,

      institutionCategory:
        data.institutionCategory,

      isActive:
        true,
    });

  await user.setPassword(
    data.password
  );

  await user.save();

  res.status(201).json({
    message:
      'Institution account created successfully',

    user: {
      id:
        user._id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,

      institutionCategory:
        user.institutionCategory,
    },
  });
}