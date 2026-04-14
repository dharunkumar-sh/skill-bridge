"use client";

import { Bell, Search, Menu, LogOut, Settings, User, BookOpen, Briefcase, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "../ui/Button";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

const mockNotifications = [
  { id: 1, title: "Course Completed", message: "You have successfully completed Advanced React Patterns.", time: "10 min ago", unread: true },
  { id: 2, title: "New Mentor Available", message: "Sarah Drasner is now open to new mentees.", time: "2 hours ago", unread: true },
  { id: 3, title: "Job Alert", message: "New job matching your skills: Senior Frontend Engineer.", time: "1 day ago", unread: false },
];

const searchData = [
  { id: 1, type: "Course", title: "Advanced React Patterns", href: "/dashboard/courses", icon: BookOpen },
  { id: 2, type: "Mentor", title: "Sarah Drasner - UI/UX", href: "/dashboard/mentorship", icon: Users },
  { id: 3, type: "Job", title: "Senior Frontend Engineer", href: "/dashboard/jobs", icon: Briefcase },
  { id: 4, type: "Course", title: "Next.js Fullstack Masterclass", href: "/dashboard/courses", icon: BookOpen },
];

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const filteredSearch = searchData.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

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

        <div ref={searchRef} className="relative hidden sm:block w-full max-w-md">
          <div className="flex items-center gap-2 bg-midnight-900 border border-white/5 rounded-xl px-4 py-2 w-full focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search courses, mentors, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="bg-transparent border-none focus:outline-none text-sm text-white placeholder-slate-500 w-full"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-midnight-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              {filteredSearch.length > 0 ? (
                <div className="py-2">
                  {filteredSearch.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-midnight-800 transition-colors"
                      >
                        <div className="p-2 bg-midnight-800 rounded-lg text-blue-400">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="text-xs text-slate-400">{item.type}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
            className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Bell size={20} />
            {mockNotifications.some(n => n.unread) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-midnight-950"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-midnight-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <span className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">Mark all as read</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto hidden-scrollbar">
                {mockNotifications.map((notif) => (
                  <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-midnight-800 transition-colors cursor-pointer ${notif.unread ? "bg-blue-500/5" : ""}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-medium ${notif.unread ? "text-white" : "text-slate-300"}`}>{notif.title}</p>
                      <span className="text-[10px] text-slate-500">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-white/5 text-center">
                <button className="text-xs text-slate-400 hover:text-white transition-colors">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

        {/* Profile Dropdown */}
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
