import { create } from "zustand";

export interface SearchHistoryRecord {
  id: string;
  providerId: string;
  searchTerm: string;
  searchType?: string;
  enrolleeType?: string | null;
  enrolleeId?: string;
  dependentId?: string;
  resultFound: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt?: string;
  Provider?: {
    id: string;
    name: string;
    upn: string;
    providerCode: string;
  };
}

export interface CategorizedSearchHistory {
  today: SearchHistoryRecord[];
  yesterday: SearchHistoryRecord[];
  earlier: SearchHistoryRecord[];
}

type SearchHistoryState = {
  searchHistory: CategorizedSearchHistory;
  setSearchHistory: (items: CategorizedSearchHistory) => void;
  addSearchRecord: (record: SearchHistoryRecord) => void;
  removeSearchRecord: (id: string) => void;
  clear: () => void;
};

export const useSearchHistoryStore = create<SearchHistoryState>((set) => ({
  searchHistory: {
    today: [],
    yesterday: [],
    earlier: [],
  },
  setSearchHistory: (items) => set({ searchHistory: items }),
  addSearchRecord: (record) =>
    set((state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const recordDate = new Date(record.createdAt);
      recordDate.setHours(0, 0, 0, 0);

      const newHistory = { ...state.searchHistory };

      if (recordDate.getTime() === today.getTime()) {
        newHistory.today = [record, ...newHistory.today];
      } else if (recordDate.getTime() === yesterday.getTime()) {
        newHistory.yesterday = [record, ...newHistory.yesterday];
      } else {
        newHistory.earlier = [record, ...newHistory.earlier];
      }

      return { searchHistory: newHistory };
    }),
  removeSearchRecord: (id) =>
    set((state) => ({
      searchHistory: {
        today: state.searchHistory.today.filter((r) => r.id !== id),
        yesterday: state.searchHistory.yesterday.filter((r) => r.id !== id),
        earlier: state.searchHistory.earlier.filter((r) => r.id !== id),
      },
    })),
  clear: () =>
    set({
      searchHistory: {
        today: [],
        yesterday: [],
        earlier: [],
      },
    }),
}));
