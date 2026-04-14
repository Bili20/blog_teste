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
  Check,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { uploadImage, deleteImage } from "@/services/uploadService";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
/*  Prop types                                                         */
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

  /* selectedImage drives the inline action bar AND the context-menu
     image actions. We mirror it in a ref so async handlers never read
     a stale closure value after a React re-render.                     */
  const [selectedImage, setSelectedImage] = useState<{
    node: any;
    pos: number;
  } | null>(null);
  const selectedImageRef = useRef<{ node: any; pos: number } | null>(null);

  /* Whether the context menu was opened while the pointer was over an
     <img> node – controls which items are rendered in the menu.        */
  const [contextMenuIsOnImage, setContextMenuIsOnImage] = useState(false);

  /* Prevent concurrent operations (double-click race conditions).      */
  const [isProcessing, setIsProcessing] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  Editor setup                                                       */
  /* ------------------------------------------------------------------ */
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

  /* Keep content prop in sync (edit page loads existing HTML body).    */
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
  /*  Context menu – detect whether right-click landed on an image      */
  /* ------------------------------------------------------------------ */
  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (!editor) return;

      const target = event.target as HTMLElement;

      if (target.tagName !== "IMG") {
        setContextMenuIsOnImage(false);
        return;
      }

      /* Use ProseMirror's coordinate-to-position mapping.
         posAtCoords returns { pos, inside } where `inside` is the
         position of the innermost node that contains the coordinates.  */
      const coords = { left: event.clientX, top: event.clientY };
      const result = editor.view.posAtCoords(coords);

      if (!result) {
        setContextMenuIsOnImage(false);
        return;
      }

      /* Try `inside` first (most precise), then neighbours.            */
      const candidates = [result.inside, result.pos, result.pos - 1].filter(
        (p) => p >= 0,
      );

      for (const p of candidates) {
        const node = editor.state.doc.nodeAt(p);
        if (node && node.type.name === "image") {
          const imageData = { node, pos: p };
          /* Update both the ref and state so the inline bar and context
             menu handlers always have the correct image reference.      */
          selectedImageRef.current = imageData;
          setSelectedImage(imageData);
          setContextMenuIsOnImage(true);
          /* Select the image in the editor so keyboard operations and
             the inline action bar stay in sync.                         */
          editor.chain().setNodeSelection(p).run();
          return;
        }
      }

      setContextMenuIsOnImage(false);
    },
    [editor],
  );

  /* Reset image-context flag when the menu closes without an action.   */
  const handleContextMenuOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setContextMenuIsOnImage(false);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Image upload (toolbar "+" button)                                  */
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
          .setImage({ src: result.url, "data-media-id": result.id } as any)
          .run();
        /* Deselect so the inline bar does not appear automatically.    */
        selectedImageRef.current = null;
        setSelectedImage(null);
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setIsProcessing(false);
      }

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
      /* Always read from the ref – never from the closure – so that
         focus-loss induced re-renders cannot stale the value.          */
      const currentSelected = selectedImageRef.current;
      if (!file || !editor || !currentSelected) return;

      setIsProcessing(true);
      try {
        const oldMediaId = currentSelected.node.attrs["data-media-id"];
        if (oldMediaId) {
          try {
            await deleteImage(oldMediaId);
          } catch (error) {
            console.error("Failed to delete old image from server:", error);
          }
        }

        const result = await uploadImage(file);

        editor
          .chain()
          .focus()
          .setNodeSelection(currentSelected.pos)
          .deleteSelection()
          .setImage({ src: result.url, "data-media-id": result.id } as any)
          .run();

        /* Deselect after replace – user must click the new image to
           interact with it again.                                       */
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
    const currentSelected = selectedImageRef.current;
    if (!editor || !currentSelected) return;

    setIsProcessing(true);
    try {
      const mediaId = currentSelected.node.attrs["data-media-id"];
      if (mediaId) {
        try {
          await deleteImage(mediaId);
        } catch (error) {
          console.error("Failed to delete image from server:", error);
        }
      } else {
        console.warn("Image has no data-media-id, skipping server delete");
      }

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
      {/* ── Toolbar ───────────────────────────────────────────────── */}
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
          label="Insert image"
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

      {/* ── Inline image action bar (visible when an image is clicked) ─ */}
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

      {/* ── Hidden file inputs ─────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceImageFile}
        className="hidden"
      />

      {/* ── Editor area wrapped in a right-click context menu ─────── */}
      <ContextMenu onOpenChange={handleContextMenuOpenChange}>
        <ContextMenuTrigger asChild>
          <div onContextMenu={handleContextMenu}>
            <EditorContent
              editor={editor}
              className={disabled ? "opacity-60 pointer-events-none" : ""}
            />
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-52 rounded-none">
          {/* ── Text formatting (always visible) ──────────────────── */}
          <ContextMenuLabel className="text-xs text-stone-400 uppercase tracking-widest px-2 py-1">
            Formatting
          </ContextMenuLabel>

          <ContextMenuItem
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            className="gap-2"
          >
            <Bold className="w-4 h-4 text-stone-500" />
            Bold
            {editor.isActive("bold") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            className="gap-2"
          >
            <Italic className="w-4 h-4 text-stone-500" />
            Italic
            {editor.isActive("italic") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled}
            className="gap-2"
          >
            <UnderlineIcon className="w-4 h-4 text-stone-500" />
            Underline
            {editor.isActive("underline") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={disabled}
            className="gap-2"
          >
            <Strikethrough className="w-4 h-4 text-stone-500" />
            Strikethrough
            {editor.isActive("strike") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={disabled}
            className="gap-2"
          >
            <Heading2 className="w-4 h-4 text-stone-500" />
            Heading 2
            {editor.isActive("heading", { level: 2 }) && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={disabled}
            className="gap-2"
          >
            <Heading3 className="w-4 h-4 text-stone-500" />
            Heading 3
            {editor.isActive("heading", { level: 3 }) && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className="gap-2"
          >
            <List className="w-4 h-4 text-stone-500" />
            Bullet list
            {editor.isActive("bulletList") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            className="gap-2"
          >
            <ListOrdered className="w-4 h-4 text-stone-500" />
            Ordered list
            {editor.isActive("orderedList") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            className="gap-2"
          >
            <Quote className="w-4 h-4 text-stone-500" />
            Blockquote
            {editor.isActive("blockquote") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          <ContextMenuItem
            onClick={handleLinkInsert}
            disabled={disabled}
            className="gap-2"
          >
            <LinkIcon className="w-4 h-4 text-stone-500" />
            Link
            {editor.isActive("link") && (
              <Check className="ml-auto w-3.5 h-3.5 text-amber-700" />
            )}
          </ContextMenuItem>

          {/* ── Image actions (only when right-click was on an image) ─ */}
          {contextMenuIsOnImage && (
            <>
              <ContextMenuSeparator />

              <ContextMenuLabel className="text-xs text-stone-400 uppercase tracking-widest px-2 py-1">
                Image
              </ContextMenuLabel>

              <ContextMenuItem
                onClick={handleReplaceImage}
                disabled={disabled || isProcessing}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4 text-stone-500" />
                Replace image
              </ContextMenuItem>

              <ContextMenuItem
                onClick={handleDeleteImage}
                disabled={disabled || isProcessing}
                className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete image
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
