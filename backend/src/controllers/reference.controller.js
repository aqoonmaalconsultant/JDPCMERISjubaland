import { District } from '../models/District.js';
import { Donor } from '../models/Donor.js';
import { Ministry } from '../models/Ministry.js';
import { Partner } from '../models/Partner.js';
import { Region } from '../models/Region.js';
import { Village } from '../models/Village.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const models = {
  ministries: Ministry,
  regions: Region,
  districts: District,
  villages: Village,
  donors: Donor,
  partners: Partner
};

export async function listReference(req, res) {
  const Model = models[req.params.resource];
  if (!Model) {
    return res.status(404).json({ message: 'Reference resource not found' });
  }

  const query = Model.find().sort({ name: 1, organizationName: 1 });

  if (req.params.resource === 'districts') {
    query.populate('region');
  }

  if (req.params.resource === 'villages') {
    query.populate({
      path: 'district',
      populate: { path: 'region' }
    });
  }

  const rows = await query;
  return res.json({ data: rows });
}

export async function createReference(req, res) {
  const Model = models[req.params.resource];
  if (!Model) {
    return res.status(404).json({ message: 'Reference resource not found' });
  }

  const row = await Model.create(req.body);
  await writeAudit(req, 'REFERENCE_CREATED', req.params.resource, row._id, null, row.toObject());
  return res.status(201).json({ data: row });
}

export async function updateReference(req, res) {
  const Model = models[req.params.resource];
  if (!Model) {
    return res.status(404).json({ message: 'Reference resource not found' });
  }

  const existing = await Model.findById(req.params.id);
  if (!existing) {
    throw new HttpError(404, 'Reference record not found');
  }

  const before = existing.toObject();
  Object.assign(existing, req.body);
  await existing.save();
  await writeAudit(req, 'REFERENCE_UPDATED', req.params.resource, existing._id, before, existing.toObject());

  return res.json({ data: existing });
}

export async function deleteReference(req, res) {
  const Model = models[req.params.resource];
  if (!Model) {
    return res.status(404).json({ message: 'Reference resource not found' });
  }

  const existing = await Model.findById(req.params.id);
  if (!existing) {
    throw new HttpError(404, 'Reference record not found');
  }

  await existing.deleteOne();
  await writeAudit(req, 'REFERENCE_DELETED', req.params.resource, existing._id, existing.toObject(), null);

  return res.status(204).send();
}
