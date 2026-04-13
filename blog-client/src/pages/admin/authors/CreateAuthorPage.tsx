import { useMemo, useState, type FormEvent } from "react";
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

type CreateAuthorFormValues = {
  name: string;
  initials: string;
  bio: string;
  email: string;
  password: string;
};

type CreateAuthorFormErrors = Partial<
  Record<keyof CreateAuthorFormValues, string>
>;

const INITIAL_FORM_VALUES: CreateAuthorFormValues = {
  name: "",
  initials: "",
  bio: "",
  email: "",
  password: "",
};

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

  const [formValues, setFormValues] =
    useState<CreateAuthorFormValues>(INITIAL_FORM_VALUES);
  const [formErrors, setFormErrors] = useState<CreateAuthorFormErrors>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pageTitle = useMemo(() => "Create author", []);

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

  const handleFieldChange = <FieldName extends keyof CreateAuthorFormValues>(
    fieldName: FieldName,
    fieldValue: CreateAuthorFormValues[FieldName],
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
    const nextErrors: CreateAuthorFormErrors = {};

    const name = formValues.name.trim();
    const initials = formValues.initials.trim();
    const email = formValues.email.trim();
    const password = formValues.password;

    if (name.length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name = "Name must be at most 100 characters.";
    }

    if (!/^[A-Z]{2,3}$/.test(initials)) {
      nextErrors.initials = "Initials must be 2–3 uppercase letters (e.g. MV).";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
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

    const payload: CreateAuthorRequest = {
      name: formValues.name.trim(),
      initials: formValues.initials.trim(),
      bio: formValues.bio.trim() || undefined,
      email: formValues.email.trim(),
      password: formValues.password,
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="border border-stone-200 bg-white p-8 space-y-6">
          {/* Name */}
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
              placeholder="Mara Voss"
            />
            {formErrors.name && (
              <p className="text-sm text-red-700">{formErrors.name}</p>
            )}
          </div>

          {/* Initials */}
          <div className="space-y-2">
            <Label htmlFor="initials">Initials</Label>
            <Input
              id="initials"
              value={formValues.initials}
              onChange={(event) =>
                handleFieldChange("initials", event.target.value.toUpperCase())
              }
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="MV"
              maxLength={3}
            />
            <p className="text-xs text-stone-400">
              2–3 uppercase letters used as the author avatar (e.g. MV, SAO).
            </p>
            {formErrors.initials && (
              <p className="text-sm text-red-700">{formErrors.initials}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              Bio <span className="text-stone-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="bio"
              value={formValues.bio}
              onChange={(event) => handleFieldChange("bio", event.target.value)}
              disabled={isSubmitting}
              className="rounded-none min-h-[100px]"
              placeholder="Writer and cultural critic exploring the edges of digital life."
            />
            {formErrors.bio && (
              <p className="text-sm text-red-700">{formErrors.bio}</p>
            )}
          </div>

          <hr className="border-stone-200" />

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formValues.email}
              onChange={(event) =>
                handleFieldChange("email", event.target.value)
              }
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="mara@themargin.com"
            />
            {formErrors.email && (
              <p className="text-sm text-red-700">{formErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formValues.password}
              onChange={(event) =>
                handleFieldChange("password", event.target.value)
              }
              disabled={isSubmitting}
              className="rounded-none"
              placeholder="At least 6 characters"
            />
            <p className="text-xs text-stone-400">
              The author will use this password to sign in.
            </p>
            {formErrors.password && (
              <p className="text-sm text-red-700">{formErrors.password}</p>
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
