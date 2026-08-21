import { useContext } from "react";
import { AuthContext } from "../store/AuthContext";

export function useAuth() {
  return useContext(AuthContext);
}
