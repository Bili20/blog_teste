import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PostForm } from "@/components/PostForm";
import { useAuth } from "@/hooks/useAuth";
import { listAuthors, type Author } from "../../services/authorService";
import { listTags } from "@/services/tagService";
import { getPostById, updatePost } from "@/services/postService";
import type { Post, UpdatePostRequest } from "@/types/post";
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

  return "Unable to update the post right now.";
}

export default function EditPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();

  const postId = params.id ?? "";

  const [post, setPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState<boolean>(true);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [authorOptions, setAuthorOptions] = useState<Author[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState<boolean>(true);
  const [authorsErrorMessage, setAuthorsErrorMessage] = useState<string | null>(
    null,
  );

  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(true);
  const [tagsErrorMessage, setTagsErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
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

  const watchedTitle = watch("title");

  // Only admins can select a different author — skip the network request for
  // non-admin users entirely.
  useEffect(() => {
    if (isAuthLoading || !user) return;

    if (!user.roles.includes("admin")) {
      setIsLoadingAuthors(false);
      return;
    }

    let isMounted = true;

    async function loadAuthors() {
      setIsLoadingAuthors(true);
      setAuthorsErrorMessage(null);

      try {
        const loadedAuthors = await listAuthors();

        if (!isMounted) return;

        setAuthorOptions(loadedAuthors);
      } catch (error) {
        if (!isMounted) return;

        setAuthorOptions([]);
        setAuthorsErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingAuthors(false);
        }
      }
    }

    void loadAuthors();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, user]);

  useEffect(() => {
    let isMounted = true;

    async function loadTags() {
      setIsLoadingTags(true);
      setTagsErrorMessage(null);

      try {
        const loadedTags = await listTags();

        if (!isMounted) return;

        setTagOptions(loadedTags);
      } catch (error) {
        if (!isMounted) return;

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

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!postId) {
        if (isMounted) {
          setApiErrorMessage("Post not found.");
          setIsLoadingPost(false);
        }
        return;
      }

      setIsLoadingPost(true);
      setApiErrorMessage(null);

      try {
        const loadedPost = await getPostById(postId);

        if (!isMounted) return;

        setPost(loadedPost);
      } catch (error) {
        if (!isMounted) return;

        setPost(null);
        setApiErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoadingPost(false);
        }
      }
    }

    void loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        subtitle: post.subtitle,
        excerpt: post.excerpt,
        body: post.body,
        category: post.category,
        readTime: post.readTime,
        slug: post.slug,
        featured: post.featured,
        published: post.published,
        authorId: post.authorId,
        selectedTagSlugs: post.tags.map((tag) => tag.slug),
      });
    }
  }, [post, reset]);

  const pageTitle = useMemo(() => {
    if (!watchedTitle) return "Edit post";
    return `Edit: ${watchedTitle}`;
  }, [watchedTitle]);

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

  // Only admin and author roles may access post editing.
  if (!isAdmin && !isAuthor) {
    return <Navigate to="/" replace />;
  }

  if (!postId) {
    return <Navigate to="/admin/posts" replace />;
  }

  if (isLoadingPost) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          {isAdmin ? "Admin" : "Author"}
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Loading post...
        </h1>
        <p className="text-stone-500">
          Please wait while we fetch the post details.
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          {isAdmin ? "Admin" : "Author"}
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Unable to load post
        </h1>
        <p className="text-stone-500 mb-8">
          {apiErrorMessage ?? "The requested post could not be loaded."}
        </p>
        <Link
          to="/admin/posts"
          className="inline-block px-6 py-3 bg-stone-900 text-white rounded-none uppercase text-xs tracking-widest font-semibold hover:bg-amber-700 transition-colors"
        >
          Back to posts
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: PostSchemaValues): Promise<void> => {
    setApiErrorMessage(null);
    setSuccessMessage(null);

    const payload: UpdatePostRequest = {
      title: data.title.trim(),
      subtitle: data.subtitle.trim(),
      excerpt: data.excerpt.trim(),
      body: data.body.trim(),
      category: data.category,
      readTime: data.readTime.trim(),
      slug: data.slug.trim() || undefined,
      featured: data.featured,
      published: data.published,
      // For author role the backend will override authorId with req.user.sub anyway,
      // but we still send it for completeness.
      authorId: data.authorId.trim(),
      tagSlugs: data.selectedTagSlugs,
    };

    try {
      await updatePost(postId, payload);
      const updatedMessage = "Post updated successfully.";
      setSuccessMessage(updatedMessage);
      toast.success("Post updated", {
        description: updatedMessage,
      });
      navigate("/admin/posts", {
        replace: true,
        state: { successMessage: updatedMessage },
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setApiErrorMessage(message);
      toast.error("Unable to update post", {
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
          <p className="text-stone-500 mt-2">Editing as {user.name}.</p>
        </div>

        <Link
          to="/admin/posts"
          className="inline-flex items-center justify-center px-4 py-2 border border-stone-200 text-stone-700 rounded-none text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
        >
          Back to posts
        </Link>
      </div>

      <PostForm
        mode="edit"
        title={pageTitle}
        description={`Editing as ${user.name}.`}
        register={register}
        control={control}
        errors={errors}
        isSubmitting={isSubmitting}
        isLoadingAuthors={isLoadingAuthors}
        isLoadingTags={isLoadingTags}
        authorsErrorMessage={authorsErrorMessage}
        tagsErrorMessage={tagsErrorMessage}
        apiErrorMessage={apiErrorMessage}
        successMessage={successMessage}
        submitLabel="Save changes"
        submittingLabel="Saving..."
        authorOptions={authorOptions}
        tagOptions={tagOptions}
        // Non-admin authors cannot change the post owner — lock the field.
        authorReadOnly={!isAdmin}
        currentAuthorName={user.name}
        canSetFeatured={isAdmin}
        onSubmit={handleSubmit(onSubmit)}
        onCancelPath="/admin/posts"
      />
    </div>
  );
}
