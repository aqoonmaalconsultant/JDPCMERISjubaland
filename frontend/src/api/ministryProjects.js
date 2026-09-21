import { api } from './client.js';

/*
|--------------------------------------------------------------------------
| Ministry Website Projects Portal
|--------------------------------------------------------------------------
|
| These endpoints are protected by the existing JAIMS authentication.
|
*/

export async function getMinistryProjectStatistics() {
  const { data } =
    await api.get(
      '/ministry-projects/statistics'
    );

  return data;
}

export async function getMinistryProjects(
  params = {}
) {
  const { data } =
    await api.get(
      '/ministry-projects',
      {
        params,
      }
    );

  return data;
}

export async function getMinistryProject(
  projectId
) {
  const { data } =
    await api.get(
      `/ministry-projects/${projectId}`
    );

  return data;
}

export async function createMinistryProject(
  payload
) {
  const { data } =
    await api.post(
      '/ministry-projects',
      payload
    );

  return data;
}

export async function updateMinistryProject(
  projectId,
  payload
) {
  const { data } =
    await api.patch(
      `/ministry-projects/${projectId}`,
      payload
    );

  return data;
}

export async function publishMinistryProject(
  projectId
) {
  const { data } =
    await api.patch(
      `/ministry-projects/${projectId}/publish`
    );

  return data;
}

export async function unpublishMinistryProject(
  projectId
) {
  const { data } =
    await api.patch(
      `/ministry-projects/${projectId}/unpublish`
    );

  return data;
}

export async function archiveMinistryProject(
  projectId
) {
  const { data } =
    await api.patch(
      `/ministry-projects/${projectId}/archive`
    );

  return data;
}
export async function uploadMinistryProjectImage(
  projectId,
  file
) {
  const formData =
    new FormData();

  formData.append(
    'image',
    file
  );

  const { data } =
    await api.post(
      `/ministry-projects/${projectId}/images`,
      formData
    );

  return data;
}