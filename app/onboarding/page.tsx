"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

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
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center p-4 pt-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400 mb-4">
          Welcome to CareerLift, {user.name?.split(" ")[0]}!
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Let&apos;s personalize your learning experience. It only takes a minute.
        </p>
      </div>
      
      <OnboardingForm />
    </div>
  );
}
