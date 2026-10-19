/** Auth endpoints. JWT tokens are persisted for the axios interceptor. */
import { apiClient, TOKEN_KEY, USER_KEY } from './apiClient';
import { User, UserRole } from '../types';

export interface RawUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const ROLE_FROM_API: Record<string, UserRole> = {
  researcher: 'Researcher',
  institution_admin: 'Institution Admin',
  reviewer: 'Reviewer',
  system_admin: 'System Admin',
};

const ROLE_TO_API: Record<UserRole, string> = {
  Researcher: 'researcher',
  'Institution Admin': 'institution_admin',
  Reviewer: 'reviewer',
  'System Admin': 'system_admin',
};

/**
 * UI label -> API slug, tolerant of casing/spacing ("system admin",
 * "System Admin", "SYSTEM-ADMIN" all map to "system_admin").
 */
export function roleToApiSlug(role?: string | null): string | undefined {
  if (!role) return undefined;
  const slug = role.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const found = Object.values(ROLE_TO_API).find((value) => value === slug);
  return found ?? ROLE_TO_API[role as UserRole];
}

export function mapUser(raw: RawUser): User {
  const initials = raw.full_name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    id: raw.id,
    name: raw.full_name,
    email: raw.email,
    role: ROLE_FROM_API[raw.role] ?? 'Researcher',
    initials: initials || 'U',
    avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(raw.id)}`,
  };
}

export function persistSession(tokens: TokenResponse, user: User): void {
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  localStorage.setItem('scientific_app_refresh_token', tokens.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('scientific_app_refresh_token');
}

export const authService = {
  /**
   * OAuth2 password grant — the backend expects form-encoded username/password.
   * `role` is the role card the user picked (`/admin-login` sends System Admin);
   * the backend refuses the attempt when it does not match the account.
   */
  async login(email: string, password: string, role?: UserRole): Promise<User> {
    // Drop any stale session first: a leftover token would otherwise be sent
    // with this request and, on 401, could bounce the sign-in page away.
    clearSession();
    const body = new URLSearchParams({ username: email.trim().toLowerCase(), password });
    const apiRole = roleToApiSlug(role);
    if (apiRole) body.set('role', apiRole);
    const { data: tokens } = await apiClient.post<TokenResponse>('/auth/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem(TOKEN_KEY, tokens.access_token);
    localStorage.setItem('scientific_app_refresh_token', tokens.refresh_token);
    const user = await authService.me();
    persistSession(tokens, user);
    return user;
  },

  async register(input: {
    email: string;
    password: string;
    fullName: string;
    role?: UserRole;
  }): Promise<User> {
    const { data } = await apiClient.post<RawUser>('/auth/register', {
      email: input.email,
      password: input.password,
      full_name: input.fullName,
      role: roleToApiSlug(input.role),
    });
    return mapUser(data);
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<RawUser>('/auth/me');
    return mapUser(data);
  },

  async refresh(): Promise<User> {
    const refreshToken = localStorage.getItem('scientific_app_refresh_token');
    const { data } = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem('scientific_app_refresh_token', data.refresh_token);
    const user = await authService.me();
    persistSession(data, user);
    return user;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  logout(): void {
    clearSession();
  },
};

export type { TokenResponse };
