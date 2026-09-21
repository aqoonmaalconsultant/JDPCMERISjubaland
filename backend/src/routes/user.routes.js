import { Router } from 'express';
import { createUser, deleteUser, getRbacCatalog, listUsers, updateUser } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const userRouter = Router();

userRouter.get(
  '/',
  authenticate,
  authorize(Permissions.MANAGE_USERS),
  asyncHandler(listUsers)
);

userRouter.get(
  '/rbac',
  authenticate,
  authorize(Permissions.MANAGE_USERS),
  getRbacCatalog
);

userRouter.post(
  '/',
  authenticate,
  authorize(Permissions.MANAGE_USERS),
  asyncHandler(createUser)
);

userRouter.patch(
  '/:id',
  authenticate,
  authorize(Permissions.MANAGE_USERS),
  asyncHandler(updateUser)
);

userRouter.delete(
  '/:id',
  authenticate,
  authorize(Permissions.MANAGE_USERS),
  asyncHandler(deleteUser)
);
