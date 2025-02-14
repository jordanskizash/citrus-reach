import { v } from "convex/values";

import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { ActionCtx, MutationCtx } from "./_generated/server";


// Add this utility function at the top of your file
function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Add these new query and mutation handlers
export const getDocumentsBySlug = query({
  args: { 
    slug: v.string(),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => 
        q.and(
          q.eq(q.field("slug"), args.slug),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .collect();
    
    return documents;
  },
});

export const updateSlug = mutation({
  args: {
    id: v.id("documents"),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, slug } = args;
    
    const existingDocument = await ctx.db.get(id);
    if (!existingDocument) {
      throw new Error("Document not found");
    }

    return await ctx.db.patch(id, { slug });
  },
});


  // Add this new query to get document by slug
  export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
      const documents = await ctx.db
        .query("documents")
        .filter((q) => q.eq(q.field("slug"), args.slug))
        .filter((q) => q.eq(q.field("isPublished"), true))
        .filter((q) => q.eq(q.field("isArchived"), false))
        .first();
      
      return documents;
    },
  });

  export const toggleLike = mutation({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const userId = identity.subject;
      const document = await ctx.db.get(args.documentId);
  
      if (!document) {
        throw new Error("Document not found");
      }
  
      const currentLikedBy = document.likedBy || [];
      const currentLikeCount = document.likeCount || 0;
  
      const hasLiked = currentLikedBy.includes(userId);
  
      if (hasLiked) {
        // Remove like
        await ctx.db.patch(args.documentId, {
          likedBy: currentLikedBy.filter(id => id !== userId),
          likeCount: Math.max(0, currentLikeCount - 1)
        });
        return false; // Returns false to indicate unliked
      } else {
        // Add like
        await ctx.db.patch(args.documentId, {
          likedBy: [...currentLikedBy, userId],
          likeCount: currentLikeCount + 1
        });
        return true; // Returns true to indicate liked
      }
    },
  });
  
  export const checkLikeStatus = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      
      if (!identity) {
        return { isLiked: false, likeCount: 0 };
      }
  
      const document = await ctx.db.get(args.documentId);
      
      if (!document) {
        return { isLiked: false, likeCount: 0 };
      }
  
      return {
        isLiked: document.likedBy?.includes(identity.subject) || false,
        likeCount: document.likeCount || 0
      };
    },
  });

  export const getLikeCount = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        const document = await ctx.db.get(args.documentId);
        return document?.likeCount || 0;
    },
});

export const togglePublicLike = mutation({
  args: { 
      documentId: v.id("documents"),
      action: v.string() // 'increment' or 'decrement'
  },
  handler: async (ctx, args) => {
      const document = await ctx.db.get(args.documentId);
      
      if (!document) {
          throw new Error("Document not found");
      }

      const currentLikes = document.likeCount || 0;
      const newLikeCount = args.action === 'increment' 
          ? currentLikes + 1 
          : Math.max(0, currentLikes - 1);

      await ctx.db.patch(args.documentId, {
          likeCount: newLikeCount
      });

      return newLikeCount;
  },
});


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
});

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

// export const create = action({
//     args: {
//       title: v.string(),
//       parentDocument: v.optional(v.id("documents")),
//     },
//     handler: async (ctx, args) => {
//       const identity = await ctx.auth.getUserIdentity();
  
//       if (!identity) {
//         throw new Error("Not authenticated");
//       }
  
//       const userId = identity.subject;
  
//       // Fetch user's full name and image URL from Clerk
//       let authorFullName = "Unknown User";
//       let authorImageUrl = "/placeholder.png"; // Update this to your default image path
  
//       try {
//         const user = await clerkClient.users.getUser(userId);
  
//         // Ensure we have a full name
//         authorFullName =
//           user.fullName ||
//           `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
//           "Unknown User";
  
//         // Ensure we have an image URL
//         authorImageUrl = user.imageUrl || authorImageUrl;
  
//         console.log(
//           `Creating document for user: ${authorFullName} with image: ${authorImageUrl}`
//         );
//       } catch (error) {
//         console.error(`Error fetching user ${userId} from Clerk:`, error);
//       }
  
//       // Insert the document into the database
//       const document = await ctx.db.insert("documents", {
//         title: args.title,
//         parentDocument: args.parentDocument,
//         userId,
//         authorFullName,
//         authorImageUrl,
//         isArchived: false,
//         isPublished: false,
//       });
  
