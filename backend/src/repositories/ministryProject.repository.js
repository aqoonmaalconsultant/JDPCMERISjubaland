import { MinistryProject } from '../models/MinistryProject.js';

/*
|--------------------------------------------------------------------------
| Internal Project Queries
|--------------------------------------------------------------------------
*/

export function findAllMinistryProjects(
  filter = {}
) {
  return MinistryProject.find(filter)
    .sort({
      createdAt: -1,
    })
    .populate(
      'createdBy updatedBy publishedBy',
      'name email'
    );
}

export function findMinistryProjectById(
  projectId
) {
  return MinistryProject.findById(
    projectId
  ).populate(
    'createdBy updatedBy publishedBy',
    'name email'
  );
}

export function findMinistryProjectBySlug(
  slug
) {
  return MinistryProject.findOne({
    slug,
  }).populate(
    'createdBy updatedBy publishedBy',
    'name email'
  );
}

export function createMinistryProject(
  payload
) {
  return MinistryProject.create(
    payload
  );
}

export function updateMinistryProject(
  projectId,
  payload
) {
  return MinistryProject.findByIdAndUpdate(
    projectId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).populate(
    'createdBy updatedBy publishedBy',
    'name email'
  );
}

/*
|--------------------------------------------------------------------------
| Public Queries
|--------------------------------------------------------------------------
*/

export function findPublishedMinistryProjects(
  filter = {}
) {
  return MinistryProject.find({
    ...filter,

    publicationStatus:
      'Published',

    active: true,
  })
    .sort({
      featured: -1,
      publishedAt: -1,
    })
    .select(
      '-createdBy -updatedBy -publishedBy'
    );
}

export function findPublishedProjectBySlug(
  slug
) {
  return MinistryProject.findOne({
    slug,

    publicationStatus:
      'Published',

    active: true,
  }).select(
    '-createdBy -updatedBy -publishedBy'
  );
}

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

export async function getMinistryProjectStatistics() {
  const [
    total,
    planned,
    ongoing,
    completed,
    onHold,
    published,
    drafts,
    featured,
  ] = await Promise.all([
    MinistryProject.countDocuments({
      active: true,
    }),

    MinistryProject.countDocuments({
      active: true,
      status: 'Planned',
    }),

    MinistryProject.countDocuments({
      active: true,
      status: 'Ongoing',
    }),

    MinistryProject.countDocuments({
      active: true,
      status: 'Completed',
    }),

    MinistryProject.countDocuments({
      active: true,
      status: 'On Hold',
    }),

    MinistryProject.countDocuments({
      active: true,
      publicationStatus:
        'Published',
    }),

    MinistryProject.countDocuments({
      active: true,
      publicationStatus:
        'Draft',
    }),

    MinistryProject.countDocuments({
      active: true,
      featured: true,
    }),
  ]);

  return {
    total,
    planned,
    ongoing,
    completed,
    onHold,
    published,
    drafts,
    featured,
  };
}