import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
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
      default:
        return "Unable to sign in. Please try again.";
    }
  }
  return "Unable to sign in. Please try again.";
}

export function Login() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "authenticated") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-7">
        <div className="mb-6 text-center">
          <p className="text-[15px] font-semibold text-text-primary">
            Stationery Manager
          </p>
          <p className="mt-1 text-[13px] text-text-secondary">
            Sign in to your admin account
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="mt-1 w-full">
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
