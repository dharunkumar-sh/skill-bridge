"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Brain,
  Briefcase,
  GraduationCap,
  Code2,
  Target,
  BookOpen,
  Clock,
  Rocket,
  Heart,
  X,
} from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

/* ───────── STEP DEFINITIONS ───────── */

interface SingleSelectOption {
  id: string;
  label: string;
  icon: string;
  description?: string;
}

interface StepBase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
}

interface SingleSelectStep extends StepBase {
  type: "single-select";
  options: SingleSelectOption[];
}

interface MultiSelectStep extends StepBase {
  type: "multi-select";
  options: string[];
}

interface SliderStep extends StepBase {
  type: "slider";
  min: number;
  max: number;
  defaultValue: number;
  unit: string;
  marks: { value: number; label: string }[];
}

interface TextInputsStep extends StepBase {
  type: "text-inputs";
  fields: {
    id: string;
    label: string;
    placeholder: string;
    type: string;
    icon: React.ReactNode;
  }[];
}

interface TextAreaComboStep extends StepBase {
  type: "textarea-combo";
  textareaLabel: string;
  textareaPlaceholder: string;
  selectLabel: string;
  selectOptions: SingleSelectOption[];
}

type Step =
  | SingleSelectStep
  | MultiSelectStep
  | SliderStep
  | TextInputsStep
  | TextAreaComboStep;

const TECH_OPTIONS = [
  "HTML/CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C++",
  "C#",
  ".NET",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Laravel",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Firebase",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "Linux",
  "GraphQL",
  "REST APIs",
  "TensorFlow",
  "PyTorch",
  "Machine Learning",
  "Figma",
  "Adobe XD",
  "UI/UX Design",
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
];

