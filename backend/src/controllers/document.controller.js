import { z } from 'zod';
import { buildProjectScope } from '../middleware/scope.js';
import { Document } from '../models/Document.js';
import { Project } from '../models/Project.js';
import { deleteStoredProjectFile, readStoredProjectFile, storeProjectFile } from '../services/fileStorageService.js';
import { writeAudit } from '../services/auditService.js';
import { HttpError } from '../utils/httpError.js';

const documentSchema = z.object({
  title: z.string().min(2),
  category: z.enum(['Contract', 'Agreement', 'Report', 'Photo', 'Video', 'Completion Certificate', 'Other']).default('Other')
});

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function locationNames(locations = [], field) {
  return locations.map((location) => location[field]?.name).filter(Boolean).join('; ');
}

async function buildDocumentSearchFilter(req) {
  const projects = await Project.find(buildProjectScope(req.user)).select('_id');
  const filter = { project: { $in: projects.map((project) => project._id) } };

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  return filter;
}

function documentSearchQuery(req) {
  return Document.find(req.documentSearchFilter)
    .populate({
      path: 'project',
      select: 'projectName projectCode ministry donor locations',
      populate: [
        { path: 'ministry', select: 'name code' },
        { path: 'donor', select: 'name' },
        { path: 'locations.region', select: 'name code' },
        { path: 'locations.district', select: 'name code' }
      ]
    })
    .populate('uploadedBy', 'name email role')
    .sort({ createdAt: -1 });
}

export async function listProjectDocuments(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const data = await Document.find({ project: project._id }).sort({ createdAt: -1 });
  res.json({ data });
}

export async function uploadProjectDocument(req, res) {
  if (!req.file) {
    throw new HttpError(422, 'File is required');
  }

  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const data = documentSchema.parse(req.body);
  let storedFile;

  try {
    storedFile = await storeProjectFile({ projectId: project._id.toString(), file: req.file });
  } catch (storageError) {
    throw new HttpError(503, `File storage failed: ${storageError.message}`);
  }

  const document = await Document.create({
    project: project._id,
    title: data.title,
    category: data.category,
    fileName: storedFile.fileName,
    mimeType: storedFile.mimeType,
    storageType: storedFile.storageType,
    storageKey: storedFile.key,
    url: storedFile.url,
    uploadedBy: req.user._id
  });

  await writeAudit(req, 'DOCUMENT_UPLOADED', 'Document', document._id, null, document.toObject());

  res.status(201).json({ data: document });
}

export async function updateProjectDocument(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const document = await Document.findOne({ _id: req.params.documentId, project: project._id });
  if (!document) {
    throw new HttpError(404, 'Document not found');
  }

  const before = document.toObject();
  Object.assign(document, documentSchema.partial().parse(req.body));
  await document.save();

  await writeAudit(req, 'DOCUMENT_UPDATED', 'Document', document._id, before, document.toObject());
  res.json({ data: document });
}

export async function downloadProjectDocument(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const document = await Document.findOne({ _id: req.params.documentId, project: project._id });
  if (!document) {
    throw new HttpError(404, 'Document not found');
  }

  let fileBuffer;
  try {
    fileBuffer = await readStoredProjectFile({
      storageType: document.storageType,
      storageKey: document.storageKey
    });
  } catch (storageError) {
    throw new HttpError(503, `File read failed: ${storageError.message}`);
  }

  res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.fileName || document.title)}"`);
  res.send(fileBuffer);
}

export async function searchDocuments(req, res) {
  req.documentSearchFilter = await buildDocumentSearchFilter(req);
  const data = await documentSearchQuery(req)
    .limit(Math.min(Number(req.query.limit) || 100, 500));

  res.json({ data });
}

export async function exportDocumentSearchCsv(req, res) {
  req.documentSearchFilter = await buildDocumentSearchFilter(req);
  const documents = await documentSearchQuery(req).limit(2000);

  const rows = [
    ['Title', 'Category', 'File Name', 'Storage Type', 'MIME Type', 'Project Code', 'Project Name', 'Ministry', 'Donor', 'Region', 'District', 'Uploaded By', 'Uploaded At'],
    ...documents.map((document) => [
        document.title,
        document.category,
        document.fileName,
        document.storageType,
        document.mimeType,
        document.project?.projectCode,
        document.project?.projectName,
        document.project?.ministry?.name,
        document.project?.donor?.name,
        locationNames(document.project?.locations, 'region'),
        locationNames(document.project?.locations, 'district'),
        document.uploadedBy?.name || document.uploadedBy?.email,
        document.createdAt?.toISOString()
      ])
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="jdpcmeris-document-search.csv"');
  res.send(rows.map((row) => row.map(escapeCsv).join(',')).join('\n'));
}

export async function deleteProjectDocument(req, res) {
  const project = await Project.findOne({ _id: req.params.projectId, ...buildProjectScope(req.user) });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  const document = await Document.findOne({ _id: req.params.documentId, project: project._id });
  if (!document) {
    throw new HttpError(404, 'Document not found');
  }

  const before = document.toObject();

  try {
    await deleteStoredProjectFile({
      storageType: document.storageType,
      storageKey: document.storageKey
    });
  } catch (storageError) {
    console.warn(`Stored file delete failed for document ${document._id}: ${storageError.message}`);
  }

  await document.deleteOne();
  await writeAudit(req, 'DOCUMENT_DELETED', 'Document', document._id, before, null);
  res.status(204).send();
}
