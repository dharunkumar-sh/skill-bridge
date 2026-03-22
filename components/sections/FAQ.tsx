"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How long does a typical course take?",
    answer: "Most of our professional courses take between 3 to 6 months to complete if you dedicate 10-15 hours per week. However, learning is entirely self-paced."
  },
  {
    question: "Will I get a job guarantee?",
    answer: "Yes, our Premium tier includes a job placement guarantee within 6 months of graduation, provided you meet the graduation criteria and actively apply through our partner network."
  },
  {
    question: "Can I learn while working?",
    answer: "Absolutely. 70% of our learners are working professionals. Our flexible scheduling and offline access make it easy to learn on weekends or after work."
  },
  {
    question: "What if I'm a complete beginner?",
    answer: "No problem. We offer starter paths that assume zero prior knowledge and build your foundations before moving onto advanced topics."
  },
  {
    question: "How is the job matching done?",
    answer: "Our proprietary AI analyzes your completed projects, test scores, and soft skills against thousands of active job descriptions from our hiring partners to find the statistically best match."
  },
  {
    question: "What's the refund policy?",
    answer: "We offer a 30-day, no-questions-asked money-back guarantee. If you decide SkillBridge isn't right for you within your first month, we will refund your full payment."
  },
  {
    question: "Do I get a certificate?",
    answer: "Yes, you receive industry-recognized certificates for each completed course and a capstone certificate upon finishing your professional track."
  },
  {
    question: "Can I access courses offline?",
    answer: "Yes, our mobile app allows you to download videos, reading materials, and small interactive exercises for offline use."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-midnight-950 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-blue-900 bg-blue-900/10' : 'border-midnight-700 bg-midnight-800 hover:border-midnight-600'}`}
                >
                  <button
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                  >
                    <span className={`font-semibold text-lg ${isOpen ? 'text-blue-400' : 'text-white'}`}>
                      {faq.question}
                    </span>
                    <div className={`ml-4 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-900/40 text-blue-400' : 'bg-midnight-700 text-slate-400'}`}>
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
