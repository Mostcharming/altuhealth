"use client";

import { useAuthStore } from "@/lib/authStore";
import { useTicketStore } from "@/lib/store/ticketStore";
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
  } = useTicketStore();

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticketId) {
      getTicket(ticketId, true);
    }
  }, [ticketId, getTicket]);

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
      formData.append("senderType", "Provider");
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
      await getMessages(ticketId, {});
    } catch (error) {
      console.error("Failed to send reply:", error);
      alert("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    {message.senderType[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {message.senderType}
                      {message.isInternal && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (Internal Note)
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
                {message.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}
                {message.attachmentUrl && (
                  <div className="mt-3">
                    <a
                      href={message.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <img
                        src={message.attachmentUrl}
                        alt="Attachment"
                        className="max-h-64 rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </a>
                    {message.attachmentName && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {message.attachmentName}
                      </p>
                    )}
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
                <div className="flex items-end gap-3">
                  <picture>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 w-auto rounded-lg"
                    />
                  </picture>
                  <button
                    onClick={handleRemoveAttachment}
                    type="button"
                    className="mb-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <textarea
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="h-20 w-full resize-none border-none bg-transparent p-5 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-gray-500"
            />

            <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleAttachClick}
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-transparent px-2 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L7.5 10.5H12L12 22H12C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Attach
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || (!replyText.trim() && !selectedFile)}
                type="button"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16151495 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99021575 L3.03521743,10.4311088 C3.03521743,10.5882061 3.19218622,10.7453035 3.50612381,10.7453035 L16.6915026,11.5307904 C16.6915026,11.5307904 17.1624089,11.5307904 17.1624089,12.0020826 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"
                    fill="currentColor"
                  />
                </svg>
                {sending ? "Sending..." : "Send"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
