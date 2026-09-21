import { z } from 'zod';

import {
  InstitutionProfile,
  InstitutionTypes,
} from '../models/InstitutionProfile.js';

import {
  Roles,
  PortalRoles
} from '../security/roles.js';

import {
  HttpError,
} from '../utils/httpError.js';

const contactPersonSchema =
  z.object({
    name: z
      .string()
      .min(
        2,
        'Contact Person Name is required.'
      )
      .trim(),

    position: z
      .string()
      .min(
        2,
        'Contact Person Position is required.'
      )
      .trim(),

    phone: z
      .string()
      .min(
        5,
        'Contact Person Phone is required.'
      )
      .trim(),

    email: z
      .string()
      .email(
        'A valid Contact Person Email is required.'
      )
      .trim()
      .toLowerCase(),
  });

/*
 * Government Institution Profile
 *
 * Government institutions do not
 * participate in organization
 * registration, licensing, fees,
 * renewal, or certificate workflows.
 *
 * Only basic institution identity
 * and contact details are required.
 */
const governmentInstitutionProfileSchema =
  z.object({
    institutionName: z
      .string()
      .min(
        2,
        'Institution Name is required.'
      )
      .trim(),

    website: z
      .string()
      .trim()
      .optional(),

    contactPerson:
      contactPersonSchema,
  });

/*
 * Non-Governmental Institution Profile
 *
 * Existing requirements remain
 * available for non-governmental
 * institution accounts.
 */
const nonGovernmentInstitutionProfileSchema =
  z.object({
    institutionName: z
      .string()
      .min(
        2,
        'Institution Name is required.'
      )
      .trim(),

    institutionType: z.enum(
      InstitutionTypes
    ),

    country: z
      .string()
      .min(
        2,
        'Country is required.'
      )
      .trim(),

    address: z
      .string()
      .trim()
      .optional(),

    phone: z
      .string()
      .min(
        5,
        'Institution Phone is required.'
      )
      .trim(),

    email: z
      .string()
      .email(
        'A valid Institution Email is required.'
      )
      .trim()
      .toLowerCase(),

    website: z
      .string()
      .trim()
      .optional(),

    registrationNumber: z
      .string()
      .trim()
      .optional(),

    registrationAuthority: z
      .string()
      .trim()
      .optional(),

    registrationCountry: z
      .string()
      .trim()
      .optional(),

    contactPerson:
      contactPersonSchema,
  });

function ensureInstitutionAccount(
  user
) {
  if (
    user.role !==
    PortalRoles.ORGANIZATION_USER
  ) {
    throw new HttpError(
      403,
      'This portal is only available to institution accounts.'
    );
  }
}

function isGovernmentAccount(
  user
) {
  return (
    user.institutionCategory ===
    'Government'
  );
}

function canEditProfile(
  profile
) {
  return [
    'Incomplete',
    'Returned for Update',
  ].includes(
    profile.verificationStatus
  );
}

export async function getInstitutionProfile(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const profile =
    await InstitutionProfile.findOne({
      accountUser:
        req.user._id,
    }).populate(
      'verifiedBy',
      'name email'
    );

  res.json({
    data:
      profile || null,
  });
}

export async function saveInstitutionProfile(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const governmentAccount =
    isGovernmentAccount(
      req.user
    );

  const validationSchema =
    governmentAccount
      ? governmentInstitutionProfileSchema
      : nonGovernmentInstitutionProfileSchema;

  const data =
    validationSchema.parse(
      req.body
    );

  const existing =
    await InstitutionProfile.findOne({
      accountUser:
        req.user._id,
    });

  if (
    existing &&
    !canEditProfile(
      existing
    )
  ) {
    throw new HttpError(
      409,
      `Institution profile cannot be edited while its verification status is "${existing.verificationStatus}".`
    );
  }

  const update = {
    $set: {
      ...data,

      accountUser:
        req.user._id,

      verificationStatus:
        existing
          ?.verificationStatus ===
        'Returned for Update'
          ? 'Returned for Update'
          : 'Incomplete',
    },
  };

  /*
   * Remove old organization-style
   * information from Government
   * Institution Profiles.
   *
   * This also cleans profiles that
   * were created before Government
   * accounts received their own
   * simplified profile structure.
   */
  if (
    governmentAccount
  ) {
    update.$unset = {
      institutionType: 1,
      country: 1,
      address: 1,
      phone: 1,
      email: 1,
      registrationNumber: 1,
      registrationAuthority: 1,
      registrationCountry: 1,
    };
  }

  const profile =
    await InstitutionProfile.findOneAndUpdate(
      {
        accountUser:
          req.user._id,
      },
      update,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
      res.status(
    existing
      ? 200
      : 201
  ).json({
    message:
      existing
        ? 'Institution profile updated successfully.'
        : 'Institution profile created successfully.',

    data:
      profile,
  });
}

export async function submitInstitutionProfile(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const profile =
    await InstitutionProfile.findOne({
      accountUser:
        req.user._id,
    });

  if (!profile) {
    throw new HttpError(
      404,
      'Complete the institution profile before submitting it for verification.'
    );
  }

  if (
    !canEditProfile(
      profile
    )
  ) {
    throw new HttpError(
      409,
      `Institution profile cannot be submitted while its verification status is "${profile.verificationStatus}".`
    );
  }

  /*
   * Final Government profile check.
   *
   * Government Institution Profiles
   * require only:
   * - Institution Name
   * - Contact Person Name
   * - Contact Person Position
   * - Contact Person Phone
   * - Contact Person Email
   *
   * Website remains optional.
   */
  if (
    isGovernmentAccount(
      req.user
    )
  ) {
    if (
      !profile.institutionName
        ?.trim()
    ) {
      throw new HttpError(
        400,
        'Institution Name is required.'
      );
    }

    if (
      !profile.contactPerson
        ?.name?.trim()
    ) {
      throw new HttpError(
        400,
        'Contact Person Name is required.'
      );
    }

    if (
      !profile.contactPerson
        ?.position?.trim()
    ) {
      throw new HttpError(
        400,
        'Contact Person Position is required.'
      );
    }

    if (
      !profile.contactPerson
        ?.phone?.trim()
    ) {
      throw new HttpError(
        400,
        'Contact Person Phone is required.'
      );
    }

    if (
      !profile.contactPerson
        ?.email?.trim()
    ) {
      throw new HttpError(
        400,
        'Contact Person Email is required.'
      );
    }
  }

  profile.verificationStatus =
    'Pending Verification';

  profile.submittedForVerificationAt =
    new Date();

  profile.verificationNotes =
    undefined;

  await profile.save();

  res.json({
    message:
      'Institution profile submitted to MoPIIC for verification.',

    data:
      profile,
  });
}