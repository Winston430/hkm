// pages/users/UserFormModal.tsx
import { useEffect, useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import { Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { toast } from "../../lib/toast";
import type { UserRole } from "../../types/user";

function createUserErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "A user with this email already exists.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      default:
        return "Unable to create user. Please try again.";
    }
  }
  return "Unable to create user. Please try again.";
}

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";

function generateTempPassword(length = 12): string {
  const values = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < length; i++) values[i] = Math.floor(Math.random() * PASSWORD_CHARS.length);
  }
  return Array.from(values, (n) => PASSWORD_CHARS[n % PASSWORD_CHARS.length]).join("");
}

export function UserFormModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("agent");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setRole("agent");
      setError(null);
    }
  }, [open]);

  async function handleCopyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard.");
    } catch {
      toast.error("Unable to copy. Select and copy the password manually.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Fill in all fields. Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), password, role });
      onClose();
    } catch (err) {
      setError(createUserErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add User"
      width="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="user-form" disabled={submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Creating
              </span>
            ) : (
              "Create User"
            )}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          id="user-name"
          label="Name"
          autoComplete="name"
          autoFocus
          disabled={submitting}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          id="user-email"
          label="Email"
          type="email"
          autoComplete="email"
          disabled={submitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <div className="relative">
            <Input
              id="user-password"
              label="Temporary Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={submitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-sm text-text-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
            >
              {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPassword(generateTempPassword());
                setShowPassword(true);
              }}
              className="rounded-sm text-[11px] text-text-muted underline-offset-2 transition-colors duration-150 hover:text-text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
            >
              Generate password
            </button>
            {password && (
              <button
                type="button"
                onClick={handleCopyPassword}
                className="rounded-sm text-[11px] text-text-muted underline-offset-2 transition-colors duration-150 hover:text-text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        <Select
          id="user-role"
          label="Role"
          value={role}
          disabled={submitting}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </Select>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
          >
            <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}