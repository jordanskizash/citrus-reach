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

  try {
    // First verify the webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Processing event type:', event.type);

    // Only process checkout.session.completed events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Session data:', {
        clientReferenceId: session.client_reference_id,
        paymentStatus: session.payment_status
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
        // Update the credits
        await convex.mutation(api.users.updateCreditsFromWebhook, {
          clerkId: session.client_reference_id
        });
        
        console.log('Credits updated successfully for user:', session.client_reference_id);
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Failed to update credits:', error);
        return new Response(JSON.stringify({ error: 'Failed to update credits' }), {
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