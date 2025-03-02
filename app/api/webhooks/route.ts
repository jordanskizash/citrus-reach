// app/api/webhooks/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    console.error('No signature found in webhook request');
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // First verify the webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Processing event type:', event.type);

    // Handle checkout.session.completed events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Session data:', {
        clientReferenceId: session.client_reference_id,
        paymentStatus: session.payment_status,
        subscriptionId: session.subscription,
        customerId: session.customer,
        metadata: session.metadata
      });

      // Verify we have a user ID
      if (!session.client_reference_id) {
        console.error('No client_reference_id found');
        return new Response(JSON.stringify({ error: 'No client_reference_id' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        // Get the subscription tier from metadata
        const tier = session.metadata?.tier || "pro"; // Default to pro if not specified
        
        console.log(`Updating subscription for user: ${session.client_reference_id} to tier: ${tier}`);
        
        // Update the user's subscription
        await convex.mutation(api.users.updateSubscriptionFromWebhook, {
          clerkId: session.client_reference_id,
          subscriptionId: session.subscription as string,
          customerId: session.customer as string,
          tier: tier
        });
        
        console.log(`Subscription updated successfully for user: ${session.client_reference_id}. Tier: ${tier}`);
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Failed to update subscription:', error);
        return new Response(JSON.stringify({ error: 'Failed to update subscription' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Handle subscription update events
    else if (event.type === "customer.subscription.updated" || 
      event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      console.log(`Subscription ${subscription.id} ${event.type === 'customer.subscription.deleted' ? 'canceled' : 'updated'}`);
      console.log(`Status: ${subscription.status}, Period End: ${subscription.current_period_end}`);

      try {
      // Update subscription status in the database
      // Make sure to use updateSubscriptionStatusFromWebhook, not updateSubscriptionFromWebhook
      await convex.mutation(api.users.updateSubscriptionStatusFromWebhook, {
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end
      });
      
      console.log(`Subscription status updated to ${subscription.status}`);
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      } catch (error) {
      console.error('Failed to update subscription status:', error);
      return new Response(JSON.stringify({ error: 'Failed to update subscription status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

    // Always acknowledge other event types with 200
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}