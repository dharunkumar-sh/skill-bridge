import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const customerId = "cus_Rllq2c4a0Bf82w"; // My test customer ID

async function run() {
  try {
    const isUpi = true;
    const paymentIntentParams = {
      amount: 299900,
      currency: "inr",
      customer: customerId,
      metadata: { plan: "professional", paymentMethod: "upi" },
      description: "Test",
      payment_method_types: isUpi ? ["upi"] : ["card"],
      ...(isUpi && { return_url: `http://localhost:3000/payment/success` }),
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams as any);
    console.log("Success:", paymentIntent.client_secret);
  } catch(e) {
    console.error("Stripe error:", e);
  }
}

run();
