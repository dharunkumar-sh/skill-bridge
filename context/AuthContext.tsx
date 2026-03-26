/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export interface User {
  id?: string;
  name: string;
  email: string;
  picture: string;
  hasCompletedOnboarding?: boolean;
  mindset?: string | null;
  skillStatus?: string | null;
  careerGoal?: string | null;
  authProvider?: string;
  githubUsername?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: "login" | "signup";
  setAuthMode: (mode: "login" | "signup") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    // Check if onboarding is needed
    if (!userData.hasCompletedOnboarding) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          isAuthModalOpen,
          setIsAuthModalOpen,
          authMode,
          setAuthMode,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
