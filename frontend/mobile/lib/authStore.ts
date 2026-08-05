import { useSyncExternalStore } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const AUTH_STORAGE_KEY = "altu_enrollee_session";

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string | null;
  type?: string;
  picture?: string | null;
  phoneNumber?: string | null;
  policyNumber?: string;
  status?: string;
  rolePrivileges?: string[];
  dependentVisitNotificationsEnabled?: boolean | null;
  requiresDependentVisitSetup?: boolean;
};

type AuthState = {
  user?: User | null;
  token?: string;
  isHydrated: boolean;
  login: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  setToken: (token?: string) => void;
  clearAuth: () => void;
  hydrateAuth: () => Promise<void>;
};

type AuthStore = {
  <T = AuthState>(selector?: (state: AuthState) => T): T;
  getState: () => AuthState;
  setState: (partial: Partial<AuthState>) => void;
  subscribe: (listener: () => void) => () => void;
};

async function readStoredSession() {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(AUTH_STORAGE_KEY) ?? null;
  }
  return SecureStore.getItemAsync(AUTH_STORAGE_KEY);
}

async function writeStoredSession(value?: { user: User; token: string }) {
  if (Platform.OS === "web") {
    if (value) {
      globalThis.localStorage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    } else {
      globalThis.localStorage?.removeItem(AUTH_STORAGE_KEY);
    }
    return;
  }

  if (value) {
    await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(value));
  } else {
    await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
  }
}

let hydratePromise: Promise<void> | null = null;

let state: AuthState = {
  user: null,
  token: undefined,
  isHydrated: false,
  login: (user: User, token: string) => {
    useAuthStore.setState({ user, token, isHydrated: true });
    void writeStoredSession({ user, token });
  },
  updateUser: (updates: Partial<User>) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    const user = { ...currentUser, ...updates };
    useAuthStore.setState({ user });
    const token = useAuthStore.getState().token;
    if (token) void writeStoredSession({ user, token });
  },
  setToken: (token?: string) => useAuthStore.setState({ token }),
  clearAuth: () => {
    useAuthStore.setState({ user: null, token: undefined, isHydrated: true });
    void writeStoredSession();
  },
  hydrateAuth: async () => {
    if (useAuthStore.getState().isHydrated) return;
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      try {
        const raw = await readStoredSession();
        const session = raw ? JSON.parse(raw) : null;
        if (session?.user && session?.token) {
          useAuthStore.setState({
            user: session.user,
            token: session.token,
            isHydrated: true,
          });
        } else {
          useAuthStore.setState({ isHydrated: true });
        }
      } catch {
        await writeStoredSession();
        useAuthStore.setState({
          user: null,
          token: undefined,
          isHydrated: true,
        });
      } finally {
        hydratePromise = null;
      }
    })();

    return hydratePromise;
  },
};

const listeners = new Set<() => void>();

export const useAuthStore: AuthStore = (<T = AuthState>(
  selector = ((authState: AuthState) => authState) as (state: AuthState) => T
) =>
  useSyncExternalStore(
    useAuthStore.subscribe,
    () => selector(state),
    () => selector(state)
  )) as AuthStore;

useAuthStore.getState = () => state;

useAuthStore.setState = (partial: Partial<AuthState>) => {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
};

useAuthStore.subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
