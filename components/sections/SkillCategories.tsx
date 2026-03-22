"use client";

import { motion } from "framer-motion";
import { 
  BarChart, 
  Code, 
  Smartphone, 
  Layout, 
  Megaphone, 
  Cloud, 
  BrainCircuit, 
  PieChart 
} from "lucide-react";

const skills = [
  { name: "Data Analytics", icon: <BarChart size={20} />, color: "text-blue-600 bg-blue-50 border-blue-100" },
  { name: "Web Development", icon: <Code size={20} />, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { name: "Mobile App Dev", icon: <Smartphone size={20} />, color: "text-purple-600 bg-purple-50 border-purple-100" },
  { name: "UI/UX Design", icon: <Layout size={20} />, color: "text-pink-600 bg-pink-50 border-pink-100" },
  { name: "Digital Marketing", icon: <Megaphone size={20} />, color: "text-amber-600 bg-amber-50 border-amber-100" },
  { name: "Cloud & DevOps", icon: <Cloud size={20} />, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  { name: "AI & ML", icon: <BrainCircuit size={20} />, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  { name: "Business Analytics", icon: <PieChart size={20} />, color: "text-rose-600 bg-rose-50 border-rose-100" },
];

export default function SkillCategories() {
  return (
    <section className="py-24 bg-midnight-950" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Learn Skills in High Demand
          </h2>
          <p className="text-lg text-slate-400">
            Curated learning paths designed around the exact skills top employers are actively hiring for.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {skills.map((skill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className={`flex items-center gap-3 px-6 py-4 rounded-full border border-midnight-700 bg-midnight-800/50 hover:shadow-lg hover:border-blue-500/50 transition-all ${skill.color}`}
            >
              {skill.icon}
              <span className="font-semibold">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
