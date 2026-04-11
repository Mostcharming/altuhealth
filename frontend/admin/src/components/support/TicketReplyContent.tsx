"use client";

import { useTicketStore } from "@/lib/store/ticketStore";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TicketReplyContent() {
  const params = useParams();
  const ticketId = params.id as string;

  const {
    currentTicket: ticket,
    messages = [],
    ticketsLoading: loading,
    getTicket,
    getMessages,
    addMessage,
    updateTicket,
  } = useTicketStore();

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "On Hold", value: "on_hold" },
    { label: "Solved", value: "solved" },
    { label: "Closed", value: "closed" },
  ];

  useEffect(() => {
    if (ticketId) {
      getTicket(ticketId, true);
    }
  }, [ticketId, getTicket]);

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  useEffect(() => {
    if (ticketId) {
      getMessages(ticketId, { page: currentPage, limit: 20 });
    }
  }, [ticketId, currentPage, getMessages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !ticket) return;

    setSending(true);
    try {
      await addMessage(ticketId, {
        senderId:
          typeof window !== "undefined"
            ? localStorage.getItem("adminId") || ""
            : "",
        senderType: "Admin",
        content: replyText,
        messageType: "text",
        isInternal: false,
      });
      setReplyText("");
      setCurrentPage(1);
      // Refresh messages
      await getMessages(ticketId, { page: 1, limit: 20 });
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    try {
      await updateTicket(ticketId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 text-gray-500">Ticket not found</div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
            Ticket #{ticket.ticketNumber} - {ticket.subject}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white/90">
              <svg
                className="stroke-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white/90">
              <svg
                className="stroke-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.29167 15.8335L12.5 10.6252L7.29167 5.41683"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative px-6 py-7">
        <div className="custom-scrollbar h-[calc(58vh-162px)] space-y-7 divide-y divide-gray-200 overflow-y-auto pr-2 dark:divide-gray-800">
          {messages.map((message) => (
            <article
              key={message.id}
              className={message.isInternal ? "opacity-75" : ""}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {message.senderType[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {message.senderType}
                      {message.isInternal && (
                        <span className="ml-2 inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded dark:bg-yellow-900/30 dark:text-yellow-300">
                          Internal Note
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pb-6">
                {message.messageType === "text" && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
                {message.messageType === "attachment" &&
                  message.attachmentUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 w-fit">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M14.4194 11.7679L15.4506 10.7367C17.1591 9.02811 17.1591 6.25802 15.4506 4.54947C13.742 2.84093 10.9719 2.84093 9.2634 4.54947L8.2322 5.58067M11.77 14.4172L10.7365 15.4507C9.02799 17.1592 6.2579 17.1592 4.54935 15.4507C2.84081 13.7422 2.84081 10.9721 4.54935 9.26352L5.58285 8.23002M11.7677 8.23232L8.2322 11.7679"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <a
                        href={message.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 underline"
                      >
                        {message.attachmentName || "Download Attachment"}
                      </a>
                    </div>
                  )}
              </div>
            </article>
          ))}
        </div>

        {/* Reply Input */}
        <div className="pt-5">
          <div className="mx-auto max-h-[162px] w-full rounded-2xl border border-gray-200 shadow-xs dark:border-gray-800 dark:bg-gray-800">
            <textarea
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="h-20 w-full resize-none border-none bg-transparent p-5 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
            />

            <div className="flex items-center justify-between p-3">
              <button className="flex h-9 items-center gap-1.5 rounded-lg bg-transparent px-2 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                >
                  <path
                    d="M14.4194 11.7679L15.4506 10.7367C17.1591 9.02811 17.1591 6.25802 15.4506 4.54947C13.742 2.84093 10.9719 2.84093 9.2634 4.54947L8.2322 5.58067M11.77 14.4172L10.7365 15.4507C9.02799 17.1592 6.2579 17.1592 4.54935 15.4507C2.84081 13.7422 2.84081 10.9721 4.54935 9.26352L5.58285 8.23002M11.7677 8.23232L8.2322 11.7679"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Attach
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs inline-flex h-9 items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors"
              >
                {sending ? "Sending..." : "Reply"}
              </button>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="text-gray-500 dark:text-gray-400">Status:</span>
          <div className="flex items-center gap-4">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                htmlFor={option.value}
                className="flex cursor-pointer items-center text-sm font-medium text-gray-700 select-none dark:text-gray-400"
              >
                <div className="relative">
                  <input
                    type="radio"
                    id={option.value}
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={() => handleStatusChange(option.value)}
                    className="sr-only"
                  />
                  <div
                    className={`mr-3 flex h-4 w-4 items-center justify-center rounded-full border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 transition-colors ${
                      selectedStatus === option.value
                        ? "border-brand-500 bg-brand-500"
                        : "bg-transparent border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        selectedStatus === option.value
                          ? "bg-white"
                          : "bg-white dark:bg-[#171f2e]"
                      }`}
                    ></span>
                  </div>
                </div>
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
