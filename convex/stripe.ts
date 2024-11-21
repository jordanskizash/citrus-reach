// convex/stripe.ts
"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import Stripe from "stripe";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia", // Updated API version
});

export const createCheckoutSession = action({
    args: { 
      userId: v.string(),
      planType: v.string()
    },
    handler: async (
      ctx,
      { userId, planType }
    ): Promise<string | null> => {
      console.log('Creating Stripe session for user:', userId);
      const domain = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  
      console.log('Creating checkout session for user:', userId);
  
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${domain}/settings?success=true`,
        cancel_url: `${domain}/settings?canceled=true`,
        client_reference_id: userId, // Make sure this is included!
        metadata: {
          userId: userId // Extra backup of the user ID
        }
      });
  
      console.log('Checkout session created with ID:', session.id);
      return session.url || null;
    },
  });

  export const fulfill = internalAction({
    args: {
      signature: v.string(),
      payload: v.string(),
    },
    handler: async (ctx, { signature, payload }) => {
      try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
          throw new Error("STRIPE_WEBHOOK_SECRET is not set");
        }
  
        const event = stripe.webhooks.constructEvent(
          payload,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
  
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          const clerkId = session.client_reference_id;
  
          if (!clerkId) {
            throw new Error("Missing client_reference_id in session");
          }
  
          await ctx.runMutation(internal.users.updateUserCreditsAfterPayment, {
            clerkId,
          });
        }
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          console.error("Webhook error:", error.message);
        } else {
          console.error("Unknown webhook error:", error);
        }
        return { success: false };
      }
    },
  });