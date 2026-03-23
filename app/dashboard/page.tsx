"use client";

import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function OverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-linear-to-r from-blue-900/20 to-indigo-900/10 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 relative">
          Good to see you, {user?.name}!
        </h1>
        <p className="text-slate-400 max-w-xl relative">
          Here is what&apos;s happening with your learning journey today. You have 1 pending assignment and 2 upcoming mentorship sessions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-midnight-900 p-6 rounded-2xl border border-white/5 shadow-lg hover:border-blue-500/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            📚
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Courses in Progress</h3>
          <p className="text-3xl font-bold text-white">4</p>
        </div>
        <div className="bg-midnight-900 p-6 rounded-2xl border border-white/5 shadow-lg hover:border-emerald-500/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            ⭐
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Completed Skills</h3>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="bg-midnight-900 p-6 rounded-2xl border border-white/5 shadow-lg hover:border-amber-500/30 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            ⏱️
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">Upcoming Sessions</h3>
          <p className="text-3xl font-bold text-white">2</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-slate-500 text-sm">No recent activity to show.</p>
            <Button variant="ghost" size="sm" className="mt-4 text-blue-400">Jump back in</Button>
          </div>
        </div>
        
        <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Skill Assessment Match</h2>
          <div className="text-center py-12 bg-midnight-950/50 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 to-purple-600/5 pointer-events-none"></div>
            <p className="text-slate-300 text-sm max-w-sm mx-auto mb-4">Take our 5-minute AI assessment to build your hyper-personalized learning path.</p>
            <Button>Take Assessment</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
