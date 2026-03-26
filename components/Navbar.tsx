/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket, LogOut } from "lucide-react";
import Button from "./ui/Button";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "Courses", href: "#courses" },
  { name: "Mentorship", href: "#mentorship" },
  { name: "Jobs", href: "#jobs" },
  { name: "Pricing", href: "#pricing" },
];
export default function Navbar() {
  const {
    user,
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
  } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all border-b border-white/5 ${
        isScrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto px-2 sm:px-4 lg:px-6">
        <div
          className={`flex justify-between items-center transition-all duration-500 px-6 ${
            isScrolled
              ? "bg-midnight-950/70 backdrop-blur-xl py-3 rounded-2xl border border-white/5 shadow-2xl shadow-blue-500/10"
              : "bg-transparent py-2"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className={`rounded-xl flex items-center justify-center text-white transition-all duration-500 ${
                isScrolled
                  ? "w-9 h-9 bg-blue-600"
                  : "w-11 h-11 bg-linear-to-r from-blue-700 to-blue-500"
              } group-hover:scale-110 shadow-lg shadow-blue-500/30`}
            >
              <Rocket size={isScrolled ? 20 : 24} />
            </div>
            <span
              className={`font-bold tracking-tight transition-all duration-300 ${
                isScrolled ? "text-lg text-white" : "text-xl text-white"
              }`}
            >
              Skill<span className="text-blue-400">Bridge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-300 hover:text-white font-medium text-sm tracking-wide transition-all relative group/link"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover/link:w-full"></span>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    {user.picture && user.authProvider !== "credentials" ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-midnight-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-300 hidden lg:block">
                      {user.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-500! hover:text-red-400! hover:bg-red-500/10! px-2 flex items-center gap-1.5 transition-all hover:translate-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg"
                    onClick={() => {
                      setAuthMode("login");
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 rounded-lg px-6"
                    onClick={() => {
                      setAuthMode("signup");
                      setIsAuthModalOpen(true);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-300 hover:text-white transition-colors p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav UI */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="md:hidden absolute top-[calc(100%+12px)] left-4 right-4 bg-midnight-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40"
          >
            <div className="p-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-300 hover:text-blue-400 font-semibold text-lg py-1 transition-colors flex items-center justify-between"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20"></div>
                </Link>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <div className="flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                      {user.picture && user.authProvider !== "credentials" ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border border-midnight-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      fullWidth
                      className="text-red-400! hover:text-red-300! hover:bg-red-400/10! flex items-center justify-center gap-2 py-3 mt-2"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      fullWidth
                      className="text-slate-400 hover:text-white"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setAuthMode("login");
                        setIsAuthModalOpen(true);
                      }}
                    >
                      Log In
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setAuthMode("signup");
                        setIsAuthModalOpen(true);
                      }}
                    >
                      Sign Up Free
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </nav>
  );
}
