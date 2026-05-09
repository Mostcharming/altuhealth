"use client";

import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Palette,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import React from "react";

interface RichHtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RichHtmlEditor: React.FC<RichHtmlEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4 text-gray-900 dark:text-gray-100",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleAddLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const handleAddImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor.chain().focus().setColor(e.target.value).run();
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? "bg-blue-500 text-white"
          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {Icon}
    </button>
  );

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden dark:border-gray-700 bg-white dark:bg-gray-950">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={<Bold size={18} />}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={<Italic size={18} />}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            icon={<UnderlineIcon size={18} />}
            title="Underline"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            icon={<Heading1 size={18} />}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            icon={<Heading2 size={18} />}
            title="Heading 2"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={<List size={18} />}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={<ListOrdered size={18} />}
            title="Ordered List"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            icon={<AlignLeft size={18} />}
            title="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            icon={<AlignCenter size={18} />}
            title="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            icon={<AlignRight size={18} />}
            title="Align Right"
          />
        </div>

        {/* Links & Media */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <ToolbarButton
            onClick={handleAddLink}
            icon={<LinkIcon size={18} />}
            title="Add Link"
          />
          <ToolbarButton
            onClick={handleAddImage}
            icon={<ImageIcon size={18} />}
            title="Add Image"
          />
        </div>

        {/* Code Block */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            icon={<Code size={18} />}
            title="Code Block"
          />
        </div>

        {/* Color Picker */}
        <div className="flex gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 items-center">
          <label
            title="Text Color"
            className="flex items-center gap-1 cursor-pointer"
          >
            <Palette size={18} className="text-gray-700 dark:text-gray-300" />
            <input
              type="color"
              onChange={handleColorChange}
              className="w-8 h-8 rounded cursor-pointer"
              disabled={disabled}
            />
          </label>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={<Undo2 size={18} />}
            title="Undo"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={<Redo2 size={18} />}
            title="Redo"
          />
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
};

export default RichHtmlEditor;
