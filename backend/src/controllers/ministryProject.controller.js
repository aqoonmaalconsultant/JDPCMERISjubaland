import mongoose from 'mongoose';

import {
  createMinistryProject,
  findAllMinistryProjects,
  findMinistryProjectById,
  findPublishedMinistryProjects,
  findPublishedProjectBySlug,
  getMinistryProjectStatistics,
  updateMinistryProject,
} from '../repositories/ministryProject.repository.js';

import { HttpError } from '../utils/httpError.js';
import {
  storeProjectFile,
} from '../services/fileStorageService.js';
/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function ensureValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(
      400,
      'Invalid project ID.'
    );
  }
}

function createSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sanitizePublicProject(project) {
  if (!project) {
    return project;
  }

  const data =
    typeof project.toObject === 'function'
      ? project.toObject()
      : { ...project };

  /*
   * Budget is internal by default.
   * It must not be returned through
   * the public API unless explicitly
   * approved for publication.
   */
  if (data.showBudgetPublicly !== true) {
    delete data.budget;
    delete data.currency;
  }

  delete data.showBudgetPublicly;

  delete data.createdBy;
  delete data.updatedBy;
  delete data.publishedBy;

  return data;
}

async function ensureUniqueSlug(
  requestedSlug,
  title,
  ignoreProjectId = null
) {
  const baseSlug =
    createSlug(
      requestedSlug ||
      title
    );

  if (!baseSlug) {
    throw new HttpError(
      400,
      'A valid project title or slug is required.'
    );
  }

  let candidate =
    baseSlug;

  let sequence = 2;

  while (true) {
    const existing =
      await findAllMinistryProjects({
        slug: candidate,
      });

    const conflict =
      existing.find(
        (item) =>
          String(item._id) !==
          String(
            ignoreProjectId ||
            ''
          )
      );

    if (!conflict) {
      return candidate;
    }

    candidate =
      `${baseSlug}-${sequence}`;

    sequence += 1;
  }
}

/*
|--------------------------------------------------------------------------
| Internal Statistics
|--------------------------------------------------------------------------
*/

export async function ministryProjectStatistics(
  req,
  res
) {
  const data =
    await getMinistryProjectStatistics();

  res.json({
    data,
  });
}

/*
|--------------------------------------------------------------------------
| Internal Project List
|--------------------------------------------------------------------------
*/

