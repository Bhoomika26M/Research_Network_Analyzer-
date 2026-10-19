import axios, { AxiosError } from 'axios';

/** Base URL of the FastAPI backend (see `VITE_API_URL` in `.env`). */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/** localStorage keys shared with the auth store. */
export const TOKEN_KEY = 'scientific_app_token';
export const USER_KEY = 'scientific_app_user';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach the JWT (if any) to every request.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 clear the session and bounce to /login.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? '';
      // A 401 on a request that carried no token says nothing about the stored
      // session — clearing it there could kill a session that just signed in.
      const sentToken = Boolean(
        error.config?.headers && (error.config.headers as Record<string, unknown>).Authorization
      );
      if (!sentToken) return Promise.reject(error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('scientific_app_refresh_token');
      // A failed sign-in attempt must surface its own message ("Incorrect email
      // or password") instead of bouncing away from the auth pages.
      const attemptedLogin = url.includes('/auth/login');
      // Stale/expired tokens only mean "sign in again": never redirect from an
      // auth endpoint (that is the redirect loop the admin login used to hit).
      const authEndpoint = /\/auth\/(login|register|me|refresh|change-password)/.test(url);
      const { pathname } = window.location;
      const onAuthPage = ['/', '/login', '/register', '/admin-login'].includes(pathname);
      if (!attemptedLogin && !authEndpoint && !onAuthPage) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Error message for the auth screens: the backend's own message wins — e.g. the
 * 403 "Account pending approval" for an inactive account — then apiErrorMessage.
 */
export function apiAuthErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error?: { message?: string } }>;
  return axiosError?.response?.data?.error?.message || apiErrorMessage(error);
}

/** Returned for HTTP 403 so the UI can render the "Not authorized" view. */
export const FORBIDDEN_MESSAGE = 'You are not authorized to access this resource.';

/** True when an API error was an HTTP 403 (forbidden). */
export function isForbidden(error: unknown): boolean {
  return (error as AxiosError)?.response?.status === 403;
}

/** Turn an axios/backend error into a human-readable message. */
export function apiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ error?: { message?: string }; detail?: unknown }>;
  if (axiosError?.response?.status === 403) {
    return FORBIDDEN_MESSAGE;
  }
  const payload = axiosError?.response?.data;
  if (payload && typeof payload === 'object' && 'error' in payload && payload.error?.message) {
    return payload.error.message;
  }
  if (payload && typeof payload === 'object' && 'detail' in payload) {
    const detail = payload.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  }
  if (axiosError?.message) return axiosError.message;
  return 'Something went wrong. Please try again.';
}

/** Pagination envelope returned by every list endpoint. */
export interface ApiPage<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export default apiClient;
