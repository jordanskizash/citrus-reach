// videos.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Generate a URL for uploading a video
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  
  // Generate a temporary upload URL that's valid for 2 minutes
  return await ctx.storage.generateUploadUrl();
});

// Save the video URL to the profile
export const saveVideoUrl = mutation({
    args: {
      profileId: v.id("profiles"),
      storageId: v.string(),
      videoName: v.string() // Add videoName to args
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Not authenticated");
      }
  
      const userId = identity.subject;
      
      const profile = await ctx.db.get(args.profileId);
      if (!profile) {
        throw new ConvexError("Profile not found");
      }
      
      if (profile.userId !== userId) {
        throw new ConvexError("Unauthorized");
      }
  
      if (profile.videoUrl) {
        try {
          const existingStorageId = profile.videoUrl.split('/').pop();
          if (existingStorageId) {
            await ctx.storage.delete(existingStorageId);
          }
        } catch (error) {
          console.error("Error deleting existing video:", error);
        }
      }
  
      const videoUrl = await ctx.storage.getUrl(args.storageId);
  
      // Update the profile with both the video URL and name
      await ctx.db.patch(args.profileId, {
        videoUrl: videoUrl || undefined,
        videoName: args.videoName // Store the video name
      });
  
      return videoUrl || undefined;
    }
  });

// Delete a video
export const deleteVideo = mutation({
  args: {
    profileId: v.id("profiles")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const userId = identity.subject;
    
    // Get the profile
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new ConvexError("Profile not found");
    }
    
    // Check authorization
    if (profile.userId !== userId) {
      throw new ConvexError("Unauthorized");
    }

    // If there's an existing video, delete it
    if (profile.videoUrl) {
      try {
        const storageId = profile.videoUrl.split('/').pop();
        if (storageId) {
          await ctx.storage.delete(storageId);
        }
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }

    // Update the profile to remove the video URL
    await ctx.db.patch(args.profileId, {
      videoUrl: undefined
    });

    return true;
  }
});