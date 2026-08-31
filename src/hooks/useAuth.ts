// hooks/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../store/AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}