// store/AuthContext.tsx — full file, permission helpers added
import { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { fetchUserProfile, logout, subscribeToAuthChanges } from "../services/auth";
import { ensureSessionExpiry } from "../lib/session";
import { toast } from "../lib/toast";
import type { AppUser } from "../types/user";
import type { Permission } from "../types/permissions";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type ProfileStatus = "idle" | "loading" | "ready" | "error";

interface RawAuthState {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  profile: AppUser | null;
  profileStatus: ProfileStatus;
  error: string | null;
}

interface AuthContextValue extends RawAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isResolvingProfile: boolean;
  /** Admins always pass, regardless of their (usually empty) permissions array. */
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function getRoleHomePath(profile: AppUser | null): string {
  if (profile?.role === "admin") return "/admin/dashboard";
  if (profile?.role === "agent") return "/agent";
  return "/login";
}

function expireSession() {
  logout().catch(() => {});
  toast.info("Your session has expired. Please sign in again.");
}

const PROFILE_FETCH_RETRY_DELAYS_MS = [150, 400];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchUserProfileWithRetry(uid: string): Promise<AppUser | null> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= PROFILE_FETCH_RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fetchUserProfile(uid);
    } catch (err) {
      lastError = err;
      const delay = PROFILE_FETCH_RETRY_DELAYS_MS[attempt];
      if (delay) await wait(delay);
    }
  }
  throw lastError;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RawAuthState>({
    status: "loading",
    firebaseUser: null,
    profile: null,
    profileStatus: "idle",
    error: null,
  });

  const requestIdRef = useRef(0);

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      const requestId = ++requestIdRef.current;

      if (expiryTimer) {
        clearTimeout(expiryTimer);
        expiryTimer = null;
      }

      if (!firebaseUser) {
        setState({
          status: "unauthenticated",
          firebaseUser: null,
          profile: null,
          profileStatus: "idle",
          error: null,
        });
        return;
      }

      const expiresAt = ensureSessionExpiry();
      const remainingMs = expiresAt - Date.now();

      if (remainingMs <= 0) {
        expireSession();
        return;
      }

      expiryTimer = setTimeout(expireSession, remainingMs);

      setState({
        status: "authenticated",
        firebaseUser,
        profile: null,
        profileStatus: "loading",
        error: null,
      });

      try {
        const profile = await fetchUserProfileWithRetry(firebaseUser.uid);
        if (requestId !== requestIdRef.current) return;
        setState({
          status: "authenticated",
          firebaseUser,
          profile,
          profileStatus: "ready",
          error: null,
        });
      } catch {
        if (requestId !== requestIdRef.current) return;
        setState({
          status: "authenticated",
          firebaseUser,
          profile: null,
          profileStatus: "error",
          error: "Unable to load your user profile. Please try reloading the page.",
        });
      }
    });

    return () => {
      unsubscribe();
      if (expiryTimer) clearTimeout(expiryTimer);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin = state.profile?.role === "admin";
    const grantedPermissions = state.profile?.permissions ?? [];

    function hasPermission(permission: Permission): boolean {
      return isAdmin || grantedPermissions.includes(permission);
    }

    function hasAnyPermission(permissions: Permission[]): boolean {
      return isAdmin || permissions.some((p) => grantedPermissions.includes(p));
    }

    return {
      ...state,
      isAuthenticated: state.status === "authenticated",
      isAdmin,
      isAgent: state.profile?.role === "agent",
      isResolvingProfile: state.status === "authenticated" && state.profileStatus === "loading",
      hasPermission,
      hasAnyPermission,
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}