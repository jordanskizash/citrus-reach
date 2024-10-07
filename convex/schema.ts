import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema ({
    documents: defineTable ({
        title: v.string(),
        userId: v.string(),
        authorFullName: v.string(),
        authorImageUrl: v.string(),
        isArchived: v.boolean(),
        parentDocument: v.optional(v.id("documents")),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.boolean(),
    })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

    profiles: defineTable ({
        displayName: v.string(),
        bio: v.optional(v.string()),
        description: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        userId: v.string(),
        isArchived: v.boolean(),
        parentProfile: v.optional(v.id('profiles')),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.boolean(),
    })

    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentProfile"])
})