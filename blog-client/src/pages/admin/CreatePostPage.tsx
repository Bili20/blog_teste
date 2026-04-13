import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { PostForm } from "@/components/PostForm";
import { createPost } from "@/services/postService";
import { listTags } from "@/services/tagService";
import { useAuth } from "@/hooks/useAuth";
import { type CreatePostRequest } from "@/types/post";
import type { Tag } from "@/types/tag";
import { postSchema, type PostSchemaValues } from "@/lib/schemas";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Unable to create the post right now. Please try again.";
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(true);
  const [tagsErrorMessage, setTagsErrorMessage] = useState<string | null>(null);

  const pageTitle = useMemo(() => "Create post", []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PostSchemaValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      excerpt: "",
      body: "",
      category: "Essay",
      readTime: "",
      slug: "",
      featured: false,
      published: true,
      authorId: "",
      selectedTagSlugs: [],
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadTags() {
      setIsLoadingTags(true);
      setTagsErrorMessage(null);

      try {
        const loadedTags = await listTags();

        if (!isMounted) {
          return;
        }

        setTagOptions(loadedTags);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setTagOptions([]);
        setTagsErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingTags(false);
        }
      }
    }

    void loadTags();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Admin
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Checking session...
        </h1>
        <p className="text-stone-500">
          Please wait while we verify your authentication status.
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.roles.includes("admin");
  const isAuthor = user.roles.includes("author");

  if (!isAdmin && !isAuthor) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: PostSchemaValues): Promise<void> => {
    setApiErrorMessage(null);

    const payload: CreatePostRequest = {
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      excerpt: data.excerpt.trim(),
      body: data.body.trim(),
      category: data.category,
      readTime: data.readTime.trim(),
      slug: data.slug.trim() || undefined,
      featured: data.featured,
      published: data.published,
      authorId: user.id,
      tagSlugs: data.selectedTagSlugs,
    };

    try {
      await createPost(payload);
      toast.success("Post created", {
        description: `"${payload.title}" was published successfully.`,
      });
      navigate("/admin/posts", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      setApiErrorMessage(message);
      toast.error("Unable to create post", {
        description: message,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-3">
            {isAdmin ? "Admin" : "Author"}
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-900">
            {pageTitle}
          </h1>
          <p className="text-stone-500 mt-2">Creating as {user.name}.</p>
        </div>

        <Link
          to="/admin/posts"
          className="inline-flex items-center justify-center px-4 py-2 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
        >
          Back to posts
        </Link>
      </div>

      <PostForm
        mode="create"
        title={pageTitle}
        description={`Creating as ${user.name}.`}
        register={register}
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        isLoadingTags={isLoadingTags}
        tagsErrorMessage={tagsErrorMessage}
        tagOptions={tagOptions}
        apiErrorMessage={apiErrorMessage}
        submitLabel="Create post"
        submittingLabel="Creating..."
        currentAuthorName={user.name}
        canSetFeatured={isAdmin}
        onSubmit={handleSubmit(onSubmit)}
        onCancelPath="/admin/posts"
      />
    </div>
  );
}
