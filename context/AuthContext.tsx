"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiLogin, apiRegister, setToken, getToken, clearToken } from "@/lib/api";
import type { LoginResponse, RegisterResult } from "@/lib/api";

export type Role = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: Role }>;
  register: (name: string, email: string, password: string, role: Role) => Promise<RegisterResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie helpers
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveLocalUser = (u: User) => {
    const json = JSON.stringify(u);
    localStorage.setItem("dapurkita_user", json);
    setCookie("dapurkita_session", json);
  };

  const clearLocalUser = () => {
    localStorage.removeItem("dapurkita_user");
    clearToken();
    deleteCookie("dapurkita_session");
  };

  // On mount — restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dapurkita_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          if (!parsed.role) parsed.role = "user";
          if (!parsed.id) parsed.id = "local-" + Date.now();
          setUser(parsed);
        }
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: Role }> => {
    // Try backend API first
    const apiResult: LoginResponse | null = await apiLogin(email, password);

    if (apiResult && apiResult.access_token) {
      // Save token
      setToken(apiResult.access_token);

      // Map API role ("USER" | "ADMIN") to frontend role ("user" | "admin")
      const role: Role = apiResult.role === "ADMIN" ? "admin" : "user";

      // Decode some info from the token (JWT) if possible, or use email
      let userName = email.split("@")[0];
      try {
        const payload = JSON.parse(atob(apiResult.access_token.split(".")[1]));
        if (payload.name) userName = payload.name;
        if (payload.sub) {
          // sub could be userId
        }
      } catch { /* ignore */ }

      const u: User = {
        id: apiResult.access_token.substring(0, 16),
        name: userName,
        email,
        role,
      };
      setUser(u);
      saveLocalUser(u);
      return { success: true, role };
    }

    return { success: false };
  };

  const register = async (name: string, email: string, password: string, role: Role): Promise<RegisterResult> => {
    // Try backend API
    const result = await apiRegister(name, email, password, role);
    return result;
  };

  const logout = () => {
    clearLocalUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
