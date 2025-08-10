import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

interface User {
  id?: string;
  name: string;
  mobile?: string;
  referralCode: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  // 🧪 TEMPORARY: Mock auth controls for UI testing
  enableMockAuth: () => void;
  disableMockAuth: () => void;
  isMockAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isMockAuth, setIsMockAuth] = useState<boolean>(true); // 🧪 TEMPORARY: Track mock auth state

  // 🧪 TEMPORARY: Mock user for UI testing (remove in production)
  
  const mockUser: User = {
    id: "1",
    name: "TestUser",
    mobile: "+1234567890", 
    referralCode: "TEST123",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  };
  
  const mockToken = "mock-jwt-token-for-testing";

  useEffect(() => {
    // 🧪 TEMPORARY: Auto-login with mock user for UI testing
    if (isMockAuth) {
      console.log("🧪 MOCK AUTH ENABLED - Using test user for UI testing");
      setUser(mockUser);
      setToken(mockToken);
      return;
    }
    
    // Normal auth flow
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { user, token } = JSON.parse(stored);
      setUser(user);
      setToken(token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [isMockAuth]);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("auth", JSON.stringify({ user, token }));
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
    delete api.defaults.headers.common["Authorization"];
  };

  // 🧪 TEMPORARY: Mock auth control functions for UI testing
  const enableMockAuth = () => {
    console.log("🧪 Enabling mock auth for UI testing");
    setIsMockAuth(true);
  };

  const disableMockAuth = () => {
    console.log("🧪 Disabling mock auth - switching to real auth");
    setIsMockAuth(false);
    logout(); // Clear any mock user data
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      enableMockAuth,
      disableMockAuth,
      isMockAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
