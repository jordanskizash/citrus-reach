"use client"

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { ProfToolbar } from "@/components/profile-toolbar";
import { useEffect, useMemo, useState } from "react";
import VideoRecorder from "@/components/videoRecorder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Calendar, MessageSquare, Linkedin, ArrowRight, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import InlineWidget from "@calcom/embed-react";
import Link from "next/link";
import ReadOnlyVideo from "@/components/readOnlyVideo";
import Image from "next/image";
import { ProfileDescription } from "@/app/(main)/_components/prof-description";
import { useUser } from "@clerk/clerk-react";
import { event } from "@/lib/analytics";
import SmartMeetingButton from "@/app/(main)/_components/meetingButton";
import LogoComparison from "@/app/(main)/_components/logo-comparison";

interface ProfileIdPageProps {
  params: {
    profileId: Id<"profiles">;
  };
}

export default function ProfileIdPage({ params }: ProfileIdPageProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isCalDialogOpen, setIsCalDialogOpen] = useState(false);

  const { user } = useUser();

  const dbQuery = useQuery(api.users.getUserByClerkId, { 
    clerkId: user?.id ?? "skip" 
  });


  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId,
  });

  const documents = useQuery(
    api.documents.getPublishedDocumentsByUserId,
    profile ? { userId: profile.userId } : "skip"
  );

  const userDetails = useQuery(
    api.users.getUserByClerkId,
    profile ? { clerkId: profile.userId } : "skip"
  );

  const latestDocuments = useMemo(() => {
    if (!documents) return [];
    
    if (profile?.featuredContent && profile.featuredContent.length > 0) {
      // Sort documents according to the featuredContent order
      return profile.featuredContent
        .map(id => documents.find(doc => doc._id === id))
        .filter((doc): doc is Doc<"documents"> => doc !== undefined);
    }
    
    // Fallback to showing the latest 6 documents
    return documents.slice(0, 6);
  }, [documents, profile?.featuredContent]);

  // Track page view with profile owner's ID
  useEffect(() => {
    if (profile) {
      // Log that we're attempting to track
      console.log('Tracking pageview:', {
        path: `/profile/${params.profileId}`,
        profileName: profile.displayName,
        timestamp: new Date().toISOString()
      });
  
      // Your existing event tracking
      event({
        action: 'profile_view',
        category: 'profile',
        label: profile.displayName || 'Unknown Profile',
        userId: profile.userId,
        pageType: 'profile',
        value: 1,
        metadata: {
          profileId: params.profileId,
          viewerId: user?.id || 'anonymous',
          viewTimestamp: new Date().toISOString()
        }
      });
  
      // Also track using GA directly for redundancy
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_title: profile.displayName,
          page_path: `/profile/${params.profileId}`,
          page_location: window.location.href,
          send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
        });
      }
    }
  }, [profile, params.profileId, user?.id]);

  if (!profile || documents === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get the logo URL from either userDetails or profile
  const displayLogo = userDetails?.logoUrl || profile.logoUrl || "/placeholder.svg?height=60&width=180";

  const handleThumbnailGenerated = (thumbnailUrl: string) => {
    // Store the thumbnail URL in your profile data using your update mutation
    updateProfile({
      id: params.profileId,
      videoThumbnail: thumbnailUrl
    });
  };


  const authorFullName = documents.length > 0 && documents[0].authorFullName
    ? documents[0].authorFullName
    : profile.displayName || "Unknown Author";

  const authorFirstName = authorFullName.split(" ")[0];
  const userLogo = userDetails?.logoUrl;
  const clientLogo = profile?.icon || "/acme.png";

  const handleVideoUpload = () => {
    setVideoKey((prevKey) => prevKey + 1);
  };

  // Track interactions with profile owner's ID
  const trackInteraction = (interactionType: string, additionalMetadata = {}) => {
    if (profile) {
      event({
        action: interactionType,
        category: 'profile_interaction',
        label: profile.displayName || 'Unknown Profile',
        userId: profile.userId, // Profile owner's ID
        pageType: 'profile',
        metadata: {
          profileId: params.profileId,
          viewerId: user?.id || 'anonymous',
          interactionTimestamp: new Date().toISOString(),
          ...additionalMetadata
        }
      });
    }
  };


  const handleShare = async () => {
    trackInteraction('share_profile');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${authorFullName}'s Profile`,
          text: `Check out ${authorFullName}'s profile!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setIsShareDialogOpen(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
    setIsShareDialogOpen(false);
  };

  const gradientStyle = {
    background: profile.colorPreference
      ? `linear-gradient(to bottom, ${profile.colorPreference}, #ffffff)`
      : "white",
  };

  const getPostUrl = (post: Doc<"documents">) => {
    if (post.isExternalLink && post.externalUrl) {
      return post.externalUrl;
    }
    // Default behavior for regular posts
    return `/blog/${post.slug ?? post._id}`;
  };

  return (
    <div className="min-h-screen" style={gradientStyle}>
      <div className="flex flex-col items-center pb-20 pt-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-4">
          <div className="flex items-center space-x-4">
          <LogoComparison 
              userLogo={userLogo}
              clientLogo={clientLogo}
              containerClassName="my-8"
            />
            {/* <Image
              src={displayLogo|| "/placeholder.svg?height=60&width=180"}
              alt="User Company Logo"
              width={180}
              height={60}
              className="object-contain w-[40px] sm:w-[60px]"
            />
            <span className="text-xl sm:text-2xl font-bold">x</span>
            <Image
              src={clientLogo || "/acme.png"}
              alt="Client Company Logo"
              width={180}
              height={60}
              className="object-contain w-[120px] sm:w-[180px]"
            /> */}
          </div>
        </div>

        <div className="w-full mb-4 mt-4">
          {/* Pass a prop to ProfToolbar to handle mobile optimization */}
          <div className="text-[1.15rem] sm:text-xl leading-relaxed">
            <ProfToolbar initialData={profile} editable={false} />
          </div>
          <p className="text-lg sm:text-xl mt-4 mb-6 text-center font-light px-2 sm:px-0">{profile.bio}</p>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="w-full md:w-3/4 px-2 sm:px-0">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <ReadOnlyVideo 
                videoUrl={profile.videoUrl} 
                onThumbnailGenerated={handleThumbnailGenerated} 
              />
            </div>
          </div>
          <div className="w-full md:w-1/4 flex flex-col gap-4 px-6 sm:px-0">
            {/* Reply Dialog */}
            {/* <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full">
                  <MessageSquare className="mr-2 h-5 w-5" /> Reply
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Reply to {authorFirstName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="name">
                      Your Name
                    </label>
                    <Input id="name" placeholder="Full Name" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <Input id="email" type="email" placeholder="Email Address" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="message">
                      Your Message
                    </label>
                    <Textarea id="message" placeholder="Type your message here..." rows={6} required />
                  </div>
                  <Button type="submit" className="w-full">
                    Send
                  </Button>
                </form>
              </DialogContent>
            </Dialog> */}

            <Button
              className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full"
              asChild
              style={{
                backgroundColor: profile.themeSettings?.accentColor || '#000000',
                color: '#FFFFFF'
              }}
            >
              <a
                href={`mailto:jordan.steinberg@ibm.com`}
                className="inline-block"
              >
                <Mail className="mr-2 h-5 w-5" /> Reply
              </a>
            </Button>

            {/* Book a Meeting Dialog */}
            <SmartMeetingButton 
              calComUsername={userDetails?.calComUsername || undefined}
              meetingLink={userDetails?.meetingLink || undefined}
              themeSettings={profile?.themeSettings || undefined}
              className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full"
            />
            {/* <Dialog open={isCalDialogOpen} onOpenChange={setIsCalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full">
                  <Calendar className="mr-2 h-5 w-5" /> Book a meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Book a Meeting with {authorFirstName}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <InlineWidget
                    calLink="citrusreach"
                    style={{ height: "650px", width: "100%", overflow: "scroll" }}
                    config={{ theme: "light", layout: "month_view" }}
                  />
                </div>
              </DialogContent>
            </Dialog> */}

            {/* Share Button */}
            <Button
              className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full"
              onClick={handleShare}
              style={{
                backgroundColor: profile.themeSettings?.accentColor || '#000000',
                color: '#FFFFFF'
              }}
            >
              <Share2 className="mr-2 h-5 w-5" /> Share
            </Button>

            {/* Get in Touch Button */}
            <Button 
              className="h-12 rounded-full text-base font-medium hover:scale-105 transition-transform mx-auto w-full" 
              style={{
                backgroundColor: profile.themeSettings?.accentColor || '#000000',
                color: '#FFFFFF'
              }}
              asChild>
              <a
                href={userDetails?.linkedin || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="mr-2 h-4 w-4" /> Get in Touch
              </a>
            </Button>
          </div>
        </div>

        {/* Share Dialog Content */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Share Profile</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Input value={window.location.href} readOnly className="mb-4" />
              <Button onClick={copyToClipboard} className="w-full">
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* More from {authorFirstName} Section */}
        {latestDocuments.length > 0 && (
          <div className="mt-16 w-full">
            <div className="flex justify-between items-center mb-8 px-2 sm:px-0">
              <h2 className="text-xl sm:text-2xl font-bold">More from {authorFirstName}</h2>
              <Link 
                href={`/homepage/${encodeURIComponent(authorFullName.toLowerCase().replace(/ /g, '-'))}`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="rounded-full hover:scale-105 hover:bg-black hover:text-white bg-black text-white transition-transform text-sm sm:text-base">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
            {latestDocuments.map((post) => (
              <Link
                key={post._id}
                href={getPostUrl(post)}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col group"
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={post.coverImage || "/placeholder.svg?height=300&width=400"}
                    alt={post.title}
                    className="w-full h-[200px] sm:h-[240px] object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-gray-500 text-sm mt-4 mb-1">
                  {new Date(post._creationTime).toLocaleDateString()}
                </p>
                <h3 className="text-lg text-black sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  By {authorFullName}
                </p>
              </Link>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function updateProfile(arg0: { id: Id<"profiles">; videoThumbnail: string; }) {
  throw new Error("Function not implemented.");
}