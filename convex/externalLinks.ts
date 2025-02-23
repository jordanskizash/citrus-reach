import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Create the external link (Convex adds _creationTime automatically)
    const externalLink = await ctx.db.insert("externalLinks", {
      url: args.url,
      title: args.title,
      description: args.description,
      coverImage: args.coverImage,
      userId: userId,
      isArchived: false,
    });

    return externalLink;
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("externalLinks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});

export const listByUser = query({
  args: {
    userId: v.optional(v.string()), // Keep userId optional
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return []; // Return an empty array if userId is missing
    }

    return ctx.db
      .query("externalLinks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as string)) // Ensure it's always a string
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
  },
});


export const remove = mutation({
  args: { id: v.id("externalLinks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingLink = await ctx.db.get(args.id);
    
    if (!existingLink) {
      throw new Error("Link not found");
    }

    if (existingLink.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      isArchived: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("externalLinks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingLink = await ctx.db.get(args.id);
    
    if (!existingLink) {
      throw new Error("Link not found");
    }

    if (existingLink.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Update the link with any provided fields
    await ctx.db.patch(args.id, {
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(args.coverImage && { coverImage: args.coverImage }),
    });
  },
});