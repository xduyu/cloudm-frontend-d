"use client";
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { SERVER_URL } from "@/data/SERVER_URL";

// ─── Types ─────────────────────────────────────────────────────────

interface User {
  username: string;
  email: string;
  isArtist: boolean;
  subscribedArtists: string[];
  FavouriteTracks: string[];
  Alboums: string[];
  Playlists: string[];
  SubScribtionType: "free" | "premium" | "platinum";
  isAdmin: boolean;
  isMod: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (username: string, email: string, password: string) => Promise<any>;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ─── Provider ──────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lastUserRef = useRef<User | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Держим tokenRef актуальным для использования в колбэках
  useEffect(() => { tokenRef.current = token; }, [token]);

  // ─── Fetch user ──────────────────────────────────────────────────
  const fetchUser = useCallback(async (currentToken?: string) => {
    const t = currentToken ?? tokenRef.current;
    if (!t) return;

    try {
      const res = await fetch(`${SERVER_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!res.ok) return;

      const data = await res.json();

      if (!isEqual(lastUserRef.current, data.user)) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        lastUserRef.current = data.user;
      }
    } catch (err) {
      console.error("fetchUser error:", err);
    }
  }, []);

  // ─── Load from localStorage при старте ──────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        lastUserRef.current = parsed;
        // Сразу проверяем актуальность данных с сервера
        fetchUser(savedToken);
      } catch {
        localStorage.clear();
      }
    }

    setIsLoading(false);
  }, []);

  // ─── Обновление при фокусе вкладки ──────────────────────────────
  useEffect(() => {
    if (!token) return;

    const handleVisibilityChange = () => {
      // Пользователь вернулся на вкладку — проверяем обновления
      if (document.visibilityState === "visible") fetchUser();
    };

    const handleFocus = () => fetchUser();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [token, fetchUser]);

  // ─── Register ───────────────────────────────────────────────────
  async function register(username: string, email: string, password: string) {
    try {
      const res = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch {
      return { success: false, message: "Ошибка сети" };
    }
  }

  // ─── Login ──────────────────────────────────────────────────────
  async function login(username: string, password: string) {
    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };

      setToken(data.token);
      setUser(data.user);
      lastUserRef.current = data.user;
      localStorage.setItem('PanelStatus', "hidden");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return { success: true, message: data.message };
    } catch {
      return { success: false, message: "Ошибка сети" };
    }
  }

  // ─── Logout ─────────────────────────────────────────────────────
  function logout() {
    setToken(null);
    setUser(null);
    lastUserRef.current = null;
    localStorage.clear();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        register,
        login,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}