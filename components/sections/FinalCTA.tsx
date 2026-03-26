"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function FinalCTA() {
  const { user, setIsAuthModalOpen, setAuthMode } = useAuth();
  const router = useRouter();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with Dark Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-midnight-950 via-blue-950 to-midnight-900"></div>
      
      {/* Abstract background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Ready to <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-emerald-300">Transform</span> Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
            Join thousands of learners earning better jobs and higher salaries. The first step towards your dream career takes less than 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              animate={{
                boxShadow: ["0 0 0 0px rgba(59, 130, 246, 0.5)", "0 0 0 20px rgba(59, 130, 246, 0)", "0 0 0 0px rgba(59, 130, 246, 0)"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="rounded-lg"
            >
              <Button 
                size="xl" 
                className="w-full sm:w-auto shadow-xl"
                onClick={() => {
                  if (user) {
                    router.push("/dashboard");
                  } else {
                    setAuthMode("signup");
                    setIsAuthModalOpen(true);
                  }
                }}
              >
                {user ? "Go to Dashboard" : "Start Your Learning Journey Free"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
          
          <div className="mt-8 text-sm text-blue-200">
            No credit card required • 30-day money back • Cancel anytime
          </div>
        </motion.div>
      </div>
    </section>
  );
}
