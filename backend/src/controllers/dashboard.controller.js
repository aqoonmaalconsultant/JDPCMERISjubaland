import {
  buildExecutiveDashboard,
} from '../services/dashboard/dashboard.service.js';

export async function executiveDashboard(
  req,
  res
) {
  const dashboard =
    await buildExecutiveDashboard();

  res.json({
    data: dashboard,
  });
}