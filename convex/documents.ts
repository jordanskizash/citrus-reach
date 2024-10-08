import { v } from "convex/values";

import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { clerkClient } from "@clerk/clerk-sdk-node";


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

        // Fetch user's full name and image URL from Clerk
        let authorFullName = "Unknown User";
        let authorImageUrl = "/placeholder.png"; // Update this to your default image path

        try {
            const user = await clerkClient.users.getUser(userId);
            
            // Ensure we have a full name
            authorFullName = user.fullName || 
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                            "Unknown User";
            
            // Ensure we have an image URL
            authorImageUrl = user.imageUrl || authorImageUrl;

            console.log(`Creating document for user: ${authorFullName} with image: ${authorImageUrl}`);
        } catch (error) {
            console.error(`Error fetching user ${userId} from Clerk:`, error);
        }

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            authorFullName,
            authorImageUrl,
            isArchived: false,
            isPublished: false,
        });

        return document;
    }
});

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

export const getById = query ({
    args: { documentId: v.id("documents") },
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        const document = await ctx.db.get(args.documentId);

        if(!document) {
            throw new Error("Not found");
        }

        if (document.isPublished && !document.isArchived) {
            return document;
        }

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        if (document.userId !== userId) {
            throw new Error("Unauthorized");
        }

        return document;
    }
});

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

export const addAuthorInfoToExistingDocuments = action({
    handler: async (ctx) => {
      const { runMutation, runQuery } = ctx;
  
      // Fetch all documents
      const documents = await runQuery(api.documents.getAllDocuments);
      
      console.log(`Found ${documents.length} documents to update`);
  
      for (const document of documents) {
        try {
          const user = await clerkClient.users.getUser(document.userId);
          
          // Ensure we have a full name
          const authorFullName = user.fullName || 
                                `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                                "Unknown User";
          
          // Ensure we have an image URL
          const authorImageUrl = user.imageUrl || "/placeholder.png"; // Update this to your default image path
  
          console.log(`Updating document ${document._id} with author: ${authorFullName}`);
  
          // Update the document with the new fields
          await runMutation(api.documents.updateAuthorInfo, {
            id: document._id,
            authorFullName,
            authorImageUrl,
          });
        } catch (error) {
          console.error(`Error updating document ${document._id} for user ${document.userId}:`, error);
        }
      }
  
      return { message: "Migration completed" };
    },
  });
  
  // Add this query to fetch all documents
  export const getAllDocuments = query({
    handler: async (ctx) => {
      return await ctx.db.query("documents").collect();
    },
  });
  
  // Add this mutation to update author info
  export const updateAuthorInfo = mutation({
    args: { id: v.id("documents"), authorFullName: v.string(), authorImageUrl: v.string() },
    handler: async (ctx, args) => {
      const { id, authorFullName, authorImageUrl } = args;
      await ctx.db.patch(id, { authorFullName, authorImageUrl });
    },
  });


// Test query - doesn't modify any data
export const testClerkConnection = query({
    handler: async (ctx) => {
        const results = {
            identityCheck: false,
            clerkClientCheck: false,
            userData: null as any,
            errors: [] as string[]
        };

        // Step 1: Check if we can get the user identity
        try {
            const identity = await ctx.auth.getUserIdentity();
            if (identity) {
                results.identityCheck = true;
                console.log("Identity check passed, user ID:", identity.subject);
            } else {
                results.errors.push("No user identity found");
                console.log("No user identity found");
            }
        } catch (error) {
            results.errors.push(`Identity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error("Identity check failed:", error);
        }

        // Step 2: Test Clerk client directly
        try {
            // First, get the user ID from the identity
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) {
                results.errors.push("No user identity for Clerk client test");
                return results;
            }

            const userId = identity.subject;
            const user = await clerkClient.users.getUser(userId);
            
            results.clerkClientCheck = true;
            results.userData = {
                id: user.id,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
            };
            console.log("Clerk client check passed, user data:", results.userData);
        } catch (error) {
            results.errors.push(`Clerk client check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error("Clerk client check failed:", error);
        }

        return results;
    }
});

