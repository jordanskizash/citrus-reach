import type { Metadata } from "next"
import type { Id } from "@/convex/_generated/dataModel"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

interface ProfileParams {
  params: {
    profileId: Id<"profiles">
  }
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function generateMetadata({ params }: ProfileParams): Promise<Metadata> {
  try {
    const profile = await convex.query(api.profiles.getById, {
      profileId: params.profileId as Id<"profiles">,
    })

    if (!profile) {
      return {
        title: "Profile Not Found",
      }
    }

    // Remove these lines:
    // const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://citrusreach.com"
    // const ogImageUrl = `${baseUrl}/videoOG.png`

    // Replace with this single line:
    const ogImageUrl = "https://citrusreach.com/videoOG.png"

    const metadata: Metadata = {
      title: `New Recording for ${profile.displayName}`,
      description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
      openGraph: {
        title: `Recording for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        type: "video.other",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${profile.displayName}'s video preview`,
          },
        ],
      },
      twitter: {
        card: "player",
        site: "@CitrusReach",
        title: `Custom profile for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        images: [ogImageUrl],
      },
    }

    // If we have a video, add video-specific metadata
    if (profile.videoUrl) {
      metadata.openGraph = {
        ...metadata.openGraph,
        videos: [
          {
            url: profile.videoUrl,
            width: 1280,
            height: 720,
            type: "video/mp4",
          },
        ],
      }

      metadata.twitter = {
        ...metadata.twitter,
        card: "player",
        players: [
          {
            playerUrl: profile.videoUrl,
            streamUrl: profile.videoUrl,
            width: 1280,
            height: 720,
          },
        ],
      }
    }

    return metadata
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "New Video Message",
      description: "View profile details",
    }
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

