"use client";

import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { X, Loader2, Check, Shield, AlertCircle } from "lucide-react";
import Button from "./ui/Button";
import { motion } from "framer-motion";

// Initialize Stripe outside components so it is not repeatedly recreated.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  plan: "professional" | "premium";
  planDetails: { name: string; price: string; currency: string };
  onSuccess?: () => void;
}

const PLAN_COLORS = {
  professional: "from-blue-950/50 to-indigo-950/50 border-blue-500/20",
  premium: "from-amber-950/50 to-orange-950/50 border-amber-500/20",
};

export default function CheckoutModal({
  isOpen, onClose, userEmail, userId, plan, planDetails, onSuccess,
}: CheckoutModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [csError, setCsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setCsError(null);
      return;
    }

    // Fetch PaymentIntent immediately so PaymentElement can render
    const fetchIntent = async () => {
      try {
        const res = await fetch("/api/payment/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, userEmail, userId }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to initialize payment");
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setCsError(err.message);
      }
    };
    fetchIntent();
  }, [isOpen, plan, userEmail, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-midnight-900 border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
      >
        <div className="sticky top-0 bg-midnight-900/90 backdrop-blur-md z-10 flex items-center justify-between p-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Complete Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Shield size={11} /> Secured by Stripe
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-midnight-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className={`bg-gradient-to-r ${PLAN_COLORS[plan]} border rounded-2xl px-4 py-3 flex justify-between items-center shadow-inner`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Plan</p>
              <p className="text-white font-bold text-lg leading-none">{planDetails.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Monthly</p>
              <p className="text-2xl font-black text-white leading-none">{planDetails.currency}{planDetails.price}</p>
            </div>
          </div>

          {csError ? (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
              <span>{csError}</span>
            </div>
          ) : !clientSecret ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Initializing secure checkout...</p>
            </div>
          ) : (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#6366f1',
                    colorBackground: '#0b1120',
                    colorText: '#f1f5f9',
                    colorDanger: '#ef4444',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '12px',
                  }
                }
              }}
            >
              <CheckoutForm 
                plan={plan} 
                planDetails={planDetails} 
                onSuccess={() => { onSuccess?.(); onClose(); }} 
              />
            </Elements>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Inner Checkout Form Component ──
function CheckoutForm({ plan, planDetails, onSuccess }: any) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    setIsLoading(true);

    try {
      // confirmPayment naturally handles both Card and UPI redirects dynamically via Stripe Elements
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/settings?payment=success&session_id=verified`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        throw new Error(result.error.message || "Payment declined or failed");
      }

      // If no redirect was required (Card), it succeeded directly.
      if (result.paymentIntent?.status === "succeeded") {
        // Confirm server-side logic
        const confirm = await fetch("/api/payment/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            paymentIntentId: result.paymentIntent.id, 
            clientSecret: result.paymentIntent.client_secret 
          }),
        });
        if (!confirm.ok) throw new Error("Server activation failed");

        setIsSuccess(true);
        setTimeout(() => onSuccess(), 2500);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto mb-4 flex items-center justify-center border border-emerald-500/30"
        >
          <Check size={32} className="text-emerald-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Successful! 🎉</h3>
        <p className="text-slate-400 text-sm">Your {planDetails.name} plan is now active.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      
      {error && (
        <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-sm">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={isLoading || !stripe} className="w-full" size="lg">
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin mr-2" /> Processing securely...</>
        ) : (
           `Pay ${planDetails.currency}${planDetails.price}`
        )}
      </Button>

      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-2 border-t border-white/5">
         <span>Powered by <strong className="text-slate-400 font-bold">Stripe</strong></span>
         <span>•</span>
         <span>Bank-grade security</span>
      </div>
    </form>
  );
}
