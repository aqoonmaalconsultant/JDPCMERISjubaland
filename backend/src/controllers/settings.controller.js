import { z } from 'zod';
import { Setting } from '../models/Setting.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const settingSchema = z.object({
  key: z.string().min(2),
  value: z.any(),
  category: z.string().default('system'),
  description: z.string().optional(),
  isPublic: z.boolean().optional()
});

export async function listSettings(_req, res) {
  const data = await Setting.find().populate('updatedBy', 'name email role').sort({ category: 1, key: 1 });
  res.json({ data });
}

export async function listPublicSettings(_req, res) {
  const rows = await Setting.find({ isPublic: true }).select('key value category description');
  res.json({ data: rows });
}

export async function upsertSetting(req, res) {
  const payload = settingSchema.parse(req.body);
  const before = await Setting.findOne({ key: payload.key });
  const setting = await Setting.findOneAndUpdate(
    { key: payload.key },
    { ...payload, updatedBy: req.user._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await writeAudit(req, 'SETTING_UPDATED', 'Setting', setting._id, before?.toObject() || null, setting.toObject());
  res.status(before ? 200 : 201).json({ data: setting });
}

export async function deleteSetting(req, res) {
  const setting = await Setting.findById(req.params.id);

  if (!setting) {
    throw new HttpError(404, 'Setting not found');
  }

  const before = setting.toObject();
  await setting.deleteOne();
  await writeAudit(req, 'SETTING_DELETED', 'Setting', setting._id, before, null);

  res.status(204).send();
}
