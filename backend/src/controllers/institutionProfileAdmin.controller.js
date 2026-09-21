import { z } from 'zod';

import {
  InstitutionProfile,
} from '../models/InstitutionProfile.js';

import {
  HttpError,
} from '../utils/httpError.js';

const returnSchema = z.object({
  reason: z
    .string()
    .min(
      3,
      'A reason is required when returning an institution profile.'
    )
    .trim(),
});

const verifySchema = z.object({
  note: z
    .string()
    .trim()
    .optional(),
});

function populateInstitutionProfile(query) {
  return query
    .populate(
      'accountUser',
      'name email role'
    )
    .populate(
      'verifiedBy',
      'name email role'
    );
}

/*
 * GET /institution-profiles
 *
 * Internal MoPIIC list of institution profiles.
 */
export async function listInstitutionProfiles(
  req,
  res
) {
  const {
    search = '',
    status = '',
    type = '',
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  if (status) {
    filter.verificationStatus =
      status;
  }

  if (type) {
    filter.institutionType =
      type;
  }

  if (search.trim()) {
    const term =
      search.trim();

    filter.$or = [
      {
        institutionName: {
          $regex: term,
          $options: 'i',
        },
      },

      {
        email: {
          $regex: term,
          $options: 'i',
        },
      },

      {
        phone: {
          $regex: term,
          $options: 'i',
        },
      },

      {
        'contactPerson.name': {
          $regex: term,
          $options: 'i',
        },
      },
    ];
  }

  const safePage =
    Math.max(
      Number(page) || 1,
      1
    );

  const safeLimit =
    Math.min(
      Math.max(
        Number(limit) || 20,
        1
      ),
      100
    );

  const skip =
    (safePage - 1) *
    safeLimit;

  const [
    items,
    total,
  ] = await Promise.all([
    populateInstitutionProfile(
      InstitutionProfile.find(
        filter
      )
    )
      .sort({
        submittedForVerificationAt:
          -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(safeLimit),

    InstitutionProfile.countDocuments(
      filter
    ),
  ]);

  res.json({
    data: items,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages:
        Math.ceil(
          total /
            safeLimit
        ) || 1,
    },
  });
}

/*
 * GET /institution-profiles/:id
 *
 * Internal MoPIIC view of one institution.
 */
export async function getInstitutionProfileForReview(
  req,
  res
) {
  const profile =
    await populateInstitutionProfile(
      InstitutionProfile.findById(
        req.params.id
      )
    );

  if (!profile) {
    throw new HttpError(
      404,
      'Institution profile not found.'
    );
  }

  res.json({
    data: profile,
  });
}

/*
 * PATCH /institution-profiles/:id/return-for-update
 *
 * Pending Verification
 *        ↓
 * Returned for Update
 */
export async function returnInstitutionProfileForUpdate(
  req,
  res
) {
  const {
    reason,
  } =
    returnSchema.parse(
      req.body
    );

  const profile =
    await InstitutionProfile.findById(
      req.params.id
    );

  if (!profile) {
    throw new HttpError(
      404,
      'Institution profile not found.'
    );
  }

  if (
    profile.verificationStatus !==
    'Pending Verification'
  ) {
    throw new HttpError(
      409,
      `Only institution profiles awaiting verification can be returned. Current status: "${profile.verificationStatus}".`
    );
  }

  profile.verificationStatus =
    'Returned for Update';

  profile.verificationNotes =
    reason;

  profile.verifiedBy =
    undefined;

  profile.verifiedAt =
    undefined;

  await profile.save();

  const updated =
    await populateInstitutionProfile(
      InstitutionProfile.findById(
        profile._id
      )
    );

  res.json({
    message:
      'Institution profile returned for update.',

    data:
      updated,
  });
}

/*
 * PATCH /institution-profiles/:id/verify
 *
 * Pending Verification
 *        ↓
 * Verified
 */
export async function verifyInstitutionProfile(
  req,
  res
) {
  const {
    note,
  } =
    verifySchema.parse(
      req.body || {}
    );

  const profile =
    await InstitutionProfile.findById(
      req.params.id
    );

  if (!profile) {
    throw new HttpError(
      404,
      'Institution profile not found.'
    );
  }

  if (
    profile.verificationStatus !==
    'Pending Verification'
  ) {
    throw new HttpError(
      409,
      `Only institution profiles awaiting verification can be verified. Current status: "${profile.verificationStatus}".`
    );
  }

  profile.verificationStatus =
    'Verified';

  profile.verificationNotes =
    note || undefined;

  profile.verifiedBy =
    req.user._id;

  profile.verifiedAt =
    new Date();

  profile.suspendedAt =
    undefined;

  await profile.save();

  const updated =
    await populateInstitutionProfile(
      InstitutionProfile.findById(
        profile._id
      )
    );

  res.json({
    message:
      'Institution verified successfully.',

    data:
      updated,
  });
}