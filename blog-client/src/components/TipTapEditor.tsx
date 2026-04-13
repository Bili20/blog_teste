import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImagePlus,
  Undo2,
  Redo2,
} from "lucide-react";
import { uploadImage } from "@/services/uploadService";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  isActive = false,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded-sm transition-colors ${
        isActive
          ? "bg-amber-100 text-amber-800"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-6 bg-stone-200 mx-1" />;
}

export function TipTapEditor({
  content,
  onChange,
  disabled = false,
}: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({
        placeholder: "Write your article content here...",
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editor) return;

      try {
        const result = await uploadImage(file);
        editor.chain().focus().setImage({ src: result.url }).run();
      } catch (error) {
        console.error("Image upload failed:", error);
      }

      // Reset the input so the same file can be selected again
      event.target.value = "";
    },
    [editor],
  );

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLinkInsert = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", previousUrl ?? "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-stone-200 bg-white rounded-none">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
        <ToolbarButton
          icon={Bold}
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          disabled={disabled}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          disabled={disabled}
        />
        <ToolbarButton
          icon={UnderlineIcon}
          label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          disabled={disabled}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          icon={Heading2}
          label="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          disabled={disabled}
        />
        <ToolbarButton
          icon={Heading3}
          label="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          icon={List}
          label="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          disabled={disabled}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          disabled={disabled}
        />
        <ToolbarButton
          icon={Quote}
          label="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          icon={LinkIcon}
          label="Link"
          onClick={handleLinkInsert}
          isActive={editor.isActive("link")}
          disabled={disabled}
        />
        <ToolbarButton
          icon={ImagePlus}
          label="Image"
          onClick={handleImageButtonClick}
          isActive={false}
          disabled={disabled}
        />

        <ToolbarSeparator />

        <ToolbarButton
          icon={Undo2}
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          disabled={disabled}
        />
        <ToolbarButton
          icon={Redo2}
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          disabled={disabled}
        />
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor content area */}
      <EditorContent
        editor={editor}
        className={disabled ? "opacity-60 pointer-events-none" : ""}
      />
    </div>
  );
}
