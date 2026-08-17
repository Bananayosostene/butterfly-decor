"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { Placeholder } from "@tiptap/extensions";
import { useRef, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Quote,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Heading1, Heading2, Heading3,
  Eraser, Rows3, Columns3, Trash2,
} from "lucide-react";

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: active ? "#2b1807" : "transparent",
        color: active ? "#e8d5b7" : "var(--foreground)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px self-stretch bg-border mx-0.5" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageExtension.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[140px] px-3 py-2",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "butterfly-content");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) editor.chain().focus().setImage({ src: json.data.url }).run();
    } finally {
      setUploadingImage(false);
    }
  };

  const inTable = editor.isActive("table");

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-1.5 py-1">
        <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolbarButton>

        <Divider />

        <label title="Text color" className="p-1 rounded-md cursor-pointer flex items-center" style={{ color: "var(--foreground)" }}>
          <input
            type="color"
            className="w-4 h-4 cursor-pointer"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            onClick={(e) => e.stopPropagation()}
          />
        </label>

        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>

        <ToolbarButton title="Insert image" disabled={uploadingImage} onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={insertImage} />

        <Divider />

        {!inTable ? (
          <ToolbarButton title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
        ) : (
          <>
            <ToolbarButton title="Add row" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <Rows3 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Add column" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <Columns3 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
              <Trash2 className="w-3.5 h-3.5" />
            </ToolbarButton>
          </>
        )}

        <Divider />

        <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <Eraser className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} className="text-sm text-foreground [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none" />
    </div>
  );
}
