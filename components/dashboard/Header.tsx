"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "../ui/Button";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-midnight-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      
      {/* Left side: Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-midnight-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-midnight-900 border border-white/5 rounded-xl px-4 py-2 w-full max-w-md focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
          <Search size={18} className="text-slate-500" />
          <input 
            type="text" 
            placeholder="Search courses, mentors, jobs..."
            className="bg-transparent border-none focus:outline-none text-sm text-white placeholder-slate-500 w-full"
          />
        </div>
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-midnight-950"></span>
        </button>

        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white leading-tight">{user.name}</div>
              <div className="text-xs text-slate-400">Student</div>
            </div>
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-blue-500/20 shadow-md object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {user.name?.charAt(0)}
              </div>
            )}
          </div>
        ) : (
          <Button size="sm" onClick={() => window.location.href = '/'}>Go Home</Button>
        )}
      </div>

    </header>
  );
}
