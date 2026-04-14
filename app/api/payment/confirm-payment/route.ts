import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, payments, subscriptions } from "@/src/db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, clientSecret } = body;

    if (!paymentIntentId || !clientSecret) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.client_secret !== clientSecret) {
      return NextResponse.json(
        { error: "Invalid client secret" },
        { status: 400 },
      );
    }

    const userId = paymentIntent.metadata?.userId;
    const plan = paymentIntent.metadata?.plan;

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    if (paymentIntent.status === "succeeded") {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Insert subscription record
      await db.insert(subscriptions).values({
        userId,
        stripeSubscriptionId: paymentIntent.id,
        plan,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      }).onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          stripeSubscriptionId: paymentIntent.id,
          plan,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        },
      });

      // Update user subscription fields
      await db.update(users).set({
        subscriptionPlan: plan,
        stripeSubscriptionId: paymentIntent.id,
        subscriptionStatus: "active",
        subscriptionStartDate: now,
        subscriptionEndDate: periodEnd,
      }).where(eq(users.id, userId));

      // Update the payment record status
      await db.update(payments).set({
        status: "succeeded",
        updatedAt: now,
      }).where(eq(payments.stripePaymentIntentId, paymentIntentId));

      return NextResponse.json(
        { success: true, message: "Payment confirmed and subscription activated" },
        { status: 200 },
      );
    } else if (paymentIntent.status === "requires_payment_method") {
      return NextResponse.json(
        { success: false, message: "Payment requires payment method" },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: `Payment status: ${paymentIntent.status}` },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 },
    );
  }
}
