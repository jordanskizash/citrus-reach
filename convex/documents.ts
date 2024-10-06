import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { clerkClient } from '@clerk/clerk-sdk-node';

export const archive = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);
        if (!existingDocument) {
            throw new Error ("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveArchive = async (documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", (q) => (
                    q
                        .eq("userId", userId)
                        .eq("parentDocument", documentId)
                ))
                .collect();

            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: true,
                });

                await recursiveArchive(child._id);
            }
        }

        const document = await ctx.db.patch(args.id, {
            isArchived: true,
        });

        recursiveArchive(args.id);

        return document;
    }
})

export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user_parent", (q) =>
                q
                    .eq("userId", userId)
                    .eq("parentDocument", args.parentDocument)
            )
            .filter((q) => 
                q.eq(q.field("isArchived"), false)
            )
            .order("desc")
            .collect();
        
        return documents;
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false,
        });

        return document;
    }
})

export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => 
                q.eq(q.field("isArchived"), true),
            )
            .order("desc")
            .collect();

        return documents;
    }
});

export const restore = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error ("Unauthorized");
        }

        const recursiveRestore = async(documentId: Id<"documents">) => {
            const children = await ctx.db
                .query("documents")
                .withIndex("by_user_parent", (q) => (
                    q
                        .eq("userId", userId)
                        .eq("parentDocument", documentId)
                ))
            .collect();
        
        for (const child of children) {
            await ctx.db.patch(child._id, {
                isArchived: false,
            });

            await recursiveRestore(child._id);
        }
            

        }

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        };

        if (existingDocument.parentDocument) {
            const parent = await ctx.db.get(existingDocument.parentDocument);
            if (parent?.isArchived) {
                options.parentDocument = undefined;
            }
        }

        const document = await ctx.db.patch(args.id, options);

        recursiveRestore(args.id);

        return document;
    }
});

export const remove = mutation ({
    args: {id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized)");
        }

        const document = await ctx.db.delete(args.id);

        return document;
    }
})

export const getSearch = query({
    handler: async(ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.eq(q.field("isArchived"), false),
            )
            .order("desc")
            .collect()

        return documents;
    }
});

export const getById = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      const document = await ctx.db.get(args.documentId);
  
      if (!document) {
        throw new Error("Not found");
      }
  
      // Fetch the author's data from Clerk
      let authorData = { fullName: "Unknown", imageUrl: "" };
      try {
        const user = await clerkClient.users.getUser(document.userId);
        authorData = {
          fullName: user.fullName || "Unknown",
          imageUrl: user.imageUrl || "",
        };
      } catch (error) {
        console.error("Error fetching user from Clerk:", error);
      }
  
      // If the document is published and not archived, allow public access
      if (document.isPublished && !document.isArchived) {
        return { ...document, author: authorData };
      }
  
      // If the document is not published or is archived, require authentication
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const userId = identity.subject;
  
      // Ensure the requesting user is the owner of the document
      if (document.userId !== userId) {
        throw new Error("Unauthorized");
      }
  
      // Return the document along with the author's data
      return { ...document, author: authorData };
    },
  });

// export const getById = query ({
//     args: { documentId: v.id("documents") },
//     handler: async(ctx, args) => {
//         const identity = await ctx.auth.getUserIdentity();

//         const document = await ctx.db.get(args.documentId);

//         if(!document) {
//             throw new Error("Not found");
//         }

//         if (document.isPublished && !document.isArchived) {
//             return document;
//         }

//         if (!identity) {
//             throw new Error("Not authenticated");
//         }

//         const userId = identity.subject;

//         if (document.userId !== userId) {
//             throw new Error("Unauthorized");
//         }

//         return document;
//     }
// });

export const update = mutation({
    args: {
        id: v.id("documents"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        icon: v.optional(v.string()),
        isPublished: v.optional(v.boolean())
    },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const { id, ...rest } = args;
        
        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId != userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.patch(args.id, {
            ...rest,
        });

        return document;
    },
});

export const removeIcon = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }


        const document = await ctx.db.patch(args.id, {
            icon: undefined
        });

        return document;
    }
});

export const removeCoverImage = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.patch(args.id, {
            coverImage: undefined,
        });

        return document;
    }
});

// export const getPublishedDocuments = query({
//     handler: async (ctx) => {
//       const documents = await ctx.db
//         .query("documents")
//         .filter((q) => 
//           q.eq(q.field("isPublished"), true)
//         )
//         .order("desc")
//         .collect();
  
//       return documents;
//     },
//   });

export const getPublishedDocumentsByUserId = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
      const documents = await ctx.db
        .query("documents")
        .filter((q) =>
          q.and(
            q.eq(q.field("isPublished"), true),
            q.eq(q.field("isArchived"), false),
            q.eq(q.field("userId"), args.userId)
          )
        )
        .order("desc")
        .collect();
  
      return documents;
    },
  });

  export const getPublishedDocuments = query({
    handler: async (ctx) => {
        // Allow this query without authentication
        const identity = await ctx.auth.getUserIdentity();
        
        let userId = null;
        if (identity) {
            userId = identity.subject;
        }

        const documents = await ctx.db
            .query('documents')
            .filter((q) =>
                q.and(
                    q.eq(q.field('isPublished'), true),
                    userId ? q.eq(q.field('userId'), userId) : true // Include user-specific filtering if user is authenticated
                )
            )
            .order('desc') // Order by creation time or any other field
            .collect();

        return documents;
    },
});


//   export const getPublishedDocuments = query({
//     handler: async (ctx) => {
//       const identity = await ctx.auth.getUserIdentity();
  
//       if (!identity) {
//         throw new Error('Not authenticated');
//       }
  
//       const userId = identity.subject;
  
//       const documents = await ctx.db
//         .query('documents')
//         .filter((q) =>
//           q.and(
//             q.eq(q.field('isPublished'), true),
//             q.eq(q.field('userId'), userId)
//           )
//         )
//         .order('desc') // Order by creation time or any other field
//         .collect();
  
//       return documents;
//     },
//   });