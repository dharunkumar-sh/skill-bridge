/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
  targetRole?: string | null;
  knownTechnologies?: string | null;
  learningStyle?: string | null;
  weeklyHours?: string | null;
  workExperience?: string | null;
  education?: string | null;
  motivation?: string | null;
  authProvider?: string;
  githubUsername?: string | null;
  aiAnalysis?: any;
  // Subscription fields
  subscriptionPlan?: string; // free, professional, premium
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string; // active, inactive, canceled, past_due
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

  // Refresh user data from the database
  const refreshUser = useCallback(async () => {
    const currentEmail = user?.email;
    if (!currentEmail) return;

    try {
      const res = await fetch(
        `/api/user/profile?email=${encodeURIComponent(currentEmail)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  }, [user?.email]);

  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          refreshUser,
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
