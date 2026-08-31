// pages/settings/ChangePasswordForm.tsx
import { useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import { Eye, EyeSlash, WarningCircle } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { changePassword } from "../../services/auth";
import { toast } from "../../lib/toast";

function changePasswordErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Your current password is incorrect.";
      case "auth/weak-password":
        return "New password must be at least 6 characters.";
      default:
        return "Unable to update password. Please try again.";
    }
  }
  return "Unable to update password. Please try again.";
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswords(false);
    } catch (err) {
      setError(changePasswordErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const fieldType = showPasswords ? "text" : "password";

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <CardHeader title="Change Password" className="mb-0" />
        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="flex items-center gap-1.5 rounded-sm text-[12px] text-text-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
        >
          {showPasswords ? <EyeSlash size={14} /> : <Eye size={14} />}
          {showPasswords ? "Hide" : "Show"} passwords
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            id="current-password"
            label="Current Password"
            type={fieldType}
            autoComplete="current-password"
            required
            disabled={submitting}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            id="new-password"
            label="New Password"
            type={fieldType}
            autoComplete="new-password"
            required
            disabled={submitting}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            id="confirm-password"
            label="Confirm New Password"
            type={fieldType}
            autoComplete="new-password"
            required
            disabled={submitting}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
          >
            <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Updating
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}