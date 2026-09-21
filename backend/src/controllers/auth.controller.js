import jwt from 'jsonwebtoken';

import { z } from 'zod';

import {
  RefreshToken,
  hashRefreshToken,
} from '../models/RefreshToken.js';

import {
  User,
} from '../models/User.js';
import {
  getRolePermissions,
} from '../security/roles.js';
import {
  HttpError,
} from '../utils/httpError.js';

const loginSchema = z.object({
  email: z.string().email(),

  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

function refreshTtlToDate() {
  const ttl =
    process.env.REFRESH_TOKEN_TTL ||
    '7d';

  const match =
    ttl.match(/^(\d+)([dhm])$/);

  const amount =
    Number(match?.[1] || 7);

  const unit =
    match?.[2] || 'd';

  const ms =
    unit === 'h'
      ? amount * 60 * 60 * 1000
      : unit === 'm'
        ? amount * 60 * 1000
        : amount * 24 * 60 * 60 * 1000;

  return new Date(
    Date.now() + ms
  );
}

function signAccessToken(user) {
  const payload = {
    sub:
      user._id.toString(),

    role:
      user.role,
  };

  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn:
        process.env.ACCESS_TOKEN_TTL ||
        '15m',
    }
  );
}

function authUser(user) {
  return {
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

    permissions:
  getRolePermissions(
    user.role
  ),

    ministry:
      user.ministry,

    region:
      user.region,

    district:
      user.district,

    donor:
      user.donor,

    partner:
      user.partner,
  };
}

async function createRefreshToken(
  req,
  user
) {
  const payload = {
    sub:
      user._id.toString(),

    role:
      user.role,

    typ:
      'refresh',
  };

  const token =
    jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn:
          process.env
            .REFRESH_TOKEN_TTL ||
          '7d',
      }
    );

  await RefreshToken.create({
    user:
      user._id,

    tokenHash:
      hashRefreshToken(token),

    expiresAt:
      refreshTtlToDate(),

    ipAddress:
      req.ip,

    userAgent:
      req.headers['user-agent'],
  });

  return token;
}
export async function login(
  req,
  res
) {
  const data =
    loginSchema.parse(
      req.body
    );

  const user =
    await User.findOne({
      email:
        data.email,
    });

  if (
    !user ||
    !(await user.verifyPassword(
      data.password
    ))
  ) {
    throw new HttpError(
      401,
      'Invalid email or password'
    );
  }

  user.lastLoginAt =
    new Date();

  await user.save();

  res.json({
    user:
      authUser(user),

    accessToken:
      signAccessToken(user),

    refreshToken:
      await createRefreshToken(
        req,
        user
      ),
  });
}

export function getCurrentUser(
  req,
  res
) {
  res.json({
    user:
      authUser(req.user),
  });
}

export async function refreshToken(
  req,
  res
) {
  const {
    refreshToken: token,
  } = refreshSchema.parse(
    req.body
  );

  let payload;

  try {
    payload =
      jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
      );
  } catch {
    throw new HttpError(
      401,
      'Invalid refresh token'
    );
  }

  const tokenHash =
    hashRefreshToken(token);

  const stored =
    await RefreshToken.findOne({
      tokenHash,
    });

  if (
    !stored ||
    stored.revokedAt ||
    stored.expiresAt <
      new Date()
  ) {
    throw new HttpError(
      401,
      'Refresh token expired or revoked'
    );
  }

  const user =
    await User.findById(
      payload.sub
    );

  if (
    !user ||
    !user.isActive
  ) {
    throw new HttpError(
      401,
      'Invalid or inactive user'
    );
  }

  const newRefreshToken =
    await createRefreshToken(
      req,
      user
    );

  stored.revokedAt =
    new Date();

  stored.replacedByTokenHash =
    hashRefreshToken(
      newRefreshToken
    );

  await stored.save();

  res.json({
    user:
      authUser(user),

    accessToken:
      signAccessToken(user),

    refreshToken:
      newRefreshToken,
  });
}

export async function logout(
  req,
  res
) {
  const {
    refreshToken: token,
  } = refreshSchema.parse(
    req.body
  );

  const tokenHash =
    hashRefreshToken(token);

  await RefreshToken.updateOne(
    {
      tokenHash,
    },
    {
      revokedAt:
        new Date(),
    }
  );

  res
    .status(204)
    .send();
}