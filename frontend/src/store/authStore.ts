import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = { id: string; email: string; name: string };

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  redirectAfterLogin: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setRedirect: (path: string | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      redirectAfterLogin: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setRedirect: (path) => set({ redirectAfterLogin: path }),
    }),
    { name: "prism-auth" }
  )
);
