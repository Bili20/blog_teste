import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  getAuthorById,
  updateAuthor,
  type Author,
  type UpdateAuthorRequest,
} from "@/services/authorService";
import { editAuthorSchema, type EditAuthorFormValues } from "@/lib/schemas";

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

  return "Unable to update the author right now. Please try again.";
}

export default function EditAuthorPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const authorId = params.id ?? "";

  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState<boolean>(true);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditAuthorFormValues>({
    resolver: zodResolver(editAuthorSchema),
    defaultValues: { name: "", initials: "", bio: "" },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadAuthor() {
      if (!authorId) {
        if (isMounted) {
          setApiErrorMessage("Author not found.");
          setIsLoadingAuthor(false);
        }
        return;
      }

      setIsLoadingAuthor(true);
      setApiErrorMessage(null);

      try {
        const fetchedAuthor = await getAuthorById(authorId);
        if (!isMounted) return;
        setAuthor(fetchedAuthor);
      } catch (error) {
        if (!isMounted) return;
        setAuthor(null);
        setApiErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) setIsLoadingAuthor(false);
      }
    }

    void loadAuthor();

    return () => {
      isMounted = false;
    };
  }, [authorId]);

  useEffect(() => {
    if (author) {
      reset({
        name: author.name,
        initials: author.initials,
        bio: author.bio ?? "",
      });
    }
  }, [author, reset]);

  const watchedName = watch("name");

  const pageTitle = useMemo(() => {
    if (!watchedName) return "Edit author";
    return `Edit: ${watchedName}`;
  }, [watchedName]);

  const onSubmit = async (data: EditAuthorFormValues) => {
    setApiErrorMessage(null);

    const payload: UpdateAuthorRequest = {
      name: data.name.trim(),
      initials: data.initials.trim(),
      bio: data.bio.trim() || undefined,
    };

    try {
      await updateAuthor(authorId, payload);
      toast.success("Author updated successfully.");
      navigate("/admin/authors", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      setApiErrorMessage(message);
      toast.error(message);
    }
  };

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

  if (!user.roles.includes("admin")) {
    return <Navigate to="/" replace />;
  }

  if (!authorId) {
    return <Navigate to="/admin/authors" replace />;
  }

  if (isLoadingAuthor) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Admin
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Loading author...
        </h1>
        <p className="text-stone-500">
          Please wait while we fetch the author details.
        </p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-4">
          Admin
        </p>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
          Unable to load author
        </h1>
        <p className="text-stone-500 mb-8">
          {apiErrorMessage ?? "The requested author could not be loaded."}
        </p>
        <Link
          to="/admin/authors"
          className="inline-block px-6 py-3 bg-stone-900 text-white rounded-none uppercase text-xs tracking-widest font-semibold hover:bg-amber-700 transition-colors"
        >
          Back to authors
        </Link>
      </div>
    );
  }

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
          <p className="text-stone-500 mt-2">Update name, initials, and bio.</p>
        </div>

        <Link
          to="/admin/authors"
          className="inline-flex items-center justify-center px-4 py-2 border border-stone-200 text-stone-700 rounded-none text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
        >
          Back to authors
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="border border-stone-200 bg-white p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="Mara Voss"
            />
            {errors.name && (
              <p className="text-sm text-red-700">{errors.name.message}</p>
            )}
          </div>

          {/* Initials */}
          <div className="space-y-2">
            <Label htmlFor="initials">Initials</Label>
            <Controller
              name="initials"
              control={control}
              render={({ field }) => (
                <Input
                  id="initials"
                  {...field}
                  onChange={(event) =>
                    field.onChange(event.target.value.toUpperCase())
                  }
                  disabled={isSubmitting}
                  maxLength={3}
                  className="rounded-none w-24"
                  placeholder="MV"
                />
              )}
            />
            <p className="text-xs text-stone-400">
              2 or 3 uppercase letters used in the author avatar.
            </p>
            {errors.initials && (
              <p className="text-sm text-red-700">{errors.initials.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              disabled={isSubmitting}
              className="rounded-none min-h-[120px]"
              placeholder="A short bio that appears alongside posts."
            />
            <p className="text-xs text-stone-400">
              Optional. Maximum 500 characters.
            </p>
            {errors.bio && (
              <p className="text-sm text-red-700">{errors.bio.message}</p>
            )}
          </div>

          <div className="border-t border-stone-100 pt-4">
            <p className="text-xs text-stone-400">
              Email and password changes are not available through this form.
              Contact a system administrator if credentials need to be updated.
            </p>
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
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>

          <Link
            to="/admin/authors"
            className="inline-flex items-center justify-center px-6 py-2 border border-stone-200 text-stone-700 rounded-none text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
