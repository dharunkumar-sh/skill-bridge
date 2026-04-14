"use client";

import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  Github,
  FolderGit2,
  Check,
  Loader2,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";

type SettingsTab = "billing" | "projects";

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("billing");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedRepos, setConnectedRepos] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  // Fetch repositories when user has GitHub connected
  useEffect(() => {
    if (user?.githubUsername && activeTab === "projects") {
      fetchRepositories();
    }
  }, [user?.githubUsername, activeTab]);

  const fetchRepositories = async () => {
    if (!user?.githubUsername) return;

    setIsLoadingRepos(true);
    try {
      const response = await fetch(
        `/api/github/repos?username=${user.githubUsername}`,
      );
      const data = await response.json();

      if (response.ok) {
        setConnectedRepos(data.repos || []);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleConnectGitHub = async () => {
    if (!githubUsername.trim()) {
      alert("Please enter a GitHub username");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          githubUsername: githubUsername.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user data
        if (user) {
          const updatedUser = {
            ...user,
            githubUsername: githubUsername.trim(),
          };
          login(updatedUser);
        }
        setShowGithubModal(false);
        setGithubUsername("");
      } else {
        alert(data.error || "Failed to connect GitHub");
      }
    } catch (error) {
      console.error("Error connecting GitHub:", error);
      alert("An error occurred while connecting GitHub");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAnalyzeRepos = async () => {
    if (!user?.email || connectedRepos.length === 0) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          repos: connectedRepos,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Repository analysis complete!\n\nSkill Level: ${data.analysis.skillLevel}\nPrimary Languages: ${data.analysis.primaryLanguages.join(", ")}\nTotal Repos: ${data.analysis.totalRepos}\nTotal Stars: ${data.analysis.totalStars}`,
        );
      } else {
        alert("Failed to analyze repositories. Please try again.");
      }
    } catch (error) {
      console.error("Error analyzing repos:", error);
      alert("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">
          Manage your subscription and connected projects.
        </p>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8">
        {/* Settings Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${
              activeTab === "billing"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <CreditCard size={18} /> Billing & Plan
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`w-full flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors cursor-pointer ${
              activeTab === "projects"
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <FolderGit2 size={18} /> Projects
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-midnight-900 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          {/* Billing & Plan Tab */}
          {activeTab === "billing" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Billing & Plan
                </h2>
                <p className="text-slate-400">
                  Manage your subscription and payment methods.
                </p>
              </div>

              {/* Current Plan */}
              <div className="bg-midnight-950 border border-white/5 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Current Plan
                    </h3>
                    <p className="text-sm text-slate-400">
                      You are currently on the Free plan
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-semibold rounded-full border border-blue-800/30">
                    FREE
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={16} className="text-emerald-400" />
                    <span>Access to 50+ basic courses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={16} className="text-emerald-400" />
                    <span>Community peer support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={16} className="text-emerald-400" />
                    <span>Basic job listings access</span>
                  </div>
                </div>

                <Button variant="primary" fullWidth>
                  Upgrade to Professional
                </Button>
              </div>

              {/* Available Plans */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  Available Plans
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Professional Plan */}
                  <div className="bg-midnight-950 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="relative">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold text-white">
                          ₹2,999
                        </span>
                        <span className="text-slate-500">/mo</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        Professional
                      </h4>
                      <p className="text-sm text-slate-400 mb-4">
                        For serious learners looking for jobs
                      </p>

                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-blue-400" />
                          <span>All Free features</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-blue-400" />
                          <span>1-on-1 mentoring (5 sessions/mo)</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-blue-400" />
                          <span>AI Job Matching</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-blue-400" />
                          <span>Resume review</span>
                        </li>
                      </ul>

                      <Button variant="primary" fullWidth size="sm">
                        Select Plan
                      </Button>
                    </div>
                  </div>

                  {/* Premium Plan */}
                  <div className="bg-midnight-950 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                    <div className="relative">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold text-white">
                          ₹4,999
                        </span>
                        <span className="text-slate-500">/mo</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">
                        Premium
                      </h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Ultimate track with guarantees
                      </p>

                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-amber-400" />
                          <span>All Professional features</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-amber-400" />
                          <span>Unlimited mentoring</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-amber-400" />
                          <span>Priority job placement</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-300">
                          <Check size={14} className="text-amber-400" />
                          <span>Salary negotiation support</span>
                        </li>
                      </ul>

                      <Button variant="outline" fullWidth size="sm">
                        Select Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  Payment Method
                </h3>
                <div className="bg-midnight-950 border border-white/5 rounded-2xl p-6 text-center">
                  <p className="text-slate-400 text-sm mb-4">
                    No payment method added
                  </p>
                  <Button variant="outline" size="sm">
                    Add Payment Method
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Connected Projects
                </h2>
                <p className="text-slate-400">
                  Connect your GitHub repositories to analyze your skills and
                  showcase your work.
                </p>
              </div>

              {/* GitHub Connection */}
              <div className="bg-linear-to-br from-midnight-950 to-midnight-900 border border-white/5 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-midnight-800 border border-white/5 flex items-center justify-center">
                      <Github size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        GitHub Repositories
                      </h3>
                      <p className="text-sm text-slate-400">
                        Connect your GitHub username to analyze repositories
                      </p>
                    </div>
                  </div>
                  {user?.githubUsername ? (
                    <div className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-800/30 flex items-center gap-1">
                      <Check size={12} />@{user.githubUsername}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGithubModal(true)}
                    >
                      Connect GitHub
                    </Button>
                  )}
                </div>

                {user?.githubUsername && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white">
                        Your Repositories
                      </h4>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAnalyzeRepos}
                        disabled={isAnalyzing || connectedRepos.length === 0}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Skills"
                        )}
                      </Button>
                    </div>

                    {isLoadingRepos ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">
                          Loading repositories...
                        </p>
                      </div>
                    ) : connectedRepos.length > 0 ? (
                      <div className="space-y-3">
                        {connectedRepos.map((repo) => (
                          <div
                            key={repo.id}
                            className="flex items-center justify-between p-4 bg-midnight-900 border border-white/5 rounded-xl hover:border-blue-500/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <FolderGit2
                                size={18}
                                className="text-blue-400 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                  {repo.name}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  {repo.language && (
                                    <span className="text-xs text-slate-400">
                                      {repo.language}
                                    </span>
                                  )}
                                  <span className="text-xs text-slate-500">
                                    ⭐ {repo.stars}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    🔱 {repo.forks}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 ml-4"
                            >
                              View →
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                        <FolderGit2
                          size={32}
                          className="text-slate-600 mx-auto mb-3"
                        />
                        <p className="text-slate-400 text-sm mb-2">
                          No repositories found
                        </p>
                        <p className="text-slate-500 text-xs">
                          Make sure your GitHub profile has public repositories
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Skill Analysis Info */}
              <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  How Skill Analysis Works
                </h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      We analyze your code, languages, frameworks, and libraries
                      used
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      Identify your skill level based on code complexity and
                      patterns
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      Recommend personalized courses to fill skill gaps
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      Match you with relevant job opportunities based on your
                      expertise
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Username Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
          <div className="bg-midnight-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Connect GitHub</h3>
              <button
                onClick={() => setShowGithubModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Enter your GitHub username to connect your repositories
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                GitHub Username
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. octocat"
                className="w-full px-4 py-3 bg-midnight-950 border border-midnight-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-600"
                onKeyPress={(e) => e.key === "Enter" && handleConnectGitHub()}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowGithubModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleConnectGitHub}
                disabled={isConnecting || !githubUsername.trim()}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
