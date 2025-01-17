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

    // Get the absolute URL for the videoOG.png image
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://citrusreach.com';
    const ogImageUrl = `${baseUrl}/videoOG.png`;

    const metadata: Metadata = {
      title: `New Recording for ${profile.displayName}`,
      description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
      openGraph: {
        title: `Recording for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        type: 'video.other',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${profile.displayName}'s video preview`,
          },
        ],
      },
    };

    // If we have a video, add video-specific metadata
    if (profile.videoUrl) {
      metadata.openGraph = {
        ...metadata.openGraph,
        videos: [
          {
            url: profile.videoUrl,
            width: 1280,
            height: 720,
            type: 'video/mp4',
            secureUrl: profile.videoUrl,
          },
        ],
      };

      // Enhanced metadata for better video preview support
      metadata.other = {
        // Basic video metadata
        'og:video': profile.videoUrl,
        'og:video:secure_url': profile.videoUrl,
        'og:video:type': 'video/mp4',
        'og:video:width': '1280',
        'og:video:height': '720',
        'og:type': 'video.other',
        
        // Always use videoOG.png for preview image
        'og:image': ogImageUrl,
        'og:image:secure_url': ogImageUrl,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:type': 'image/png',
        
        // Video player specific metadata
        'og:video:duration': '300',
        'og:video:release_date': new Date().toISOString(),
        
        // Additional metadata for better platform support
        'theme-color': '#ffffff',
        'twitter:player': profile.videoUrl,
        'twitter:player:width': '1280',
        'twitter:player:height': '720',
      };

      // Twitter card metadata always using videoOG.png
      metadata.twitter = {
        card: 'player',
        site: '@CitrusReach',
        title: `Custom profile for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        images: [ogImageUrl],
        players: [
          {
            playerUrl: profile.videoUrl,
            streamUrl: profile.videoUrl,
            width: 1280,
            height: 720
          }
        ]
      };
    } else {
      // Fallback metadata still using videoOG.png
      metadata.twitter = {
        card: 'summary_large_image',
        title: `${profile.displayName}'s Profile`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        images: [ogImageUrl],
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