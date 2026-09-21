import {
  getExecutiveSummary,
  getInstitutionWorkflow,
  getProjectWorkflow,
  getImplementationStatus,
  getSectorDistribution,
  getRegionDistribution,
  getDistrictDistribution,
  getRecentActivities,
} from '../../repositories/dashboard.repository.js';

export async function buildExecutiveDashboard() {

  const [
  summary,
  institutionWorkflow,
  projectWorkflow,
  projectStatus,
  sectorDistribution,
  regionDistribution,
  districtDistribution,
  recentActivities,
] = await Promise.all([
  getExecutiveSummary(),
  getInstitutionWorkflow(),
  getProjectWorkflow(),
  getImplementationStatus(),
  getSectorDistribution(),
  getRegionDistribution(),
  getDistrictDistribution(),
  getRecentActivities(),
]);  return {

    /*
    |--------------------------------------------------------------------------
    | Executive Overview
    |--------------------------------------------------------------------------
    */

    overview: summary,

    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    */

    registration: {

      institution:
        institutionWorkflow,

      project:
        projectWorkflow,

    },

    /*
    |--------------------------------------------------------------------------
    | Portfolio
    |--------------------------------------------------------------------------
    */

    portfolio: {

  implementationStatus:
    projectStatus,

  sectorDistribution:
    sectorDistribution,

  regionDistribution:
    regionDistribution,

  districtDistribution:
    districtDistribution,

},

    /*
    |--------------------------------------------------------------------------
    | Finance
    |--------------------------------------------------------------------------
    */

   finance: {

  totalBudget:
    summary.totalBudget,

  totalProjects:
    summary.totalProjects,

},

    /*
    |--------------------------------------------------------------------------
    | Activities
    |--------------------------------------------------------------------------
    */

   activities: {
  recent: recentActivities,
},

  };

}