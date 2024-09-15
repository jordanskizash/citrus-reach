import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
    args: {
        displayName: v.string(),
        description: v.optional(v.string()),
        bio: v.string(), // Use 'description' if that's what the schema defines
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        // Insert a new profile into the 'profile' table
        const profile = await ctx.db.insert("profiles", {
            userId,                // Assuming each profile is linked to a userId
            displayName: args.displayName,
            bio: args.bio,
            description: args.description, // Handle 'description' correctly
            isArchived: false,  
            isPublished: false,   // Assuming you might want to keep track of archival status
            // Ensure only fields defined in your schema are included here
        });

        return profile;
    }
})

export const getById = query ({
    args: { profileId: v.id("profiles") },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const profile = await ctx.db.get(args.profileId);

        if(!profile) {
            throw new Error("Not found");
        }

        if (profile.isPublished && !profile.isArchived) {
            return profile;
        }

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        if (profile.userId !== userId) {
            throw new Error("Unauthorized");
        }

        return profile;
    }
});
