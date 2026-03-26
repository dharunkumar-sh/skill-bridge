"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

const steps = [
  {
    id: "mindset",
    title: "Where are you currently in your career journey?",
    options: [
      { id: "student", label: "Student looking for first job", icon: "🎓" },
      { id: "professional_pivot", label: "Professional looking to pivot", icon: "🔄" },
      { id: "upskilling", label: "Looking for upskilling in current role", icon: "📈" },
      { id: "freelancer", label: "Freelancer/Consultant", icon: "💻" },
    ],
  },
  {
    id: "skillStatus",
    title: "How would you rate your current technical expertise?",
    options: [
      { id: "beginner", label: "Beginner", icon: "🌱", description: "Just starting out" },
      { id: "intermediate", label: "Intermediate", icon: "🌿", description: "Some experience, but need growth" },
      { id: "advanced", label: "Advanced", icon: "🌳", description: "Confident in my core skills" },
    ],
  },
  {
    id: "careerGoal",
    title: "What is your primary goal moving forward?",
    options: [
      { id: "new_job", label: "Get a new higher-paying job", icon: "💼" },
      { id: "learn_skill", label: "Learn a specific highly-valued skill", icon: "🧠" },
      { id: "network", label: "Expand my professional network", icon: "🤝" },
    ],
  },
];

export default function OnboardingForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: optionId });
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      await submitOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitOnboarding = async () => {
    if (!user || !user.email) return;
    setIsSubmitting(true);
    
    try {
      const resp = await axios.post("/api/user/onboarding", {
        email: user.email,
        mindset: answers["mindset"],
        skillStatus: answers["skillStatus"],
        careerGoal: answers["careerGoal"],
      });

      if (resp.status === 200) {
        // Update local auth context via the login method (which now sets hasCompletedOnboarding)
        const updatedUser = { ...user, hasCompletedOnboarding: true, ...resp.data.user };
        login(updatedUser);
        // AuthContext automatically pushes to dashboard if hasCompletedOnboarding is true.
      }
    } catch (err) {
      console.error("Failed to save onboarding data", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = steps[currentStep];

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 50 : -50,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0,
      };
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Background flair */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? "w-8 bg-blue-500" : idx < currentStep ? "w-2 bg-emerald-500" : "w-2 bg-midnight-700"}`} 
              />
            ))}
          </div>
          <p className="text-slate-400 text-sm font-medium">Step {currentStep + 1} of {steps.length}</p>
        </div>

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              {currentStepData.title}
            </h2>

            <div className="space-y-4">
              {currentStepData.options.map((option) => {
                const isSelected = answers[currentStepData.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-200 group ${
                      isSelected 
                        ? "bg-blue-900/40 border-blue-500 shadow-md shadow-blue-500/10" 
                        : "bg-midnight-800 border-white/5 hover:border-blue-500/50 hover:bg-midnight-800/80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{option.icon}</div>
                      <div>
                        <p className={`font-semibold ${isSelected ? "text-blue-200" : "text-slate-200"}`}>{option.label}</p>
                        {option.description && (
                          <p className="text-sm text-slate-400 mt-1">{option.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? "bg-blue-500 border-blue-500" : "border-slate-600 group-hover:border-blue-500/50"
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-between items-center pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleBack}
            className={`text-slate-400 hover:text-white ${currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!answers[currentStepData.id] || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : currentStep === steps.length - 1 ? (
              "Complete Setup"
            ) : (
              <>
                Next
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
