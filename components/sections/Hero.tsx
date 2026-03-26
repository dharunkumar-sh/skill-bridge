"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Star, Users } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { user, setIsAuthModalOpen, setAuthMode } = useAuth();
  const router = useRouter();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-midnight-900">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-900/40 blur-[100px] opacity-70" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[120px] opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 text-blue-300 font-medium text-sm mb-6 border border-blue-800/50">
              <Star size={16} className="fill-blue-400" />
              <span>Rated #1 Career Platform 2024</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-h1 font-bold tracking-tight text-white leading-tight mb-6">
              Bridge Your Skills to Your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">Dream Job</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl">
              Master in-demand skills. Get matched with jobs. Earn 40-50% more. 
              Join India&apos;s fastest-growing skill-to-employment platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button 
                size="lg" 
                className="group"
                onClick={() => {
                  if (user) {
                    router.push("/dashboard");
                  } else {
                    setAuthMode("signup");
                    setIsAuthModalOpen(true);
                  }
                }}
              >
                {user ? "Go to Dashboard" : "Start Learning Free"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

          </motion.div>

          {/* Right Visual (Abstract UI representation) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Main dashboard mock */}
            <div className="relative z-10 w-full max-w-lg bg-midnight-800 rounded-2xl shadow-2xl shadow-black/50 border border-midnight-700 overflow-hidden">
              <div className="bg-midnight-950 border-b border-midnight-700 p-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/50"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-white text-lg">Your Learning Path</h3>
                    <p className="text-sm text-slate-400">Data Analytics to Data Scientist</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-800/50">
                    68%
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  {[
                    { title: "Python for Data Analysis", status: "Completed", icon: <CheckCircle2 size={18} className="text-emerald-400" /> },
                    { title: "Machine Learning Basics", status: "In Progress", icon: <div className="w-2 h-2 rounded-full bg-blue-400 mx-1"></div> },
                    { title: "Deep Learning with PyTorch", status: "Locked", icon: <div className="w-2 h-2 rounded-full bg-slate-600 mx-1"></div> }
                  ].map((course, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-midnight-700/50 hover:bg-midnight-700/30 transition-colors">
                      <div className="flex items-center gap-3">
                        {course.icon}
                        <span className="font-medium text-slate-200 text-sm">{course.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.status === 'Completed' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30' : 
                        course.status === 'In Progress' ? 'bg-blue-900/30 text-blue-400 border border-blue-800/30' : 'bg-midnight-700/50 text-slate-500'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-linear-to-r from-blue-400 to-indigo-400 rounded-xl p-5 text-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold mb-1">New Job Match!</h4>
                    <p className="text-blue-100 text-sm">Data Analyst at TechCorp</p>
                  </div>
                  <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">Apply</Button>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 top-20 bg-midnight-800 p-4 rounded-xl shadow-2xl border border-midnight-700 z-20 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400 border border-emerald-800/30">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Hired this week</p>
                <p className="text-xl font-bold text-white">432 Students</p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
