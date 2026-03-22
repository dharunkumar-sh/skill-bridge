/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    avatar: "https://i.pravatar.cc/150?img=5",
    prevRole: "Unemployed",
    currentRole: "Data Analyst @ TCS",
    salary: "₹5.2L/year",
    quote: "SkillBridge transformed my career completely. The real-world projects and 24/7 mentoring were game-changers for me."
  },
  {
    name: "Rahul Patel",
    avatar: "https://i.pravatar.cc/150?img=11",
    prevRole: "Support Staff",
    currentRole: "Full Stack Developer @ Startup",
    salary: "₹7.5L/year",
    quote: "From having zero coding skills to landing my absolute dream job in just 4 months. It was worth every single rupee."
  },
  {
    name: "Ananya Singh",
    avatar: "https://i.pravatar.cc/150?img=20",
    prevRole: "Freelancer (irregular income)",
    currentRole: "Product Manager @ Unicorn",
    salary: "₹9L/year",
    quote: "The job matching algorithm is insanely accurate. I got an interview call within a week and landed the offer shortly after."
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-midnight-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Students Are Getting Results
          </h2>
          <p className="text-lg text-slate-400">
            Real stories from people who took the leap and leveled up their careers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-midnight-800 rounded-2xl p-8 shadow-xl border border-midnight-700 flex flex-col h-full hover:border-midnight-600 transition-all"
            >
              <div className="flex text-amber-500 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className="fill-amber-500" />
                ))}
              </div>
              
              <blockquote className="text-slate-300 leading-relaxed mb-8 flex-1 italic text-lg">
                &quot;{testimonial.quote}&quot;
              </blockquote>
              
              <div className="border-t border-midnight-700 pt-6 mt-auto">
                <div className="flex items-center gap-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover border-2 border-midnight-700" />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <div className="text-sm text-slate-500 flex flex-col mt-1">
                      <span className="line-through text-red-400/70">{testimonial.prevRole}</span>
                      <span className="font-medium text-emerald-400 mt-1">{testimonial.currentRole}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-emerald-900/20 border border-emerald-800/30 rounded-lg py-2 px-4 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Current Salary</span>
                  <span className="font-bold text-emerald-400">{testimonial.salary}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