export async function listMinistryProjects(
  req,
  res
) {
  const filter = {};

  if (
    req.query.status &&
    req.query.status !== 'All'
  ) {
    filter.status =
      req.query.status;
  }

  if (
    req.query.publicationStatus &&
    req.query.publicationStatus !==
      'All'
  ) {
    filter.publicationStatus =
      req.query.publicationStatus;
  }

  if (req.query.sector) {
    filter.$or = [
      {
        primarySector:
          req.query.sector,
      },
      {
        sectors:
          req.query.sector,
      },
    ];
  }

  if (req.query.search) {
    const search =
      String(
        req.query.search
      ).trim();

    if (search) {
      filter.$and = [
        {
          $or: [
            {
              title: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              shortTitle: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              projectCode: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      ];
    }
  }

  const projects =
    await findAllMinistryProjects(
      filter
    );

  res.json({
    data: projects,
  });
}

/*
|--------------------------------------------------------------------------
| Internal Project Details
|--------------------------------------------------------------------------
*/

export async function getMinistryProject(
  req,
  res
) {
  ensureValidId(
    req.params.id
  );

  const project =
    await findMinistryProjectById(
      req.params.id
    );

  if (!project) {
    throw new HttpError(
      404,
      'Ministry project not found.'
    );
  }

  res.json({
    data: project,
  });
}

/*
|--------------------------------------------------------------------------
| Create Project
|--------------------------------------------------------------------------
*/

export async function createProject(
  req,
  res
) {
  const {
    title,
    overview,
  } = req.body;

  if (!title?.trim()) {
    throw new HttpError(
      400,
      'Project title is required.'
    );
  }

  if (!overview?.trim()) {
    throw new HttpError(
      400,
      'Project overview is required.'
    );
  }

  const slug =
    await ensureUniqueSlug(
      req.body.slug,
      title
    );

  const project =
    await createMinistryProject({
      ...req.body,

      title:
        title.trim(),

      overview:
        overview.trim(),

      slug,

      publicationStatus:
        'Draft',

      publishedAt:
        undefined,

      publishedBy:
        undefined,

      createdBy:
        req.user?._id,

      updatedBy:
        req.user?._id,
    });

  res.status(201).json({
    message:
      'Ministry project created successfully.',

    data: project,
  });
}

/*
|--------------------------------------------------------------------------
| Update Project
|--------------------------------------------------------------------------
*/

export async function updateProject(
  req,
  res
) {
  ensureValidId(
    req.params.id
  );

  const existing =
    await findMinistryProjectById(
      req.params.id
    );

  if (!existing) {
    throw new HttpError(
      404,
      'Ministry project not found.'
    );
  }

  const payload = {
    ...req.body,

    updatedBy:
      req.user?._id,
  };

  /*
   * Publication is controlled
   * by dedicated endpoints.
   */
  delete payload.publicationStatus;
  delete payload.publishedAt;
  delete payload.publishedBy;

  if (
    payload.title ||
    payload.slug
  ) {
    payload.slug =
      await ensureUniqueSlug(
        payload.slug ||
          existing.slug,

        payload.title ||
          existing.title,

        existing._id
      );
  }

  const project =
    await updateMinistryProject(
      existing._id,
      payload
    );

  res.json({
    message:
      'Ministry project updated successfully.',

    data: project,
  });
}

/*
|--------------------------------------------------------------------------
| Publish Project
|--------------------------------------------------------------------------
*/

export async function publishProject(
  req,
  res
) {
  ensureValidId(
    req.params.id
  );

  const existing =
    await findMinistryProjectById(
      req.params.id
    );

  if (!existing) {
    throw new HttpError(
      404,
      'Ministry project not found.'
    );
  }

  if (
    !existing.title ||
    !existing.overview
  ) {
    throw new HttpError(
      400,
      'Project title and overview are required before publication.'
    );
  }

  const project =
    await updateMinistryProject(
      existing._id,
      {
        publicationStatus:
          'Published',

        publishedAt:
          new Date(),

        publishedBy:
          req.user?._id,

        updatedBy:
          req.user?._id,

        active: true,
      }
    );

  res.json({
    message:
      'Project published successfully.',

    data: project,
  });
}

/*
|--------------------------------------------------------------------------
| Move Back To Draft
|--------------------------------------------------------------------------
*/

export async function unpublishProject(
  req,
  res
) {
  ensureValidId(
    req.params.id
  );

  const existing =
    await findMinistryProjectById(
      req.params.id
    );

  if (!existing) {
    throw new HttpError(
      404,
      'Ministry project not found.'
    );
  }

  const project =
    await updateMinistryProject(
      existing._id,
      {
        publicationStatus:
          'Draft',

        updatedBy:
          req.user?._id,
      }
    );

  res.json({
    message:
      'Project moved back to draft.',

    data: project,
  });
}

/*
|--------------------------------------------------------------------------
| Archive Project
|--------------------------------------------------------------------------
*/

export async function archiveProject(
  req,
  res
) {
  ensureValidId(
    req.params.id
  );

  const existing =
    await findMinistryProjectById(
      req.params.id
    );

  if (!existing) {
    throw new HttpError(
      404,
      'Ministry project not found.'
    );
  }

  const project =
    await updateMinistryProject(
      existing._id,
      {
        publicationStatus:
          'Archived',

        active: false,

        updatedBy:
          req.user?._id,
      }
    );

  res.json({
    message:
      'Project archived successfully.',

    data: project,
  });
}

/*
|--------------------------------------------------------------------------
| Public Project List / Dashboard
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Upload Ministry Project Image
|--------------------------------------------------------------------------
*/

export async function uploadMinistryProjectImage(
  req,
  res
) {
  ensureValidId(
    req.params.id
  );

  const existing =
    await findMinistryProjectById(
      req.params.id
    );

  if (!existing) {
    throw new HttpError(
      404,
      'Ministry project not found.'
    );
  }

  if (!req.file) {
    throw new HttpError(
      400,
      'Please select an image to upload.'
    );
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (
    !allowedTypes.includes(
      req.file.mimetype
    )
  ) {
    throw new HttpError(
      400,
      'Only JPG, PNG and WebP images are allowed.'
    );
  }

  const stored =
    await storeProjectFile({
      projectId:
        existing._id.toString(),

      file: req.file,
    });

  res.status(201).json({
    message:
      'Project image uploaded successfully.',

    data: {
      url: stored.url,
      key: stored.key,
      storageType:
        stored.storageType,
      fileName:
        stored.fileName,
      mimeType:
        stored.mimeType,
    },
  });
}
export async function listPublicMinistryProjects(
  req,
  res
) {
  const filter = {};

  if (
    req.query.status &&
    req.query.status !== 'All'
  ) {
    filter.status =
      req.query.status;
  }

  if (req.query.sector) {
    filter.$or = [
      {
        primarySector:
          req.query.sector,
      },
      {
        sectors:
          req.query.sector,
      },
    ];
  }

  if (
    req.query.featured ===
    'true'
  ) {
    filter.featured =
      true;
  }

  if (req.query.search) {
    const search =
      String(
        req.query.search
      ).trim();

    if (search) {
      filter.$and = [
        {
          $or: [
            {
              title: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              shortTitle: {
                $regex: search,
                $options: 'i',
              },
            },
            {
              overview: {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        },
      ];
    }
  }

  const projects =
    await findPublishedMinistryProjects(
      filter
    );

  res.json({
    data:
      projects.map(
        sanitizePublicProject
      ),
  });
}

/*
|--------------------------------------------------------------------------
| Public Project Details
|--------------------------------------------------------------------------
*/

export async function getPublicMinistryProject(
  req,
  res
) {
  const project =
    await findPublishedProjectBySlug(
      req.params.slug
    );

  if (!project) {
    throw new HttpError(
      404,
      'Published project not found.'
    );
  }

  res.json({
    data:
      sanitizePublicProject(
        project
      ),
  });
}