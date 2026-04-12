"use client";

import capitalizeWords from "@/lib/capitalize";
import { useTicketStore } from "@/lib/store/ticketStore";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function TicketDetails() {
  const params = useParams();
  const ticketId = params.id as string;

  const {
    currentTicket: ticket,
    ticketsLoading: loading,
    getTicket,
  } = useTicketStore();

  useEffect(() => {
    if (ticketId) {
      getTicket(ticketId);
    }
  }, [ticketId, getTicket]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: {
        bg: "bg-warning-50 dark:bg-warning-500/15",
        text: "text-warning-600 dark:text-warning-500",
      },
      in_progress: {
        bg: "bg-info-50 dark:bg-info-500/15",
        text: "text-info-600 dark:text-info-500",
      },
      on_hold: {
        bg: "bg-yellow-50 dark:bg-yellow-500/15",
        text: "text-yellow-600 dark:text-yellow-500",
      },
      solved: {
        bg: "bg-success-50 dark:bg-success-500/15",
        text: "text-success-700 dark:text-success-500",
      },
      closed: {
        bg: "bg-gray-50 dark:bg-gray-500/15",
        text: "text-gray-700 dark:text-gray-500",
      },
    };
    return colors[status] || colors.pending;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      billing: "💳",
      technical: "🔧",
      claim: "📋",
      provider: "🏥",
      enrollment: "✍️",
      prescription: "💊",
      appointment: "📅",
      general: "❓",
      other: "📞",
    };
    return icons[category] || "❓";
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 text-gray-500">Ticket not found</div>
    );
  }

  const statusColor = getStatusColor(ticket.status);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
          Ticket Details
        </h3>
      </div>

      <ul className="divide-y divide-gray-100 px-6 py-3 dark:divide-gray-800">
        <li className="grid grid-cols-2 gap-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Ticket ID
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            #{ticket.ticketNumber}
          </span>
        </li>

        <li className="grid grid-cols-2 gap-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            User Type
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {ticket.userType}
          </span>
        </li>
        <li className="grid grid-cols-2 gap-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            User Name
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {capitalizeWords(ticket.userName) || "Unknown"}
          </span>
        </li>

        <li className="grid grid-cols-2 gap-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Category
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
            <span>{getCategoryIcon(ticket.category)}</span>
            <span className="capitalize">{ticket.category}</span>
          </span>
        </li>

        <li className="grid grid-cols-2 gap-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Priority
          </span>
          <span
            className={`text-sm font-semibold capitalize ${
              ticket.priority === "urgent"
                ? "text-red-600 dark:text-red-400"
                : ticket.priority === "high"
                ? "text-orange-600 dark:text-orange-400"
                : ticket.priority === "medium"
                ? "text-blue-600 dark:text-blue-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {ticket.priority}
          </span>
        </li>

        <li className="grid grid-cols-2 gap-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Status
          </span>
          <div>
            <span
              className={`text-xs rounded-full px-3 py-1 font-semibold inline-block ${statusColor.bg} ${statusColor.text} capitalize`}
            >
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        </li>

        <li className="grid grid-cols-2 gap-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Created
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </li>

        {ticket.closedAt && (
          <li className="grid grid-cols-2 gap-5 py-3.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Closed
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(ticket.closedAt).toLocaleDateString()}
            </span>
          </li>
        )}

        {ticket.assignedToId && (
          <li className="grid grid-cols-2 gap-5 py-3.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Assigned To
            </span>
            <span className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
              {ticket.assignedToId}
            </span>
          </li>
        )}
      </ul>

      {/* Description Section */}
      {ticket.description && (
        <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <h4 className="mb-3 text-sm font-medium text-gray-800 dark:text-white/90">
            Description
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
      )}
    </div>
  );
}
