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

// First, add a new field to store unique handles
export const create = mutation({
  args: {
      displayName: v.string(),
      description: v.optional(v.string()),
      bio: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      authorFullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();

      if (!identity) {
          throw new Error("Not authenticated");
      }

      const userId = identity.subject;

      // Generate base slug from authorFullName or displayName
      const baseSlug = (args.authorFullName || args.displayName)
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^a-z0-9-]/g, '');

      // Check for existing profiles with similar slugs
      const existingProfiles = await ctx.db
          .query("profiles")
          .filter((q) => 
              q.eq(q.field("authorSlug"), baseSlug)
          )
          .collect();

      // If exists, append number
      let authorSlug = baseSlug;
      if (existingProfiles.length > 0) {
          authorSlug = `${baseSlug}-${existingProfiles.length + 1}`;
      }

      const profile = await ctx.db.insert("profiles", {
          userId,
          displayName: args.displayName,
          bio: args.bio,
          description: args.description,
          isArchived: false,
          isPublished: false,
          logoUrl: args.logoUrl,
          authorFullName: args.authorFullName,
          authorSlug, // Store the unique slug
      });

      return profile;
  }
});


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
    videoThumbnail: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
    parentProfile: v.optional(v.id('profiles')),
    content: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    colorPreference: v.optional(v.string()),
    greetingText: v.optional(v.string()),
    // Add themeSettings if you want to update them
    themeSettings: v.optional(v.object({
      backgroundColor: v.string(),
      accentColor: v.string(),
      textColor: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    // Add video thumbnail to the updates if it exists
    if (updates.videoThumbnail) {
      filteredUpdates.videoThumbnail = updates.videoThumbnail;
    }

    // Perform the update
    await ctx.db.patch(id, filteredUpdates);

    // Return the updated profile
    return await ctx.db.get(id);
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

  export const getByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
      const profile = await ctx.db
        .query("profiles")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .first();
      
      if (!profile) {
        throw new Error("Profile not found");
      }
  
      return profile;
    },
  });

  export const getByAuthorName = query({
    args: { authorFullName: v.string() },
    handler: async (ctx, args) => {
      const profile = await ctx.db
        .query("profiles")
        .filter((q) => q.eq(q.field("authorFullName"), args.authorFullName))
        .first();
      
      if (!profile) {
        throw new Error("Profile not found");
      }
  
      return profile;
    },
  });

  // In your profiles.ts
 // In your profiles.ts
 export const getByAuthorSlug = query({
  args: { authorSlug: v.string() },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    // Find the matching document to get the correct authorFullName
    const matchingDoc = documents.find(doc => {
      if (!doc.authorFullName) return false;

      const docSlug = doc.authorFullName
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');

      return docSlug === args.authorSlug.toLowerCase();
    });

    if (!matchingDoc) {
      throw new Error("Author not found");
    }

    // Now get the profile associated with this author
    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("userId"), matchingDoc.userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Add the authorFullName from the document to the profile response
    return {
      ...profile,
      authorFullName: matchingDoc.authorFullName
    };
  },
});

// Add a utility function to check handle availability
export const checkHandleAvailability = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
      const profile = await ctx.db
          .query("profiles")
          .filter((q) => q.eq(q.field("handle"), args.handle.toLowerCase()))
          .first();

      return !profile;
  },
});