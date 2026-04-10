import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPostById, updatePost } from "@/services/postService";
import {
  POST_CATEGORIES,
  type Post,
  type PostFormValues,
  type UpdatePostRequest,
} from "@/types/post";

function parseTagSlugs(tagSlugsValue: string): string[] {
  return tagSlugsValue
    .split(",")
    .map((tagSlug) => tagSlug.trim())
    .filter(Boolean);
}

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
    tagSlugs: post.tags.map((tag) => tag.slug),
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

export default function EditPostPage() {
  const params = useParams();
  const navigate = useNavigate();
  const postId = params.id ?? "";

  const [formValues, setFormValues] = useState<PostFormValues | null>(null);
  const [tagSlugsInput, setTagSlugsInput] = useState<string>("");
  const [isLoadingPost, setIsLoadingPost] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!postId) {
        if (isMounted) {
          setErrorMessage("Post not found.");
          setIsLoadingPost(false);
        }
        return;
      }

      setIsLoadingPost(true);
      setErrorMessage(null);

      try {
        const post = await getPostById(postId);

        if (!isMounted) {
          return;
        }

        const initialFormValues = buildInitialFormValues(post);

        setFormValues(initialFormValues);
        setTagSlugsInput(initialFormValues.tagSlugs.join(", "));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
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
    if (!formValues?.title) {
      return "Edit post";
    }

    return `Edit: ${formValues.title}`;
  }, [formValues?.title]);

  if (!postId) {
    return <Navigate to="/admin/posts" replace />;
  }

  const handleInputChange = <K extends keyof PostFormValues>(
    fieldName: K,
    fieldValue: PostFormValues[K],
  ) => {
    setFormValues((currentFormValues) => {
      if (!currentFormValues) {
        return currentFormValues;
      }

      return {
        ...currentFormValues,
        [fieldName]: fieldValue,
      };
    });

    if (errorMessage) {
      setErrorMessage(null);
    }

    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formValues) {
      return "Post data is not available.";
    }

    if (formValues.title.trim().length < 3) {
      return "Title must be at least 3 characters.";
    }

    if (formValues.subtitle.trim().length < 3) {
      return "Subtitle must be at least 3 characters.";
    }

    if (formValues.excerpt.trim().length < 10) {
      return "Excerpt must be at least 10 characters.";
    }

    if (formValues.body.trim().length < 20) {
      return "Body must be at least 20 characters.";
    }

    if (formValues.readTime.trim().length < 1) {
      return "Read time is required.";
    }

    if (formValues.authorId.trim().length < 1) {
      return "Author ID is required.";
    }

    if (
      formValues.slug.trim() &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formValues.slug.trim())
    ) {
      return "Slug must be kebab-case.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues) {
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
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
      authorId: formValues.authorId.trim(),
      tagSlugs: parseTagSlugs(tagSlugsInput),
    };

    try {
      await updatePost(postId, payload);
      setSuccessMessage("Post updated successfully.");

      navigate("/admin/posts", {
        replace: true,
        state: {
          successMessage: "Post updated successfully.",
        },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Admin
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
          Admin
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Unable to load post
        </h1>
        <p className="text-stone-500 mb-8">
          {errorMessage ?? "The requested post could not be loaded."}
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
          className="inline-flex items-center justify-center px-4 py-2 border border-stone-200 text-stone-700 rounded-none text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
        >
          Back to posts
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8">
          <div className="border border-stone-200 bg-white p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={(event) =>
                  handleInputChange("title", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formValues.subtitle}
                onChange={(event) =>
                  handleInputChange("subtitle", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formValues.excerpt}
                onChange={(event) =>
                  handleInputChange("excerpt", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={formValues.body}
                onChange={(event) =>
                  handleInputChange("body", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none min-h-[320px]"
              />
            </div>
          </div>

          <div className="border border-stone-200 bg-stone-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formValues.category}
                onChange={(event) =>
                  handleInputChange(
                    "category",
                    event.target.value as PostFormValues["category"],
                  )
                }
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-none border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-400"
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
                value={formValues.readTime}
                onChange={(event) =>
                  handleInputChange("readTime", event.target.value)
                }
                disabled={isSubmitting}
                placeholder="7 min"
                className="rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formValues.slug}
                onChange={(event) =>
                  handleInputChange("slug", event.target.value)
                }
                disabled={isSubmitting}
                placeholder="the-quiet-internet"
                className="rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorId">Author ID</Label>
              <Input
                id="authorId"
                value={formValues.authorId}
                onChange={(event) =>
                  handleInputChange("authorId", event.target.value)
                }
                disabled={isSubmitting}
                className="rounded-none"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tagSlugs">Tag slugs</Label>
              <Input
                id="tagSlugs"
                value={tagSlugsInput}
                onChange={(event) => setTagSlugsInput(event.target.value)}
                disabled={isSubmitting}
                placeholder="culture, technology, attention"
                className="rounded-none"
              />
              <p className="text-xs text-stone-400">
                Separate tags with commas.
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={formValues.featured}
                onChange={(event) =>
                  handleInputChange("featured", event.target.checked)
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded-none border-stone-300"
              />
              Featured post
            </label>

            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={formValues.published}
                onChange={(event) =>
                  handleInputChange("published", event.target.checked)
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded-none border-stone-300"
              />
              Published
            </label>
          </div>
        </div>

        {errorMessage && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>

          <Link
            to="/admin/posts"
            className="inline-flex items-center justify-center px-6 py-2 border border-stone-200 text-stone-700 rounded-none text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
