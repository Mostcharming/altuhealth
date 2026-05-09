"use client";

import { useAuthStore } from "@/lib/authStore";
import { useTicketStore } from "@/lib/store/ticketStore";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TicketReplyContent() {
  const params = useParams();
  const ticketId = params.id as string;

  const { user } = useAuthStore();

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
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      getMessages(ticketId, {});
    }
  }, [ticketId, getMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() && !selectedFile) return;
    if (!ticket || !user) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("senderId", user.id);
      formData.append("senderType", "Admin");
      formData.append("content", replyText);
      formData.append("messageType", selectedFile ? "attachment" : "text");
      formData.append("isInternal", "false");

      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      // Use the store's addMessage method which handles FormData
      await addMessage(ticketId, formData);

      // Reset form after successful send
      setReplyText("");
      setSelectedFile(null);
      setPreviewUrl("");

      // Refresh messages from server to ensure complete data is loaded
      // This ensures attachment URLs are properly populated
      await getMessages(ticketId, {});
    } catch (error) {
      console.error("Failed to send reply:", error);
      alert("Failed to send reply. Please try again.");
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      </div>

      {/* Messages */}
      <div className="relative px-6 py-7">
        <div className="custom-scrollbar h-[calc(58vh-200px)] space-y-7 divide-y divide-gray-200 overflow-y-auto pr-2 dark:divide-gray-800">
          {messages.map((message) => (
            <article
              key={message.id}
              className={message.isInternal ? "opacity-75" : ""}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {message.senderType ? message.senderType[0] : "?"}
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
                    <div className="flex flex-col gap-2">
                      {message.content && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                      <Image
                        src={message.attachmentUrl}
                        alt={message.attachmentName || "Attachment"}
                        width={320}
                        height={240}
                        className="max-w-xs h-auto rounded-lg shadow-sm"
                        unoptimized
                      />
                    </div>
                  )}
              </div>
            </article>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input */}
        <div className="pt-5">
          <div className="mx-auto w-full rounded-2xl border border-gray-200 shadow-xs dark:border-gray-800 dark:bg-gray-800">
            {previewUrl && (
              <div className="relative p-3 border-b border-gray-200 dark:border-gray-700">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={20}
                  height={20}
                  className="max-h-32 w-auto rounded-lg"
                />
                <button
                  onClick={handleRemoveAttachment}
                  className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}
            <textarea
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="h-20 w-full resize-none border-none bg-transparent p-5 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
            />

            <div className="flex items-center justify-between p-3">
              <button
                onClick={handleAttachClick}
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-transparent px-2 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300"
              >
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={handleSendReply}
                disabled={sending || (!replyText.trim() && !selectedFile)}
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
