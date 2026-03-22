"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BookX, Briefcase, IndianRupee } from "lucide-react";
import Card from "../ui/Card";

const problems = [
  {
    icon: <BookX size={32} className="text-red-500" />,
    stat: "50%",
    headline: "of students finish courses but don't get jobs",
    description: "Traditional education focuses on theory while employers demand practical, job-ready skills. There is a massive gap in what is taught vs. what is needed.",
    color: "bg-red-900/20 border-red-800/30"
  },
  {
    icon: <Briefcase size={32} className="text-amber-500" />,
    stat: "3.5M+",
    headline: "unfilled tech jobs despite high unemployment",
    description: "Employers are struggling to find skilled workers. The problem isn't a lack of jobs; it's a severe skills mismatch in the current workforce.",
    color: "bg-amber-900/20 border-amber-800/30"
  },
  {
    icon: <IndianRupee size={32} className="text-blue-500" />,
    stat: "₹50k+",
    headline: "spent monthly on outdated coaching",
    description: "Quality training is prohibitively expensive, yet often relies on outdated curriculums that don't reflect current industry standards.",
    color: "bg-blue-900/20 border-blue-800/30"
  }
];

export default function ProblemStatement() {
  return (
    <section className="py-24 bg-midnight-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 text-red-400 border border-red-800/30 font-medium text-sm mb-4"
          >
            <AlertTriangle size={16} />
            <span>The Reality Check</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Why Skills Matter More Than Ever
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400"
          >
            The old way of getting a job is broken. A college degree is no longer enough.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, idx) => (
            <Card key={idx} delay={idx * 0.1} className={`border-t-4 ${
              idx === 0 ? 'border-t-red-500' : idx === 1 ? 'border-t-amber-500' : 'border-t-blue-500'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${problem.color}`}>
                {problem.icon}
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white tracking-tight">{problem.stat}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{problem.headline}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {problem.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
