"use client";

import { useAuth } from "@/context/AuthContext";
import { Mail, Calendar, Award, Target, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const { user } = useAuth();

  const getMindsetLabel = (mindset: string | null | undefined) => {
    const labels: Record<string, string> = {
      student: "Student looking for first job",
      professional_pivot: "Professional looking to pivot",
      upskilling: "Looking for upskilling",
      freelancer: "Freelancer/Consultant",
    };
    return mindset ? labels[mindset] || mindset : "Not specified";
  };

  const getSkillStatusLabel = (status: string | null | undefined) => {
    const labels: Record<string, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    };
    return status ? labels[status] || status : "Not assessed";
  };

  const getCareerGoalLabel = (goal: string | null | undefined) => {
    const labels: Record<string, string> = {
      new_job: "Get a new higher-paying job",
      learn_skill: "Learn a specific highly-valued skill",
      network: "Expand professional network",
    };
    return goal ? labels[goal] || goal : "Not specified";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400">
          View and manage your profile information.
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-linear-to-br from-blue-900/20 to-indigo-900/10 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Photo */}
          <div className="shrink-0">
            {user?.picture && user?.authProvider !== "credentials" ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-32 h-32 rounded-2xl border-4 border-midnight-950 shadow-xl object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold border-4 border-midnight-950 shadow-xl">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
            <div className="flex flex-col md:flex-row items-center gap-4 text-slate-300 mb-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-500" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-500" />
                <span className="text-sm">Joined March 2024</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {user?.subscriptionPlan && user?.subscriptionStatus === "active" && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {user.subscriptionPlan === "premium" ? "👑 Premium Plan" : "✨ Pro Member"}
                </span>
              )}
              <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-semibold rounded-full border border-blue-800/30">
                {user?.authProvider === "google"
                  ? "Google Account"
                  : user?.authProvider === "github"
                    ? "GitHub Account"
                    : "Email Account"}
              </span>
              {user?.githubUsername && (
                <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs font-semibold rounded-full border border-slate-700">
                  @{user.githubUsername}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Career Journey */}
        <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-900/30 flex items-center justify-center">
              <Target size={20} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Career Journey</h3>
          </div>
          <p className="text-slate-300">{getMindsetLabel(user?.mindset)}</p>
        </div>

        {/* Skill Level */}
        <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/30 flex items-center justify-center">
              <Award size={20} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Skill Level</h3>
          </div>
          <p className="text-slate-300">
            {getSkillStatusLabel(user?.skillStatus)}
          </p>
        </div>

        {/* Career Goal */}
        <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-900/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Primary Goal</h3>
          </div>
          <p className="text-slate-300">
            {getCareerGoalLabel(user?.careerGoal)}
          </p>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6">
          Learning Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">4</div>
            <div className="text-sm text-slate-400">Courses Enrolled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-1">12</div>
            <div className="text-sm text-slate-400">Skills Learned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">2</div>
            <div className="text-sm text-slate-400">Mentorship Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">68%</div>
            <div className="text-sm text-slate-400">Overall Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
}
