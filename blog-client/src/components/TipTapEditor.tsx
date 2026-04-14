import { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageBase from "@tiptap/extension-image";
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
import { uploadImage, deleteImage } from "@/services/uploadService";

/* ------------------------------------------------------------------ */
/*  Custom Image extension – persists data-media-id on <img> nodes    */
/* ------------------------------------------------------------------ */
const CustomImage = ImageBase.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-media-id": {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-media-id"),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes["data-media-id"]) return {};
          return { "data-media-id": attributes["data-media-id"] };
        },
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/*  Prop types                                                        */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Small reusable bits                                                */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function TipTapEditor({
  content,
  onChange,
  disabled = false,
}: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<{
    node: any;
    pos: number;
  } | null>(null);

  // Bug fix #1: Mirror selectedImage in a ref so async handlers never
  // read a stale closure value (e.g. after focus loss clears the state).
  const selectedImageRef = useRef<{ node: any; pos: number } | null>(null);

  // Bug fix #2: Prevent double-clicks / race conditions with a processing flag.
  const [isProcessing, setIsProcessing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
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
    onSelectionUpdate: ({ editor: ed }) => {
      const { node } = ed.state.selection as any;
      if (node && node.type.name === "image") {
        const imageData = { node, pos: (ed.state.selection as any).from };
        selectedImageRef.current = imageData;
        setSelectedImage(imageData);
      } else {
        selectedImageRef.current = null;
        setSelectedImage(null);
      }
    },
  });

  /* Keep content prop in sync ---------------------------------------- */
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

  /* ------------------------------------------------------------------ */
  /*  Image upload (new image)                                           */
  /* ------------------------------------------------------------------ */
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editor) return;

      setIsProcessing(true);
      try {
        const result = await uploadImage(file);
        editor
          .chain()
          .focus()
          .setImage({
            src: result.url,
            "data-media-id": result.id,
          } as any)
          .run();
        // Deselect after insert so the action bar doesn't appear automatically
        selectedImageRef.current = null;
        setSelectedImage(null);
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setIsProcessing(false);
      }

      // Reset the input so the same file can be selected again
      event.target.value = "";
    },
    [editor],
  );

  const handleImageButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Replace image                                                      */
  /* ------------------------------------------------------------------ */
  const handleReplaceImage = useCallback(() => {
    replaceFileInputRef.current?.click();
  }, []);

  const handleReplaceImageFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Bug fix #1: Read from the ref (always current) instead of the
      // potentially-stale `selectedImage` closure value.
      const currentSelected = selectedImageRef.current;
      if (!file || !editor || !currentSelected) return;

      setIsProcessing(true);
      try {
        // Delete old image from server if it has a media ID
        const oldMediaId = currentSelected.node.attrs["data-media-id"];
        if (oldMediaId) {
          try {
            await deleteImage(oldMediaId);
          } catch (error) {
            // Bug fix #3: Log instead of silently swallowing
            console.error("Failed to delete old image from server:", error);
          }
        }

        // Upload new image
        const result = await uploadImage(file);

        // Replace the image at its position
        const { pos } = currentSelected;
        editor
          .chain()
          .focus()
          .setNodeSelection(pos)
          .deleteSelection()
          .setImage({
            src: result.url,
            "data-media-id": result.id,
          } as any)
          .run();
        // Deselect after replace so the action bar disappears — user must
        // click the new image explicitly to interact with it again.
        selectedImageRef.current = null;
        setSelectedImage(null);
      } catch (error) {
        console.error("Image replace failed:", error);
      } finally {
        setIsProcessing(false);
      }

      event.target.value = "";
    },
    [editor],
  );

  /* ------------------------------------------------------------------ */
  /*  Delete image                                                       */
  /* ------------------------------------------------------------------ */
  const handleDeleteImage = useCallback(async () => {
    // Bug fix #1: Read from the ref instead of the closure value.
    const currentSelected = selectedImageRef.current;
    if (!editor || !currentSelected) return;

    setIsProcessing(true);
    try {
      const mediaId = currentSelected.node.attrs["data-media-id"];
      if (mediaId) {
        try {
          await deleteImage(mediaId);
        } catch (error) {
          // Bug fix #3: Log instead of silently swallowing
          console.error("Failed to delete image from server:", error);
        }
      } else {
        console.warn("Image has no data-media-id, skipping server delete");
      }

      // Remove the image from the editor
      editor
        .chain()
        .focus()
        .setNodeSelection(currentSelected.pos)
        .deleteSelection()
        .run();

      selectedImageRef.current = null;
      setSelectedImage(null);
    } catch (error) {
      console.error("Image delete failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [editor]);

  /* ------------------------------------------------------------------ */
  /*  Link insert                                                        */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
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
          disabled={disabled || isProcessing}
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

      {/* Image actions bar — shown when an image is selected */}
      {selectedImage && (
        <div className="flex items-center gap-2 border-b border-stone-200 bg-amber-50 px-3 py-1.5">
          <span className="text-xs text-amber-800 font-medium">
            {isProcessing ? "Processing..." : "Image selected"}
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleReplaceImage}
            disabled={disabled || isProcessing}
            className="text-xs px-2 py-1 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={handleDeleteImage}
            disabled={disabled || isProcessing}
            className="text-xs px-2 py-1 bg-white border border-red-200 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      )}

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Hidden file input for image replacement */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceImageFile}
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
