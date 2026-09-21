import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
});

export function clearAuthSession() {
  localStorage.removeItem('jdpcmeris_access_token');
  localStorage.removeItem('jdpcmeris_refresh_token');
  localStorage.removeItem('jdpcmeris_user');
  window.dispatchEvent(new Event('jdpcmeris_auth_cleared'));
}

export function updateStoredUser(user) {
  if (!user) return;
  localStorage.setItem('jdpcmeris_user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('jdpcmeris_user_updated', { detail: user }));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jdpcmeris_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest?._retry || originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('jdpcmeris_refresh_token');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    refreshPromise ||= axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        localStorage.setItem('jdpcmeris_access_token', data.accessToken);
        localStorage.setItem('jdpcmeris_refresh_token', data.refreshToken);
        updateStoredUser(data.user);
        return data.accessToken;
      })
      .catch((refreshError) => {
        clearAuthSession();
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const accessToken = await refreshPromise;
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return api(originalRequest);
  }
);
