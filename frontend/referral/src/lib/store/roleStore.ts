import { create } from "zustand";

export interface Privilege {
  id: string;
  name?: string;
  description?: string | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  privileges?: Privilege[];
  createdAt?: string;
  updatedAt?: string;
}

type RoleState = {
  roles: Role[];
  setRoles: (items: Role[]) => void;
  addRole: (item: Role) => void;
  updateRole: (id: string, patch: Partial<Role>) => void;
  removeRole: (id: string) => void;
  clear: () => void;
};

export const useRoleStore = create<RoleState>((set) => ({
  roles: [],
  setRoles: (items) => set({ roles: items }),
  addRole: (item) => set((state) => ({ roles: [item, ...state.roles] })),
  updateRole: (id, patch) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
  removeRole: (id) =>
    set((state) => ({ roles: state.roles.filter((r) => r.id !== id) })),
  clear: () => set({ roles: [] }),
}));
