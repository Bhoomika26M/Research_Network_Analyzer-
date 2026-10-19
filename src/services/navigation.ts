/**
 * URL ⇄ shell page sync. This app has no router: each role shell owns its page
 * state, so we keep the address bar in step with it — direct URLs land on the
 * right page, login lands on /dashboard, and nav highlights stay truthful.
 */
export const PAGE_PATH: Record<string, string> = {
  dashboard: '/dashboard',
  collaboration: '/collaboration',
  users: '/users',
  profile: '/profile',
}

/** Deep-link → page key; falls back to the shell's default (dashboard). */
export function pageFromPath(fallback: string): string {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path.startsWith('/collaboration')) return 'collaboration'
  if (path === '/users') return 'users'
  if (path === '/profile') return 'profile'
  return fallback
}

/** Write the URL without triggering a reload. */
export function writePath(path: string): void {
  window.history.replaceState(null, '', path)
}