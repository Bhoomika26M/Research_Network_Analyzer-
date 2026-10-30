// src/lib/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string) {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json: ApiResponse<any> = await resp.json();
  if (!json.success) throw new Error(json.message || "Login failed");
  const { access_token, refresh_token, token_type, role } = json.data as any;
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
  return { role, access_token, refresh_token };
}

export async function register(email: string, password: string, role: string) {
  const resp = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });
  const json: ApiResponse<any> = await resp.json();
  if (!json.success) throw new Error(json.message || "Register failed");
  const { access_token, refresh_token, role: returnedRole } = json.data as any;
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("refresh_token", refresh_token);
  return { role: returnedRole };
}

export async function fetchMe() {
  const resp = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...getAuthHeader() },
  });
  const json: ApiResponse<any> = await resp.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch user");
  return json.data;
}

export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, { method: "POST", headers: getAuthHeader() });
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
