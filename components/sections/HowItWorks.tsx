"use client";

import { motion } from "framer-motion";
import { Compass, GraduationCap, Briefcase } from "lucide-react";

const steps = [
  {
    title: "Take Skill Assessment",
    description: "We analyze your current skills, background, and career goals to identify exactly what you need to learn.",
    icon: <Compass size={32} className="text-white" />,
    color: "from-purple-500 to-indigo-600"
  },
  {
    title: "Learn with Personalized Paths",
    description: "Get a customized learning roadmap featuring interactive courses, real-world projects, and expert mentoring.",
    icon: <GraduationCap size={32} className="text-white" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Get Matched & Placed",
    description: "Our AI matches you with perfect roles. We help you with interviews, portfolios, and salary negotiation.",
    icon: <Briefcase size={32} className="text-white" />,
    color: "from-emerald-400 to-teal-500"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-midnight-900 relative overflow-hidden" id="mentorship">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your Path to Success in 3 Steps
          </h2>
          <p className="text-lg text-slate-400">
            A proven framework that takes you from where you are to where you want to be.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-midnight-700 z-0"></div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Number Badge */}
                <div className="absolute -top-4 -left-2 md:left-1/2 md:-translate-x-[60px] w-8 h-8 rounded-full bg-midnight-800 border-2 border-midnight-700 flex items-center justify-center text-white font-bold shadow-lg z-20">
                  {idx + 1}
                </div>
                
                {/* Icon Circle */}
                <div className={`w-24 h-24 rounded-full bg-linear-to-br ${step.color} p-1 mb-8 shadow-xl`}>
                  <div className="w-full h-full rounded-full border-4 border-white/20 flex items-center justify-center bg-transparent backdrop-blur-sm">
                    {step.icon}
                  </div>
                </div>

                <div className="bg-midnight-800 rounded-2xl p-8 shadow-sm border border-midnight-700 w-full h-full hover:shadow-lg hover:border-midnight-600 transition-all">
                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
