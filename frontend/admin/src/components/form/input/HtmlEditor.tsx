"use client";

import React, { useState } from "react";

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter HTML content...",
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Edit HTML
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === "edit" ? (
          <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={15}
            className="w-full h-full p-4 font-mono text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border-none focus:outline-none resize-none"
          />
        ) : (
          <div className="p-4 bg-white dark:bg-gray-950 overflow-auto h-96">
            {value ? (
              <div
                className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                No content to preview. Start editing to see your changes here.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HtmlEditor;
