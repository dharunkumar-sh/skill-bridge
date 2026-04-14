"use client";

import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function CoursesPage() {
  const { user } = useAuth();
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"recommended" | "enrolled">(
    "recommended",
  );

  // Dynamic state
  const [aiData, setAiData] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Fetch AI-recommended courses and enrolled courses from DB
  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    try {
      const [profileRes, enrollRes] = await Promise.all([
        fetch(`/api/user/profile?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/user/courses?email=${encodeURIComponent(user.email)}`),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        const analysis = data.user?.aiAnalysis;
        setAiData(
          typeof analysis === "string" ? JSON.parse(analysis) : analysis,
        );
      }
      if (enrollRes.ok) {
        const data = await enrollRes.json();
        setEnrolledCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Failed to fetch course data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh every 2 min
  useEffect(() => {
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Enroll in a course
  const handleEnroll = async (course: any, source: string) => {
    if (!user?.email) return;
    const enrollId = course.id || course.title;
    setEnrollingId(enrollId);

    try {
      await axios.post("/api/user/courses", {
        email: user.email,
        courseTitle: course.title || course.name,
        courseUrl: course.url || course.link || null,
        courseSource: source,
        courseThumbnail: course.thumbnail || course.image || null,
        courseInstructor: course.instructor || course.author || null,
        priority: course.priority || "medium",
        durationWeeks: parseInt(course.duration) || 4,
      });

      // Refresh enrolled courses
      await fetchData();
    } catch (err: any) {
      if (err.response?.status !== 409) {
        console.error("Failed to enroll:", err);
      }
    } finally {
      setEnrollingId(null);
    }
  };

  const isEnrolled = (title: string) => {
    return enrolledCourses.some(
      (c) => c.courseTitle.toLowerCase() === title.toLowerCase(),
    );
  };

  const courses: any[] = Array.isArray(aiData?.recommendedCourses)
    ? aiData.recommendedCourses
    : [];

  const filteredCourses =
    filterPriority === "all"
      ? courses
      : courses.filter((c: any) => c.priority === filterPriority);

  const priorityConfig: Record<
    string,
    { bg: string; text: string; border: string; label: string }
  > = {
    high: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
      label: "High Priority",
    },
    medium: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      label: "Medium",
    },
    low: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      label: "Nice to Have",
    },
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Tab Navigation ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Courses</h1>
          <p className="text-slate-400 text-sm">
            {enrolledCourses.length > 0 && (
              <span className="text-emerald-400 font-medium mr-2">
                {enrolledCourses.filter((c) => c.status === "completed").length}
                /{enrolledCourses.length} completed
              </span>
            )}
            AI-curated courses just for you.
          </p>
        </div>

        <div className="flex gap-2">
          {(
            [
              { id: "recommended", label: "⭐ AI Picks" },
              {
                id: "enrolled",
                label: `📚 My Courses (${enrolledCourses.length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-midnight-800 border-white/5 text-slate-400 hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ TAB: RECOMMENDED (AI-CURATED) ═══════════ */}
      {activeTab === "recommended" && (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-24 bg-midnight-900 border border-white/5 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 to-indigo-600/5 pointer-events-none" />
              <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2 relative">
                Unlock Personalized Courses
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6 relative">
                Complete your onboarding assessment to get AI-curated courses.
              </p>
              <Button onClick={() => (window.location.href = "/onboarding")}>
                Complete Assessment <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          ) : (
            <>
              {/* Priority Filter */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "All" },
                  { id: "high", label: "🔴 High" },
                  { id: "medium", label: "🟡 Medium" },
                  { id: "low", label: "🟢 Low" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterPriority(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      filterPriority === f.id
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        : "bg-midnight-800 border-white/5 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {filteredCourses.map((course: any, idx: number) => {
                  const pc =
                    priorityConfig[course.priority] || priorityConfig.medium;
                  const enrolled = isEnrolled(course.title);
                  return (
                    <div
                      key={idx}
                      className="group bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl hover:border-indigo-500/20 transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {course.icon || "📚"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-500">
                                {course.level}
                              </span>
                              {course.duration && (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  · <Clock size={10} /> {course.duration}
                                </span>
                              )}
                              {course.platform && (
                                <span className="text-xs text-indigo-400 font-medium">
                                  {course.platform}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${pc.bg} ${pc.text} ${pc.border} border shrink-0 ml-2`}
                        >
                          {pc.label}
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 mb-3 leading-relaxed line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {course.skills?.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold uppercase text-blue-300 bg-blue-900/20 px-2 py-0.5 rounded-md border border-blue-500/10"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-col gap-2">
                        {course.url && course.url !== "#" && (
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 transition-colors cursor-pointer"
                          >
                            Go to Course <ExternalLink size={14} />
                          </a>
                        )}
                        {enrolled ? (
                          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
                            <CheckCircle2 size={16} /> Enrolled
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              handleEnroll(course, "ai_recommended")
                            }
                            disabled={
                              enrollingId === (course.id || course.title)
                            }
                          >
                            {enrollingId === (course.id || course.title) ? (
                              <Loader2
                                size={14}
                                className="animate-spin mr-2"
                              />
                            ) : (
                              <Plus size={14} className="mr-2" />
                            )}
                            Enroll & Track
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ═══════════ TAB: MY ENROLLED COURSES ═══════════ */}
      {activeTab === "enrolled" && (
        <>
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-24 bg-midnight-900 border border-white/5 rounded-3xl shadow-xl">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                No Enrolled Courses
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Enroll in AI-recommended courses to start tracking your
                progress.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {enrolledCourses.map((course, idx) => {
                const isCompleted = course.status === "completed";
                const isOverdue =
                  course.deadlineAt &&
                  new Date(course.deadlineAt) < new Date() &&
                  !isCompleted;
                const daysLeft = course.deadlineAt
                  ? Math.ceil(
                      (new Date(course.deadlineAt).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : null;

                return (
                  <div
                    key={idx}
                    className={`bg-midnight-900 border rounded-2xl p-5 shadow-xl ${isCompleted ? "border-emerald-500/20" : isOverdue ? "border-rose-500/20" : "border-white/5"}`}
                  >
                    <div className="flex items-start gap-4">
                      {course.courseThumbnail ? (
                        <img
                          src={course.courseThumbnail}
                          alt=""
                          className="w-20 h-14 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <BookOpen size={20} className="text-indigo-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">
                          {course.courseTitle}
                        </h3>
                        {course.courseInstructor && (
                          <p className="text-xs text-slate-500 mb-2">
                            {course.courseInstructor}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-400"
                                : isOverdue
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {isCompleted
                              ? "✓ Completed"
                              : isOverdue
                                ? "⏰ Overdue"
                                : course.status}
                          </span>

                          {daysLeft !== null && !isCompleted && (
                            <span
                              className={`text-[10px] font-medium ${daysLeft > 0 ? "text-slate-500" : "text-rose-400"}`}
                            >
                              {daysLeft > 0
                                ? `${daysLeft}d left`
                                : `${Math.abs(daysLeft)}d overdue`}
                            </span>
                          )}

                          <span className="text-[10px] text-slate-600 uppercase">
                            {course.courseSource}
                          </span>
                        </div>
                      </div>
                    </div>

                    {course.courseUrl && (
                      <a
                        href={course.courseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-midnight-800 border border-white/5 text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400 transition-all cursor-pointer"
                      >
                        Continue on{" "}
                        {course.courseSource === "udemy" ? "Udemy" : "Platform"}{" "}
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
