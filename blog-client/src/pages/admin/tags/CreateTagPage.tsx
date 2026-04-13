import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTag } from "@/services/tagService";
import { useAuth } from "@/hooks/useAuth";
import type { CreateTagRequest } from "@/types/tag";

type CreateTagFormValues = {
  name: string;
  slug: string;
};

type CreateTagFormErrors = Partial<Record<keyof CreateTagFormValues, string>>;

const INITIAL_FORM_VALUES: CreateTagFormValues = {
  name: "",
  slug: "",
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

  return "Unable to create the tag right now. Please try again.";
}

export default function CreateTagPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [formValues, setFormValues] =
    useState<CreateTagFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<CreateTagFormErrors>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pageTitle = useMemo(() => "Create tag", []);

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

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleFieldChange = <FieldName extends keyof CreateTagFormValues>(
    fieldName: FieldName,
    fieldValue: CreateTagFormValues[FieldName],
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
    const nextErrors: CreateTagFormErrors = {};
    const normalizedName = formValues.name.trim();
    const normalizedSlug = formValues.slug.trim();

    if (normalizedName.length < 1) {
      nextErrors.name = "Name is required.";
    }

    if (normalizedName.length > 50) {
      nextErrors.name = "Name must be at most 50 characters.";
    }

    if (normalizedSlug && !isKebabCase(normalizedSlug)) {
      nextErrors.slug = "Slug must be in kebab-case.";
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

    const payload: CreateTagRequest = {
      name: formValues.name.trim(),
      slug: formValues.slug.trim() || undefined,
    };

    try {
      await createTag(payload);
      toast.success("Tag created", {
        description: `"${payload.name}" was created successfully.`,
      });
      navigate("/admin/tags", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      setApiErrorMessage(message);
      toast.error("Unable to create tag", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-3">
            Admin
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-900">
            {pageTitle}
          </h1>
          <p className="text-stone-500 mt-2">
            Create a new tag for organizing posts.
          </p>
        </div>

        <Link
          to="/admin/tags"
          className="inline-flex items-center justify-center px-4 py-2 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
        >
          Back to tags
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border border-stone-200 bg-white p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formValues.name}
              onChange={(event) =>
                handleFieldChange("name", event.target.value)
              }
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="culture"
            />
            {formErrors.name && (
              <p className="text-sm text-red-700">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formValues.slug}
              onChange={(event) =>
                handleFieldChange("slug", event.target.value)
              }
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="optional-kebab-case-slug"
            />
            <p className="text-xs text-stone-400">
              Leave blank to let the backend generate the slug from the name.
            </p>
            {formErrors.slug && (
              <p className="text-sm text-red-700">{formErrors.slug}</p>
            )}
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
            {isSubmitting ? "Creating..." : "Create tag"}
          </Button>

          <Link
            to="/admin/tags"
            className="inline-flex items-center justify-center px-6 py-2 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
