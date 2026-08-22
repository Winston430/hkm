import { useEffect, useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
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
  const [role, setRole] = useState<UserRole>("salesperson");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("salesperson");
      setError(null);
    }
  }, [open]);

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
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="user-form" disabled={submitting}>
            {submitting ? "Creating..." : "Create User"}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          id="user-name"
          label="Name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          id="user-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="user-password"
          label="Temporary Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Select
          id="user-role"
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="salesperson">Salesperson</option>
          <option value="admin">Admin</option>
        </Select>

        {error && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