const steps: Step[] = [
  {
    id: "mindset",
    type: "single-select",
    title: "Where are you in your career journey?",
    subtitle: "This helps us tailor everything to your current stage.",
    icon: <Briefcase size={20} />,
    accentColor: "blue",
    options: [
      {
        id: "student",
        label: "Student looking for first job",
        icon: "🎓",
        description: "Currently studying or recently graduated",
      },
      {
        id: "professional_pivot",
        label: "Professional looking to pivot",
        icon: "🔄",
        description: "Transitioning to a new career field",
      },
      {
        id: "upskilling",
        label: "Upskilling in current role",
        icon: "📈",
        description: "Growing skills to advance or get promoted",
      },
      {
        id: "freelancer",
        label: "Freelancer / Consultant",
        icon: "💻",
        description: "Building or expanding independent career",
      },
      {
        id: "returning",
        label: "Returning after a break",
        icon: "🔙",
        description: "Getting back into the workforce",
      },
    ],
  },
  {
    id: "skillStatus",
    type: "single-select",
    title: "How would you rate your technical expertise?",
    subtitle: "Be honest — it helps us build the right path for you.",
    icon: <Code2 size={20} />,
    accentColor: "emerald",
    options: [
      {
        id: "beginner",
        label: "Beginner",
        icon: "🌱",
        description: "Just starting out, learning the basics",
      },
      {
        id: "elementary",
        label: "Elementary",
        icon: "🌿",
        description: "Know fundamentals, building first projects",
      },
      {
        id: "intermediate",
        label: "Intermediate",
        icon: "🌲",
        description: "Comfortable with core concepts and workflows",
      },
      {
        id: "advanced",
        label: "Advanced",
        icon: "🏔️",
        description: "Deep expertise, mentoring others",
      },
      {
        id: "expert",
        label: "Expert / Lead",
        icon: "⭐",
        description: "Industry-level mastery, architecture decisions",
      },
    ],
  },
  {
    id: "knownTechnologies",
    type: "multi-select",
    title: "What technologies do you already know?",
    subtitle: "Select all that apply — even if you're not an expert yet.",
    icon: <Sparkles size={20} />,
    accentColor: "violet",
    options: TECH_OPTIONS,
  },
  {
    id: "targetRole",
    type: "single-select",
    title: "What is your target role or domain?",
    subtitle: "We'll analyze your readiness and build a path to get there.",
    icon: <Target size={20} />,
    accentColor: "amber",
    options: [
      {
        id: "frontend",
        label: "Frontend Developer",
        icon: "🎨",
        description: "React, Vue, UI/UX engineering",
      },
      {
        id: "backend",
        label: "Backend Developer",
        icon: "⚙️",
        description: "APIs, databases, server architecture",
      },
      {
        id: "fullstack",
        label: "Full Stack Developer",
        icon: "🌐",
        description: "End-to-end web application development",
      },
      {
        id: "mobile",
        label: "Mobile Developer",
        icon: "📱",
        description: "iOS, Android, cross-platform apps",
      },
      {
        id: "data",
        label: "Data Analyst / Scientist",
        icon: "📊",
        description: "Python, SQL, ML, data visualization",
      },
      {
        id: "devops",
        label: "DevOps / Cloud Engineer",
        icon: "☁️",
        description: "CI/CD, containers, cloud infrastructure",
      },
      {
        id: "design",
        label: "Product / UX Designer",
        icon: "✨",
        description: "Figma, user research, design systems",
      },
      {
        id: "ai_ml",
        label: "AI / ML Engineer",
        icon: "🤖",
        description: "Deep learning, NLP, computer vision",
      },
      {
        id: "other",
        label: "Other / Exploring",
        icon: "🔍",
        description: "Still figuring it out",
      },
    ],
  },
  {
    id: "learningStyle",
    type: "single-select",
    title: "How do you learn best?",
    subtitle: "We'll match content to your preferred learning style.",
    icon: <BookOpen size={20} />,
    accentColor: "cyan",
    options: [
      {
        id: "video",
        label: "Video Tutorials",
        icon: "🎬",
        description: "Watch and follow along with instructors",
      },
      {
        id: "reading",
        label: "Articles & Documentation",
        icon: "📖",
        description: "Read docs, blogs, and written guides",
      },
      {
        id: "hands_on",
        label: "Hands-on Projects",
        icon: "🛠️",
        description: "Build real-world projects from scratch",
      },
      {
        id: "interactive",
        label: "Interactive Coding",
        icon: "💡",
        description: "Exercises, challenges, and quizzes",
      },
      {
        id: "mentorship",
        label: "1-on-1 Mentorship",
        icon: "🤝",
        description: "Personal guidance from an expert",
      },
    ],
  },
  {
    id: "weeklyHours",
    type: "slider",
    title: "How many hours per week can you dedicate?",
    subtitle: "We'll create a realistic timeline based on your availability.",
    icon: <Clock size={20} />,
    accentColor: "rose",
    min: 1,
    max: 40,
    defaultValue: 10,
    unit: "hours/week",
    marks: [
      { value: 5, label: "5h" },
      { value: 10, label: "10h" },
      { value: 20, label: "20h" },
      { value: 30, label: "30h" },
      { value: 40, label: "40h" },
    ],
  },
  {
    id: "experience",
    type: "text-inputs",
    title: "Tell us about your background",
    subtitle: "This helps us gauge your starting point accurately.",
    icon: <GraduationCap size={20} />,
    accentColor: "indigo",
    fields: [
      {
        id: "workExperience",
        label: "Years of Work Experience",
        placeholder: "e.g. 2 years, Fresh graduate, 5+ years",
        type: "text",
        icon: <Briefcase size={16} />,
      },
      {
        id: "education",
        label: "Highest Qualification",
        placeholder: "e.g. B.Tech CS, Self-taught, Bootcamp graduate",
        type: "text",
        icon: <GraduationCap size={16} />,
      },
    ],
  },
  {
    id: "goals",
    type: "textarea-combo",
    title: "What drives you forward?",
    subtitle: "Share your goals and we'll create your personalized plan.",
    icon: <Rocket size={20} />,
    accentColor: "fuchsia",
    textareaLabel: "What motivates you? What do you want to achieve?",
    textareaPlaceholder:
      "e.g. I want to transition from manual testing to full-stack development and land a remote job at a product company within 6 months...",
    selectLabel: "What is your primary career goal?",
    selectOptions: [
      { id: "new_job", label: "Land a new higher-paying job", icon: "💰" },
      {
        id: "learn_skill",
        label: "Master a specific in-demand skill",
        icon: "🧠",
      },
      { id: "promotion", label: "Get promoted in my current role", icon: "📈" },
      {
        id: "freelance",
        label: "Build a freelance / consulting career",
        icon: "🏗️",
      },
      { id: "startup", label: "Build my own product / startup", icon: "🚀" },
      { id: "network", label: "Expand my professional network", icon: "🤝" },
    ],
  },
];

