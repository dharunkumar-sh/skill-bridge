"use client";

import { useAuth } from "@/context/AuthContext";
import { Sparkles, MessageCircle, Clock, ArrowRight, UserCheck, Code } from "lucide-react";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AI_PERSONAS = [
  {
    name: "Sarah Jenkins",
    role: "Senior Staff Engineer",
    avatar: "👩‍💻",
    specialty: "System Design & Architecture",
    description: "Expert in distributed systems. Best for mock interviews on highly scalable backend architectures.",
    topic: "System Design Mock Interview & Architecture Review",
  },
  {
    name: "David Chen",
    role: "Tech Lead & Hiring Manager",
    avatar: "👨‍💻",
    specialty: "Data Structures & Algorithms",
    description: "Conducts realistic standard FAANG coding interviews. Specializes in optimized algorithmic problem solving.",
    topic: "DSA Mock Interview & Coding Evaluation",
  },
  {
    name: "Priya Sharma",
    role: "Engineering Manager",
    avatar: "👩🏽‍💼",
    specialty: "Career Strategy & Leadership",
    description: "Helps you navigate promotions, workplace conflict, resume reviews, and behavioral interview questions.",
    topic: "Career Growth & Behavioral Interview Prep",
  },
  {
    name: "Alex Rivera",
    role: "Senior Frontend Architect",
    avatar: "👨🏻‍🎨",
    specialty: "Modern UI & Performance",
    description: "React/Next.js expert. Deep dives into frontend system design, web vitals, and modern client-side architecture.",
    topic: "Frontend System Design & Performance Review",
  }
];

export default function MentorshipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.email) return;
      try {
        const res = await axios.get(`/api/mentorship/sessions?email=${encodeURIComponent(user.email)}`);
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [user?.email]);

  const startSession = async (persona: typeof AI_PERSONAS[0]) => {
    if (!user?.email) return;
    setStartingSessionId(persona.name);
    try {
      const res = await axios.post("/api/mentorship/sessions", {
        email: user.email,
        mentorName: persona.name,
        mentorRole: persona.role,
        mentorAvatar: persona.avatar,
        topic: persona.topic,
      });
      if (res.data.session?.id) {
        router.push(`/dashboard/mentorship/room/${res.data.session.id}`);
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      setStartingSessionId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/10 border border-indigo-500/20 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold mb-4 border border-indigo-500/30">
            <Sparkles size={14} /> AI-POWERED MENTORSHIP
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Futuristic Mentoring Hub</h1>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
            Practice mock interviews, get career advice, and evaluate system designs with our highly specialized, autonomous AI Mentors available 24/7.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Avatars */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck size={20} className="text-indigo-400" /> Choose Your Mentor Persona
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {AI_PERSONAS.map((persona, idx) => (
              <div key={idx} className="bg-midnight-900 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-midnight-950 flex items-center justify-center text-3xl border border-white/10 group-hover:scale-105 transition-transform shadow-lg">
                    {persona.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{persona.name}</h3>
                    <p className="text-indigo-400 text-sm font-medium">{persona.role}</p>
                  </div>
                </div>
                
                <div className="mb-5 flex-1">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-midnight-800 px-2.5 py-1 rounded-md mb-3 font-semibold">
                    <Code size={14} className="text-emerald-400"/> {persona.specialty}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{persona.description}</p>
                </div>

                <Button 
                  onClick={() => startSession(persona)} 
                  disabled={startingSessionId === persona.name}
                  className="w-full justify-between group-hover:bg-indigo-600 transition-colors shadow-none group-hover:shadow-lg group-hover:shadow-indigo-500/25"
                >
                  {startingSessionId === persona.name ? "Booting Link..." : "Start Session"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-slate-400" /> Past Sessions
          </h2>
          
          <div className="bg-midnight-900 border border-white/5 rounded-3xl p-2 shadow-xl">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading history...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <MessageCircle size={32} className="text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">No recent mentor sessions.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[500px] hide-scrollbar p-2 space-y-2">
                {sessions.map((session) => (
                  <button 
                    key={session.id}
                    onClick={() => router.push(`/dashboard/mentorship/room/${session.id}`)}
                    className="w-full text-left p-4 rounded-2xl bg-midnight-950/50 hover:bg-midnight-800 border border-white/5 hover:border-indigo-500/30 transition-all flex gap-4 items-center group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-midnight-900 flex items-center justify-center text-2xl shrink-0 group-hover:bg-indigo-500/10 transition-colors">
                      {session.mentorAvatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-white font-semibold text-sm truncate">{session.mentorName}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(session.lastActiveAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs truncate">{session.topic}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
