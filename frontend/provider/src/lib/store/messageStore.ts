import { create } from "zustand";

export interface Message {
  id: string;
  senderId: string;
  senderType: "Admin" | "Enrollee" | "Provider" | "Staff" | "System";
  receiverId?: string | null;
  receiverType: "Admin" | "Enrollee" | "Provider" | "Staff" | "System";
  content: string;
  messageType?: string;
  isInternal?: boolean;
  status?: "sent" | "read" | "delivered" | "failed";
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  conversationType: string;
  senderId?: string | null;
  senderType: "Admin" | "Enrollee" | "Provider" | "Staff" | "System";
  receiverId?: string | null;
  receiverType: "Admin" | "Enrollee" | "Provider" | "Staff" | "System";
  subject: string;
  description?: string | null;
  priority: "low" | "medium" | "high" | "critical";
  category?: string | null;
  assignedToId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  status: "open" | "closed" | "archived";
  messageCount: number;
  lastMessageAt?: string | null;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  assignedAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  messages?: Message[];
}

type ConversationState = {
  conversations: Conversation[];
  setConversations: (items: Conversation[]) => void;
  addConversation: (item: Conversation) => void;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  clear: () => void;
};

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  setConversations: (items) => set({ conversations: items }),
  addConversation: (item) =>
    set((state) => ({ conversations: [item, ...state.conversations] })),
  updateConversation: (id, patch) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    })),
  clear: () => set({ conversations: [] }),
}));
