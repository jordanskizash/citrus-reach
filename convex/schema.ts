import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema ({
    documents: defineTable ({
        title: v.string(),
        userId: v.string(),
        authorFullName: v.optional(v.string()),
        authorImageUrl: v.optional(v.string()),
        slug: v.optional(v.string()),
        isArchived: v.boolean(),
        parentDocument: v.optional(v.id("documents")),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.boolean(),
    })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_user_parent", ["userId", "parentDocument"]),

    profiles: defineTable ({
        displayName: v.string(),
        authorFullName: v.optional(v.string()),
        bio: v.optional(v.string()),
        description: v.optional(v.string()),
        videoUrl: v.optional(v.string()),
        videoDescription: v.optional(v.string()),
        userId: v.string(),
        isArchived: v.boolean(),
        parentProfile: v.optional(v.id('profiles')),
        content: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.boolean(),
        colorPreference: v.optional(v.string()),
        organizationLogo: v.optional(v.string()),
        isDarkMode: v.optional(v.boolean()),
        greetingText: v.optional(v.string()),
        themeSettings_backgroundColor: v.optional(v.string()),
        themeSettings_textColor: v.optional(v.string()),
        themeSettings_accentColor: v.optional(v.string()),
        themeSettings: v.optional(v.object({
            backgroundColor: v.string(),
            textColor: v.string(),
            accentColor: v.string()
        }))
    })
    
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentProfile"])
    .index("by_author_full_name", ["authorFullName"]) ,

    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        website: v.optional(v.string()),
        calComUsername: v.optional(v.string()), // Added field
        domainName: v.optional(v.string()),     // Added field
        logoUrl: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"]),

        events: defineTable({
            title: v.string(),
            description: v.string(),
            userId: v.string(),
            coverImage: v.optional(v.string()),
            eventDate: v.string(),
            eventTime: v.string(),
            location: v.string(),
            isArchived: v.boolean(),
            content: v.optional(v.string()),
            isPublished: v.boolean(),
            speakers: v.optional(v.array(v.object({
                name: v.string(),
                role: v.string(),
                imageUrl: v.optional(v.string()),
                bio: v.optional(v.string())
            }))),
            registrations: v.optional(v.array(v.object({
                name: v.string(),
                role: v.string(),
                company: v.string(),
                email: v.string(),
                timestamp: v.number()
            })))
        })
        .index("by_user", ["userId"])
    })