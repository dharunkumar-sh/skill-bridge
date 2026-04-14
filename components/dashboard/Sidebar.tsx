"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Users,
  Briefcase,
  Settings,
  Rocket,
  FileText,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Mentorship", href: "/dashboard/mentorship", icon: Users },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Resume AI", href: "/dashboard/resume", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-midnight-950/80 backdrop-blur-sm lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 w-64 bg-midnight-950/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-r from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Rocket size={18} />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Skill<span className="text-blue-400">Bridge</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto hidden-scrollbar">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group"
                >
                  {/* Active Indicator Background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-xl -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon
                    size={20}
                    className={`transition-colors ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"}`}
                  />
                  <span
                    className={
                      isActive
                        ? "text-blue-100 font-semibold"
                        : "text-slate-400 group-hover:text-slate-200"
                    }
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Upgrade Card */}
          <div className="p-4 border-t border-white/5">
            <div className="bg-linear-to-br from-midnight-800 to-midnight-900 border border-midnight-700 p-4 rounded-xl text-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <h4 className="text-white text-sm font-bold mb-1">Unlock Pro</h4>
              <p className="text-slate-400 text-xs mb-3">
                Get 1-on-1 expert mentorship.
              </p>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-md cursor-pointer">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
