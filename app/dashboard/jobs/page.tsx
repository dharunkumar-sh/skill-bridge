"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function JobsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [profileData, setProfileData] = useState<any>(null);
  const [curatedJobs, setCuratedJobs] = useState<any[]>([]);
  const [searchJobs, setSearchJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("developer jobs in chicago");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch profile and AI-curated jobs from API
  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(
        `/api/user/profile?email=${encodeURIComponent(user.email)}`,
      );
      if (!res.ok) return;

      const data = await res.json();
      setProfileData(data.user || null);

      const targetRole = data.user?.targetRole || "software developer";
      const fallbackQuery = `${targetRole} jobs in united states`;
      const knownTechnologies = data.user?.knownTechnologies || "";

      const curatedParams = new URLSearchParams({
        mode: "curated",
        query: fallbackQuery,
        country: "us",
        date_posted: "all",
        num_pages: "1",
        targetRole,
        skills: knownTechnologies,
      });

      const curatedRes = await fetch(
        `/api/jobs/search?${curatedParams.toString()}`,
      );
      if (curatedRes.ok) {
        const curatedData = await curatedRes.json();
        setCuratedJobs(curatedData.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJobSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setSearchLoading(true);
    try {
      const params = new URLSearchParams({
        mode: "search",
        query: trimmedQuery,
        country: "us",
        date_posted: "all",
        page: "1",
        num_pages: "1",
      });

      const res = await fetch(`/api/jobs/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSearchJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Failed to search jobs:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const jobs: any[] = curatedJobs;

  // Known technologies for skill matching highlights
  const userSkills = new Set(
    (profileData?.knownTechnologies || user?.knownTechnologies || "")
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean),
  );

  // Group jobs
  const topMatches = jobs.filter((j: any) => j.matchScore >= 75);
  const goodFits = jobs.filter(
    (j: any) => j.matchScore >= 50 && j.matchScore < 75,
  );

  const getDisplayJobs = () => {
    if (activeTab === "top") return topMatches;
    if (activeTab === "good") return goodFits;
    return jobs;
  };

  const displayJobs = getDisplayJobs();

  function getScoreColor(score: number) {
    if (score >= 80)
      return {
        bg: "bg-emerald-500/15",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
      };
    if (score >= 60)
      return {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/30",
      };
    if (score >= 40)
      return {
        bg: "bg-amber-500/15",
        text: "text-amber-400",
        border: "border-amber-500/30",
      };
    return {
      bg: "bg-slate-500/15",
      text: "text-slate-400",
      border: "border-slate-500/30",
    };
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading AI-matched jobs...</p>
      </div>
    );
  }

  /* ── No Data Fallback ── */
  if (jobs.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Job Board</h1>
          <p className="text-slate-400">
            We are preparing API-powered AI job matches for your profile.
          </p>
        </div>
        <div className="text-center py-24 bg-midnight-900 border border-white/5 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 to-emerald-600/5 pointer-events-none" />
          <Briefcase className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 relative">
            Unlock AI-Matched Jobs
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6 relative">
            Complete your assessment so we can curate better API-powered
            opportunities.
          </p>
          <Button onClick={() => (window.location.href = "/onboarding")}>
            Complete Assessment <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI-Matched Jobs
          </h1>
          <p className="text-slate-400">
            {jobs.length} API opportunities curated by AI match scoring.{" "}
            {topMatches.length > 0 && (
              <span className="text-emerald-400 font-medium">
                {topMatches.length} top{" "}
                {topMatches.length === 1 ? "match" : "matches"}!
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: `All (${jobs.length})` },
            { id: "top", label: `🏆 Top (${topMatches.length})` },
            { id: "good", label: `👍 Good (${goodFits.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                  : "bg-midnight-800 border-white/5 text-slate-400 hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Job Cards ── */}
      <div className="bg-midnight-900 border border-white/5 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="grid gap-4">
          {displayJobs.map((job: any, idx: number) => {
            const scoreStyle = getScoreColor(job.matchScore || 0);
            return (
              <div
                key={idx}
                className="group flex flex-col lg:flex-row justify-between p-5 bg-midnight-950/50 hover:bg-midnight-800 border border-white/5 rounded-2xl transition-all items-start lg:items-center gap-5"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 border border-blue-800/50">
                    <Building2 size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {job.title}
                      </h3>
                      <span
                        className={`score-badge text-xs font-bold px-2.5 py-0.5 rounded-full border ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}
                      >
                        {job.matchScore}% Match
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm mb-2">
                      {job.company}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" />{" "}
                        {job.location}
                      </span>
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} className="text-slate-400" />{" "}
                          {job.salary}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-midnight-800 border border-white/5">
                        {job.type}
                      </span>
                    </div>

                    {job.reason && (
                      <p className="text-xs text-slate-400 leading-relaxed mb-3 max-w-xl">
                        💡 {job.reason}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {job.tags?.map((tag: string, i: number) => {
                        const hasSkill = userSkills.has(tag.toLowerCase());
                        return (
                          <span
                            key={i}
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border flex items-center gap-1 ${
                              hasSkill
                                ? "text-emerald-300 bg-emerald-900/20 border-emerald-500/20"
                                : "text-amber-300 bg-amber-900/20 border-amber-500/20"
                            }`}
                          >
                            {hasSkill ? (
                              <CheckCircle2 size={10} />
                            ) : (
                              <AlertCircle size={10} />
                            )}
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full lg:w-auto">
                  <a
                    href={job.applyUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full lg:w-auto"
                  >
                    <Button
                      disabled={!job.applyUrl}
                      className="w-full lg:w-auto group-hover:bg-blue-600 transition-colors shadow-none group-hover:shadow-lg group-hover:shadow-blue-500/20"
                    >
                      Apply Now <ExternalLink size={14} className="ml-1.5" />
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {displayJobs.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No jobs in this category.</p>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-6 text-xs text-slate-500 px-2">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-emerald-400" /> You have this
          skill
        </span>
        <span className="flex items-center gap-1.5">
          <AlertCircle size={12} className="text-amber-400" /> Skill to develop
        </span>
      </div>

      {/* ── Personal Search Section ── */}
      <div className="bg-midnight-900 border border-white/5 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-white">Search Jobs Yourself</h2>
          <p className="text-slate-400 text-sm mt-1">
            Run your own job search and apply directly from the results.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Example: frontend developer jobs in chicago"
              className="w-full pl-10 pr-4 py-2.5 bg-midnight-950 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <Button
            onClick={handleJobSearch}
            disabled={searchLoading || !searchQuery.trim()}
            className="md:w-auto"
          >
            {searchLoading ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <Search size={14} className="mr-2" />
            )}
            Search Jobs
          </Button>
        </div>

        {searchJobs.length > 0 && (
          <div className="grid gap-3">
            {searchJobs.map((job: any, idx: number) => (
              <div
                key={`${job.id || job.title}-${idx}`}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-midnight-950/50"
              >
                <div>
                  <h3 className="text-white font-semibold">{job.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {job.company} · {job.location}{" "}
                    {job.type ? `· ${job.type}` : ""}
                  </p>
                </div>
                <a
                  href={job.applyUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button disabled={!job.applyUrl} className="w-full md:w-auto">
                    Apply Now <ExternalLink size={14} className="ml-1.5" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}

        {!searchLoading && searchJobs.length === 0 && (
          <div className="text-sm text-slate-500 border border-white/5 bg-midnight-950/40 rounded-xl px-4 py-3">
            No personal search results yet. Enter a query and click Search Jobs.
          </div>
        )}
      </div>
    </div>
  );
}
