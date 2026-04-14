"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else if (user.hasCompletedOnboarding) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.hasCompletedOnboarding) {
    // Return null while redirecting to avoid layout flash
    return null;
  }

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center p-4 pt-20 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Assessment
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 mb-4">
          Welcome to CareerLift, {user.name?.split(" ")[0]}!
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Answer a few questions and our AI will create your personalized learning
          roadmap, curated courses, and matched job opportunities.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-3xl relative z-10"
      >
        <OnboardingForm />
      </motion.div>
    </div>
  );
}
