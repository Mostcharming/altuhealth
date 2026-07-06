import { create } from "zustand";

export interface Privilege {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type PrivilegeState = {
  privileges: Privilege[];
  setPrivileges: (items: Privilege[]) => void;
  addPrivilege: (item: Privilege) => void;
  updatePrivilege: (id: string, patch: Partial<Privilege>) => void;
  removePrivilege: (id: string) => void;
  clear: () => void;
};

export const usePrivilegeStore = create<PrivilegeState>((set) => ({
  privileges: [],
  setPrivileges: (items) => set({ privileges: items }),
  addPrivilege: (item) =>
    set((state) => ({ privileges: [item, ...state.privileges] })),
  updatePrivilege: (id, patch) =>
    set((state) => ({
      privileges: state.privileges.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),
  removePrivilege: (id) =>
    set((state) => ({
      privileges: state.privileges.filter((p) => p.id !== id),
    })),
  clear: () => set({ privileges: [] }),
}));
