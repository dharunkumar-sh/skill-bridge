"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Stats {
  activeLearners: number;
  jobsPlaced: number;
  avgRating: number;
  avgSalaryIncrease: number;
}

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  isFloat?: boolean;
}

function Counter({
  from = 0,
  to,
  duration = 2,
  isFloat = false,
}: CounterProps) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let startTime: number | undefined;
      let animationFrame: number;

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / (duration * 1000), 1);

        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = from + (to - from) * easeOut;

        setCount(
          isFloat ? Number(currentCount.toFixed(1)) : Math.floor(currentCount),
        );

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      const startTimeout = setTimeout(() => {
        animationFrame = requestAnimationFrame(animate);
      }, 300);

      return () => {
        clearTimeout(startTimeout);
        cancelAnimationFrame(animationFrame);
      };
    }
  }, [isInView, from, to, duration, isFloat]);

  return <span ref={ref}>{count}</span>;
}

export default function Statistics() {
  const [stats, setStats] = useState<
    | (Stats & {
        suffix: string;
        label: string;
        isFloat?: boolean;
        prefix?: string;
      })[]
    | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();

        const formattedStats = [
          {
            value: Math.floor(data.activeLearners / 1000),
            suffix: "k+",
            label: "Active Learners",
          },
          {
            value: Math.floor(data.jobsPlaced / 1000),
            suffix: "k+",
            label: "Jobs Placed",
          },
          {
            value: data.avgRating,
            suffix: "/5",
            label: "Avg Rating",
            isFloat: true,
          },
          {
            value: data.avgSalaryIncrease,
            prefix: "₹",
            suffix: "L+",
            label: "Avg Salary Increase",
            isFloat: true,
          },
        ];

        setStats(formattedStats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Fallback stats
        setStats([
          { value: 50, suffix: "k+", label: "Active Learners" },
          { value: 35, suffix: "k+", label: "Jobs Placed" },
          { value: 4.9, suffix: "/5", label: "Avg Rating", isFloat: true },
          {
            value: 5.5,
            prefix: "₹",
            suffix: "L+",
            label: "Avg Salary Increase",
            isFloat: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  return (
    <section className="py-20 bg-midnight-950 relative overflow-hidden border-y border-midnight-800">
      {/* Abstract dark gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Thousands of Success Stories
          </h2>
          <p className="text-gray-400 text-lg">
            Our numbers speak for themselves. We deliver measurable career
            outcomes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          {stats ? (
            stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center tracking-tight">
                  {stat.prefix && (
                    <span className="text-blue-400">{stat.prefix}</span>
                  )}
                  <Counter to={stat.value} isFloat={stat.isFloat} />
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400">
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-slate-500 font-medium uppercase tracking-wider text-sm mt-4">
                  {stat.label}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 md:col-span-4 text-center text-slate-400">
              Loading statistics...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
