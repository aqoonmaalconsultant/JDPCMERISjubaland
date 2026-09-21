import {
  InstitutionProfile,
} from '../models/InstitutionProfile.js';

import {
  Project,
} from '../models/Project.js';

import {
  Roles,
  PortalRoles
} from '../security/roles.js';

import {
  HttpError,
} from '../utils/httpError.js';

/*
 * ORGANIZATION / INSTITUTION PROJECT MANAGEMENT
 *
 * A verified organization can access
 * projects connected to its own
 * InstitutionProfile.
 *
 * This works for:
 * - Government institutions
 * - LNGOs
 * - INGOs
 * - UN Agencies
 * - Private companies
 * - Consultants
 * - Other registered organizations
 */

function ensureInstitutionAccount(
  user
) {
  if (
    user.role !==
    PortalRoles.ORGANIZATION_USER
  ) {
    throw new HttpError(
      403,
      'This portal is only available to organization accounts.'
    );
  }
}

/*
 * Resolve the currently logged-in user's
 * verified InstitutionProfile.
 */
async function getVerifiedInstitution(
  userId
) {
  const institution =
    await InstitutionProfile.findOne({
      accountUser:
        userId,
    });

  if (!institution) {
    throw new HttpError(
      404,
      'Organization profile not found.'
    );
  }

  if (
    institution.verificationStatus !==
    'Verified'
  ) {
    throw new HttpError(
      403,
      'Your organization must be verified before accessing registered projects.'
    );
  }

  return institution;
}

/*
 * Populate the full project record shown
 * inside the Organization Portal.
 */
function populateProject(
  query
) {
  return query
    .populate(
      'submittingInstitution',
      'institutionName institutionType verificationStatus'
    )
    .populate(
      'ministry',
      'name'
    )
    .populate(
      'supportingMinistries',
      'name'
    )
    .populate(
      'donor',
      'name'
    )
    .populate(
      'leadImplementingInstitution',
      'institutionName institutionType verificationStatus'
    )
    .populate(
      'leadImplementerMinistry',
      'name'
    )
    .populate(
      'partner'
    )
    .populate(
      'coImplementingInstitutions',
      'institutionName institutionType verificationStatus'
    )
    .populate(
      'coImplementingMinistries',
      'name'
    )
    .populate(
      'coImplementingPartners'
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
      'sourceProjectApplication',
      'applicationNumber registrationStatus registrationStage registeredAt'
    );
}

/*
 * GET
 * /institution-portal/projects
 *
 * Return projects owned by the currently
 * logged-in organization.
 *
 * For now ownership is established through
 * submittingInstitution.
 *
 * Later we can additionally support
 * delegated project-management access for
 * co-implementers.
 */
export async function listMyRegisteredProjects(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const institution =
    await getVerifiedInstitution(
      req.user._id
    );

  const projects =
    await populateProject(
      Project.find({
        submittingInstitution:
          institution._id,
      })
    ).sort({
      updatedAt: -1,
    });

  res.json({
    data:
      projects,
  });
}

/*
 * GET
 * /institution-portal/projects/:id
 *
 * Return one registered project belonging
 * to the currently logged-in organization.
 *
 * The ownership condition is part of the
 * database query itself so an organization
 * cannot access another organization's
 * project by changing the URL ID.
 */
export async function getMyRegisteredProject(
  req,
  res
) {
  ensureInstitutionAccount(
    req.user
  );

  const institution =
    await getVerifiedInstitution(
      req.user._id
    );

  const project =
    await populateProject(
      Project.findOne({
        _id:
          req.params.id,

        submittingInstitution:
          institution._id,
      })
    );

  if (!project) {
    throw new HttpError(
      404,
      'Project not found or you do not have access to this project.'
    );
  }

  res.json({
    data:
      project,
  });
}