import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { fetchUserProfile, subscribeToAuthChanges } from "../services/auth";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({
    status: "loading",
    firebaseUser: null,
    profile: null,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!firebaseUser) {
        setState({
          status: "unauthenticated",
          firebaseUser: null,
          profile: null,
          error: null,
        });
        return;
      }

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

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}
