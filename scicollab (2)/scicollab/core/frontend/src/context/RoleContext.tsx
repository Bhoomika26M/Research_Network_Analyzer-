import { createContext, useContext } from 'react';

export type Role = 'Researcher' | 'Institution Admin' | 'System Admin' | 'Reviewer';

export interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  can: (action: 'add' | 'edit' | 'delete' | 'audit', module?: string) => boolean;
  hasModule: (id: string) => boolean;
}

const allowedModules: Record<Role, string[]> = {
  'Researcher':       ['dashboard', 'researchers', 'publications', 'collaborations', 'conferences', 'citations', 'reports', 'settings'],
  'Institution Admin':['dashboard', 'researchers', 'publications', 'collaborations', 'conferences', 'citations', 'reports', 'settings'],
  'System Admin':     ['dashboard', 'researchers', 'publications', 'collaborations', 'conferences', 'citations', 'reports', 'audit', 'settings'],
  'Reviewer':         ['dashboard', 'publications', 'citations', 'conferences', 'settings'],
};

const writePermissions: Record<Role, Record<string, boolean>> = {
  'Researcher': {
    researchers: false,
    institutions: false,
    collaborations: false,
    reports: true,
    publications: true,
    conferences: false,
    citations: true,
  },
  'Institution Admin': {
    researchers: true,
    institutions: true,
    collaborations: true,
    reports: true,
    publications: true,
    conferences: true,
    citations: true,
  },
  'System Admin': {
    researchers: true,
    institutions: true,
    collaborations: true,
    reports: true,
    publications: true,
    conferences: true,
    citations: true,
    audit: true,
  },
  'Reviewer': {
    // Reviewer is view-only everywhere; approve/reject handled separately
    researchers: false,
    institutions: false,
    collaborations: false,
    reports: false,
    publications: false,
    conferences: false,
    citations: false,
    audit: false,
  },
};

export const RoleContext = createContext<RoleContextValue>({
  role: 'Researcher',
  setRole: () => {},
  can: () => false,
  hasModule: () => true,
});

export function makeRoleContextValue(role: Role, setRole: (r: Role) => void): RoleContextValue {
  return {
    role,
    setRole,
    can: (action, module = '') => {
      if (role === 'System Admin') return true;
      if (action === 'audit') return false;
      return writePermissions[role][module] ?? false;
    },
    hasModule: (id) => allowedModules[role].includes(id),
  };
}

export const useRole = () => useContext(RoleContext);
