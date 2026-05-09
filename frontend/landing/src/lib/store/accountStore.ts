import { create } from "zustand";

export interface Account {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  picture?: string | null;
  phoneNumber?: string | null;
  status?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  currentLocation?: string | null;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

type AccountState = {
  account: Account | null;
  setAccount: (item: Account) => void;
  updateAccount: (patch: Partial<Account>) => void;
  clearAccount: () => void;
};

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  setAccount: (item) => set({ account: item }),
  updateAccount: (patch) =>
    set((state) => ({
      account: state.account
        ? { ...state.account, ...patch }
        : ({ ...patch } as Account),
    })),
  clearAccount: () => set({ account: null }),
}));
