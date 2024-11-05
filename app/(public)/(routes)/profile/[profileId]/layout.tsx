// app/(main)/profile/[profileId]/layout.tsx
import { Metadata } from "next";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

interface ProfileParams {
  params: {
    profileId: Id<"profiles">;
  };
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function generateMetadata({ params }: ProfileParams): Promise<Metadata> {
  try {
    const profile = await convex.query(api.profiles.getById, { 
      profileId: params.profileId as Id<"profiles"> 
    });
    
    if (!profile) {
      return {
        title: 'Profile Not Found',
      };
    }

    const metadata: Metadata = {
      title: `New Recording for ${profile.displayName}`,
      description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
      openGraph: {
        title: `Recording for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        type: 'video.other',
      },
    };

    // If we have a video, prioritize it in the metadata
    if (profile.videoUrl) {
      metadata.openGraph = {
        ...metadata.openGraph,
        videos: [
          {
            url: profile.videoUrl,
            width: 1280,
            height: 720,
            type: 'video/mp4',
          },
        ],
        // Use video thumbnail if available, fallback to other images
        images: [
          {
            url: profile.videoThumbnail || profile.icon || '/acme.png',
            width: 1280,
            height: 720,
            alt: `${profile.displayName}'s video preview`,
          },
        ],
      };

      metadata.other = {
        'og:video': profile.videoUrl,
        'og:video:secure_url': profile.videoUrl,
        'og:video:type': 'video/mp4',
        'og:video:width': '1280',
        'og:video:height': '720',
        'og:type': 'video.other',
        'og:image': profile.videoThumbnail || profile.icon || '/acme.png',
        'og:image:secure_url': profile.videoThumbnail || profile.icon || '/acme.png',
      };

      // Use summary_large_image for Twitter with the video thumbnail
      metadata.twitter = {
        card: 'summary_large_image',
        title: `Custom profile for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        images: [profile.videoThumbnail || profile.icon || '/acme.png'],
      };
    } else {
      // Fallback to regular image metadata if no video
      metadata.openGraph = {
        ...metadata.openGraph,
        type: 'website',
        images: [
          {
            url: profile.icon || '/acme.png',
            width: 1200,
            height: 630,
            alt: `${profile.displayName}'s profile image`,
          },
        ],
      };

      metadata.twitter = {
        card: 'summary_large_image',
        title: `${profile.displayName}'s Profile`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        images: [profile.icon || '/acme.png'],
      };
    }

    return metadata;
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'New Video Message',
      description: 'View profile details',
    };
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}