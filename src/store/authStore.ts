import { create } from 'zustand';
import { User, UserRole } from '../types';
import { authService, clearSession } from '../services/authService';
import { mockDataStore } from '../services/dataStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Real login when a password is given; otherwise the demo role-switcher. */
  login: (role?: UserRole, email?: string, password?: string) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  setUser: (user: User) => void;
}

// Demo-only users used by the "Role Switcher" when no real credentials are given.
const MOCK_USERS: Record<UserRole, User> = {
  Researcher: {
    id: 'res-1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@mit.edu',
    role: 'Researcher',
    institutionId: 'inst-1',
    institutionName: 'Massachusetts Institute of Technology',
    avatarUrl: 'https://i.pravatar.cc/150?u=res-1',
    initials: 'SC',
    bio: 'Professor of AI focusing on deep learning applications in bio-molecular structures.',
    department: 'Computer Science & AI',
  },
  'Institution Admin': {
    id: 'u-admin-1',
    name: 'Prof. James Wilson',
    email: 'j.wilson@stanford.edu',
    role: 'Institution Admin',
    institutionId: 'inst-2',
    institutionName: 'Stanford University',
    avatarUrl: 'https://i.pravatar.cc/150?u=res-2',
    initials: 'JW',
    bio: 'Director of Academic Affairs and Research Funding at Stanford University.',
    department: 'Applied Physics',
  },
  Reviewer: {
    id: 'u-rev-1',
    name: 'Dr. Maria Rodriguez',
    email: 'm.rodriguez@ethz.ch',
    role: 'Reviewer',
    institutionId: 'inst-3',
    institutionName: 'ETH Zürich',
    avatarUrl: 'https://i.pravatar.cc/150?u=res-3',
    initials: 'MR',
    bio: 'Senior Peer Reviewer for Nature Machine Intelligence and IEEE Transactions.',
    department: 'Computer Science',
  },
  'System Admin': {
    id: 'u-sys-1',
    name: 'Alex Thompson',
    email: 'a.thompson@scientific.app',
    role: 'System Admin',
    institutionId: 'inst-1',
    institutionName: 'Scientific Collaboration Network',
    avatarUrl: 'https://i.pravatar.cc/150?u=res-4',
    initials: 'AT',
    bio: 'System Administrator and Governance Lead.',
    department: 'IT & Data Systems',
  },
};

export const useAuthStore = create<AuthState>((set) => {
  const savedToken = localStorage.getItem('scientific_app_token');
  const savedUser = localStorage.getItem('scientific_app_user');
  let initialUser: User | null = null;
  if (savedUser) {
    try {
      initialUser = JSON.parse(savedUser) as User;
    } catch {
      initialUser = null;
    }
  }

  return {
    user: initialUser,
    token: savedToken,
    isAuthenticated: !!savedToken && !!initialUser,

    login: async (role = 'Researcher', email, password) => {
      // Real credentials -> real JWT + `/auth/me` (role validated server-side).
      if (email && password) {
        const user = await authService.login(email, password, role);
        set({ user, token: localStorage.getItem('scientific_app_token'), isAuthenticated: true });
        void mockDataStore.prime();
        return user;
      }

      // Demo role switcher fallback (no backend call).
      const selectedUser = { ...MOCK_USERS[role] };
      if (email) selectedUser.email = email;
      const mockToken = `mock-jwt-token-${Date.now()}`;
      localStorage.setItem('scientific_app_token', mockToken);
      localStorage.setItem('scientific_app_user', JSON.stringify(selectedUser));
      set({ user: selectedUser, token: mockToken, isAuthenticated: true });
      return selectedUser;
    },

    logout: () => {
      clearSession();
      set({ user: null, token: null, isAuthenticated: false });
    },

    switchRole: (role: UserRole) => {
      const newUser = MOCK_USERS[role];
      localStorage.setItem('scientific_app_user', JSON.stringify(newUser));
      set({ user: newUser });
    },

    setUser: (user: User) => {
      localStorage.setItem('scientific_app_user', JSON.stringify(user));
      set({ user });
    },
  };
});

// On a fresh page load, warm the caches for a real (non-demo) session only.
const bootToken = localStorage.getItem('scientific_app_token');
if (bootToken && !bootToken.startsWith('mock-jwt-token')) {
  void mockDataStore.prime();
}
