// convex/stripe.ts
"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import Stripe from "stripe";
import { api, internal } from "./_generated/api";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

export const createSubscriptionSession = action({
  args: { 
    userId: v.string(),
    priceId: v.string(),
    tier: v.string()
  },
  handler: async (ctx, { userId, priceId, tier }): Promise<string | null> => {
    console.log(`Creating subscription session for user: ${userId}, tier: ${tier}, priceId: ${priceId}`);
    
    const domain = process.env.APP_URL ?? "http://localhost:3000";

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${domain}/settings?success=true`,
        cancel_url: `${domain}/settings?canceled=true`,
        client_reference_id: userId,
        metadata: {
          userId,
          tier // Make sure this is being passed
        }
      });

      console.log(`Checkout session created: ${session.id}, url: ${session.url}`);
      return session.url || null;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
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

      console.log("Processing Stripe webhook...");
      
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`Received webhook event: ${event.type}`);

      // Handle checkout completion
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientReferenceId = session.client_reference_id;
        
        if (!clientReferenceId) {
          console.error("Missing client_reference_id in session");
          throw new Error("Missing client_reference_id in session");
        }
        
        // Get the tier from metadata
        const tier = session.metadata?.tier || "pro"; // Default to pro if not specified
        
        console.log(`Checkout completed for user: ${clientReferenceId}, tier: ${tier}`);
        console.log(`Subscription ID: ${session.subscription}`);
        
        // Update the user's subscription (use the function name that exists)
        await ctx.runMutation(internal.users.updateUserSubscription, {
          clerkId: clientReferenceId,
          subscriptionId: session.subscription as string,
          customerId: session.customer as string,
          tier: tier,
        });
        
        console.log(`Successfully updated user ${clientReferenceId} to ${tier} tier`);
      }
      
      // Handle subscription updates
      else if (event.type === 'customer.subscription.updated' || 
               event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Subscription ${subscription.id} ${event.type === 'customer.subscription.deleted' ? 'canceled' : 'updated'}`);
        console.log(`Status: ${subscription.status}, Period End: ${subscription.current_period_end}`);
        
        // Update subscription status (use the function name that exists)
        await ctx.runMutation(internal.users.handleSubscriptionChange, {
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        });
        
        console.log(`Successfully updated subscription status to ${subscription.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Webhook error:", error);
      return { success: false };
    }
  },
});

export const cancelSubscription = action({
  args: { 
    subscriptionId: v.string() 
  },
  handler: async (ctx, { subscriptionId }): Promise<boolean> => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not set");
      }

      console.log(`Cancelling subscription: ${subscriptionId}`);
      
      // Cancel the subscription at period end
      // This ensures the user continues to have access until their billing period ends
      const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      
      console.log(`Subscription will be canceled at period end: ${canceledSubscription.cancel_at_period_end}`);
      
      // Use the existing handleSubscriptionChange function instead of handleSubscriptionCancellation
      // Pass in the updated subscription status and end date
      await ctx.runMutation(internal.users.handleSubscriptionChange, {
        subscriptionId,
        status: canceledSubscription.status,
        currentPeriodEnd: canceledSubscription.current_period_end
      });
      
      return true;
    } catch (error) {
      console.error("Subscription cancellation error:", error);
      throw error;
    }
  },
});