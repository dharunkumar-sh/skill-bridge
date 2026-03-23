"use client";

import { Briefcase, MapPin, DollarSign, Building2, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";

export default function JobsPage() {
  const jobs = [
    { title: "Frontend Developer (React/Next.js)", company: "TechNova Solutions", location: "Remote (India)", salary: "₹12L - ₹18L", type: "Full-time", tags: ["React", "TypeScript", "Tailwind"] },
    { title: "Junior Data Analyst", company: "DataSync AI", location: "Bengaluru, India", salary: "₹8L - ₹12L", type: "Full-time", tags: ["Python", "SQL", "Tableau"] },
    { title: "Software Development Engineer - I", company: "FinServe Digital", location: "Mumbai, India", salary: "₹15L - ₹22L", type: "Hybrid", tags: ["Java", "Spring Boot", "AWS"] },
    { title: "UI/UX Designer", company: "Creative Minds Agency", location: "Remote", salary: "₹10L - ₹15L", type: "Contract", tags: ["Figma", "User Research", "Prototyping"] },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Job Board</h1>
          <p className="text-slate-400">AI-matched opportunities based on your completed skills.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Button variant="primary" className="shrink-0"><Briefcase size={16} className="mr-2" /> Top Matches</Button>
          <Button variant="ghost" className="bg-midnight-900 border-white/5 shrink-0 text-slate-300">Saved Jobs</Button>
          <Button variant="ghost" className="bg-midnight-900 border-white/5 shrink-0 text-slate-300">Applications</Button>
        </div>
      </div>

      <div className="bg-midnight-900 border border-white/5 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="grid gap-4">
          {jobs.map((job, idx) => (
            <div key={idx} className="group flex flex-col md:flex-row justify-between p-5 bg-midnight-950/50 hover:bg-midnight-800 border border-white/5 rounded-2xl transition-all items-start md:items-center gap-6">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center text-blue-400 shrink-0 border border-blue-800/50">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{job.title}</h3>
                  <div className="text-slate-400 text-sm mb-3">
                    {job.company}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-slate-400" /> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign size={14} className="text-slate-400" /> {job.salary}</span>
                    <span className="px-2 py-0.5 rounded-full bg-midnight-800 border border-white/5">{job.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="hidden lg:flex flex-wrap justify-end gap-2">
                  {job.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold text-blue-300 bg-blue-900/20 px-2 py-1 rounded-md border border-blue-500/10">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Button className="w-full sm:w-auto shrink-0 group-hover:bg-blue-600 transition-colors shadow-none group-hover:shadow-lg group-hover:shadow-blue-500/20">
                  Apply Now <ExternalLink size={14} className="ml-1.5" />
                </Button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
