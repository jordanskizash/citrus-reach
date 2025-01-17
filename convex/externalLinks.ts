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
    // Get the user's identity
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Create the external link
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

export const listByUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Get all external links for the user that aren't archived
    const externalLinks = await ctx.db
      .query("externalLinks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return externalLinks;
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

    // Verify the user owns this link
    const existingLink = await ctx.db.get(args.id);
    
    if (!existingLink) {
      throw new Error("Link not found");
    }

    if (existingLink.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Soft delete by setting isArchived to true
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

    // Verify the user owns this link
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