//       return document;
//     },
//   });

// export const getUserInfo = query({
//     args: { userId: v.string() },
//     handler: async (ctx, args): Promise<{ authorFullName: string; authorImageUrl: string }> => {
//       const { userId } = args;
      
//       // Fetch the user from your existing users table in Convex
//       const user = await ctx.db.query("users").filter(q => q.eq(q.field("userId"), userId)).first();
  
//       if (user) {
//         return {
//           authorFullName: user.fullName || "Unknown User",
//           authorImageUrl: user.imageUrl || "/placeholder.png"
//         };
//       }
  
//       // If user not found, return default values
//       return {
//         authorFullName: "Unknown User",
//         authorImageUrl: "/placeholder.png"
//       };
//     }
//   });

//   export const create = mutation({
//     args: {
//       title: v.string(),
//       parentDocument: v.optional(v.id("documents"))
//     },
//     handler: async (ctx, args): Promise<Doc<"documents">> => {
//       const identity = await ctx.auth.getUserIdentity();
  
//       if (!identity) {
//         throw new Error("Not authenticated");
//       }
  
//       const userId = identity.subject;
  
//       // Fetch user info using the query
//       const userInfo = await ctx.runQuery("getUserInfo", { userId });
  
//       const document = await ctx.db.insert("documents", {
//         title: args.title,
//         parentDocument: args.parentDocument,
//         userId,
//         authorFullName: userInfo.authorFullName,
//         authorImageUrl: userInfo.authorImageUrl,
//         isArchived: false,
//         isPublished: false,
//         content: "",  // Add a default value for content
//       });
  
//       return document;
//     }
//   });

// Then, update the action to use runMutation

// Define the Document type
type Document = Doc<"documents">;

// The mutation to handle database insertion
export const insertDocument = mutation({
    args: {
      title: v.string(),
      parentDocument: v.optional(v.id("documents")),
      userId: v.string(),
      authorFullName: v.string(),
      authorImageUrl: v.string(),
      slug: v.string(), // Add slug to the args type
    },
    handler: async (ctx, args) => {
      const document = await ctx.db.insert("documents", {
        title: args.title,
        parentDocument: args.parentDocument,
        userId: args.userId,
        authorFullName: args.authorFullName,
        authorImageUrl: args.authorImageUrl,
        isArchived: false,
        isPublished: false,
        slug: args.slug, // Use the provided slug
        content: "",
        htmlContent: "",
      });
  
      return document;
    },
  });

// The action that handles Clerk API call and runs the mutation
export const create = action({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (
    ctx: ActionCtx,
    args: {
      title: string;
      parentDocument?: Id<"documents">;
    }
  ): Promise<Id<"documents">> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Default values
    let authorFullName = "Unknown User";
    let authorImageUrl = "/placeholder.png";

    try {
      const user = await clerkClient.users.getUser(userId);

      authorFullName =
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        authorFullName;

      authorImageUrl = user.imageUrl || authorImageUrl;

      console.log(
        `Creating document for user: ${authorFullName} with image: ${authorImageUrl}`
      );
    } catch (error) {
      console.error(`Error fetching user ${userId} from Clerk:`, error);
    }

    // Generate base slug from title
    const baseSlug = slugify(args.title);

    // Check for existing documents with this slug
    const existingDocs = await ctx.runQuery(api.documents.getDocumentsBySlug, {
      slug: baseSlug,
      userId,
    });

    // Create unique slug
    const slug = existingDocs.length > 0 
      ? `${baseSlug}-${existingDocs.length + 1}`
      : baseSlug;

    // Use the api object to reference the mutation
    const documentId = await ctx.runMutation(api.documents.insertDocument, {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      authorFullName,
      authorImageUrl,
      slug,
    });

    return documentId;
  },
});


// export const create = mutation({ 
//     args: { 
//         title: v.string(), 
//         parentDocument: v.optional(v.id("documents")) 
//     }, 
//         handler: async (ctx, args) => { 
//             const identity = await ctx.auth.getUserIdentity();

//     if (!identity) {
//         throw new Error("Not authenticated");
//     }

//     const userId = identity.subject;

//     // Fetch user's full name and image URL from Clerk
//     let authorFullName = "Unknown User";
//     let authorImageUrl = "/placeholder.png"; // Update this to your default image path

