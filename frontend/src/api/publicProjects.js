const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

async function publicRequest(
  path
) {
  const response =
    await fetch(
      `${API_BASE_URL}${path}`
    );

  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      'Unable to load public JAIMS project information.'
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Public JAIMS Projects
|--------------------------------------------------------------------------
|
| No access token is attached.
| These endpoints are intentionally public and sanitized by the backend.
|
*/

export async function getPublicProjects() {
  return publicRequest(
    '/public/projects'
  );
}

export async function getPublicProjectStatistics() {
  return publicRequest(
    '/public/projects/statistics'
  );
}