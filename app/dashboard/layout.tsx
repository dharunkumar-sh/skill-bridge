"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // Basic route protection check
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Delay slightly to give AuthContext time to rehydrate from localStorage
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("user");

      if (!user && !stored) {
        router.replace("/");
      }

      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  if (!user && typeof window !== "undefined" && !localStorage.getItem("user")) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center text-slate-400">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 flex font-sans">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
