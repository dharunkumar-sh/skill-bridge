import Stripe from 'stripe';
import * as dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const customerId = "cus_Rllq2c4a0Bf82w"; 
const vpa = "test@okaxis";

async function run() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 299900,
      currency: "inr",
      customer: customerId,
      payment_method_types: ["upi"],
      payment_method_data: {
        type: "upi",
        upi: { vpa: vpa },
      },
      confirm: true,
      return_url: "http://localhost:3000/success",
    });
    console.log("Success:", paymentIntent.next_action?.redirect_to_url?.url);
  } catch(e) {
    console.error("Stripe error:", e);
  }
}

run();
