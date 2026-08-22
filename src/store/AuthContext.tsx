import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { fetchUserProfile, logout, subscribeToAuthChanges } from "../services/auth";
import { ensureSessionExpiry } from "../lib/session";
import { toast } from "../lib/toast";
import type { AppUser } from "../types/user";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  profile: AppUser | null;
  error: string | null;
}

export const AuthContext = createContext<AuthContextValue>({
  status: "loading",
  firebaseUser: null,
  profile: null,
  error: null,
});

function expireSession() {
  logout().catch(() => {
    // Best-effort: even if the network call fails, the local session
    // record is already cleared by logout(), and the next auth check
    // will not find a valid expiry.
  });
  toast.info("Your session has expired. Please sign in again.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({
    status: "loading",
    firebaseUser: null,
    profile: null,
    error: null,
  });

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (expiryTimer) {
        clearTimeout(expiryTimer);
        expiryTimer = null;
      }

      if (!firebaseUser) {
        setState({
          status: "unauthenticated",
          firebaseUser: null,
          profile: null,
          error: null,
        });
        return;
      }

      // A session created before this feature shipped (or restored by
      // Firebase's own persistence with no expiry recorded yet) gets one
      // fresh 24h window rather than being logged out immediately.
      const expiresAt = ensureSessionExpiry();
      const remainingMs = expiresAt - Date.now();

      if (remainingMs <= 0) {
        expireSession();
        return;
      }

      expiryTimer = setTimeout(expireSession, remainingMs);

      try {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setState({
          status: "authenticated",
          firebaseUser,
          profile,
          error: null,
        });
      } catch {
        setState({
          status: "authenticated",
          firebaseUser,
          profile: null,
          error: "Unable to load your user profile.",
        });
      }
    });

    return () => {
      unsubscribe();
      if (expiryTimer) clearTimeout(expiryTimer);
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}
