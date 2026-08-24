// pages/ForgotPassword.tsx
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { ArrowLeft, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { sendPasswordReset } from "../services/auth";

const RESEND_COOLDOWN_SECONDS = 60;

function forgotPasswordErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      // auth/user-not-found is intentionally NOT special-cased — see
      // submitReset(). Revealing that an email isn't registered would let
      // anyone probe which accounts exist in the system.
      default:
        return "Unable to send reset email. Please try again.";
    }
  }
  return "Unable to send reset email. Please try again.";
}

export function ForgotPassword() {
  const { status } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  if (status === "authenticated") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    cooldownTimer.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function submitReset() {
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
      startCooldown();
    } catch (err) {
      if (err instanceof FirebaseError && err.code === "auth/user-not-found") {
        // Same outcome as a real send — see note above.
        setSent(true);
        startCooldown();
      } else {
        setError(forgotPasswordErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submitReset();
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel — desktop only, matches Login */}
      <div className="relative hidden w-[42%] max-w-md flex-col justify-between bg-black p-12 lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-[2px] bg-orange" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Zentrya
            </span>
          </div>
          <p className="mt-3 text-[22px] font-semibold tracking-tight text-white">
            Stationery Manager
          </p>
        </div>

        <p className="max-w-[26ch] text-[14px] leading-relaxed text-white/50">
          Track products, stock movement and sales across every store, in one
          place.
        </p>

        <a
          href="https://www.zentrya.co.tz"
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-[11.5px] text-white/40 transition-colors duration-150 hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
        >
          Created by Zentrya Limited
        </a>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-1.5 rounded-sm text-[12px] text-text-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
          >
            <ArrowLeft size={13} />
            Back to sign in
          </Link>

          {!sent ? (
            <>
              <div className="mb-7">
                <p className="text-[17px] font-semibold tracking-tight text-text-primary">
                  Reset your password
                </p>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Enter the email on your account and we'll send you a link
                  to reset your password.
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {error && (
                  <p
                    role="alert"
                    className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
                  >
                    <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={submitting} className="mt-1 w-full">
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="spinner-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      Sending
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="fade-in flex flex-col items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success-light">
                <CheckCircle size={22} weight="fill" className="text-success" />
              </div>
              <div>
                <p className="text-[17px] font-semibold tracking-tight text-text-primary">
                  Check your email
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  If an account exists for{" "}
                  <span className="font-medium text-text-primary">{email}</span>, we've
                  sent a link to reset your password. It may take a minute to
                  arrive — check spam if you don't see it.
                </p>
              </div>

              <button
                type="button"
                disabled={cooldown > 0 || submitting}
                onClick={() => void submitReset()}
                className="mt-1 rounded-sm text-[12.5px] font-medium text-orange-dark transition-colors duration-150 hover:text-orange disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:text-text-disabled"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}