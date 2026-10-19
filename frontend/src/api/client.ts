const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type Me = {
  id: string;
  discordId: string;
  username: string;
  globalName: string | null;
  email: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  createdAt: number;
  updatedAt: number;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
};

export const api = {
  me: () => request<Me>("/api/me"),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  loginUrl: () => `${BASE}/auth/discord/login`,
};

export { ApiError };
