import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  Eye,
  EyeSlash,
  WarningCircle,
} from "@phosphor-icons/react";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/auth";

function loginErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";

      case "auth/invalid-email":
        return "Enter a valid email address.";

      case "auth/user-disabled":
        return "This account has been disabled. Please contact an administrator.";

      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";

      default:
        return "Unable to sign in. Please try again.";
    }
  }

  return "Unable to sign in. Please try again.";
}

export function Login() {
  const { status, profile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    const destination =
      profile?.role === "agent"
        ? "/agent"
        : "/admin/dashboard";

    return <Navigate to={destination} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      /*
       * AuthContext's onAuthStateChanged will update the
       * authentication status. Once authenticated, the
       * Navigate component above handles the redirect.
       */
      await login(email.trim(), password);
    } catch (err) {
      setError(loginErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* =========================================================
          BRAND PANEL
          Desktop only
      ========================================================== */}
      <aside className="relative hidden w-[42%] max-w-md flex-col justify-between bg-black p-12 lg:flex">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-[2px] bg-orange"
              aria-hidden="true"
            />

            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
              HEKIMA STATIONERY
            </span>
          </div>

          {/* Product name */}
          <p className="mt-3 text-[22px] font-semibold tracking-tight text-white">
            Stationery Manager
          </p>
        </div>

        {/* Description */}
        <p className="max-w-[26ch] text-[14px] leading-relaxed text-white/50">
          Track products, stock movement and sales across every store, in one
          place.
        </p>

        {/* Company credit */}
        <a
          href="https://www.zentrya.co.tz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit rounded-sm text-[11.5px] text-white/40 transition-colors duration-150 hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
        >
          Created by Zentrya Limited
        </a>
      </aside>

      {/* =========================================================
          FORM PANEL
      ========================================================== */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-7 text-center">
            <p className="text-[15px] font-semibold text-text-primary lg:text-[17px] lg:tracking-tight">
              <span className="lg:hidden">
                Stationery Manager
              </span>

              <span className="hidden lg:inline">
                Sign in
              </span>
            </p>

            <p className="mt-1 text-[13px] text-text-secondary">
              <span className="lg:hidden">
                Sign in to continue
              </span>

              <span className="hidden lg:inline">
                Enter your details to access your account
              </span>
            </p>
          </div>

          {/* Login form */}
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Email */}
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                if (error) {
                  setError(null);
                }
              }}
            />

            {/* Password */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[13px] font-medium text-text-primary">
                  Password
                </span>

                <Link
                  to="/forgot-password"
                  className="rounded-sm text-[12px] text-text-muted transition-colors duration-150 hover:text-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  label=""
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (error) {
                      setError(null);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                  className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-sm text-text-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
                >
                  {showPassword ? (
                    <EyeSlash size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
              >
                <WarningCircle
                  size={14}
                  weight="fill"
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />

                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="spinner-dots"
                    aria-hidden="true"
                  >
                    <span />
                    <span />
                    <span />
                  </span>

                  Signing in
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-6 flex justify-center gap-4 text-[11px] text-text-muted">
            <Link
              to="/privacy"
              className="rounded-sm transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="rounded-sm transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
            >
              Terms of Service
            </Link>
          </div>

          {/* Mobile company credit */}
          <div className="mt-8 text-center lg:hidden">
            <a
              href="https://www.zentrya.co.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-[11px] text-text-muted transition-colors duration-150 hover:text-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
            >
              Created by Zentrya Limited
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}