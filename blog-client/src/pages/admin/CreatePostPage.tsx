import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/services/postService";
import { useAuth } from "@/hooks/useAuth";
import {
  POST_CATEGORIES,
  type PostCategory,
  type PostFormValues,
} from "@/types/post";

type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;

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
  tagSlugs: [],
};

function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function parseTagSlugs(tagSlugsValue: string): string[] {
  return tagSlugsValue
    .split(",")
    .map((tagSlug) => tagSlug.trim())
    .filter(Boolean);
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
  const { user } = useAuth();

  const [formValues, setFormValues] = useState<PostFormValues>({
    ...INITIAL_FORM_VALUES,
    authorId: user?.id ?? "",
  });
  const [tagSlugsInput, setTagSlugsInput] = useState<string>("");
  const [formErrors, setFormErrors] = useState<PostFormErrors>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pageTitle = useMemo(() => "Create post", []);

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

  const validateForm = (): boolean => {
    const nextErrors: PostFormErrors = {};
    const normalizedSlug = formValues.slug?.trim() ?? "";
    const normalizedTagSlugs = parseTagSlugs(tagSlugsInput);

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

    if (!formValues.authorId.trim()) {
      nextErrors.authorId = "Author ID is required.";
    }

    if (normalizedSlug && !isKebabCase(normalizedSlug)) {
      nextErrors.slug = "Slug must be in kebab-case.";
    }

    if (
      normalizedTagSlugs.some((tagSlug) => !isKebabCase(tagSlug))
    ) {
      nextErrors.tagSlugs = "All tag slugs must be in kebab-case.";
    }

    setFormErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiErrorMessage(null);

    try {
      await createPost({
        ...formValues,
        title: formValues.title.trim(),
        subtitle: formValues.subtitle.trim(),
        excerpt: formValues.excerpt.trim(),
        body: formValues.body.trim(),
        readTime: formValues.readTime.trim(),
        slug: formValues.slug?.trim() || undefined,
        authorId: formValues.authorId.trim(),
        tagSlugs: parseTagSlugs(tagSlugsInput),
      });

      navigate("/admin/posts", { replace: true });
    } catch (error) {
      setApiErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (category: PostCategory) => {
    handleFieldChange("category", category);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-3">
            Admin
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-900">
            {pageTitle}
          </h1>
        </div>

        <Link
          to="/admin/posts"
          className="inline-flex items-center justify-center px-4 py-2 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
        >
          Back to posts
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border border-stone-200 bg-white p-8 space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={(event) =>
                  handleFieldChange("title", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
              {formErrors.title && (
                <p className="text-sm text-red-700">{formErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formValues.subtitle}
                onChange={(event) =>
                  handleFieldChange("subtitle", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
              {formErrors.subtitle && (
                <p className="text-sm text-red-700">{formErrors.subtitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formValues.excerpt}
                onChange={(event) =>
                  handleFieldChange("excerpt", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none min-h-[120px]"
              />
              {formErrors.excerpt && (
                <p className="text-sm text-red-700">{formErrors.excerpt}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={formValues.body}
                onChange={(event) =>
                  handleFieldChange("body", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none min-h-[260px]"
              />
              {formErrors.body && (
                <p className="text-sm text-red-700">{formErrors.body}</p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-stone-200 bg-white p-8">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">
            Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formValues.category}
                onChange={(event) =>
                  handleCategoryChange(event.target.value as PostCategory)
                }
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-none border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-stone-400"
              >
                {POST_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="readTime">Read time</Label>
              <Input
                id="readTime"
                placeholder="7 min"
                value={formValues.readTime}
                onChange={(event) =>
                  handleFieldChange("readTime", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
              {formErrors.readTime && (
                <p className="text-sm text-red-700">{formErrors.readTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="optional-kebab-case-slug"
                value={formValues.slug ?? ""}
                onChange={(event) =>
                  handleFieldChange("slug", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
              {formErrors.slug && (
                <p className="text-sm text-red-700">{formErrors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorId">Author ID</Label>
              <Input
                id="authorId"
                value={formValues.authorId}
                onChange={(event) =>
                  handleFieldChange("authorId", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
              {formErrors.authorId && (
                <p className="text-sm text-red-700">{formErrors.authorId}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tagSlugs">Tag slugs</Label>
              <Input
                id="tagSlugs"
                placeholder="culture, technology, attention"
                value={tagSlugsInput}
                onChange={(event) => {
                  setTagSlugsInput(event.target.value);
                  setFormErrors((currentErrors) => ({
                    ...currentErrors,
                    tagSlugs: undefined,
                  }));
                }}
                disabled={isSubmitting}
                className="rounded-none"
              />
              <p className="text-xs text-stone-400">
                Separate tag slugs with commas.
              </p>
              {formErrors.tagSlugs && (
                <p className="text-sm text-red-700">{formErrors.tagSlugs}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                id="featured"
                type="checkbox"
                checked={formValues.featured}
                onChange={(event) =>
                  handleFieldChange("featured", event.target.checked)
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-stone-300"
              />
              <Label htmlFor="featured">Featured post</Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="published"
                type="checkbox"
                checked={formValues.published}
                onChange={(event) =>
                  handleFieldChange("published", event.target.checked)
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-stone-300"
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>
        </div>

        {apiErrorMessage && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiErrorMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold"
          >
            {isSubmitting ? "Creating..." : "Create post"}
          </Button>

          <Link
            to="/admin/posts"
            className="inline-flex items-center justify-center px-6 py-2 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
