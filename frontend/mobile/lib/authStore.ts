import { useSyncExternalStore } from "react";

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
};

type AuthState = {
  user?: User | null;
  token?: string;
  login: (user: User, token: string) => void;
  setToken: (token?: string) => void;
  clearAuth: () => void;
};

type AuthStore = {
  <T = AuthState>(selector?: (state: AuthState) => T): T;
  getState: () => AuthState;
  setState: (partial: Partial<AuthState>) => void;
  subscribe: (listener: () => void) => () => void;
};

let state: AuthState = {
  user: null,
  token: undefined,
  login: (user: User, token: string) => useAuthStore.setState({ user, token }),
  setToken: (token?: string) => useAuthStore.setState({ token }),
  clearAuth: () => useAuthStore.setState({ user: null, token: undefined }),
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
