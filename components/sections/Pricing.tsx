"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CheckoutModal from "@/components/CheckoutModal";

const plans = [
  {
    name: "Starter",
    price: "999",
    planKey: null, // free tier — no checkout
    description: "Perfect for exploring new career paths.",
    features: [
      "Access to 50+ basic courses",
      "Community peer support",
      "Basic job listings access",
      "Self-paced learning",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Professional",
    price: "2,999",
    planKey: "professional" as const,
    description: "For serious learners looking for jobs.",
    features: [
      "All Starter features",
      "1-on-1 mentoring (5 sessions/mo)",
      "Real-world Capstone projects",
      "AI Job Matching Algorithm",
      "Resume & Portfolio review",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Premium",
    price: "4,999",
    planKey: "premium" as const,
    description: "The ultimate track with guarantees.",
    features: [
      "All Professional features",
      "Unlimited 1-on-1 mentoring",
      "Priority job placement",
      "Salary negotiation support",
      "Certificate priority processing",
    ],
    cta: "Upgrade Now",
    popular: false,
  },
];

export default function Pricing() {
  const { user, setIsAuthModalOpen, setAuthMode, refreshUser } = useAuth();
  const router = useRouter();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"professional" | "premium">("professional");

  const currentPlan = user?.subscriptionPlan || "free";

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (!user) {
      // Not logged in — open sign up
      setAuthMode("signup");
      setIsAuthModalOpen(true);
      return;
    }

    if (!plan.planKey) {
      // Starter / free tier — go to dashboard
      router.push("/dashboard");
      return;
    }

    if (currentPlan === plan.planKey) {
      // Already on this plan — go to dashboard
      router.push("/dashboard");
      return;
    }

    // Paid plan + logged in → open Stripe checkout
    setSelectedPlan(plan.planKey);
    setShowCheckoutModal(true);
  };

  const getPlanCta = (plan: typeof plans[0]) => {
    if (!user) return plan.cta;
    if (!plan.planKey) return "Go to Dashboard";
    if (currentPlan === plan.planKey) return "Current Plan ✓";
    return plan.cta;
  };

  return (
    <>
      <section className="py-24 bg-midnight-900 relative" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-400">
              Invest in your future. Cancel anytime. 30 days or your money back.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {plans.map((plan, idx) => {
              const isCurrentPlan = user && currentPlan === plan.planKey;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`bg-midnight-800 rounded-3xl p-8 relative flex flex-col h-full hover:border-blue-500/50 transition-all ${
                    plan.popular
                      ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/10 md:-translate-y-4"
                      : "border border-midnight-700 shadow-xl"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-blue-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute top-3 right-3 bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                      ✓ Active
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-slate-400 text-sm h-10">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight text-white">₹</span>
                    <span className="text-5xl font-extrabold tracking-tight text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 font-medium">/mo</span>
                  </div>

                  <ul className="mb-8 space-y-4 flex-1">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? "bg-blue-900/40 text-blue-400" : "bg-emerald-900/40 text-emerald-400"}`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    fullWidth
                    size="lg"
                    className={plan.popular ? "" : "bg-midnight-700/30"}
                    disabled={isCurrentPlan === true}
                    onClick={() => handlePlanClick(plan)}
                  >
                    {getPlanCta(plan)}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12 text-sm text-slate-500 flex items-center justify-center gap-6">
            <span>🔒 Secure Payment via Stripe</span>
            <span>✔️ 30-Day Money-Back Guarantee</span>
          </div>
        </div>
      </section>

      {/* Stripe Checkout Modal */}
      {user && showCheckoutModal && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          userEmail={user.email}
          userId={user.id || ""}
          plan={selectedPlan}
          planDetails={
            {
              professional: { name: "Professional", price: "2,999", currency: "₹" },
              premium: { name: "Premium", price: "4,999", currency: "₹" },
            }[selectedPlan]
          }
          onSuccess={() => {
            refreshUser();
            setShowCheckoutModal(false);
          }}
        />
      )}
    </>
  );
}
