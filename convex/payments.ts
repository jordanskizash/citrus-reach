// convex/payments.ts
import { internalMutation } from "./_generated/server";
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
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripe_id", (q) => q.eq("stripeId", stripeId))
      .unique();
    
    if (!payment) {
      throw new Error("Payment not found");
    }

    await ctx.db.patch(payment._id, {
      status: "completed",
    });
  },
});