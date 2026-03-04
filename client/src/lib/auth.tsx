import { createContext, useContext, useCallback } from "react";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "./queryClient";
import { useQuery } from "@tanstack/react-query";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) return null;
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const login = useCallback(async (mobile: string, password: string) => {
    await apiRequest("POST", "/api/auth/login", { mobile, password });
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  }, []);

  const register = useCallback(async (data: any) => {
    const res = await apiRequest("POST", "/api/auth/register", data);
    const result = await res.json();
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    return result;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("POST", "/api/auth/logout");
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  }, []);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
