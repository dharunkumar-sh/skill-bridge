"use client";

import { BrainCircuit, Rocket, MessageCircle, Target, Smartphone, ShieldCheck } from "lucide-react";
import Card from "../ui/Card";

const features = [
  {
    title: "AI-Powered Skill Gap Analysis",
    description: "Know exactly what skills you need to learn. Our proprietary algorithm compares your profile against millions of job descriptions.",
    icon: <BrainCircuit size={28} className="text-blue-400" />,
    bg: "bg-blue-900/30 border-blue-800/20"
  },
  {
    title: "Real-World Projects",
    description: "Stop watching videos and start building. Work on actual company datasets and build a portfolio that gets you hired.",
    icon: <Rocket size={28} className="text-emerald-400" />,
    bg: "bg-emerald-900/30 border-emerald-800/20"
  },
  {
    title: "Live Expert Mentoring",
    description: "Get unstuck faster. Access 24/7 doubt clearing sessions and 1-on-1 career guidance with seasoned industry professionals.",
    icon: <MessageCircle size={28} className="text-purple-400" />,
    bg: "bg-purple-900/30 border-purple-800/20"
  },
  {
    title: "Job Matching Algorithm",
    description: "Don't just apply blindly. Get highly curated job recommendations where you have the highest statistical probability of succeeding.",
    icon: <Target size={28} className="text-amber-400" />,
    bg: "bg-amber-900/30 border-amber-800/20"
  },
  {
    title: "Flexible Learning",
    description: "Learn at your own pace. Download lessons for offline viewing and access content seamlessly across desktop and mobile devices.",
    icon: <Smartphone size={28} className="text-rose-400" />,
    bg: "bg-rose-900/30 border-rose-800/20"
  },
  {
    title: "Placement Guarantee",
    description: "We are heavily invested in your success. Get a job placement within 6 months of graduation, or get your money back.",
    icon: <ShieldCheck size={28} className="text-indigo-400" />,
    bg: "bg-indigo-900/30 border-indigo-800/20"
  }
];

export default function KeyFeatures() {
  return (
    <section className="py-24 bg-midnight-950 relative" id="jobs">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#3B82F6 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Why Choose SkillBridge?
          </h2>
          <p className="text-lg text-slate-400">
            Everything you need to master new skills and land your dream job, all in one platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card key={idx} delay={idx * 0.1} className="group hover:-translate-y-2 transition-transform duration-300 border-midnight-700/50">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border ${feature.bg} group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
