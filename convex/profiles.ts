import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
    args: {
        parentProfile: v.optional(v.id("profiles")),
        id: v.id("profiles")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingProfile = await ctx.db.get(args.id);
        if (!existingProfile) {
            throw new Error ("Not found");
        }

        if (existingProfile.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveArchive = async (documentId: Id<"profiles">) => {
            const children = await ctx.db
                .query("profiles")
                .withIndex("by_user_parent", (q) => (
                    q
                        .eq("userId", userId)
                        .eq("parentProfile", documentId)
                ))
                .collect();

            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: true,
                });

                await recursiveArchive(child._id);
            }
        }

        const profile = await ctx.db.patch(args.id, {
            isArchived: true,
        });

        recursiveArchive(args.id);

        return profile;
    }
})

export const create = mutation({
    args: {
        displayName: v.string(),
        description: v.optional(v.string()),
        bio: v.optional(v.string()), // Use 'description' if that's what the schema defines
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

export const update = mutation({
    args: {
      id: v.id("profiles"),
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      description: v.optional(v.string()),
      videoUrl: v.optional(v.string()),
      isArchived: v.optional(v.boolean()),
      parentProfile: v.optional(v.id('profiles')),
      content: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      icon: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
      colorPreference: v.optional(v.string()),
      greetingText: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const { id, ...rest } = args;
  
      // Filter out undefined values from rest
      const updates = Object.fromEntries(
        Object.entries(rest).filter(([_, value]) => value !== undefined)
      );
  
      await ctx.db.patch(id, updates);
    },
  });
  

export const remove = mutation({
    args: { id: v.id("profiles") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingProfile = await ctx.db.get(args.id);

        if (!existingProfile) {
            throw new Error("Not found");
        }

        if (existingProfile.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const profile = await ctx.db.delete(args.id);

        return profile;
    }
});

export const restore = mutation({
    args: { id: v.id("profiles") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingProfile = await ctx.db.get(args.id);

        if (!existingProfile) {
            throw new Error("Not found");
        }

        if (existingProfile.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveRestore = async (profileId: Id<"profiles">) => {
            const children = await ctx.db
                .query("profiles")
                .withIndex("by_user_parent", (q) => (
                    q
                        .eq("userId", userId)
                        .eq("parentProfile", profileId)
                ))
                .collect();

            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: false,
                });

                await recursiveRestore(child._id);
            }
        }

        const options: Partial<Doc<"profiles">> = {
            isArchived: false,
        };

        if (existingProfile.parentProfile) {
            const parent = await ctx.db.get(existingProfile.parentProfile);
            if (parent?.isArchived) {
                options.parentProfile = undefined;
            }
        }

        const profile = await ctx.db.patch(args.id, options);

        recursiveRestore(args.id);

        return profile;
    }
});

export const getSidebar = query({
    args: {
        parentProfile: v.optional(v.id("profiles"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const profiles = await ctx.db
            .query("profiles")
            .withIndex("by_user_parent", (q) =>
                q
                    .eq("userId", userId)
                    .eq("parentProfile", args.parentProfile)
            )
            .filter((q) => 
                q.eq(q.field("isArchived"), false)
            )
            .order("desc")
            .collect();
        
        return profiles;
    },

});

// In your Convex functions (e.g., profiles.ts)
export const updateVideoUrl = mutation({
    args: {
      id: v.id("profiles"),
      videoUrl: v.optional(v.string()),
    },
    handler: async ({ db }, { id, videoUrl }) => {
      await db.patch(id, { videoUrl });
    },
  });


  // Function to get published profiles by a specific user ID
export const getPublishedProfilesByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
      const profiles = await ctx.db
        .query('profiles')
        .filter((q) =>
          q.and(
            q.eq(q.field('isPublished'), true),
            q.eq(q.field('isArchived'), false),
            q.eq(q.field('userId'), args.userId)
          )
        )
        .order('desc')
        .collect();
  
      return profiles;
    },
  });
  
  // Function to get all published profiles, optionally filtered by the authenticated user's ID
  export const getPublishedProfiles = query({
    handler: async (ctx) => {
      // Allow this query without authentication
      const identity = await ctx.auth.getUserIdentity();
  
      let userId = null;
      if (identity) {
        userId = identity.subject;
      }
  
      const profiles = await ctx.db
        .query('profiles')
        .filter((q) =>
          q.and(
            q.eq(q.field('isPublished'), true),
            q.eq(q.field('isArchived'), false),
            userId ? q.eq(q.field('userId'), userId) : true
          )
        )
        .order('desc') // Adjust the field by which you want to order the profiles
        .collect();
  
      return profiles;
    },
  });