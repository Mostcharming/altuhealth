import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  picture?: string;
  phoneNumber?: string;
  status?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: AuthState["user"], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        set({ user, token });
        document.cookie = `auth_token=${token}; path=/; max-age=86400`;
      },
      logout: () => {
        set({ user: null, token: null });
        document.cookie = "auth_token=; path=/; max-age=0";
        window.location.href = "/signin";
      },
    }),
    { name: "auth-storage" }
  )
);
