import axios from 'axios';

const ORGANIZATION_ACCESS_TOKEN_KEY =
  'jaims_org_access_token';

const ORGANIZATION_REFRESH_TOKEN_KEY =
  'jaims_org_refresh_token';

const ORGANIZATION_USER_KEY =
  'jaims_org_user';

export const organizationApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api/v1',
});

export function getOrganizationUser() {
  try {
    const storedUser =
      localStorage.getItem(
        ORGANIZATION_USER_KEY
      );

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    return null;
  }
}

export function getOrganizationAccessToken() {
  return localStorage.getItem(
    ORGANIZATION_ACCESS_TOKEN_KEY
  );
}

export function getOrganizationRefreshToken() {
  return localStorage.getItem(
    ORGANIZATION_REFRESH_TOKEN_KEY
  );
}

export function saveOrganizationSession({
  accessToken,
  refreshToken,
  user,
}) {
  localStorage.setItem(
    ORGANIZATION_ACCESS_TOKEN_KEY,
    accessToken
  );

  localStorage.setItem(
    ORGANIZATION_REFRESH_TOKEN_KEY,
    refreshToken
  );

  localStorage.setItem(
    ORGANIZATION_USER_KEY,
    JSON.stringify(user)
  );

  window.dispatchEvent(
    new CustomEvent(
      'jaims_org_user_updated',
      {
        detail: user,
      }
    )
  );
}

export function clearOrganizationSession() {
  localStorage.removeItem(
    ORGANIZATION_ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    ORGANIZATION_REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    ORGANIZATION_USER_KEY
  );

  window.dispatchEvent(
    new Event(
      'jaims_org_auth_cleared'
    )
  );
}

organizationApi.interceptors.request.use(
  (config) => {
    const token =
      getOrganizationAccessToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

let refreshPromise = null;

organizationApi.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes(
        '/auth/refresh'
      )
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      getOrganizationRefreshToken();

    if (!refreshToken) {
      clearOrganizationSession();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    refreshPromise ||=
      axios
        .post(
          `${organizationApi.defaults.baseURL}/auth/refresh`,
          {
            refreshToken,
          }
        )
        .then(({ data }) => {
          if (
            data.user?.role !==
            'ORGANIZATION_USER'
          ) {
            throw new Error(
              'Invalid organization session.'
            );
          }

          saveOrganizationSession({
            accessToken:
              data.accessToken,

            refreshToken:
              data.refreshToken,

            user:
              data.user,
          });

          return data.accessToken;
        })
        .catch(
          (refreshError) => {
            clearOrganizationSession();

            if (
              window.location.pathname !==
              '/public/organization/login'
            ) {
              window.location.assign(
                '/public/organization/login'
              );
            }

            throw refreshError;
          }
        )
        .finally(() => {
          refreshPromise = null;
        });

    const accessToken =
      await refreshPromise;

    originalRequest.headers.Authorization =
      `Bearer ${accessToken}`;

    return organizationApi(
      originalRequest
    );
  }
);