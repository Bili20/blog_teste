import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  PostForm,
  type PostFormErrors,
  type PostFormValues,
} from "@/components/PostForm";
import { useAuth } from "@/hooks/useAuth";
import { listAuthors, type Author } from "../../services/authorService";
import { listTags } from "@/services/tagService";
import { getPostById, updatePost } from "@/services/postService";
import type { Post, UpdatePostRequest } from "@/types/post";
import type { Tag } from "@/types/tag";

function buildInitialFormValues(post: Post): PostFormValues {
  return {
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
  };
}

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

function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export default function EditPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();

  const postId = params.id ?? "";

  const [formValues, setFormValues] = useState<PostFormValues | null>(null);
  const [formErrors, setFormErrors] = useState<PostFormErrors>({});
  const [isLoadingPost, setIsLoadingPost] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
        const post = await getPostById(postId);

        if (!isMounted) return;

        setFormValues(buildInitialFormValues(post));
      } catch (error) {
        if (!isMounted) return;

        setFormValues(null);
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

  const pageTitle = useMemo(() => {
    if (!formValues?.title) return "Edit post";
    return `Edit: ${formValues.title}`;
  }, [formValues?.title]);

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

  if (!formValues) {
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

  const handleFieldChange = <FieldName extends keyof PostFormValues>(
    fieldName: FieldName,
    fieldValue: PostFormValues[FieldName],
  ) => {
    setFormValues((currentFormValues) => {
      if (!currentFormValues) return currentFormValues;

      return {
        ...currentFormValues,
        [fieldName]: fieldValue,
      };
    });

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));

    if (apiErrorMessage) setApiErrorMessage(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleTagToggle = (tagSlug: string, isChecked: boolean) => {
    setFormValues((currentFormValues) => {
      if (!currentFormValues) return currentFormValues;

      const nextSelectedTagSlugs = isChecked
        ? currentFormValues.selectedTagSlugs.includes(tagSlug)
          ? currentFormValues.selectedTagSlugs
          : [...currentFormValues.selectedTagSlugs, tagSlug]
        : currentFormValues.selectedTagSlugs.filter(
            (currentTagSlug) => currentTagSlug !== tagSlug,
          );

      return {
        ...currentFormValues,
        selectedTagSlugs: nextSelectedTagSlugs,
      };
    });

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      selectedTagSlugs: undefined,
    }));

    if (apiErrorMessage) setApiErrorMessage(null);
    if (successMessage) setSuccessMessage(null);
  };

  const validateForm = (values: PostFormValues): PostFormErrors => {
    const nextErrors: PostFormErrors = {};
    const normalizedSlug = values.slug.trim();

    if (values.title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters.";
    }

    if (values.subtitle.trim().length < 3) {
      nextErrors.subtitle = "Subtitle must be at least 3 characters.";
    }

    if (values.excerpt.trim().length < 10) {
      nextErrors.excerpt = "Excerpt must be at least 10 characters.";
    }

    if (values.body.trim().length < 20) {
      nextErrors.body = "Body must be at least 20 characters.";
    }

    if (values.readTime.trim().length < 1) {
      nextErrors.readTime = "Read time is required.";
    }

    if (isAdmin && values.authorId.trim().length < 1) {
      nextErrors.authorId = "Author is required.";
    }

    if (normalizedSlug && !isKebabCase(normalizedSlug)) {
      nextErrors.slug = "Slug must be kebab-case.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(formValues);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setApiErrorMessage(null);
    setSuccessMessage(null);

    const payload: UpdatePostRequest = {
      title: formValues.title.trim(),
      subtitle: formValues.subtitle.trim(),
      excerpt: formValues.excerpt.trim(),
      body: formValues.body.trim(),
      category: formValues.category,
      readTime: formValues.readTime.trim(),
      slug: formValues.slug.trim() || undefined,
      featured: formValues.featured,
      published: formValues.published,
      // For author role the backend will override authorId with req.user.sub anyway,
      // but we still send it for completeness.
      authorId: formValues.authorId.trim(),
      tagSlugs: formValues.selectedTagSlugs,
    };

    try {
      await updatePost(postId, payload);
      const successMessage = "Post updated successfully.";
      setSuccessMessage(successMessage);
      toast.success("Post updated", {
        description: successMessage,
      });

      navigate("/admin/posts", {
        replace: true,
        state: { successMessage },
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setApiErrorMessage(message);
      toast.error("Unable to update post", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
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
        values={formValues}
        errors={formErrors}
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
        onFieldChange={handleFieldChange}
        onTagToggle={handleTagToggle}
        onSubmit={handleSubmit}
        onCancelPath="/admin/posts"
      />
    </div>
  );
}
