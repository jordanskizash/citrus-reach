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

function LightModeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="light">
      {children}
    </div>
  );
}

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

    // Create the base metadata object
    const metadata: Metadata = {
      title: `${profile.displayName}'s Profile`,
      description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
      openGraph: {
        title: `${profile.displayName}'s Profile`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        type: 'video.other',
        images: [
          {
            url: profile.icon || '/acme.png',
            width: 1200,
            height: 630,
            alt: `${profile.displayName}'s profile image`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${profile.displayName}'s Profile`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        images: [profile.icon || '/acme.png'],
      },
    };

    // Only add video metadata if videoUrl exists
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
      };

      metadata.other = {
        'og:video': profile.videoUrl,
        'og:video:secure_url': profile.videoUrl,
        'og:video:type': 'video/mp4',
        'og:video:width': '1280',
        'og:video:height': '720',
      };
    }

    return metadata;

  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'New Profile Site',
      description: 'View profile details',
    };
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LightModeWrapper>{children}</LightModeWrapper>;
}