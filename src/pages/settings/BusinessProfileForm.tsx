// pages/settings/BusinessProfileForm.tsx
import { useEffect, useState, type FormEvent } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { getBusinessProfile, saveBusinessProfile } from "../../services/settings";
import { toast } from "../../lib/toast";

type Status = "loading" | "success" | "error";

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export function BusinessProfileForm() {
  const [status, setStatus] = useState<Status>("loading");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("TZS");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstSetup, setIsFirstSetup] = useState(false);

  async function load() {
    setStatus("loading");
    try {
      const profile = await getBusinessProfile();
      if (profile) {
        setName(profile.name);
        setPhone(profile.phone);
        setAddress(profile.address);
        setCurrency(profile.currency);
        setIsFirstSetup(false);
      } else {
        setIsFirstSetup(true);
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Business name is required.");
      return;
    }
    if (!CURRENCY_CODE_PATTERN.test(currency)) {
      setError("Currency code must be exactly 3 letters (e.g. TZS, USD).");
      return;
    }

    setSubmitting(true);
    try {
      await saveBusinessProfile({
        name: trimmedName,
        phone: phone.trim(),
        address: address.trim(),
        currency,
      });
      setIsFirstSetup(false);
      toast.success("Business profile saved successfully.");
    } catch {
      toast.error("Unable to save business profile.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Business Profile" />

      {status === "loading" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-[160px]" />
          <Skeleton className="h-8 w-28" />
        </div>
      )}

      {status === "error" && <ErrorState onRetry={load} />}

      {status === "success" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isFirstSetup && (
            <p className="text-[12px] text-text-muted">
              This appears on receipts and reports — set it up once and it'll
              apply everywhere.
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              id="business-name"
              label="Business Name"
              autoComplete="organization"
              required
              disabled={submitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="business-phone"
              label="Phone"
              autoComplete="tel"
              disabled={submitting}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Input
            id="business-address"
            label="Address"
            autoComplete="street-address"
            disabled={submitting}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="max-w-[160px]">
            <Input
              id="business-currency"
              label="Currency Code"
              disabled={submitting}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
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
                  Saving
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}