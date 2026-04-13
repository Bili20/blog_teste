import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POST_CATEGORIES, type PostCategory } from "@/types/post";
import type { Tag } from "@/types/tag";
import type { Author } from "@/services/authorService";

export type PostFormMode = "create" | "edit";

export type PostFormValues = {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  category: PostCategory;
  readTime: string;
  slug: string;
  featured: boolean;
  published: boolean;
  authorId: string;
  selectedTagSlugs: string[];
};

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>> & {
  authorDisplay?: string;
};

type PostFormProps = {
  mode: PostFormMode;
  title: string;
  description?: string;
  values: PostFormValues;
  errors: PostFormErrors;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel?: string;
  apiErrorMessage?: string | null;
  successMessage?: string | null;
  currentAuthorName?: string | null;
  authorReadOnly?: boolean;
  canSetFeatured?: boolean;
  authorOptions?: Author[];
  tagOptions?: Tag[];
  isLoadingAuthors?: boolean;
  isLoadingTags?: boolean;
  authorsErrorMessage?: string | null;
  tagsErrorMessage?: string | null;
  onFieldChange: <FieldName extends keyof PostFormValues>(
    fieldName: FieldName,
    fieldValue: PostFormValues[FieldName],
  ) => void;
  onTagToggle: (tagSlug: string, isChecked: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelPath?: string;
};

export function PostForm({
  mode,
  title,
  description,
  values,
  errors,
  isSubmitting,
  submitLabel,
  submittingLabel = "Saving...",
  apiErrorMessage = null,
  successMessage = null,
  currentAuthorName = null,
  authorReadOnly = false,
  canSetFeatured = true,
  authorOptions = [],
  tagOptions = [],
  isLoadingAuthors = false,
  isLoadingTags = false,
  authorsErrorMessage = null,
  tagsErrorMessage = null,
  onFieldChange,
  onTagToggle,
  onSubmit,
  onCancelPath = "/admin/posts",
}: PostFormProps) {
  const isCreateMode = mode === "create";
  const showAuthorAsReadOnly = isCreateMode || authorReadOnly;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        <div className="border border-stone-200 bg-white p-6 space-y-6">
          <div>
            <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-3">
              Admin
            </p>
            <h1 className="font-serif text-4xl font-bold text-stone-900">
              {title}
            </h1>
            {description && (
              <p className="text-stone-500 mt-2">{description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              disabled={isSubmitting}
              className="rounded-none"
            />
            {errors.title && (
              <p className="text-sm text-red-700">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={values.subtitle}
              onChange={(event) =>
                onFieldChange("subtitle", event.target.value)
              }
              disabled={isSubmitting}
              className="rounded-none"
            />
            {errors.subtitle && (
              <p className="text-sm text-red-700">{errors.subtitle}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={values.excerpt}
              onChange={(event) => onFieldChange("excerpt", event.target.value)}
              disabled={isSubmitting}
              className="rounded-none min-h-[120px]"
            />
            {errors.excerpt && (
              <p className="text-sm text-red-700">{errors.excerpt}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              value={values.body}
              onChange={(event) => onFieldChange("body", event.target.value)}
              disabled={isSubmitting}
              className="rounded-none min-h-[320px]"
            />
            {errors.body && (
              <p className="text-sm text-red-700">{errors.body}</p>
            )}
          </div>
        </div>

        <div className="border border-stone-200 bg-stone-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={values.category}
              onValueChange={(value) =>
                onFieldChange("category", value as PostCategory)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                id="category"
                className="h-10 rounded-none border-stone-200 bg-white text-stone-900"
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {POST_CATEGORIES.map((categoryOption) => (
                  <SelectItem
                    key={categoryOption}
                    value={categoryOption}
                    className="rounded-none"
                  >
                    {categoryOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-700">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="readTime">Read time</Label>
            <Input
              id="readTime"
              value={values.readTime}
              onChange={(event) =>
                onFieldChange("readTime", event.target.value)
              }
              disabled={isSubmitting}
              placeholder="7 min"
              className="rounded-none"
            />
            {errors.readTime && (
              <p className="text-sm text-red-700">{errors.readTime}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(event) => onFieldChange("slug", event.target.value)}
              disabled={isSubmitting}
              placeholder="the-quiet-internet"
              className="rounded-none"
            />
            {errors.slug && (
              <p className="text-sm text-red-700">{errors.slug}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorId">Author</Label>

            {showAuthorAsReadOnly ? (
              <>
                <Input
                  id="authorId"
                  value={currentAuthorName ?? "Logged author"}
                  readOnly
                  disabled
                  className="rounded-none bg-stone-50 text-stone-500"
                />
                <p className="text-xs text-stone-400">
                  {isCreateMode
                    ? "This post will be created using your logged-in account."
                    : "You can only edit posts attributed to your own account."}
                </p>
              </>
            ) : (
              <>
                <Select
                  value={values.authorId}
                  onValueChange={(value) => onFieldChange("authorId", value)}
                  disabled={isSubmitting || isLoadingAuthors}
                >
                  <SelectTrigger
                    id="authorId"
                    className="h-10 rounded-none border-stone-200 bg-white text-stone-900"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingAuthors
                          ? "Loading authors..."
                          : "Select an author"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {authorOptions.map((authorOption) => (
                      <SelectItem
                        key={authorOption.id}
                        value={authorOption.id}
                        className="rounded-none"
                      >
                        {authorOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {authorsErrorMessage && (
                  <p className="text-sm text-red-700">{authorsErrorMessage}</p>
                )}
              </>
            )}

            {errors.authorId && (
              <p className="text-sm text-red-700">{errors.authorId}</p>
            )}
            {errors.authorDisplay && (
              <p className="text-sm text-red-700">{errors.authorDisplay}</p>
            )}
          </div>

          <div className="space-y-3 md:col-span-2">
            <div>
              <Label>Tags</Label>
              <p className="text-xs text-stone-400 mt-1">
                Select one or more tags for this post.
              </p>
            </div>

            <div className="border border-stone-200 bg-white p-4 max-h-56 overflow-y-auto">
              {isLoadingTags ? (
                <p className="text-sm text-stone-400">Loading tags...</p>
              ) : tagsErrorMessage ? (
                <p className="text-sm text-red-700">{tagsErrorMessage}</p>
              ) : tagOptions.length === 0 ? (
                <p className="text-sm text-stone-400">
                  No tags available right now.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tagOptions.map((tagOption) => {
                    const isChecked = values.selectedTagSlugs.includes(
                      tagOption.slug,
                    );

                    return (
                      <label
                        key={tagOption.id}
                        className="flex items-center gap-3 border border-stone-200 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(event) =>
                            onTagToggle(tagOption.slug, event.target.checked)
                          }
                          disabled={isSubmitting}
                          className="h-4 w-4 rounded-none border-stone-300"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-800">
                            {tagOption.name}
                          </p>
                          <p className="text-xs text-stone-400">
                            {tagOption.slug}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {errors.selectedTagSlugs && (
              <p className="text-sm text-red-700">{errors.selectedTagSlugs}</p>
            )}
          </div>

          {canSetFeatured && (
            <label className="flex items-center gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(event) =>
                  onFieldChange("featured", event.target.checked)
                }
                disabled={isSubmitting}
                className="h-4 w-4 rounded-none border-stone-300"
              />
              Featured post
            </label>
          )}

          <label className="flex items-center gap-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(event) =>
                onFieldChange("published", event.target.checked)
              }
              disabled={isSubmitting}
              className="h-4 w-4 rounded-none border-stone-300"
            />
            Published
          </label>
        </div>
      </div>

      {apiErrorMessage && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiErrorMessage}
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
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>

        <a
          href={onCancelPath}
          className="inline-flex items-center justify-center px-6 py-2 border border-stone-200 text-stone-700 rounded-none text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
