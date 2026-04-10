import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

type LoginFormState = {
  email: string;
  password: string;
};

function getErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }

  return "Unable to sign in right now. Please try again.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? "/";
  }, [location.state]);

  if (!isAuthLoading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleInputChange = (
    fieldName: keyof LoginFormState,
    fieldValue: string,
  ) => {
    setFormState((currentFormState) => ({
      ...currentFormState,
      [fieldName]: fieldValue,
    }));

    if (apiErrorMessage) {
      setApiErrorMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.email.trim() || !formState.password.trim()) {
      setApiErrorMessage("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setApiErrorMessage(null);

    try {
      await login({
        email: formState.email.trim(),
        password: formState.password,
      });

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setApiErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-12 bg-stone-50">
      <div className="w-full max-w-md border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-amber-700 font-semibold mb-3">
            Admin access
          </p>
          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-3">
            Sign in
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            Use your admin credentials to access protected actions in the blog
            dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="mara@themargin.com"
              value={formState.email}
              onChange={(event) =>
                handleInputChange("email", event.target.value)
              }
              disabled={isSubmitting}
              className="rounded-none border-stone-200 focus-visible:ring-0 focus-visible:border-stone-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formState.password}
              onChange={(event) =>
                handleInputChange("password", event.target.value)
              }
              disabled={isSubmitting}
              className="rounded-none border-stone-200 focus-visible:ring-0 focus-visible:border-stone-400"
            />
          </div>

          {apiErrorMessage && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiErrorMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-none bg-stone-900 text-white hover:bg-amber-700 text-xs tracking-widest uppercase font-semibold"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 border-t border-stone-200 pt-5">
          <p className="text-xs text-stone-400">
            Back to{" "}
            <Link to="/" className="text-stone-700 hover:text-amber-700">
              archive
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
