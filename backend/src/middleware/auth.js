import jwt from 'jsonwebtoken';

import {
  User,
} from '../models/User.js';

import {
  getRolePermissions,
} from '../security/roles.js';

import {
  HttpError,
} from '../utils/httpError.js';

/*
|--------------------------------------------------------------------------
| Authenticate
|--------------------------------------------------------------------------
*/

export async function authenticate(
  req,
  _res,
  next
) {
  try {
    const header =
      req.headers.authorization;

    const token =
      header?.startsWith(
        'Bearer '
      )
        ? header.slice(7)
        : null;

    if (!token) {
      throw new HttpError(
        401,
        'Authentication token is required'
      );
    }

    const payload =
      jwt.verify(
        token,
        process.env
          .JWT_ACCESS_SECRET
      );

    const user =
      await User.findById(
        payload.sub
      ).select(
        '-passwordHash'
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

    /*
    |--------------------------------------------------------------------------
    | Always Use Current Role Permissions
    |--------------------------------------------------------------------------
    |
    | roles.js is the authoritative RBAC source.
    |
    | This prevents old permission arrays stored in MongoDB from causing
    | users to keep outdated access after a role definition changes.
    |
    */

    user.permissions =
      getRolePermissions(
        user.role
      );

    req.user = user;

    next();
  } catch (error) {
    next(
      error.statusCode
        ? error
        : new HttpError(
            401,
            'Invalid authentication token'
          )
    );
  }
}

/*
|--------------------------------------------------------------------------
| Authorize
|--------------------------------------------------------------------------
*/

export function authorize(
  ...permissions
) {
  return (
    req,
    _res,
    next
  ) => {
    if (
      !permissions.length
    ) {
      return next();
    }

    const currentPermissions =
      getRolePermissions(
        req.user?.role
      );

    const hasPermission =
      permissions.some(
        (permission) =>
          currentPermissions.includes(
            permission
          )
      );

    if (!hasPermission) {
      return next(
        new HttpError(
          403,
          'You do not have permission to perform this action'
        )
      );
    }

    return next();
  };
}