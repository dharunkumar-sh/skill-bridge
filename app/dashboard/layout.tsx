"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Basic route protection check
  useEffect(() => {
    // We delay the check slightly to give the AuthContext time to rehydrate from localStorage
    const timer = setTimeout(() => {
      if (!user && typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (!stored) {
          router.push("/");
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  if (!user && typeof window !== "undefined" && !localStorage.getItem("user")) {
    return null; // Don't flash layout if entirely unauthenticated
  }

  return (
    <div className="min-h-screen bg-midnight-950 flex font-sans">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
