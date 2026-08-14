import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => {
    set({ accessToken: token });
    if (token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('has_session', 'true');
      }
    }
  },
  clearAuth: () => {
    set({ accessToken: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('has_session');
    }
  },
}));