/* ───────── STEP ACCENT COLORS MAP ───────── */
const accentMap: Record<
  string,
  { bg: string; border: string; text: string; ring: string; glow: string }
> = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500",
    text: "text-blue-400",
    ring: "ring-blue-500",
    glow: "bg-blue-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500",
    text: "text-emerald-400",
    ring: "ring-emerald-500",
    glow: "bg-emerald-500/20",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500",
    text: "text-violet-400",
    ring: "ring-violet-500",
    glow: "bg-violet-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500",
    text: "text-amber-400",
    ring: "ring-amber-500",
    glow: "bg-amber-500/20",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500",
    text: "text-cyan-400",
    ring: "ring-cyan-500",
    glow: "bg-cyan-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    border: "border-rose-500",
    text: "text-rose-400",
    ring: "ring-rose-500",
    glow: "bg-rose-500/20",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500",
    text: "text-indigo-400",
    ring: "ring-indigo-500",
    glow: "bg-indigo-500/20",
  },
  fuchsia: {
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500",
    text: "text-fuchsia-400",
    ring: "ring-fuchsia-500",
    glow: "bg-fuchsia-500/20",
  },
};

/* ───────── MAIN COMPONENT ───────── */

export default function OnboardingForm() {
  const { user, login } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({
    weeklyHours: "10",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoadingText, setAiLoadingText] = useState(
    "Analyzing your profile...",
  );

  const currentStepData = steps[currentStep];
  const accent = accentMap[currentStepData.accentColor] || accentMap.blue;

  /* ─── Answer Handlers ─── */

  const handleSingleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentStepData.id]: optionId });
  };

  const handleMultiSelect = (tech: string) => {
    const current: string[] = answers[currentStepData.id] || [];
    if (current.includes(tech)) {
      setAnswers({
        ...answers,
        [currentStepData.id]: current.filter((t) => t !== tech),
      });
    } else {
      setAnswers({ ...answers, [currentStepData.id]: [...current, tech] });
    }
  };

  const handleSlider = (value: string) => {
    setAnswers({ ...answers, [currentStepData.id]: value });
  };

  const handleTextInput = (fieldId: string, value: string) => {
    setAnswers({ ...answers, [fieldId]: value });
  };

  const handleTextareaCombo = (fieldId: string, value: string) => {
    setAnswers({ ...answers, [fieldId]: value });
  };

  /* ─── Step Validation ─── */

  const isStepValid = (): boolean => {
    const step = currentStepData;
    switch (step.type) {
      case "single-select":
        return !!answers[step.id];
      case "multi-select":
        return (answers[step.id] || []).length > 0;
      case "slider":
        return true; // always has a default
      case "text-inputs":
        return step.fields.every((f) => answers[f.id]?.trim());
      case "textarea-combo":
        return !!answers["motivation"]?.trim() && !!answers["careerGoal"];
      default:
        return false;
    }
  };

  /* ─── Navigation ─── */

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

  /* ─── Submit ─── */

  const submitOnboarding = async () => {
    if (!user || !user.email) return;
    setIsSubmitting(true);

    const loadingMessages = [
      "Analyzing your profile...",
      "Mapping your skill gaps...",
      "Finding personalized courses...",
      "Matching you with ideal jobs...",
      "Building your learning roadmap...",
      "Almost there — finalizing your plan...",
    ];

    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setAiLoadingText(loadingMessages[msgIdx]);
    }, 2500);

    try {
      const resp = await axios.post("/api/user/onboarding", {
        email: user.email,
        mindset: answers["mindset"],
        skillStatus: answers["skillStatus"],
        knownTechnologies: (answers["knownTechnologies"] || []).join(", "),
        targetRole: answers["targetRole"],
        learningStyle: answers["learningStyle"],
        weeklyHours: answers["weeklyHours"] || answers["slider"],
        workExperience: answers["workExperience"],
        education: answers["education"],
        motivation: answers["motivation"],
        careerGoal: answers["careerGoal"],
      });

      if (resp.status === 200) {
        clearInterval(interval);
        const updatedUser = {
          ...user,
          hasCompletedOnboarding: true,
          ...resp.data.user,
        };
        login(updatedUser);
      }
    } catch (err) {
      console.error("Failed to save onboarding data", err);
      clearInterval(interval);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Animation Variants ─── */

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 60 : -60, opacity: 0 }),
  };

  /* ─── AI Loading Screen ─── */

  if (isSubmitting) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 md:p-12 bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
        {/* Background glows */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Animated brain icon */}
          <div className="ai-loading-pulse mb-8 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-indigo-500/30">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-[-8px] rounded-full border-2 border-transparent border-t-indigo-400/60 ai-loading-spin" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            AI is crafting your plan
          </h2>
          <p className="text-slate-400 text-lg mb-6 max-w-md">
            {aiLoadingText}
          </p>

          {/* Shimmer bar */}
          <div className="w-64 h-2 rounded-full overflow-hidden bg-midnight-800">
            <div className="shimmer-bg w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main Render ─── */

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Background flair */}
      <div
        className={`absolute -top-32 -right-32 w-72 h-72 ${accent.glow} rounded-full blur-[120px] pointer-events-none transition-colors duration-700`}
      />
      <div
        className={`absolute -bottom-32 -left-32 w-72 h-72 ${accent.glow} rounded-full blur-[120px] pointer-events-none transition-colors duration-700`}
      />

      <div className="relative z-10">
        {/* ── Progress Bar ── */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg ${accent.bg} ${accent.text} transition-colors duration-500`}
              >
                {currentStepData.icon}
              </div>
              <span className="text-slate-400 text-sm font-medium">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${accent.bg} ${accent.text}`}
            >
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          {/* Bar */}
          <div className="w-full h-2 rounded-full bg-midnight-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={false}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* ── Step Content ── */}
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
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-slate-400 mb-8">{currentStepData.subtitle}</p>

            {/* ─ SINGLE SELECT ─ */}
            {currentStepData.type === "single-select" && (
              <div className="space-y-3 max-h-[380px] overflow-y-auto onboarding-scroll pr-1">
                {(currentStepData as SingleSelectStep).options.map((option) => {
                  const isSelected = answers[currentStepData.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSingleSelect(option.id)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-200 group cursor-pointer ${
                        isSelected
                          ? `bg-${currentStepData.accentColor}-900/30 ${accent.border} shadow-md shadow-${currentStepData.accentColor}-500/10`
                          : "bg-midnight-800 border-white/5 hover:border-white/20 hover:bg-midnight-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{option.icon}</div>
                        <div>
                          <p
                            className={`font-semibold ${isSelected ? accent.text : "text-slate-200"}`}
                          >
                            {option.label}
                          </p>
                          {option.description && (
                            <p className="text-sm text-slate-500 mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? `${accent.bg} ${accent.border}`
                            : "border-slate-600 group-hover:border-slate-400"
                        }`}
                      >
                        {isSelected && (
                          <Check size={14} className={accent.text} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─ MULTI SELECT ─ */}
            {currentStepData.type === "multi-select" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-slate-500">
                    {(answers[currentStepData.id] || []).length} selected
                  </span>
                  {(answers[currentStepData.id] || []).length > 0 && (
                    <button
                      onClick={() =>
                        setAnswers({ ...answers, [currentStepData.id]: [] })
                      }
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5 max-h-[340px] overflow-y-auto onboarding-scroll pr-1">
                  {(currentStepData as MultiSelectStep).options.map((tech) => {
                    const isSelected = (
                      answers[currentStepData.id] || []
                    ).includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => handleMultiSelect(tech)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? `${accent.bg} ${accent.border} ${accent.text} chip-enter shadow-sm`
                            : "bg-midnight-800 border-white/5 text-slate-300 hover:border-white/20 hover:bg-midnight-700"
                        }`}
                      >
                        {isSelected && (
                          <Check size={12} className="inline mr-1.5 -mt-0.5" />
                        )}
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─ SLIDER ─ */}
            {currentStepData.type === "slider" &&
              (() => {
                const step = currentStepData as SliderStep;
                const value = parseInt(
                  answers[step.id] ||
                    answers["weeklyHours"] ||
                    step.defaultValue,
                );
                return (
                  <div className="pt-4 pb-8">
                    <div className="text-center mb-10">
                      <span
                        className={`text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400`}
                      >
                        {value}
                      </span>
                      <span className="text-2xl text-slate-400 ml-2">
                        {step.unit}
                      </span>
                    </div>

                    <div className="px-2">
                      <input
                        type="range"
                        min={step.min}
                        max={step.max}
                        value={value}
                        onChange={(e) => handleSlider(e.target.value)}
                        className="onboarding-slider w-full"
                      />
                      <div className="flex justify-between mt-4">
                        {step.marks.map((mark) => (
                          <button
                            key={mark.value}
                            onClick={() => handleSlider(String(mark.value))}
                            className={`text-xs font-medium px-2 py-1 rounded-md transition-colors cursor-pointer ${
                              value === mark.value
                                ? `${accent.bg} ${accent.text}`
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {mark.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-midnight-800/50 border border-white/5">
                      <p className="text-slate-400 text-sm">
                        {value <= 5 &&
                          "💡 A light commitment — we'll prioritize high-impact micro-lessons."}
                        {value > 5 &&
                          value <= 15 &&
                          "⚡ Great balance — enough time for both theory and hands-on projects."}
                        {value > 15 &&
                          value <= 25 &&
                          "🔥 Serious dedication — you'll see rapid progress with this commitment."}
                        {value > 25 &&
                          "🚀 Full-time learner mode — we'll create an intensive accelerated plan!"}
                      </p>
                    </div>
                  </div>
                );
              })()}

            {/* ─ TEXT INPUTS ─ */}
            {currentStepData.type === "text-inputs" && (
              <div className="space-y-6">
                {(currentStepData as TextInputsStep).fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        {field.icon}
                      </div>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={answers[field.id] || ""}
                        onChange={(e) =>
                          handleTextInput(field.id, e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-4 bg-midnight-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white placeholder:text-slate-600 transition-all text-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─ TEXTAREA COMBO ─ */}
            {currentStepData.type === "textarea-combo" &&
              (() => {
                const step = currentStepData as TextAreaComboStep;
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {step.textareaLabel}
                      </label>
                      <div className="relative">
                        <Heart
                          size={16}
                          className="absolute left-4 top-4 text-slate-500"
                        />
                        <textarea
                          rows={4}
                          placeholder={step.textareaPlaceholder}
                          value={answers["motivation"] || ""}
                          onChange={(e) =>
                            handleTextareaCombo("motivation", e.target.value)
                          }
                          className="w-full pl-12 pr-4 py-4 bg-midnight-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 text-white placeholder:text-slate-600 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        {step.selectLabel}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {step.selectOptions.map((option) => {
                          const isSelected =
                            answers["careerGoal"] === option.id;
                          return (
                            <button
                              key={option.id}
                              onClick={() =>
                                handleTextareaCombo("careerGoal", option.id)
                              }
                              className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                                isSelected
                                  ? "bg-fuchsia-900/30 border-fuchsia-500 shadow-md"
                                  : "bg-midnight-800 border-white/5 hover:border-white/20"
                              }`}
                            >
                              <span className="text-xl">{option.icon}</span>
                              <span
                                className={`text-sm font-medium ${isSelected ? "text-fuchsia-300" : "text-slate-300"}`}
                              >
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation ── */}
        <div className="mt-10 flex justify-between items-center pt-6 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleBack}
            className={`text-slate-400 hover:text-white ${
              currentStep === 0
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="min-w-[140px]"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Sparkles size={16} className="mr-2" />
                Generate My Plan
              </>
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
