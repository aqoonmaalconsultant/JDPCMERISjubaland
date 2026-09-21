import { z } from 'zod';
import { User } from '../models/User.js';
import { Permissions, Roles, getRoleCatalog, getRolePermissions, roleScopeRequirements } from '../security/roles.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid reference id');

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(Object.values(Roles)),
  ministry: objectIdSchema.optional(),
  region: objectIdSchema.optional(),
  district: objectIdSchema.optional(),
  donor: objectIdSchema.optional(),
  partner: objectIdSchema.optional(),
  isActive: z.boolean().optional()
});

const userUpdateSchema = userSchema.partial().extend({
  password: z.string().min(8).optional()
});

const scopeFields = ['ministry', 'region', 'district', 'donor', 'partner'];

function cleanPayload(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== '' && value !== undefined && value !== null));
}

function applyRoleScopes(user, data, role) {
  const requiredScopes = roleScopeRequirements[role] || [];

  for (const field of scopeFields) {
    user[field] = requiredScopes.includes(field) ? data[field] : undefined;
  }

  const missingScope = requiredScopes.find((field) => !data[field]);
  if (missingScope) {
    throw new HttpError(400, `${role} requires ${missingScope} scope`);
  }
}

async function assertSuperAdminSafety(targetUser, changes = {}) {
  if (targetUser.role !== Roles.SUPER_ADMIN) return;

  const willStopBeingActive = changes.isActive === false || (changes.role && changes.role !== Roles.SUPER_ADMIN) || changes.delete === true;
  if (!willStopBeingActive) return;

  const activeSuperAdmins = await User.countDocuments({
    _id: { $ne: targetUser._id },
    role: Roles.SUPER_ADMIN,
    isActive: true
  });

  if (activeSuperAdmins === 0) {
    throw new HttpError(409, 'At least one active Super Admin account is required');
  }
}

function publicUser(user) {
  const object = user.toObject ? user.toObject() : user;
  delete object.passwordHash;
  return object;
}

export async function listUsers(_req, res) {
  const data = await User.find()
    .select('-passwordHash')
    .populate('ministry region district donor partner')
    .sort({ createdAt: -1 })
    .limit(300);

  res.json({ data });
}

export function getRbacCatalog(_req, res) {
  res.json({
    roles: getRoleCatalog(),
    permissions: Object.values(Permissions)
  });
}

export async function createUser(req, res) {
  const data = cleanPayload(userSchema.parse(req.body));
  const existing = await User.findOne({ email: data.email });

  if (existing) {
    throw new HttpError(409, 'A user with this email already exists');
  }

  const user = new User({
    name: data.name,
    email: data.email,
    role: data.role,
    permissions: getRolePermissions(data.role),
    isActive: data.isActive ?? true
  });

  applyRoleScopes(user, data, data.role);

  await user.setPassword(data.password);
  await user.save();
  await writeAudit(req, 'USER_CREATED', 'User', user._id, null, publicUser(user));

  const created = await User.findById(user._id).select('-passwordHash').populate('ministry region district donor partner');
  res.status(201).json({ data: created });
}

export async function updateUser(req, res) {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const before = user.toObject();
  const data = cleanPayload(userUpdateSchema.parse(req.body));

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ email: data.email, _id: { $ne: user._id } });
    if (existing) {
      throw new HttpError(409, 'A user with this email already exists');
    }
  }

  await assertSuperAdminSafety(user, data);

  const nextRole = data.role || user.role;
  const nextScope = {
    ministry: data.ministry ?? user.ministry?.toString(),
    region: data.region ?? user.region?.toString(),
    district: data.district ?? user.district?.toString(),
    donor: data.donor ?? user.donor?.toString(),
    partner: data.partner ?? user.partner?.toString()
  };

  const allowed = ['name', 'email', 'role', 'isActive'];

  for (const key of allowed) {
    if (key in data) {
      user[key] = data[key] === '' ? undefined : data[key];
    }
  }

  if ('role' in data) {
    user.permissions = getRolePermissions(data.role);
  }

  applyRoleScopes(user, nextScope, nextRole);

  if (data.password) {
    await user.setPassword(data.password);
  }

  await user.save();
  await writeAudit(req, 'USER_UPDATED', 'User', user._id, before, publicUser(user));

  const updated = await User.findById(user._id).select('-passwordHash').populate('ministry region district donor partner');
  res.json({ data: updated });
}

export async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const before = user.toObject();
  await assertSuperAdminSafety(user, { delete: true });
  await user.deleteOne();
  await writeAudit(req, 'USER_DELETED', 'User', user._id, before, null);

  res.status(204).send();
}
