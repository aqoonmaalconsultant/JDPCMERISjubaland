import { ProjectApplication } from '../models/ProjectApplication.js';
import { HttpError } from '../utils/httpError.js';
import { Roles } from '../security/roles.js';

function ensureVerificationOfficer(user) {
  const allowed = [
  Roles.SUPER_ADMIN,
  Roles.PROJECTS_MANAGER,
  Roles.ADMIN_OFFICER,
];

  if (!allowed.includes(user.role)) {
    throw new HttpError(
      403,
      'You are not authorised to verify projects.'
    );
  }
}

function populateApplication(query) {
  return query
    .populate(
      'submittingInstitution',
      'institutionName institutionType verificationStatus'
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
      'projectVerifiedBy',
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

export async function verificationStatistics(
  req,
  res
) {
  ensureVerificationOfficer(req.user);

  const [
    pending,
    verified,
    returned,
    registered,
  ] = await Promise.all([
    ProjectApplication.countDocuments({
      registrationStatus: 'Submitted',
    }),

    ProjectApplication.countDocuments({
      registrationStatus: 'Verified',
    }),

    ProjectApplication.countDocuments({
      registrationStatus:
        'Returned for Revision',
    }),

    ProjectApplication.countDocuments({
      registrationStatus:
        'Registered',
    }),
  ]);

  res.json({
    data: {
      pending,
      verified,
      returned,
      registered,
    },
  });
}

/*
|--------------------------------------------------------------------------
| List Submitted Projects
|--------------------------------------------------------------------------
*/

export async function listSubmittedProjects(
  req,
  res
) {
  ensureVerificationOfficer(req.user);

  console.log(
    'PROJECT VERIFICATION CONTROLLER CALLED'
  );

  const projects =
    await populateApplication(
    ProjectApplication.find({
  registrationStatus: 'Submitted',
})
.sort({
        submittedAt: -1,
      })
    );

  console.log(
    'PROJECTS FOUND:',
    projects.length
  );

  res.json({
    data: projects,
  });
}

/*
|--------------------------------------------------------------------------
| Get Project
|--------------------------------------------------------------------------
*/

export async function getProjectForVerification(
  req,
  res
) {
  ensureVerificationOfficer(req.user);

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
/*
|--------------------------------------------------------------------------
| Verify Project
|--------------------------------------------------------------------------
*/

export async function verifyProject(
  req,
  res
) {
  ensureVerificationOfficer(req.user);

  console.log(
    'VERIFY PROJECT:',
    req.params.id
  );

  const project =
    await ProjectApplication.findById(
      req.params.id
    );

  if (!project) {
    throw new HttpError(
      404,
      'Project not found.'
    );
  }

  console.log(
    'CURRENT STATUS:',
    project.registrationStatus
  );

  if (
    project.registrationStatus !==
    'Submitted'
  ) {
    throw new HttpError(
      409,
      `Only submitted projects can be verified. Current status: ${project.registrationStatus}`
    );
  }

  project.registrationStatus =
  'Verified';

project.registrationStage =
  'Final Registration';

  project.projectVerificationAt =
    new Date();

  project.projectVerifiedBy =
    req.user._id;

  project.updatedBy =
    req.user._id;

  project.registrationHistory.push({
    action:
      'Project Verified',

    fromStatus:
      'Submitted',

    toStatus:
      'Verified',

    fromStage:
      'Project Verification',

    toStage:
      'Final Registration',

    actor:
      req.user._id,

    actedAt:
      new Date(),
  });

  await project.save();

  console.log(
    'PROJECT VERIFIED SUCCESSFULLY'
  );

  res.json({
    message:
      'Project verified successfully.',
    data: project,
  });
}

/*
|--------------------------------------------------------------------------
| Return For Revision
|--------------------------------------------------------------------------
*/

export async function returnProjectForRevision(
  req,
  res
) {
  ensureVerificationOfficer(req.user);

  console.log(
    'RETURN PROJECT:',
    req.params.id
  );

  const {
    revisionReason,
  } = req.body;

  if (!revisionReason?.trim()) {
    throw new HttpError(
      400,
      'Revision reason is required.'
    );
  }

  const project =
    await ProjectApplication.findById(
      req.params.id
    );

  if (!project) {
    throw new HttpError(
      404,
      'Project not found.'
    );
  }

  console.log(
    'CURRENT STATUS:',
    project.registrationStatus
  );

  project.registrationStatus =
    'Returned for Revision';

  project.registrationStage =
    'Draft';

  project.revisionReason =
    revisionReason.trim();

  project.returnedForRevisionAt =
    new Date();

  project.updatedBy =
    req.user._id;

  project.registrationHistory.push({
    action:
      'Returned For Revision',

    fromStatus:
      'Submitted',

    toStatus:
      'Returned for Revision',

    fromStage:
      'Project Verification',

    toStage:
      'Draft',

    actor:
      req.user._id,

    note:
      revisionReason.trim(),

    actedAt:
      new Date(),
  });

  await project.save();

  console.log(
    'PROJECT RETURNED SUCCESSFULLY'
  );

  res.json({
    message:
      'Project returned for revision.',
    data: project,
  });
}