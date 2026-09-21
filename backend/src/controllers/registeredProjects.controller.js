import { ProjectApplication } from '../models/ProjectApplication.js';
import { HttpError } from '../utils/httpError.js';
import { Roles } from '../security/roles.js';

function ensureRegisteredProjectsAccess(user) {
  const allowed = [
  Roles.SUPER_ADMIN,
  Roles.PROJECTS_MANAGER,
  Roles.ADMIN_OFFICER,
  Roles.DIRECTOR_GENERAL,
  Roles.VIEWER,
  Roles.IT_OFFICE,
  Roles.FINANCE_OFFICER,
];

  if (!allowed.includes(user.role)) {
    throw new HttpError(
      403,
      'You are not authorised to view registered projects.'
    );
  }
}

function populateApplication(query) {
  return query
    .populate(
      'submittingInstitution',
      'institutionName institutionType'
    )
    .populate(
      'locations.region',
      'name'
    )
    .populate(
      'locations.district',
      'name'
    )
    .populate(
      'registeredBy',
      'name email'
    )
    .populate(
      'submittedBy',
      'name email'
    );
}

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export async function registeredProjectStatistics(
  req,
  res
) {
  ensureRegisteredProjectsAccess(req.user);

  const total =
    await ProjectApplication.countDocuments({
      registrationStatus: 'Registered',
    });

  res.json({
    data: {
      total,
    },
  });
}

/*
|--------------------------------------------------------------------------
| List Registered Projects
|--------------------------------------------------------------------------
*/

export async function listRegisteredProjects(
  req,
  res
) {
  ensureRegisteredProjectsAccess(req.user);

  const projects =
    await populateApplication(
      ProjectApplication.find({
        registrationStatus: 'Registered',
      }).sort({
        registeredAt: -1,
      })
    );

  res.json({
    data: projects,
  });
}

/*
|--------------------------------------------------------------------------
| Get Registered Project
|--------------------------------------------------------------------------
*/

export async function getRegisteredProject(
  req,
  res
) {
  ensureRegisteredProjectsAccess(req.user);

  const project =
    await populateApplication(
      ProjectApplication.findById(
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