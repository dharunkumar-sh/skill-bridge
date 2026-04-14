/* eslint-disable @next/next/no-img-element */
"use client";

import { Bell, Search, Menu, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "../ui/Button";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="h-20 bg-midnight-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Mobile Menu Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-midnight-800 rounded-lg transition-colors cursor-pointer"
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
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-midnight-950"></span>
        </button>

        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white leading-tight">
                  {user.name}
                </div>
                <div className="text-xs text-slate-400">Student</div>
              </div>
              {user.picture && user.authProvider !== "credentials" ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border-2 border-blue-500/20 shadow-md object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user.name?.charAt(0)}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-midnight-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="text-sm font-semibold text-white">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {user.email}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/dashboard/profile");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-midnight-800 hover:text-white transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-midnight-800 hover:text-white transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-white/5 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button size="sm" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        )}
      </div>
    </header>
  );
}
