"use client";

import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  Check,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import CheckoutModal from "@/components/CheckoutModal";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SettingsPageInner() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"professional" | "premium">("professional");
  const [upiSuccessMsg, setUpiSuccessMsg] = useState<string | null>(null);

  // ── Handle UPI redirect return from Stripe Checkout ──
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const payment = searchParams.get("payment");
    if (sessionId && payment === "success") {
      // Verify the Stripe session server-side and activate subscription
      fetch("/api/payment/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            refreshUser();
            setUpiSuccessMsg(`Your ${data.plan} plan has been activated via UPI! 🎉`);
            setTimeout(() => setUpiSuccessMsg(null), 6000);
          }
        })
        .catch(console.error);
      // Clean URL without reload
      window.history.replaceState({}, "", "/dashboard/settings");
    }
  }, [searchParams]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">
          Manage your subscription and payment methods.
        </p>
      </div>
      
      {upiSuccessMsg && (
        <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 p-4 rounded-xl text-center shadow-lg font-medium ring-1 ring-emerald-500/30">
          {upiSuccessMsg}
        </div>
      )}

      <div className="bg-midnight-900 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Billing & Plan
            </h2>
            <p className="text-slate-400">
              Manage your subscription and payment methods.
            </p>
          </div>

          {/* Current Plan — reads live from auth context */}
          {(() => {
            const plan = user?.subscriptionPlan || "free";
            const status = (user as any)?.subscriptionStatus || "inactive";
            const isActive = status === "active";
            const planLabels: Record<string, { label: string; color: string; border: string; features: string[] }> = {
              free: {
                label: "FREE",
                color: "text-blue-400 bg-blue-900/30 border-blue-800/30",
                border: "border-white/5",
                features: ["Access to 50+ basic courses", "Community peer support", "Basic job listings access"],
              },
              professional: {
                label: "PROFESSIONAL",
                color: "text-blue-300 bg-blue-500/20 border-blue-400/30",
                border: "border-blue-500/20",
                features: ["All Free features", "1-on-1 AI Mentoring (5 sessions/mo)", "AI Job Matching", "Resume Review"],
              },
              premium: {
                label: "PREMIUM",
                color: "text-amber-300 bg-amber-500/20 border-amber-400/30",
                border: "border-amber-500/20",
                features: ["All Professional features", "Unlimited AI mentoring", "Priority job placement", "Salary negotiation support"],
              },
            };
            const info = planLabels[plan] || planLabels["free"];
            return (
              <div className={`bg-midnight-950 border ${info.border} rounded-2xl p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Current Plan</h3>
                    <p className="text-sm text-slate-400">
                      {isActive ? `Your ${plan} plan is active.` : plan === "free" ? "You are on the Free plan." : `Subscription ${status}.`}
                    </p>
                  </div>
                  <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${info.color}`}>
                    {info.label}
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {info.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={16} className="text-emerald-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                {plan === "free" && (
                  <Button variant="primary" fullWidth onClick={() => { setSelectedPlan("professional"); setShowCheckoutModal(true); }}>
                    Upgrade to Professional
                  </Button>
                )}
                {plan === "professional" && (
                  <Button variant="outline" fullWidth onClick={() => { setSelectedPlan("premium"); setShowCheckoutModal(true); }}>
                    Upgrade to Premium
                  </Button>
                )}
                {plan === "premium" && (
                  <div className="text-center text-emerald-400 text-sm font-semibold py-2">🏆 You're on the highest plan!</div>
                )}
              </div>
            );
          })()}

          {/* Available Plans */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              Available Plans
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Professional Plan */}
              <div className="bg-midnight-950 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">
                      ₹2,999
                    </span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    Professional
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    For serious learners looking for jobs
                  </p>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-blue-400" />
                      <span>All Free features</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-blue-400" />
                      <span>1-on-1 mentoring (5 sessions/mo)</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-blue-400" />
                      <span>AI Job Matching</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-blue-400" />
                      <span>Resume review</span>
                    </li>
                  </ul>

                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    disabled={user?.subscriptionPlan === "professional" || user?.subscriptionPlan === "premium"}
                    onClick={() => {
                      setSelectedPlan("professional");
                      setShowCheckoutModal(true);
                    }}
                  >
                    {user?.subscriptionPlan === "professional" ? "✓ Current Plan" : user?.subscriptionPlan === "premium" ? "Already on Premium" : "Select Plan"}
                  </Button>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="bg-midnight-950 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">
                      ₹4,999
                    </span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    Premium
                  </h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Ultimate track with guarantees
                  </p>

                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-amber-400" />
                      <span>All Professional features</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-amber-400" />
                      <span>Unlimited mentoring</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-amber-400" />
                      <span>Priority job placement</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <Check size={14} className="text-amber-400" />
                      <span>Salary negotiation support</span>
                    </li>
                  </ul>

                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    disabled={user?.subscriptionPlan === "premium"}
                    onClick={() => {
                      setSelectedPlan("premium");
                      setShowCheckoutModal(true);
                    }}
                  >
                    {user?.subscriptionPlan === "premium" ? "✓ Current Plan" : "Select Plan"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">
              Payment Method
            </h3>
            <div className="bg-midnight-950 border border-white/5 rounded-2xl p-6 text-center">
              {user?.subscriptionPlan && user.subscriptionPlan !== "free" ? (
                <p className="text-sm text-emerald-400 font-medium py-2">✓ Payment method on file via Stripe</p>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-4">No payment method added yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlan("professional");
                      setShowCheckoutModal(true);
                    }}
                  >
                    Add Payment Method
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {user && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          userEmail={user.email}
          userId={user.id || ""}
          plan={selectedPlan}
          planDetails={
            {
              professional: {
                name: "Professional",
                price: "2,999",
                currency: "₹",
              },
              premium: {
                name: "Premium",
                price: "4,999",
                currency: "₹",
              },
            }[selectedPlan]
          }
          onSuccess={() => {
            refreshUser();
            setShowCheckoutModal(false);
          }}
        />
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-emerald-400 w-8 h-8" /></div>}>
      <SettingsPageInner />
    </Suspense>
  );
}
