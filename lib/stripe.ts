import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  stripeSingleton = new Stripe(key, {
    // Keep in sync with previous version used in project to satisfy TS literal type
    apiVersion: "2024-10-28.acacia",
  });
  return stripeSingleton;
}