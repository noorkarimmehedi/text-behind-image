import { stripe } from "@/lib/stripe";

// Expected env vars:
// - STRIPE_MONTHLY_PRODUCT_ID
// - STRIPE_ANNUAL_PRODUCT_ID
// - NEXT_PUBLIC_SITE_URL (fallback to request origin)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, email, plan_name, plan_type } = body as {
      user_id: string;
      email: string;
      plan_name: string;
      plan_type: 'MONTHLY' | 'ANNUAL';
    };

    const isAnnual = plan_type === 'ANNUAL';

    const MONTHLY_PRODUCT_ID = process.env.STRIPE_MONTHLY_PRODUCT_ID;
    const ANNUAL_PRODUCT_ID = process.env.STRIPE_ANNUAL_PRODUCT_ID;
    if (!MONTHLY_PRODUCT_ID || !ANNUAL_PRODUCT_ID) {
      return Response.json({ error: 'Missing Stripe product IDs in env' }, { status: 500 });
    }

    // Amounts based on your plans
    // Note: You specified $9.00 per month and $7.00 per year.
    // If $7 is intended as per year total, we will set unit_amount = 700 for yearly.
    // Adjust here if you actually want $84/year (i.e., $7 per month billed yearly).
    const unitAmount = isAnnual ? 7 * 100 : 9 * 100; // cents
    const interval: 'month' | 'year' = isAnnual ? 'year' : 'month';
    const product = isAnnual ? ANNUAL_PRODUCT_ID : MONTHLY_PRODUCT_ID;

    // Site URL
    const siteUrlFromEnv = process.env.NEXT_PUBLIC_SITE_URL;
    const origin = siteUrlFromEnv || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product,
            recurring: { interval },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id,
        plan_type,
      },
      success_url: `${origin}/app`,
      cancel_url: `${origin}/app`,
    });

    return Response.json({ paymentLink: session.url });
  } catch (error) {
    console.error('create-checkout-session error', error);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}