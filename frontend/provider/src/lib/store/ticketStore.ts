import { create } from "zustand";
import { apiClient } from "../apiClient";

export interface Ticket {
  id: string;
  ticketNumber: number;
  subject: string;
  description?: string;
  userId: string;
  userName?: string;
  userType: "Enrollee" | "RetailEnrollee" | "Provider" | "Doctor";
  category: string;
  status: "pending" | "in_progress" | "on_hold" | "solved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
  assignedToId?: string;
  closedAt?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType:
    | "Enrollee"
    | "RetailEnrollee"
    | "Provider"
    | "Doctor"
    | "Admin"
    | "System";
  messageType: "text" | "attachment" | "system" | "status_update" | "note";
  content?: string;
  attachmentUrl?: string;
  attachmentType?: "image" | "document" | "other";
  attachmentName?: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationResponse<T> {
  list: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface TicketListOptions {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  category?: string;
  priority?: string;
}

interface MessageListOptions {
  page?: number;
  limit?: number;
  includeInternal?: boolean;
}

type TicketStore = {
  // Tickets
  tickets: Ticket[];
  currentTicket: Ticket | null;
  ticketsLoading: boolean;
  ticketsError: string | null;
  ticketsPagination: {
    page: number;
    limit: number;
    totalPages: number;
    count: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Messages
  messages: TicketMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  messagesPagination: {
    page: number;
    limit: number;
    totalPages: number;
    count: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Actions - Tickets
  listTickets: (options?: TicketListOptions) => Promise<void>;
  getTicket: (ticketId: string, includeMessages?: boolean) => Promise<void>;
  createTicket: (data: {
    userId: string;
    userType: string;
    subject: string;
    description?: string;
    category?: string;
    priority?: string;
  }) => Promise<Ticket>;
  updateTicket: (
    ticketId: string,
    data: {
      status?: string;
      priority?: string;
      category?: string;
    }
  ) => Promise<void>;

  // Actions - Messages
  getMessages: (
    ticketId: string,
    options?: MessageListOptions
  ) => Promise<void>;
  addMessage: (
    ticketId: string,
    data:
      | FormData
      | {
          senderId: string;
          senderType: string;
          content?: string;
          messageType?: string;
          attachmentUrl?: string;
          attachmentType?: string;
          attachmentName?: string;
          isInternal?: boolean;
        }
  ) => Promise<void>;

  // Clear
  clearTickets: () => void;
  clearMessages: () => void;
  clearCurrentTicket: () => void;
};

export const useTicketStore = create<TicketStore>((set) => ({
  // Tickets
  tickets: [],
  currentTicket: null,
  ticketsLoading: false,
  ticketsError: null,
  ticketsPagination: {
    page: 1,
    limit: 10,
    totalPages: 1,
    count: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Messages
  messages: [],
  messagesLoading: false,
  messagesError: null,
  messagesPagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    count: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // Actions - Tickets
  listTickets: async (options = {}) => {
    set({ ticketsLoading: true, ticketsError: null });
    try {
      const endpoint = `/provider/tickets?page=${options.page || 1}&limit=${
        options.limit || 10
      }${options.q ? `&q=${options.q}` : ""}${
        options.status ? `&status=${options.status}` : ""
      }${options.category ? `&category=${options.category}` : ""}${
        options.priority ? `&priority=${options.priority}` : ""
      }`;

      const response = await apiClient(endpoint);
      const data: PaginationResponse<Ticket> = response.data;

      set({
        tickets: data.list,
        ticketsPagination: {
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          count: data.count,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
        },
      });
    } catch (error) {
      set({
        ticketsError:
          error instanceof Error ? error.message : "Failed to fetch tickets",
      });
    } finally {
      set({ ticketsLoading: false });
    }
  },

  getTicket: async (ticketId, includeMessages = false) => {
    set({ ticketsLoading: true, ticketsError: null });
    try {
      const endpoint = `/provider/tickets/${ticketId}${
        includeMessages ? "?includeMessages=true" : ""
      }`;
      const data = await apiClient(endpoint);

      set({ currentTicket: data.ticket || data.data?.ticket || data });
    } catch (error) {
      set({
        ticketsError:
          error instanceof Error ? error.message : "Failed to fetch ticket",
      });
    } finally {
      set({ ticketsLoading: false });
    }
  },

  createTicket: async (data) => {
    set({ ticketsLoading: true, ticketsError: null });
    try {
      const response = await apiClient("/provider/tickets", {
        method: "POST",
        body: data,
      });

      const ticket = response.ticket || response.data?.ticket;
      set((state) => ({
        tickets: [ticket, ...state.tickets],
      }));

      return ticket;
    } catch (error) {
      set({
        ticketsError:
          error instanceof Error ? error.message : "Failed to create ticket",
      });
      throw error;
    } finally {
      set({ ticketsLoading: false });
    }
  },

  updateTicket: async (ticketId, data) => {
    set({ ticketsLoading: true, ticketsError: null });
    try {
      const response = await apiClient(`/provider/tickets/${ticketId}`, {
        method: "PUT",
        body: data,
      });

      const updatedTicket = response.ticket || response.data?.ticket;

      set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === ticketId ? updatedTicket : t
        ),
        currentTicket:
          state.currentTicket?.id === ticketId
            ? updatedTicket
            : state.currentTicket,
      }));
    } catch (error) {
      set({
        ticketsError:
          error instanceof Error ? error.message : "Failed to update ticket",
      });
      throw error;
    } finally {
      set({ ticketsLoading: false });
    }
  },

  // Actions - Messages
  getMessages: async (ticketId, options = {}) => {
    set({ messagesLoading: true, messagesError: null });
    try {
      const endpoint = `/provider/tickets/${ticketId}/messages${
        options.includeInternal ? "?includeInternal=true" : ""
      }`;

      const response = await apiClient(endpoint);

      const messages = response.data?.list || response.list || [];

      // Sort messages by createdAt in ascending order (oldest first, newest last)
      const sortedMessages = Array.isArray(messages)
        ? [...messages].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        : [];

      set({
        messages: sortedMessages,
      });
    } catch (error) {
      set({
        messagesError:
          error instanceof Error ? error.message : "Failed to fetch messages",
      });
    } finally {
      set({ messagesLoading: false });
    }
  },

  addMessage: async (ticketId, data) => {
    set({ messagesLoading: true, messagesError: null });
    try {
      // Check if data is FormData (for file uploads)
      const requestOptions: {
        method: string;
        body?: unknown;
        formData?: FormData;
      } = {
        method: "POST",
      };

      if (data instanceof FormData) {
        requestOptions.formData = data;
      } else {
        requestOptions.body = data;
      }

      const response = await apiClient(
        `/provider/tickets/${ticketId}/messages`,
        requestOptions
      );

      // Extract message from response structure: { error, message, data: { message: {...} } }
      const message = response.data?.message;

      // If message is not an object or doesn't have required fields, log and throw
      if (!message || typeof message !== "object") {
        console.error("Invalid message response from server:", response);
        throw new Error("Invalid message response from server");
      }

      const messageData = !(data instanceof FormData)
        ? (data as {
            senderId?: string;
            senderType?: string;
            content?: string;
            messageType?: string;
            attachmentUrl?: string;
            attachmentType?: string;
            attachmentName?: string;
            isInternal?: boolean;
          })
        : {};

      // Ensure message has all required fields with fallbacks
      const enrichedMessage: TicketMessage = {
        id: message.id || `temp-${Date.now()}`,
        ticketId: ticketId,
        senderId: message.senderId || messageData.senderId || "",
        senderType: (message.senderType ||
          messageData.senderType ||
          "Provider") as TicketMessage["senderType"],
        messageType: (message.messageType ||
          messageData.messageType ||
          "text") as
          | "text"
          | "attachment"
          | "system"
          | "status_update"
          | "note",
        content: message.content || messageData.content || undefined,
        attachmentUrl: message.attachmentUrl || undefined,
        attachmentType: (message.attachmentType || undefined) as
          | "image"
          | "document"
          | "other"
          | undefined,
        attachmentName: message.attachmentName || undefined,
        isInternal: message.isInternal ?? messageData.isInternal ?? false,
        createdAt: message.createdAt || new Date().toISOString(),
        updatedAt: message.updatedAt || new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, enrichedMessage],
      }));
    } catch (error) {
      set({
        messagesError:
          error instanceof Error ? error.message : "Failed to add message",
      });
      throw error;
    } finally {
      set({ messagesLoading: false });
    }
  },

  // Clear
  clearTickets: () =>
    set({
      tickets: [],
      ticketsPagination: {
        page: 1,
        limit: 10,
        totalPages: 1,
        count: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }),

  clearMessages: () =>
    set({
      messages: [],
      messagesPagination: {
        page: 1,
        limit: 20,
        totalPages: 1,
        count: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }),

  clearCurrentTicket: () => set({ currentTicket: null }),
}));
