import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, payments, subscriptions } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

interface CheckoutRequest {
  plan: "professional" | "premium";
  userEmail: string;
  userId: string;
  paymentMethod?: "card" | "upi"; // defaults to card
}

const priceMap = {
  professional: {
    amount: 299900, // ₹2,999 in paise
    description: "Professional Plan - ₹2,999/mo",
  },
  premium: {
    amount: 499900, // ₹4,999 in paise
    description: "Premium Plan - ₹4,999/mo",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { plan, userEmail, userId, paymentMethod = "card" } = body;

    if (!plan || !userEmail || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (plan !== "professional" && plan !== "premium") {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    // Check if user already has an active subscription
    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));

    if (existingSub.length > 0) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 },
      );
    }

    const priceInfo = priceMap[plan];

    // Check/create Stripe customer
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let stripeCustomerId: string;
    if (userResult[0].stripeCustomerId) {
      stripeCustomerId = userResult[0].stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;

      await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
    }

    // UPI requires redirect flow; card uses CardElement inline
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: priceInfo.amount,
      currency: "inr",
      customer: stripeCustomerId,
      metadata: { userId, plan },
      description: priceInfo.description,
      payment_method_types: ["card", "upi"],
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Record the pending payment
    await db.insert(payments).values({
      userId,
      stripePaymentIntentId: paymentIntent.id,
      amount: priceInfo.amount,
      currency: "inr",
      status: paymentIntent.status,
      plan,
      description: priceInfo.description,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentMethod,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