//     try {
//         const user = await clerkClient.users.getUser(userId);
        
//         // Ensure we have a full name
//         authorFullName = user.fullName || 
//                         `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
//                         "Unknown User";
        
//         // Ensure we have an image URL
//         authorImageUrl = user.imageUrl || authorImageUrl;

//         console.log(`Creating document for user: ${authorFullName} with image: ${authorImageUrl}`);
//     } catch (error) {
//         console.error(`Error fetching user ${userId} from Clerk:`, error);
//     }

//     const document = await ctx.db.insert("documents", {
//         title: args.title,
//         parentDocument: args.parentDocument,
//         userId,
//         authorFullName,
//         authorImageUrl,
//         isArchived: false,
//         isPublished: false,
//     });

//     return document;
//     }
// });

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

// Update your update mutation to handle slug updates
export const update = mutation({
    args: {
      id: v.id("documents"),
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      htmlContent: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      icon: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Unauthenticated");
      }
  
      const userId = identity.subject;
      const { id, title, ...rest } = args;
  
      const existingDocument = await ctx.db.get(args.id);
  
      if (!existingDocument) {
        throw new Error("Not found");
      }
  
      if (existingDocument.userId !== userId) {
        throw new Error("Unauthorized");
      }
  
      let updateData: Partial<Doc<"documents">> = {
        ...rest,
      };
  
      // Only update slug if title is changing
      if (title) {
        const baseSlug = slugify(title);
        
        // Check for existing slugs, excluding current document
        const existingDocs = await ctx.db
          .query("documents")
          .filter((q) => 
            q.and(
              q.eq(q.field("userId"), userId),
              q.eq(q.field("slug"), baseSlug),
              q.neq(q.field("_id"), id)
            )
          )
          .collect();
        
        // Create unique slug
        const slug = existingDocs.length > 0 
          ? `${baseSlug}-${existingDocs.length + 1}`
          : baseSlug;
  
        updateData = {
          ...updateData,
          title,
          slug,
        };
      }
  
      const document = await ctx.db.patch(args.id, updateData);
  
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

export const migrateExistingDocumentsToSlugs = action({
    handler: async (ctx) => {
      const documents = await ctx.runQuery(api.documents.getAllDocuments);
      
      for (const doc of documents) {
        if (!doc.slug && doc.title) {
          const baseSlug = slugify(doc.title);
          
          // Check for existing slugs
          const existingDocs = await ctx.runQuery(api.documents.getDocumentsBySlug, { 
            slug: baseSlug,
            userId: doc.userId 
          });
          
          const slug = existingDocs.length > 0 
            ? `${baseSlug}-${existingDocs.length + 1}`
            : baseSlug;
          
          await ctx.runMutation(api.documents.updateSlug, {
            id: doc._id,
            slug,
          });
        }
      }
      
      return { message: "Migration completed" };
    },
  });


  export const migrateDocumentsToHtmlContent = mutation({
    args: {},
    handler: async (ctx) => {
        const documents = await ctx.db
            .query("documents")
            .filter((q) => q.eq(q.field("isPublished"), true))
            .collect();

        let migratedCount = 0;
        let errorCount = 0;

        for (const doc of documents) {
            try {
                if (doc.content) {
                    // Create a temporary BlockNote editor to convert content
                    const blocks = JSON.parse(doc.content);
                    
                    // Update the document with the content and htmlContent
                    await ctx.db.patch(doc._id, {
                        content: doc.content,
                        htmlContent: doc.content // Store original content - will be converted to HTML on render
                    });
                    
                    migratedCount++;
                }
            } catch (error) {
                console.error(`Error migrating document ${doc._id}:`, error);
                errorCount++;
            }
        }

        return {
            success: true,
            message: "Migration completed",
            migratedCount,
            errorCount,
            total: documents.length
        };
    }
});

export const createExternalLink = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    try {
      const document = await ctx.db.insert("documents", {
        title: args.title,
        userId: userId,
        isArchived: false,
        isPublished: true,
        coverImage: args.coverImage,
        isExternalLink: true,
        externalUrl: args.url,
        content: "", // Required field
        likeCount: 0, // Required field if in your schema
      });

      return document;
    } catch (error) {
      console.error("Error creating external link:", error);
      throw error;
    }
  },
});