"use client";

import { useAuth } from "@/context/AuthContext";
import { Search, Map, Clock, ArrowRight, PlayCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CoursesPage() {
  const { user } = useAuth();

  const courses = [
    { title: "Advanced React Patterns", level: "Intermediate", progress: 60, icon: "⚛️" },
    { title: "Next.js Full Stack App", level: "Advanced", progress: 20, icon: "▲" },
    { title: "PostgreSQL & Drizzle ORM", level: "Beginner", progress: 0, icon: "🐘" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Learning</h1>
          <p className="text-slate-400">Continue where you left off, {user?.name?.split(' ')[0] || 'Friend'}.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline"><Map size={16} className="mr-2"/> Browse Catalog</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Courses */}
        <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-blue-500" /> In Progress
          </h2>
          
          <div className="space-y-4">
            {courses.map((course, idx) => (
              <div key={idx} className="group p-4 bg-midnight-950/50 hover:bg-midnight-800 border border-white/5 rounded-xl transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">
                      {course.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{course.title}</h3>
                      <p className="text-xs text-slate-500">{course.level}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex rounded-full px-4"><PlayCircle size={16} className="mr-2"/> Resume</Button>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-midnight-950 rounded-full h-2 mb-1">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
                <div className="text-right text-xs text-slate-500 font-medium">{course.progress}% Completed</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Module */}
        <div className="bg-linear-to-br from-blue-900/40 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full"></div>
          
          <h2 className="text-xl font-bold text-white mb-2">Recommended for You</h2>
          <p className="text-slate-400 text-sm mb-6">Based on your interest in Frontend Development</p>
          
          <div className="bg-midnight-950/80 backdrop-blur-sm p-5 rounded-xl border border-white/5 shadow-lg mb-4">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded mb-3 inline-block">NEW MASTERCLASS</span>
            <h3 className="text-lg font-bold text-white mb-2">Advanced UI Animations</h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">Learn Framer Motion deeply and build layout animations, shared elements, and complex staggered effects.</p>
            <Button className="w-full">Start Masterclass <ArrowRight size={16} className="ml-2" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
