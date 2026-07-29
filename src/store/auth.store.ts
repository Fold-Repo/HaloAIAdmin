import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { appConfig } from '@/config';
import type { OtpPurpose, User } from '@/types';

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingOtpEmail: string | null;
  pendingOtpPurpose: OtpPurpose | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setPendingOtp: (email: string, purpose: OtpPurpose) => void;
  clearPendingOtp: () => void;
  setSession: (user: User, accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  completeOnboarding: () => void;
  logout: () => void;
};

function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(appConfig.auth.tokenKey, accessToken);
  localStorage.setItem(appConfig.auth.refreshTokenKey, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(appConfig.auth.tokenKey);
  localStorage.removeItem(appConfig.auth.refreshTokenKey);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      pendingOtpEmail: null,
      pendingOtpPurpose: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setPendingOtp: (email, purpose) =>
        set({ pendingOtpEmail: email, pendingOtpPurpose: purpose }),
      clearPendingOtp: () => set({ pendingOtpEmail: null, pendingOtpPurpose: null }),
      setSession: (user, accessToken, refreshToken) => {
        persistTokens(accessToken, refreshToken);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          pendingOtpEmail: null,
          pendingOtpPurpose: null,
        });
      },
      login: (user, accessToken, refreshToken) => {
        get().setSession(user, accessToken, refreshToken);
      },
      completeOnboarding: () => {
        const { user } = get();
        if (!user) return;
        set({
          user: { ...user, onboardingCompleted: true },
        });
      },
      logout: () => {
        clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          pendingOtpEmail: null,
          pendingOtpPurpose: null,
        });
      },
    }),
    {
      name: 'ai-creator-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingOtpEmail: state.pendingOtpEmail,
        pendingOtpPurpose: state.pendingOtpPurpose,
      }),
    },
  ),
);
