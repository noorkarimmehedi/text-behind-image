import type { Stripe } from "stripe";

import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Ensure this runs on Node, not Edge, and is always dynamic for Stripe signature
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    // Use the raw text body for signature verification
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    if (err! instanceof Error) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }
  
  const permittedEvents: string[] = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
  ];

  if (permittedEvents.includes(event.type)) {
    let stripeData;
    let success = false

    try {
      switch (event.type) {
        case "checkout.session.completed":
          stripeData = event.data.object as Stripe.Checkout.Session;
          success = true
          break;
        case "payment_intent.payment_failed":
          stripeData = event.data.object as Stripe.PaymentIntent;
          break;
        case "payment_intent.succeeded":
          stripeData = event.data.object as Stripe.PaymentIntent;
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }

      if (success) {
        const stripeDataJSON = JSON.parse(JSON.stringify(stripeData));
        console.log(stripeDataJSON)

        // Lazily create Supabase admin client to avoid build-time env issues
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !serviceRole) {
          throw new Error("Supabase admin env vars missing for webhook");
        }
        const supabaseAdmin = createClient(url, serviceRole);

        const userId = stripeDataJSON.metadata.user_id as string;
        const subscriptionId = stripeDataJSON.subscription as string | null;
        const email = stripeDataJSON.customer_email || (stripeDataJSON.customer_details && stripeDataJSON.customer_details.email) || null;

        // Upsert to guarantee the row exists and is marked paid
        console.log('[STRIPE WEBHOOK] Upserting user profile:', { userId, email, subscriptionId });
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: userId,
            email,
            paid: true,
            subscription_id: subscriptionId ?? ''
          }, { onConflict: 'id' });
        console.log('[STRIPE WEBHOOK] Upsert result:', { data, error });
      }
    } catch (error) {  
      console.log(error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }  
  }

  return NextResponse.json({ message: "Received" }, { status: 200 });
}
