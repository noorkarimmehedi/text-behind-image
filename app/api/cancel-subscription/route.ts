import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { subscription_id } = await req.json();
    // Cancel the subscription on Stripe
    const stripe = getStripe();
    await stripe.subscriptions.cancel(subscription_id);

    // Init Supabase admin client lazily to avoid build-time env issues
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRole) {
      throw new Error("Supabase admin env vars missing");
    }
    const supabaseAdmin = createClient(url, serviceRole);

    // Update the Supabase row
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        paid: false,
        subscription_id: null
      })
      .eq('subscription_id', subscription_id);

    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }

    return NextResponse.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}