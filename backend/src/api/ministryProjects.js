const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api/v1';

/*
|--------------------------------------------------------------------------
| Request Helper
|--------------------------------------------------------------------------
*/

async function request(
  endpoint,
  options = {}
) {
  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          'Content-Type':
            'application/json',

          ...options.headers,
        },
      }
    );

  const payload =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message ||
        'Request failed.'
    );
  }

  return payload;
}

/*
|--------------------------------------------------------------------------
| Public Projects
|--------------------------------------------------------------------------
*/

export async function getPublicMinistryProjects(
  filters = {}
) {
  const params =
    new URLSearchParams();

  if (filters.status) {
    params.set(
      'status',
      filters.status
    );
  }

  if (filters.sector) {
    params.set(
      'sector',
      filters.sector
    );
  }

  if (filters.search) {
    params.set(
      'search',
      filters.search
    );
  }

  if (
    filters.featured === true
  ) {
    params.set(
      'featured',
      'true'
    );
  }

  const query =
    params.toString();

  return request(
    `/ministry-projects/public${
      query ? `?${query}` : ''
    }`
  );
}

export async function getPublicMinistryProject(
  slug
) {
  return request(
    `/ministry-projects/public/${encodeURIComponent(
      slug
    )}`
  );
}