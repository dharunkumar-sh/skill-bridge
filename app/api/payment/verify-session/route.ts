import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, payments, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Retrieve the completed checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    const paymentIntentId = typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

    if (!userId || !plan || !paymentIntentId) {
      return NextResponse.json({ error: "Missing session metadata" }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Upsert subscription
    await db.insert(subscriptions).values({
      userId,
      stripeSubscriptionId: paymentIntentId,
      plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    }).onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeSubscriptionId: paymentIntentId,
        plan,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      },
    });

    // Update user record
    await db.update(users).set({
      subscriptionPlan: plan,
      stripeSubscriptionId: paymentIntentId,
      subscriptionStatus: "active",
      subscriptionStartDate: now,
      subscriptionEndDate: periodEnd,
    }).where(eq(users.id, userId));

    // Upsert payment record
    await db.insert(payments).values({
      userId,
      stripePaymentIntentId: paymentIntentId,
      amount: session.amount_total || 0,
      currency: session.currency || "inr",
      status: "succeeded",
      plan,
      description: `${plan} Plan - Stripe Checkout`,
    }).onConflictDoNothing();

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    console.error("Verify session error:", err);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
