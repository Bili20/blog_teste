import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  PostForm,
  type PostFormErrors,
  type PostFormValues,
} from "@/components/PostForm";
import { createPost } from "@/services/postService";
import { listTags } from "@/services/tagService";
import { useAuth } from "@/hooks/useAuth";
import { type CreatePostRequest } from "@/types/post";
import type { Tag } from "@/types/tag";

const INITIAL_FORM_VALUES: PostFormValues = {
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
};

function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
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

  return "Unable to create the post right now. Please try again.";
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [formValues, setFormValues] =
    useState<PostFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<PostFormErrors>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(true);
  const [tagsErrorMessage, setTagsErrorMessage] = useState<string | null>(null);

  const pageTitle = useMemo(() => "Create post", []);

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

  const handleFieldChange = <FieldName extends keyof PostFormValues>(
    fieldName: FieldName,
    fieldValue: PostFormValues[FieldName],
  ) => {
    setFormValues((currentFormValues) => ({
      ...currentFormValues,
      [fieldName]: fieldValue,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: undefined,
    }));

    if (apiErrorMessage) {
      setApiErrorMessage(null);
    }
  };

  const handleTagToggle = (tagSlug: string, isChecked: boolean) => {
    setFormValues((currentFormValues) => {
      const nextSelectedTagSlugs = isChecked
        ? currentFormValues.selectedTagSlugs.includes(tagSlug)
          ? currentFormValues.selectedTagSlugs
          : [...currentFormValues.selectedTagSlugs, tagSlug]
        : currentFormValues.selectedTagSlugs.filter(
            (selectedTagSlug) => selectedTagSlug !== tagSlug,
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

    if (apiErrorMessage) {
      setApiErrorMessage(null);
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: PostFormErrors = {};
    const normalizedSlug = formValues.slug.trim();

    if (formValues.title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters.";
    }

    if (formValues.subtitle.trim().length < 3) {
      nextErrors.subtitle = "Subtitle must be at least 3 characters.";
    }

    if (formValues.excerpt.trim().length < 10) {
      nextErrors.excerpt = "Excerpt must be at least 10 characters.";
    }

    if (formValues.body.trim().length < 20) {
      nextErrors.body = "Body must be at least 20 characters.";
    }

    if (formValues.readTime.trim().length < 1) {
      nextErrors.readTime = "Read time is required.";
    }

    if (!user.id.trim()) {
      nextErrors.authorDisplay = "Authenticated author is required.";
    }

    if (normalizedSlug && !isKebabCase(normalizedSlug)) {
      nextErrors.slug = "Slug must be in kebab-case.";
    }

    setFormErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiErrorMessage(null);

    const payload: CreatePostRequest = {
      title: formValues.title.trim(),
      subtitle: formValues.subtitle.trim(),
      excerpt: formValues.excerpt.trim(),
      body: formValues.body.trim(),
      category: formValues.category,
      readTime: formValues.readTime.trim(),
      slug: formValues.slug.trim() || undefined,
      featured: formValues.featured,
      published: formValues.published,
      authorId: user.id,
      tagSlugs: formValues.selectedTagSlugs,
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
        values={formValues}
        errors={formErrors}
        isSubmitting={isSubmitting}
        isLoadingTags={isLoadingTags}
        tagsErrorMessage={tagsErrorMessage}
        tagOptions={tagOptions}
        apiErrorMessage={apiErrorMessage}
        submitLabel="Create post"
        submittingLabel="Creating..."
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
