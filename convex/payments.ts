// convex/payments.ts
import { api, internal } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: { 
    userId: v.string(),
    planType: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { userId, planType, amount }) => {
    return await ctx.db.insert("payments", {
      userId,
      planType,
      amount,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateStripeId = internalMutation({
  args: {
    paymentId: v.id("payments"),
    stripeId: v.string(),
  },
  handler: async (ctx, { paymentId, stripeId }) => {
    await ctx.db.patch(paymentId, { stripeId });
  },
});

export const fulfill = internalMutation({
    args: { stripeId: v.string() },
    handler: async (ctx, { stripeId }) => {
      console.log('Payment fulfillment started for stripeId:', stripeId);
  
      const payment = await ctx.db
        .query("payments")
        .withIndex("by_stripe_id", (q) => q.eq("stripeId", stripeId))
        .unique();
      
      if (!payment) {
        console.error('Payment not found for stripeId:', stripeId);
        throw new Error("Payment not found");
      }
  
      console.log('Payment found:', payment);
  
      await ctx.db.patch(payment._id, {
        status: "completed",
      });
  
      console.log('Payment marked as completed');
  
      // Add credits to user's account
      console.log('Updating credits for user:', payment.userId);
      await ctx.runMutation(internal.users.updateUserCreditsAfterPayment, {
        clerkId: payment.userId,
      });
  
      console.log('Credits updated successfully');
    },
  });
  
  // Add this query to check payment status
  export const getPaymentStatus = query({
    args: { stripeId: v.string() },
    handler: async (ctx, { stripeId }) => {
      return await ctx.db
        .query("payments")
        .withIndex("by_stripe_id", (q) => q.eq("stripeId", stripeId))
        .unique();
    },
  });