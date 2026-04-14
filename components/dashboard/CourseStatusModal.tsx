"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  RefreshCw,
  SkipForward,
  Clock,
  BookOpen,
} from "lucide-react";
import Button from "../ui/Button";
import axios from "axios";

export interface OverdueCourse {
  id: string;
  courseTitle: string;
  courseUrl?: string;
  courseThumbnail?: string;
  deadlineAt: string;
  status: string;
}

interface CourseStatusModalProps {
  courses: OverdueCourse[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function CourseStatusModal({
  courses,
  onClose,
  onUpdate,
}: CourseStatusModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  if (courses.length === 0) return null;

  const course = courses[currentIndex];
  const daysOverdue = Math.floor(
    (Date.now() - new Date(course.deadlineAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const handleStatusUpdate = async (
    status: "completed" | "in_progress" | "skipped",
  ) => {
    setIsUpdating(true);
    try {
      await axios.patch("/api/user/courses", {
        courseId: course.id,
        status,
      });

      // Move to next course or close
      if (currentIndex < courses.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onUpdate();
        onClose();
      }
    } catch (err) {
      console.error("Failed to update course status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-200 bg-midnight-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-201 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-midnight-900 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden pointer-events-auto relative"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-midnight-800 rounded-full transition-colors z-10 cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock size={20} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Course Check-in
                </h2>
                <p className="text-xs text-slate-500">
                  {currentIndex + 1} of {courses.length} courses need your
                  attention
                </p>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="p-6">
            <div className="bg-midnight-950/60 border border-white/5 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-4">
                {course.courseThumbnail ? (
                  <img
                    src={course.courseThumbnail}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <BookOpen size={24} className="text-indigo-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-1 leading-tight">
                    {course.courseTitle}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    ⏰ {daysOverdue} {daysOverdue === 1 ? "day" : "days"} past
                    deadline
                  </p>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-sm text-center mb-6">
              Have you completed this course?
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleStatusUpdate("completed")}
                disabled={isUpdating}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer group disabled:opacity-50"
              >
                <CheckCircle2
                  size={24}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-xs font-semibold">Completed</span>
              </button>

              <button
                onClick={() => handleStatusUpdate("in_progress")}
                disabled={isUpdating}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer group disabled:opacity-50"
              >
                <RefreshCw
                  size={24}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-xs font-semibold">Still Working</span>
                <span className="text-[10px] text-slate-500">+1 week</span>
              </button>

              <button
                onClick={() => handleStatusUpdate("skipped")}
                disabled={isUpdating}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 transition-all cursor-pointer group disabled:opacity-50"
              >
                <SkipForward
                  size={24}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-xs font-semibold">Skip</span>
              </button>
            </div>
          </div>

          {/* Progress dots */}
          {courses.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-5">
              {courses.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex
                      ? "bg-amber-400"
                      : idx < currentIndex
                        ? "bg-emerald-400"
                        : "bg-midnight-700"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
