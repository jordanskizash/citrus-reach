import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    calComUsername: v.optional(v.string()),
    domainName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
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
    
    return user?.credits ?? 0;
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
        credits: 0,
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
