/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { CheckCircle2, TrendingUp, Zap, Target, BookOpen, Clock, Lightbulb, AlertTriangle, Compass, Loader2, Award, Briefcase, ChevronRight } from "lucide-react";
import CourseStatusModal from "@/components/dashboard/CourseStatusModal";

interface SkillGap {
  skill: string;
  estimatedWeeks: number;
  priority: "high" | "medium" | "low";
}

interface Milestone {
  timeline: string;
  title: string;
  description: string;
}

interface AIData {
  summary?: string;
  readinessScore: number;
  personalityInsight?: string;
  weeklyPlan: {
    theory: number;
    practice: number;
    projects: number;
  };
  skillGapAnalysis: SkillGap[];
  requiredSkills: string[];
  currentSkills?: string[];
  actionItems?: string[];
  milestones?: Milestone[];
}

interface EnrolledCourse {
  id: string;
  courseTitle: string;
  courseThumbnail?: string;
  status: string;
  deadlineAt?: string;
  progress?: number;
}

/* ── Circular Progress Component ── */
function ReadinessCircle({ score, label = "Ready" }: { score: number; label?: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="circular-progress w-full h-full" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white leading-none mb-1">{score}%</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span>
      </div>
    </div>
  );
}

/* ── Skeleton Loader ── */
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-midnight-900 border border-white/5 rounded-3xl p-6 animate-pulse ${className}`}>
      <div className="h-4 w-1/3 bg-midnight-700 rounded mb-4" />
      <div className="h-8 w-1/2 bg-midnight-700 rounded mb-3" />
      <div className="h-3 w-full bg-midnight-800 rounded mb-2" />
      <div className="h-3 w-2/3 bg-midnight-800 rounded" />
    </div>
  );
}

function UpdateProgressModal({ course, onClose, onSave }: { course: EnrolledCourse, onClose: () => void, onSave: (progress: number, completed: boolean) => Promise<void> }) {
  const [progress, setProgress] = useState(course.progress ?? 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(progress, progress === 100);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-midnight-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-midnight-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <h3 className="text-lg font-bold text-white mb-2">Update Progress</h3>
        <p className="text-xs text-slate-400 mb-6 truncate">{course.courseTitle}</p>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>0%</span>
            <span className="font-bold text-white text-base">{progress}%</span>
            <span>100%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress} 
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-midnight-950 rounded-lg appearance-none"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="primary" fullWidth onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { user, refreshUser } = useAuth();
  const [aiData, setAiData] = useState<AIData | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [overdueCourses, setOverdueCourses] = useState<EnrolledCourse[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updateCourse, setUpdateCourse] = useState<EnrolledCourse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch fresh data from DB
  const fetchDashboardData = useCallback(async () => {
    if (!user?.email) return;

    try {
      const [profileRes, coursesRes, deadlineRes] = await Promise.all([
        fetch(`/api/user/profile?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/user/courses?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/user/courses/check-deadlines?email=${encodeURIComponent(user.email)}`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const analysis = profileData.user?.aiAnalysis;
        try {
          const parsed = typeof analysis === "string" ? JSON.parse(analysis) : analysis;
          setAiData(parsed as AIData);
        } catch (e) {
          console.error("Failed to parse AI analysis", e);
        }
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setEnrolledCourses(coursesData.courses || []);
      }

      if (deadlineRes.ok) {
        const deadlineData = await deadlineRes.json();
        const overdue = deadlineData.overdueCourses || [];
        setOverdueCourses(overdue);
        if (overdue.length > 0) {
          setShowStatusModal(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Load on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Computed values
  const totalWeekly = aiData?.weeklyPlan
    ? aiData.weeklyPlan.theory + aiData.weeklyPlan.practice + aiData.weeklyPlan.projects
    : 0;

  const maxWeeks = aiData?.skillGapAnalysis
    ? Math.max(...aiData.skillGapAnalysis.map((g) => g.estimatedWeeks || 1), 4)
    : 4;

  const completedCourses = enrolledCourses.filter((c) => c.status === "completed").length;
  const activeCourses = enrolledCourses.filter((c) => c.status === "enrolled" || c.status === "in_progress").length;

  /* ── Course Manual Update Logic ── */
  const handleProgressUpdate = async (progress: number, completed: boolean) => {
    if (!updateCourse) return;
    try {
      await fetch("/api/user/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          courseId: updateCourse.id, 
          status: completed ? "completed" : "in_progress", 
          progress 
        })
      });
      await fetchDashboardData();
      setUpdateCourse(null);
    } catch (err) {
      console.error("Failed to update course progress", err);
    }
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3 mb-2">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="text-slate-400 text-sm">Loading your dashboard...</span>
        </div>
        <div className="grid lg:grid-cols-4 gap-6">
          <SkeletonCard className="lg:col-span-2 h-48" />
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <SkeletonCard className="h-[88px]" />
            <SkeletonCard className="h-[88px]" />
            <SkeletonCard className="h-[88px]" />
            <SkeletonCard className="h-[88px]" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="lg:col-span-2 h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Course Status Prompt Modal */}
      {showStatusModal && overdueCourses.length > 0 && (
        <CourseStatusModal
          courses={overdueCourses}
          onClose={() => setShowStatusModal(false)}
          onUpdate={() => {
            fetchDashboardData();
            refreshUser();
          }}
        />
      )}

      {/* Update Progress Modal */}
      {updateCourse && (
        <UpdateProgressModal 
          course={updateCourse} 
          onClose={() => setUpdateCourse(null)} 
          onSave={handleProgressUpdate} 
        />
      )}

      {/* ── Top Row: Hero & Stats ── */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Welcome & Readiness */}
        <div className="lg:col-span-2 bg-linear-to-br from-blue-900/30 to-indigo-900/10 border border-blue-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex-1 z-10 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Ready to level up, {user?.name?.split(" ")[0]}?
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
              {aiData?.summary || "Complete your onboarding to get your personalized learning path."}
            </p>
            {aiData?.personalityInsight && (
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl">
                <Lightbulb size={14} className="text-violet-400" />
                <span className="text-xs text-violet-300 font-medium line-clamp-1">{aiData.personalityInsight}</span>
              </div>
            )}
          </div>

          {aiData?.readinessScore != null && (
            <div className="z-10 shrink-0">
              <ReadinessCircle score={aiData.readinessScore} label="Role Match" />
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: "Courses Active", value: activeCourses || "—", icon: <BookOpen size={20} />, color: "text-blue-400", bg: "bg-blue-500/10 text-blue-400" },
            { label: "Completed", value: completedCourses || "—", icon: <CheckCircle2 size={20} />, color: "text-emerald-400", bg: "bg-emerald-500/10 text-emerald-400" },
            { label: "Skills Required", value: aiData?.requiredSkills?.length || "—", icon: <Zap size={20} />, color: "text-amber-400", bg: "bg-amber-500/10 text-amber-400" },
            { label: "Commitment", value: user?.weeklyHours ? `${user.weeklyHours}h / week` : "—", icon: <Clock size={20} />, color: "text-violet-400", bg: "bg-violet-500/10 text-violet-400" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-midnight-900 p-4 rounded-3xl border border-white/5 shadow-lg flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg}`}>{stat.icon}</div>
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold truncate capitalize ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Internship / Job Prompt for High Match ── */}
      {aiData?.readinessScore >= 75 && (
        <div className="bg-linear-to-r from-emerald-900/40 to-emerald-950/40 border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Award className="text-emerald-400 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                You're ready for the big leagues!
              </h2>
              <p className="text-sm text-slate-300">
                With a role match of <strong>{aiData.readinessScore}%</strong>, you've reached the top tier of candidates. Start applying for internships and jobs now.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/jobs"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap group shrink-0"
          >
            <Briefcase size={18} />
            Explore Opportunities
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* ── Enrolled Courses Progress (if any) ── */}
      {enrolledCourses.length > 0 && (
        <div className="bg-midnight-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" /> Your Enrolled Courses
          </h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {enrolledCourses.slice(0, 8).map((course, idx) => {
              const isCompleted = course.status === "completed";
              const isOverdue = course.deadlineAt && new Date(course.deadlineAt) < new Date() && !isCompleted;
              return (
                <div 
                  key={idx} 
                  onClick={() => !isCompleted && setUpdateCourse(course)}
                  className={`shrink-0 w-64 p-4 rounded-3xl border flex flex-col group/card transition-all duration-300 ${
                    !isCompleted ? "cursor-pointer hover:bg-midnight-800/50 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5" : ""
                  } ${
                    isCompleted ? "bg-emerald-950/10 border-emerald-500/20" : 
                    isOverdue ? "bg-rose-950/10 border-rose-500/20" : 
                    "bg-midnight-950/50 border-white/5"
                  }`}
                >
                  {course.courseThumbnail && (
                    <img src={course.courseThumbnail} alt="" className="w-full h-28 object-cover rounded-2xl mb-4 shadow-md" />
                  )}
                  <h4 className="text-sm font-semibold text-white line-clamp-2 mb-2">{course.courseTitle}</h4>
                  
                  <div className="mt-auto pt-2 space-y-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        isCompleted ? "bg-emerald-500/20 text-emerald-400" :
                        isOverdue ? "bg-rose-500/20 text-rose-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {isCompleted ? "✓ Done" : isOverdue ? "⏰ Overdue" : course.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Progress Bar computation based on performance/status */}
                    {(() => {
                      // Use actual progress from the database
                      const computedProgress = isCompleted ? 100 : course.progress ?? 0;
                      const barColor = isCompleted ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-blue-500";
                      
                      return (
                        <div className="w-full">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs text-slate-400 font-medium tracking-wide">Completion</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{computedProgress}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-midnight-900 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${computedProgress}%` }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[11px] text-slate-500 flex items-center gap-1.5 opacity-70">
            <Lightbulb size={12} className="text-amber-400 shrink-0" />
            Quick tip: Click on any active course card to manually adjust your progress and keep your role match score accurate.
          </p>
        </div>
      )}

      {/* ── Middle Row: Gaps & Plan ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Skill Gap */}
        <div className="lg:col-span-1 bg-midnight-900 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-400" /> Skill Gaps
            </h2>
            <span className="text-xs text-slate-500">Effort (Weeks)</span>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar space-y-5 max-h-[220px]">
            {!aiData?.skillGapAnalysis ? (
              <p className="text-slate-500 text-sm text-center mt-10">No data available.</p>
            ) : (
              aiData.skillGapAnalysis.map((gap: SkillGap, idx: number) => {
                const barColor = gap.priority === "high" ? "bg-rose-500" : gap.priority === "medium" ? "bg-amber-500" : "bg-emerald-500";
                const pct = Math.min(100, Math.max(10, ((gap.estimatedWeeks || 1) / maxWeeks) * 100));
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-semibold text-slate-200 truncate pr-2">{gap.skill}</span>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{gap.estimatedWeeks}w</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-midnight-800 overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly & Actions */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6 bg-midnight-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Clock size={16} className="text-blue-400" /> Weekly Distribution
            </h2>
            {totalWeekly > 0 ? (
              <>
                <div className="w-full h-8 flex rounded-xl overflow-hidden mb-5">
                  <div className="bg-blue-500 hover:opacity-90 transition-opacity" style={{ width: `${(aiData.weeklyPlan.theory / totalWeekly) * 100}%` }} />
                  <div className="bg-emerald-500 hover:opacity-90 transition-opacity border-l border-r border-midnight-900" style={{ width: `${(aiData.weeklyPlan.practice / totalWeekly) * 100}%` }} />
                  <div className="bg-amber-500 hover:opacity-90 transition-opacity" style={{ width: `${(aiData.weeklyPlan.projects / totalWeekly) * 100}%` }} />
                </div>
                <div className="grid grid-cols-1 gap-3 mt-auto">
                  {[
                    { label: "Theory & Video", color: "bg-blue-500", hours: aiData.weeklyPlan.theory },
                    { label: "Hands-on Practice", color: "bg-emerald-500", hours: aiData.weeklyPlan.practice },
                    { label: "Real Projects", color: "bg-amber-500", hours: aiData.weeklyPlan.projects },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-300"><span className={`w-3 h-3 rounded ${item.color}`} /> {item.label}</div>
                      <span className="font-semibold text-white">{item.hours}h</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-sm m-auto">No weekly plan data.</p>
            )}
          </div>

          <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-white/5 pt-5 sm:pt-0 sm:pl-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Target size={16} className="text-rose-400" /> Next Steps
            </h2>
            <div className="overflow-y-auto hide-scrollbar max-h-[160px] space-y-3 pr-2">
              {aiData?.actionItems ? aiData.actionItems.map((item: string, i: number) => (
                <div key={i} className="flex gap-3 text-slate-300 items-start">
                  <span className="mt-0.5 shrink-0 bg-blue-500/10 text-blue-400 rounded-full p-0.5">
                    <CheckCircle2 size={14} />
                  </span>
                  <span className="text-sm leading-tight">{item}</span>
                </div>
              )) : (
                <p className="text-slate-500 text-sm">No actions specified.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Roadmap ── */}
      {aiData?.milestones && aiData.milestones.length > 0 && (
        <div className="bg-midnight-900 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <Compass size={18} className="text-indigo-400" /> Roadmap
          </h2>
          <div className="relative pt-2 pb-4">
            <div className="absolute top-7 left-4 right-4 h-0.5 bg-midnight-800" />
            <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x pb-4">
              {aiData.milestones.map((ms, idx) => (
                <div key={idx} className="relative z-10 shrink-0 w-64 sm:w-72 snap-start flex flex-col pt-3">
                  <div className="w-8 h-8 rounded-full bg-midnight-950 border-4 border-indigo-500 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono mb-4 mx-auto md:mx-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    {idx + 1}
                  </div>
                  <div className="bg-midnight-950/50 border border-white/5 p-4 rounded-2xl h-full">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-1">{ms.timeline}</span>
                    <h3 className="text-slate-200 text-sm font-bold mb-2 leading-tight">{ms.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{ms.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Skills Comparison ── */}
      {(aiData?.currentSkills || aiData?.requiredSkills) && (
        <div className="bg-midnight-900 border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/5 bg-emerald-950/10">
            <h2 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} /> Acquired Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {aiData.currentSkills?.map((sk: string, i: number) => (
                <span key={i} className="text-xs font-medium bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/20">{sk}</span>
              ))}
            </div>
          </div>
          <div className="flex-1 p-6 bg-amber-950/10">
            <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} /> Skills to Master
            </h2>
            <div className="flex flex-wrap gap-2">
              {aiData.requiredSkills?.map((sk: string, i: number) => (
                <span key={i} className="text-xs font-medium bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded border border-amber-500/20">{sk}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
