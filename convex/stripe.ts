// convex/stripe.ts
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
      try {
        console.log('Starting checkout session creation...'); // Debug log
        const domain = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  
        console.log('Creating payment record...'); // Debug log
        const paymentId: Id<"payments"> = await ctx.runMutation(internal.payments.create, { 
          userId,
          planType,
          amount: 2000,
        });
  
        console.log('Creating Stripe session...'); // Debug log
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID, // Use environment variable
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${domain}/settings?success=true&paymentId=${paymentId}`,
          cancel_url: `${domain}/settings?canceled=true`,
          client_reference_id: userId,
          billing_address_collection: "required",
        });
  
        console.log('Session created successfully:', session.id); // Debug log
  
        await ctx.runMutation(internal.payments.updateStripeId, {
          paymentId,
          stripeId: session.id,
        });
  
        if (!session.url) {
          throw new Error('No checkout URL in session response');
        }
  
        return session.url;
      } catch (error) {
        // Detailed error logging
        console.error('Stripe checkout session creation failed:', {
          error: error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          } : error,
          userId,
          planType
        });
        
        // Re-throw the error to be handled by the client
        throw new Error(error instanceof Error ? error.message : 'Unknown error in checkout creation');
      }
    },
  });