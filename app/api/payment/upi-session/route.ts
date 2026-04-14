import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, payments, subscriptions } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const priceMap = {
  professional: { amount: 299900, label: "Professional Plan - ₹2,999/mo" },
  premium: { amount: 499900, label: "Premium Plan - ₹4,999/mo" },
};

export async function POST(req: NextRequest) {
  try {
    const { email, userId, plan } = await req.json();

    if (!email || !userId || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["professional", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const p = priceMap[plan as keyof typeof priceMap];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Find or create Stripe customer
    const userRows = await db.select().from(users).where(eq(users.id, userId));
    if (!userRows.length) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let customerId = userRows[0].stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { userId } });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
    }

    // Create a Stripe Checkout Session that supports UPI, card, netbanking etc.
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card", "upi"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: p.label },
            unit_amount: p.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}&payment=success&plan=${plan}`,
      cancel_url: `${baseUrl}/dashboard/settings?payment=cancelled`,
      metadata: { userId, plan },
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("UPI session error:", err);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
