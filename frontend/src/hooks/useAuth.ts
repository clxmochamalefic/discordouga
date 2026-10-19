import { useCallback, useEffect, useState } from "react";
import { api, type Me } from "../api/client";

export type AuthState =
  | { status: "loading" }
  | { status: "authed"; user: Me }
  | { status: "guest" };

export type AuthContext = {
  state: AuthState;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = (): AuthContext => {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const user = await api.me();
      setState({ status: "authed", user });
    } catch {
      setState({ status: "guest" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore — fall through to local guest state anyway
    }
    setState({ status: "guest" });
  }, []);

  return { state, refresh, logout };
};
