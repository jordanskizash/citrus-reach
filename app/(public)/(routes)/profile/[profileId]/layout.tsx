import type { Metadata } from "next"
import type { Id } from "@/convex/_generated/dataModel"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import type React from "react"

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

    const metadata: Metadata = {
      metadataBase: new URL("https://citrusreach.com"),
      title: `New Recording for ${profile.displayName}`,
      description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
      openGraph: {
        title: `Recording for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        type: "video.other",
        siteName: "Citrus Reach",
        images: [
          {
            url: "https://citrusreach.com/videoOG.png", // Use absolute URL
            width: 1200,
            height: 630,
            alt: `${profile.displayName}'s video preview`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@CitrusReach",
        title: `Custom profile for ${profile.displayName}`,
        description: profile.description || profile.bio || `Check out ${profile.displayName}'s profile`,
        images: ["https://citrusreach.com/videoOG.png"], // Use absolute URL
      },
    }

    if (profile.videoUrl) {
      metadata.openGraph = {
        ...metadata.openGraph,
        type: "video.other",
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