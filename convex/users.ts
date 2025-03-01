import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getUserSettings = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    return user;
  },
});

export const getUserSettingsByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
    return user;
  },
});

export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
        .first();
      return user;
    },
  });

  export const updateUserSettings = mutation({
    args: {
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      image: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      website: v.optional(v.string()),
      meetingLink: v.optional(v.string()),
      calComUsername: v.optional(v.string()),
      domainName: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      description: v.optional(v.string()), 
      phoneNumber: v.optional(v.string()), 
      companyName: v.optional(v.string()), 
      companyWebsite: v.optional(v.string()),
      companyDescription: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
        .first();
  
      if (user) {
        await ctx.db.patch(user._id, {
          ...args,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("users", {
          ...args,
          credits: 10,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    },
  });

export const getCredits = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    
    return user?.credits ?? 10;
  },
});

export const addCredits = internalMutation({
  args: { 
    clerkId: v.string(),
    amount: v.number()
  },
  handler: async (ctx, { clerkId, amount }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      credits: (user.credits ?? 0) + amount,
      updatedAt: Date.now()
    });
  },
});

// convex/users.ts
export const updateCreditsFromWebhook = mutation({
  args: { 
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    console.log('Attempting to update credits for:', clerkId);

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      // Create user if they don't exist
      console.log('User not found, creating new user');
      const userId = await ctx.db.insert("users", {
        clerkId,
        credits: 10,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        name: "", // Add any required fields
        email: ""
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error(`Failed to create/find user: ${clerkId}`);
    }

    try {
      await ctx.db.patch(user._id, {
        credits: (user.credits ?? 0) + 20,
        updatedAt: Date.now(),
      });
      
      console.log('Credits updated successfully. New total:', (user.credits ?? 0) + 20);
      return true;
    } catch (error) {
      console.error('Failed to patch user credits:', error);
      throw error;
    }
  },
});

export const updateUserCreditsAfterPayment = internalMutation({
  args: { 
    clerkId: v.string(),
  },
  handler: async (ctx, { clerkId }) => {
    console.log('Updating credits internally for clerkId:', clerkId);
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      console.error('User not found for clerkId:', clerkId);
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      credits: (user.credits ?? 0) + 20,
      updatedAt: Date.now(),
    });
  },
});

export const checkUserExists = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    
    return {
      exists: !!user,
      user: user
    };
  },
});

// Add these to your existing users.ts file

export const updateUserSubscription = internalMutation({
  args: { 
    clerkId: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    tier: v.string(),
  },
  handler: async (ctx, { clerkId, subscriptionId, customerId, tier }) => {
    console.log(`[updateUserSubscription] Updating subscription for user ${clerkId} to tier: ${tier}`);
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      console.error(`[updateUserSubscription] User not found: ${clerkId}`);
      
      // Create a new user if they don't exist
      console.log(`[updateUserSubscription] Creating new user for: ${clerkId}`);
      await ctx.db.insert("users", {
        clerkId,
        name: "New User",  // Placeholder, should be updated later
        email: "",         // Placeholder, should be updated later
        subscriptionTier: tier,
        subscriptionStatus: "active",
        subscriptionId,
        customerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      console.log(`[updateUserSubscription] Created new user with tier: ${tier}`);
      return;
    }

    // Update subscription info for existing user
    console.log(`[updateUserSubscription] Updating existing user: ${user._id} to tier: ${tier}`);
    await ctx.db.patch(user._id, {
      subscriptionTier: tier,
      subscriptionStatus: "active",
      subscriptionId,
      customerId,
      updatedAt: Date.now(),
    });
    
    console.log(`[updateUserSubscription] Successfully updated subscription for user ${clerkId} to ${tier}`);
  },
});

export const updateSubscriptionFromWebhook = mutation({
  args: { 
    clerkId: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    tier: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[updateSubscriptionFromWebhook] Received webhook for user: ${args.clerkId}, tier: ${args.tier}`);
    
    try {
      await ctx.runMutation(internal.users.updateUserSubscription, args);
      console.log(`[updateSubscriptionFromWebhook] Successfully processed webhook for: ${args.clerkId}`);
      return null;
    } catch (error) {
      console.error(`[updateSubscriptionFromWebhook] Error processing webhook:`, error);
      throw error;
    }
  },
});

export const handleSubscriptionChange = internalMutation({
  args: { 
    subscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, { subscriptionId, status, currentPeriodEnd }) => {
    console.log(`[handleSubscriptionChange] Handling subscription change for ID: ${subscriptionId}, status: ${status}`);
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("subscriptionId"), subscriptionId))
      .first();

    if (!user) {
      console.error(`[handleSubscriptionChange] No user found with subscription ID: ${subscriptionId}`);
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: status,
      currentPeriodEnd,
      updatedAt: Date.now(),
    });
    
    console.log(`[handleSubscriptionChange] Successfully updated subscription status to ${status} for user ID: ${user._id}`);
  },
});


export const getUserSubscription = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    console.log(`[getUserSubscription] Fetching subscription for user: ${clerkId}`);
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    
    console.log(`[getUserSubscription] User data:`, user);
    
    // If subscription period has ended, revert to free tier
    if (user?.currentPeriodEnd && user.currentPeriodEnd < Date.now() && user.subscriptionStatus !== "active") {
      console.log(`[getUserSubscription] Subscription expired for user: ${clerkId}`);
      return {
        tier: "free",
        status: "inactive",
        currentPeriodEnd: user.currentPeriodEnd,
        subscriptionId: user.subscriptionId, // Include this
        customerId: user.customerId, // Include this too for completeness
        cancelAtPeriodEnd: user.cancelAtPeriodEnd // Include cancellation status
      };
    }
    
    const result = {
      tier: user?.subscriptionTier ?? "free",
      status: user?.subscriptionStatus,
      currentPeriodEnd: user?.currentPeriodEnd,
      subscriptionId: user?.subscriptionId, // Include this
      customerId: user?.customerId, // Include this too for completeness
      cancelAtPeriodEnd: user?.cancelAtPeriodEnd // Include cancellation status
    };
    
    console.log(`[getUserSubscription] Returning subscription data:`, result);
    return result;
  },
});

export const updateSubscriptionStatusFromWebhook = mutation({
  args: { 
    subscriptionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    console.log(`[updateSubscriptionStatusFromWebhook] Processing status update for subscription: ${args.subscriptionId}`);
    
    // Find the user by subscription ID
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("subscriptionId"), args.subscriptionId))
      .first();
      
    if (!user) {
      console.error(`[updateSubscriptionStatusFromWebhook] No user found with subscription ID: ${args.subscriptionId}`);
      throw new Error("User not found");
    }
    
    console.log(`[updateSubscriptionStatusFromWebhook] Found user: ${user.clerkId}`);
    
    // Update the subscription status
    await ctx.db.patch(user._id, {
      subscriptionStatus: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: Date.now(),
    });
    
    console.log(`[updateSubscriptionStatusFromWebhook] Updated subscription status to: ${args.status}`);
    return null;
  },
});