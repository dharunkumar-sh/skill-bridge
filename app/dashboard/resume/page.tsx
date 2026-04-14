"use client";

import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface AnalysisResult {
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  improvements: string[];
}

export default function ResumeHelperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const analyzeResume = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  // Circular progress math
  const strokeDasharray = 283;
  const scoreOffset = result ? strokeDasharray - (result.atsScore / 100) * strokeDasharray : strokeDasharray;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Resume AI Helper</h1>
        <p className="text-slate-400">Upload your resume to get instant ATS scoring and actionable feedback powered by Groq AI.</p>
      </div>

      {!result && !isAnalyzing && (
        <div 
          className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-midnight-700 bg-midnight-900/50 hover:bg-midnight-800'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-6 text-blue-400">
            <UploadCloud size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Drag & drop your resume</h3>
          <p className="text-slate-400 mb-6">Supported format: PDF up to 5MB</p>

          <label className="cursor-pointer">
            <span className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg">
              Browse Files
            </span>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <div className="mt-8 flex items-center gap-3 bg-midnight-950 px-4 py-3 rounded-xl border border-white/10">
              <FileText className="text-blue-400" size={24} />
              <div className="text-left">
                <div className="text-sm font-semibold text-white truncate max-w-[200px]">{file.name}</div>
                <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="ml-4 text-slate-500 hover:text-red-400">
                <XCircle size={20} />
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 text-red-400 flex items-center gap-2 bg-red-400/10 px-4 py-2 rounded-lg">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {file && !error && (
            <Button onClick={analyzeResume} size="lg" className="mt-8 w-full max-w-xs shadow-blue-500/20">
              Analyze Resume
            </Button>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="border border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center bg-midnight-900 text-center shadow-2xl">
          <RefreshCw size={48} className="text-blue-500 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Groq Inference Engine is working...</h2>
          <p className="text-slate-400 max-w-md">Our high-speed AI is parsing your PDF, matching skills against industry standards, and calculating your ATS score.</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Score Card */}
            <div className="md:col-span-1 bg-midnight-900 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl">
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-midnight-800" />
                  <circle 
                    cx="80" cy="80" r="45" 
                    fill="none" stroke="currentColor" strokeWidth="8" 
                    className={`${result.atsScore >= 80 ? 'text-emerald-500' : result.atsScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={scoreOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-white">{result.atsScore}</span>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Score</span>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg text-center">ATS Compatibility</h3>
              <p className="text-slate-400 text-sm text-center mt-2">
                {result.atsScore >= 80 ? "Excellent formatting and keyword optimization!" : 
                 result.atsScore >= 50 ? "Good start, but needs some critical improvements." : 
                 "Needs a major rewrite to pass automated ATS filters."}
              </p>
              
              <Button onClick={resetAnalysis} variant="outline" className="mt-8 w-full border-midnight-700">
                 Analyze New Resume
              </Button>
            </div>

            <div className="md:col-span-2 space-y-6">
              {/* Strengths & Missing Skills */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-emerald-400 mb-4">
                    <CheckCircle2 size={18} /> Highlighted Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.length > 0 ? result.matchedSkills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-lg text-sm border border-emerald-500/20">{skill}</span>
                    )) : (
                      <span className="text-emerald-400/50 text-sm">No prominent technical skills detected.</span>
                    )}
                  </div>
                </div>

                <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 font-bold text-red-400 mb-4">
                    <AlertCircle size={18} /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.length > 0 ? result.missingSkills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-red-500/10 text-red-300 rounded-lg text-sm border border-red-500/20">{skill}</span>
                    )) : (
                      <span className="text-red-400/50 text-sm">You've hit all the major keywords!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable Feedback */}
              <div className="bg-midnight-900 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
                <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <FileText className="text-blue-500" size={20} /> Actionable Improvements
                </h3>
                <ul className="space-y-4">
                  {result.improvements.map((tip, idx) => (
                    <li key={idx} className="flex gap-4 p-4 bg-midnight-950/50 rounded-xl border border-white/5">
                      <div className="min-w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed pt-1 w-full">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
