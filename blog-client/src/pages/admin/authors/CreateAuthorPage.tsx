import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAuthor,
  type CreateAuthorRequest,
} from "@/services/authorService";
import { useAuth } from "@/hooks/useAuth";
import { createAuthorSchema, type CreateAuthorFormValues } from "@/lib/schemas";

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

  return "Unable to create the author right now. Please try again.";
}

export default function CreateAuthorPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuthorFormValues>({
    resolver: zodResolver(createAuthorSchema),
    defaultValues: {
      name: "",
      initials: "",
      bio: "",
      email: "",
      password: "",
    },
  });

  const pageTitle = useMemo(() => "Create author", []);

  const onSubmit = async (data: CreateAuthorFormValues) => {
    setApiErrorMessage(null);

    const payload: CreateAuthorRequest = {
      name: data.name.trim(),
      initials: data.initials.trim(),
      bio: data.bio.trim() || undefined,
      email: data.email.trim(),
      password: data.password,
    };

    try {
      await createAuthor(payload);
      toast.success("Author created", {
        description: `${payload.name} was added successfully.`,
      });
      navigate("/admin/authors", { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      setApiErrorMessage(message);
      toast.error("Unable to create author", {
        description: message,
      });
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

  const isAdmin = user.roles.includes("admin");

  if (!isAdmin) {
    return <Navigate to="/" replace />;
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
          <p className="text-stone-500 mt-2">
            Add a new author to the publication.
          </p>
        </div>

        <Link
          to="/admin/authors"
          className="inline-flex items-center justify-center px-4 py-2 border border-stone-200 text-stone-700 text-xs tracking-widest uppercase font-semibold hover:bg-stone-50 transition-colors"
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
                  className="rounded-none"
                  placeholder="MV"
                  maxLength={3}
                />
              )}
            />
            <p className="text-xs text-stone-400">
              2–3 uppercase letters used as the author avatar (e.g. MV, SAO).
            </p>
            {errors.initials && (
              <p className="text-sm text-red-700">{errors.initials.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio <span className="text-stone-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="bio"
              {...register("bio")}
              disabled={isSubmitting}
              className="rounded-none min-h-[100px]"
              placeholder="Writer and cultural critic exploring the edges of digital life."
            />
            {errors.bio && (
              <p className="text-sm text-red-700">{errors.bio.message}</p>
            )}
          </div>

          <hr className="border-stone-200" />

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="mara@themargin.com"
            />
            {errors.email && (
              <p className="text-sm text-red-700">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="At least 6 characters"
            />
            <p className="text-xs text-stone-400">
              The author will use this password to sign in.
            </p>
            {errors.password && (
              <p className="text-sm text-red-700">{errors.password.message}</p>
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
            {isSubmitting ? "Creating..." : "Create author"}
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
