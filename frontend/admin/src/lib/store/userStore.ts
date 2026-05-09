import { create } from "zustand";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: { id: string; name: string } | null;
  phoneNumber?: string | null;
  picture?: string | null;
  unit?: { id: string; name: string } | null;
  status?: "active" | "inactive" | string;
  createdAt?: string;
  updatedAt?: string;
}

type UserState = {
  users: User[];
  setUsers: (items: User[]) => void;
  addUser: (item: User) => void;
  upsertUser: (item: User) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;
  findUser: (id: string) => User | undefined;
  clear: () => void;
};

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  setUsers: (items) => set({ users: items }),
  addUser: (item) => set((state) => ({ users: [item, ...state.users] })),
  upsertUser: (item) =>
    set((state) => {
      const idx = state.users.findIndex((u) => u.id === item.id);
      if (idx === -1) {
        return { users: [item, ...state.users] };
      }
      const users = [...state.users];
      users[idx] = { ...users[idx], ...item };
      return { users };
    }),
  updateUser: (id, patch) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),
  removeUser: (id) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
  findUser: (id) => get().users.find((u) => u.id === id),
  clear: () => set({ users: [] }),
}));
