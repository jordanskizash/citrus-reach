import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getEvent = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId as Id<"events">);
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    return event;
  },
});

export const submitRegistration = mutation({
  args: {
    eventId: v.string(),
    name: v.string(),
    role: v.string(),
    company: v.string(),
    email: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const eventId = args.eventId as Id<"events">;
    const event = await ctx.db.get(eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }

    const registration = {
      name: args.name,
      role: args.role,
      company: args.company,
      email: args.email,
      timestamp: args.timestamp,
    };

    // Create new registrations array if it doesn't exist
    const currentRegistrations = event.registrations || [];
    
    await ctx.db.patch(eventId, {
      registrations: [...currentRegistrations, registration],
    });

    return registration;
  },
});

export const getSidebar = query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const events = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .filter((q) => q.eq(q.field("isArchived"), false))
        .order("desc")
        .collect();
  
      return events;
    },
  });
  
  export const create = mutation({
    args: {
      title: v.string(),
      description: v.string(),
      eventDate: v.string(),
      eventTime: v.string(),
      location: v.string(),
      isArchived: v.boolean(),
      isPublished: v.boolean()
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const eventId = await ctx.db.insert("events", {
        title: args.title,
        description: args.description,
        userId: identity.subject,
        eventDate: args.eventDate,
        eventTime: args.eventTime,
        location: args.location,
        isArchived: args.isArchived,
        isPublished: args.isPublished
      });
  
      return eventId;
    },
  });

  // Add this to your events.ts file in Convex

export const archive = mutation({
    args: { id: v.id("events") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const event = await ctx.db.get(args.id);
  
      if (!event) {
        throw new Error("Not found");
      }
  
      if (event.userId !== identity.subject) {
        throw new Error("Unauthorized");
      }
  
      const recursiveArchive = async (eventId: Id<"events">) => {
        const event = await ctx.db.get(eventId);
        if (!event) return;
  
        await ctx.db.patch(eventId, {
          isArchived: true,
        });
      };
  
      await recursiveArchive(args.id);
    }
  });

  // Add this to your convex/events.ts file

// Update in your convex/events.ts file

export const update = mutation({
    args: {
      id: v.id("events"),
      title: v.optional(v.string()),
      eventDate: v.optional(v.string()),
      eventTime: v.optional(v.string()),
      location: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const event = await ctx.db.get(args.id);
  
      if (!event) {
        throw new Error("Event not found");
      }
  
      if (event.userId !== identity.subject) {
        throw new Error("Not authorized");
      }
  
      const updateData: Record<string, any> = {};
  
      if (args.title !== undefined) updateData.title = args.title;
      if (args.eventDate !== undefined) updateData.eventDate = args.eventDate;
      if (args.eventTime !== undefined) updateData.eventTime = args.eventTime;
      if (args.location !== undefined) updateData.location = args.location;
  
      await ctx.db.patch(args.id, updateData);
    },
  });