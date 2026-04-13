import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTag } from "@/services/tagService";
import { useAuth } from "@/hooks/useAuth";
import type { CreateTagRequest } from "@/types/tag";
import { createTagSchema, type CreateTagFormValues } from "@/lib/schemas";

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTagFormValues>({
    resolver: zodResolver(createTagSchema),
  });

  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

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

  const onSubmit = async (data: CreateTagFormValues) => {
    setApiErrorMessage(null);

    const payload: CreateTagRequest = {
      name: data.name.trim(),
      slug: data.slug.trim() || undefined,
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="border border-stone-200 bg-white p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="culture"
            />
            {errors.name && (
              <p className="text-sm text-red-700">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              {...register("slug")}
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="optional-kebab-case-slug"
            />
            <p className="text-xs text-stone-400">
              Leave blank to let the backend generate the slug from the name.
            </p>
            {errors.slug && (
              <p className="text-sm text-red-700">{errors.slug.message}</p>
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
