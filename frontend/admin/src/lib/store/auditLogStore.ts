import { create } from "zustand";

export interface AuditLog {
  id: string;
  userId?: string | null;
  userType?: string | null;
  action: string;
  message: string;
  meta?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

type AuditLogState = {
  auditLogs: AuditLog[];
  setAuditLogs: (items: AuditLog[]) => void;
  addAuditLog: (item: AuditLog) => void;
  removeAuditLog: (id: string) => void;
  clear: () => void;
};

export const useAuditLogStore = create<AuditLogState>((set) => ({
  auditLogs: [],
  setAuditLogs: (items) => set({ auditLogs: items }),
  addAuditLog: (item) =>
    set((state) => ({ auditLogs: [item, ...state.auditLogs] })),
  removeAuditLog: (id) =>
    set((state) => ({
      auditLogs: state.auditLogs.filter((log) => log.id !== id),
    })),
  clear: () => set({ auditLogs: [] }),
}));
