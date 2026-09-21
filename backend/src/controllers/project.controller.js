import { Project } from '../models/Project.js';
import { HttpError } from '../utils/httpError.js';
import { Roles } from '../security/roles.js';

function ensureProjectAccess(user) {
  const allowed = [
  Roles.IT_OFFICE,
  Roles.SUPER_ADMIN,
  Roles.ADMIN_OFFICER,
  Roles.DIRECTOR_GENERAL,
  Roles.VIEWER,
  Roles.FINANCE_OFFICER,
  Roles.PROJECTS_MANAGER,
];

  if (!allowed.includes(user.role)) {
    throw new HttpError(
      403,
      'You are not authorised to access projects.'
    );
  }
}

function populateProject(query) {
  return query
    .populate(
      'institution',
      'institutionName institutionType'
    )
    .populate(
      'submittedBy',
      'name email'
    )
    .populate(
      'registeredBy',
      'name email'
    )
    .populate(
      'application',
      'applicationNumber'
    );
}

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export async function projectStatistics(
  req,
  res
) {
  ensureProjectAccess(req.user);

  const [
    total,
    active,
    planning,
    completed,
  ] = await Promise.all([
    Project.countDocuments(),

    Project.countDocuments({
      implementationStatus:
        'Active',
    }),

    Project.countDocuments({
      implementationStatus:
        'Planning',
    }),

    Project.countDocuments({
      implementationStatus:
        'Completed',
    }),
  ]);

  res.json({
    data: {
      total,
      active,
      planning,
      completed,
    },
  });
}

/*
|--------------------------------------------------------------------------
| List Projects
|--------------------------------------------------------------------------
*/

export async function listProjects(
  req,
  res
) {
  ensureProjectAccess(req.user);

  const projects =
    await populateProject(
      Project.find().sort({
        createdAt: -1,
      })
    );

  res.json({
    data: projects,
  });
}

/*
|--------------------------------------------------------------------------
| Get Project Dashboard
|--------------------------------------------------------------------------
*/

export async function getProject(
  req,
  res
) {
  ensureProjectAccess(req.user);

  const project =
    await populateProject(
      Project.findById(
        req.params.id
      )
    );

  if (!project) {
    throw new HttpError(
      404,
      'Project not found.'
    );
  }

  res.json({
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
  ensureProjectAccess(req.user);

  const project =
    await Project.findById(
      req.params.id
    );

  if (!project) {
    throw new HttpError(
      404,
      'Project not found.'
    );
  }

  Object.assign(
    project,
    req.body
  );

  await project.save();

  res.json({
    message:
      'Project updated successfully.',
    data: project,
  });
}