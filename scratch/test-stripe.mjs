import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

async function run() {
  try {
    const customer = await stripe.customers.create({ email: "test2@example.com" });
    
    const intent = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: 299900,
      currency: "inr",
      payment_method_types: ["card", "upi"],
      description: "Test",
    });
    console.log("Success:", intent.client_secret);
  } catch(e) {
    console.error("Stripe error:", e);
  }
}

run();
