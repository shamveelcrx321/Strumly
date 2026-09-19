import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Guitar, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import studioImage from "@/assets/strumly-studio.jpg";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

const signupSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/signup")({
  validateSearch: signupSearchSchema,
  head: () => ({
    meta: [
      { title: "Create Account — Strumly" },
      {
        name: "description",
        content: "Join Strumly to save favorite guitar chords, upload lyrics, and join our music community.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // If already authenticated, redirect to destination
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      const destination = redirect && redirect.startsWith("/") ? redirect : "/";
      void navigate({ to: destination });
    }
  }, [isAuthenticated, isAuthLoading, navigate, redirect]);

  const clearError = (field: "name" | "email" | "password" | "confirmPassword") => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) {
      nextErrors.name = "Please enter your full name";
    }

    if (!email.trim()) {
      nextErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      nextErrors.password = "Please enter a password";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessNotice(null);

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already in use")) {
          setAuthError("An account with this email already exists. Please log in instead.");
        } else if (msg.includes("password")) {
          setAuthError("Please choose a stronger password.");
        } else {
          setAuthError(error.message);
        }
        return;
      }

      // Check if user identity is empty (Supabase returns empty identities array when email is taken and email confirmation is on)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setAuthError("An account with this email already exists. Please log in.");
        return;
      }

      // Check if email confirmation is required (data.session is null)
      if (!data.session) {
        setSuccessNotice(
          "Account created! Please check your email inbox to confirm your account before logging in."
        );
        toast.success("Account created! Check your email to confirm.", {
          duration: 6000,
        });
      } else {
        // Auto-confirmed
        toast.success("Welcome to Strumly!");
        const destination = redirect && redirect.startsWith("/") ? redirect : "/";
        void navigate({ to: destination });
      }
    } catch (err: any) {
      setAuthError(err?.message || "An unexpected error occurred during signup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    toast.info("Google Sign-In will be active when OAuth is configured in Supabase.");
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-x-hidden bg-background text-foreground flex flex-col">
      {/* ── Exact Strumly Homepage Background ── */}
      <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
        <img
          src={studioImage}
          alt="A warm acoustic guitar studio overlooking a sunset lake"
          className="h-full w-full object-cover object-[58%_center]"
          width={1920}
          height={1080}
        />
        <div className="hero-vignette absolute inset-0 -z-20" />
        <div className="bottom-shade absolute inset-x-0 bottom-0 -z-10 h-[45%]" />
        <div className="absolute inset-0 -z-10 bg-black/30 backdrop-blur-[1.5px]" />
      </div>

      {/* ── Reusable Strumly Navbar ── */}
      <Navbar showSearch={false} className="w-full" />

      {/* ── Centered Glass Card Content ── */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[460px] rounded-[28px] border border-glass-border/70 bg-[#161210]/80 p-7 sm:p-10 shadow-2xl backdrop-blur-2xl animate-flow-2">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 transition-transform hover:scale-105"
              aria-label="Strumly home"
            >
              <span className="grid size-11 shrink-0 rotate-[-8deg] place-items-center rounded-[42%_42%_52%_52%] bg-primary text-primary-foreground shadow-warm">
                <Guitar size={22} />
              </span>
              <span className="font-display text-2xl font-extrabold tracking-tight text-cream">
                Strumly
              </span>
            </Link>

            <h1 className="mt-5 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-cream">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-cream/70">
              Join Strumly and make every song closer.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/15 p-3.5 text-xs text-red-200 backdrop-blur-md animate-flow-1">
              {authError}
            </div>
          )}

          {/* Confirmation Notice */}
          {successNotice ? (
            <div className="mt-6 rounded-2xl border border-peach/40 bg-[#1f1815]/90 p-6 text-center backdrop-blur-xl animate-flow-1">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-peach/15 text-peach">
                <Mail size={22} />
              </div>
              <h2 className="font-display text-xl font-bold text-cream">Check your inbox</h2>
              <p className="mt-2 text-sm text-cream/75 leading-relaxed">
                {successNotice}
              </p>
              <div className="mt-6">
                <Button asChild variant="warm" className="w-full h-11 rounded-xl font-semibold">
                  <Link to="/login" search={redirect ? { redirect } : undefined}>
                    Proceed to Log In
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSignupSubmit} className="mt-6 space-y-4" noValidate>
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-xs font-bold uppercase tracking-wider text-cream/80"
                  >
                    Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/45 pointer-events-none"
                    />
                    <input
                      id="signup-name"
                      type="text"
                      value={name}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) clearError("name");
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Jimi Hendrix"
                      autoComplete="name"
                      required
                      className={`h-11 w-full rounded-xl border bg-glass/40 pl-10 pr-4 text-sm text-cream placeholder:text-cream/40 backdrop-blur-md outline-none transition focus:ring-2 disabled:opacity-60 ${
                        errors.name
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                          : "border-glass-border focus:border-peach focus:ring-peach/25"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-bold uppercase tracking-wider text-cream/80"
                  >
                    Email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/45 pointer-events-none"
                    />
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) clearError("email");
                        if (authError) setAuthError(null);
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className={`h-11 w-full rounded-xl border bg-glass/40 pl-10 pr-4 text-sm text-cream placeholder:text-cream/40 backdrop-blur-md outline-none transition focus:ring-2 disabled:opacity-60 ${
                        errors.email
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                          : "border-glass-border focus:border-peach focus:ring-peach/25"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-bold uppercase tracking-wider text-cream/80"
                  >
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/45 pointer-events-none"
                    />
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) clearError("password");
                        if (authError) setAuthError(null);
                      }}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      className={`h-11 w-full rounded-xl border bg-glass/40 pl-10 pr-11 text-sm text-cream placeholder:text-cream/40 backdrop-blur-md outline-none transition focus:ring-2 disabled:opacity-60 ${
                        errors.password
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                          : "border-glass-border focus:border-peach focus:ring-peach/25"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cream/50 hover:text-cream transition cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-xs font-bold uppercase tracking-wider text-cream/80"
                  >
                    Confirm Password
                  </label>
                  <div className="relative mt-1.5">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/45 pointer-events-none"
                    />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) clearError("confirmPassword");
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      required
                      className={`h-11 w-full rounded-xl border bg-glass/40 pl-10 pr-11 text-sm text-cream placeholder:text-cream/40 backdrop-blur-md outline-none transition focus:ring-2 disabled:opacity-60 ${
                        errors.confirmPassword
                          ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                          : "border-glass-border focus:border-peach focus:ring-peach/25"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cream/50 hover:text-cream transition cursor-pointer"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="warm"
                  disabled={isSubmitting}
                  className="w-full mt-2 h-12 rounded-xl text-base font-bold shadow-warm tracking-wide cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4.5 animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-glass-border/50" />
                </div>
                <span className="relative bg-[#1d1715] px-3 py-0.5 rounded-full text-[11px] uppercase tracking-wider text-cream/55 border border-glass-border/40">
                  or continue with
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-glass-border bg-glass/40 px-4 text-sm font-semibold text-cream backdrop-blur-md transition hover:bg-glass-hover hover:border-glass-border/90 active:scale-[0.99] cursor-pointer"
              >
                <svg className="size-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Bottom Footer */}
          <p className="mt-7 text-center text-sm text-cream/70">
            Already have an account?{" "}
            <Link
              to="/login"
              search={redirect ? { redirect } : undefined}
              className="font-bold text-peach hover:underline hover:text-peach/90 transition ml-0.5"
            >
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
