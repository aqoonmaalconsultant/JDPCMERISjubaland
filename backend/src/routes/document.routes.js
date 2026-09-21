import { Router } from 'express';
import multer from 'multer';
import { deleteProjectDocument, downloadProjectDocument, exportDocumentSearchCsv, listProjectDocuments, searchDocuments, updateProjectDocument, uploadProjectDocument } from '../controllers/document.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { Permissions } from '../security/roles.js';

export const documentRouter = Router({ mergeParams: true });
export const documentSearchRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

documentRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(listProjectDocuments)
);

documentRouter.post(
  '/',
  authenticate,
  authorize(Permissions.UPLOAD_DOCUMENTS),
  upload.single('file'),
  asyncHandler(uploadProjectDocument)
);

documentRouter.patch(
  '/:documentId',
  authenticate,
  authorize(Permissions.UPLOAD_DOCUMENTS),
  asyncHandler(updateProjectDocument)
);

documentRouter.get(
  '/:documentId/download',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(downloadProjectDocument)
);

documentRouter.delete(
  '/:documentId',
  authenticate,
  authorize(Permissions.UPLOAD_DOCUMENTS),
  asyncHandler(deleteProjectDocument)
);

documentSearchRouter.get(
  '/export.csv',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(exportDocumentSearchCsv)
);

documentSearchRouter.get(
  '/',
  authenticate,
  authorize(Permissions.VIEW_ALL_PROJECTS, Permissions.VIEW_ASSIGNED_PROJECTS),
  asyncHandler(searchDocuments)
);
