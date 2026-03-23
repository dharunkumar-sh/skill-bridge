"use client";

import { useAuth } from "@/context/AuthContext";
import { Calendar, Video, Star, Clock, UserCheck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function MentorshipPage() {
  const { user } = useAuth();

  const mentors = [
    { name: "Sarah Jenkins", role: "Senior Frontend Engineer at Google", rating: 4.9, sessions: 124, image: "👩‍💻" },
    { name: "David Chen", role: "Staff Software Engineer at Meta", rating: 5.0, sessions: 89, image: "👨‍💻" },
    { name: "Priya Sharma", role: "Engineering Manager at Netflix", rating: 4.8, sessions: 210, image: "👩🏽‍💼" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">1-on-1 Mentorship</h1>
          <p className="text-slate-400">Book sessions with industry experts to accelerate your growth.</p>
        </div>
        <Button><Calendar size={16} className="mr-2"/> Book a Session</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Session */}
        <div className="lg:col-span-1 bg-linear-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold mb-6">
              <Video size={14} /> UPCOMING SESSION
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">System Design Mock Interview</h3>
            <p className="text-slate-400 text-sm mb-6">with David Chen</p>
            
            <div className="flex items-center gap-3 text-slate-300 text-sm mb-8 bg-midnight-950/50 p-3 rounded-xl border border-white/5">
              <Clock size={16} className="text-indigo-400" />
              <span>Today at 4:00 PM EST (45 mins)</span>
            </div>
          </div>
          
          <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-700">Join Meeting Space</Button>
        </div>

        {/* Recommended Mentors */}
        <div className="lg:col-span-2 bg-midnight-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck size={20} className="text-emerald-500" /> Recommended Mentors
            </h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</button>
          </div>
          
          <div className="space-y-4">
            {mentors.map((mentor, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-midnight-950/50 hover:bg-midnight-800 border border-white/5 rounded-2xl transition-all">
                <div className="w-16 h-16 rounded-full bg-midnight-800 flex items-center justify-center text-3xl border border-white/5 shrink-0">
                  {mentor.image}
                </div>
                
                <div className="text-center sm:text-left flex-1 shrink-0 min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{mentor.name}</h3>
                  <p className="text-slate-400 text-sm truncate">{mentor.role}</p>
                </div>
                
                <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                      <Star size={14} className="fill-amber-400" /> {mentor.rating}
                    </div>
                    <div className="text-slate-500 text-xs">({mentor.sessions} sessions)</div>
                  </div>
                  <Button variant="outline" size="sm" className="hidden sm:block">View Profile</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
