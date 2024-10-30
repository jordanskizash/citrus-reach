"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { ProfToolbar } from "@/components/profile-toolbar";
import { useState } from "react";
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
import { Share2, Calendar, MessageSquare, Linkedin } from "lucide-react";
import { toast } from "react-hot-toast";
import InlineWidget from "@calcom/embed-react";
import { motion } from "framer-motion";
import Link from "next/link";
import ReadOnlyVideo from "@/components/readOnlyVideo";
import Image from "next/image";
import { ProfileDescription } from "@/app/(main)/_components/prof-description";
import { useUser } from "@clerk/clerk-react";

interface ProfileIdPageProps {
  params: {
    profileId: Id<"profiles">;
  };
}

const MotionLink = motion(Link);


export default function ProfileIdPage({ params }: ProfileIdPageProps) {
  // Hooks must be called at the top level
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isCalDialogOpen, setIsCalDialogOpen] = useState(false);

  const { user } = useUser();

  // Fetch the profile
  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId,
  });

  // Fetch documents by profile author
  const documents = useQuery(
    api.documents.getPublishedDocumentsByUserId,
    profile ? { userId: profile.userId } : "skip"
  );

  // Fetch user details
  const userDetails = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Handle loading state
  if (!profile || documents === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Extract the author's full name from the documents
  const authorFullName =
    documents.length > 0 && documents[0].authorFullName
      ? documents[0].authorFullName
      : profile.displayName || "Unknown Author";

  // Extract the author's first name
  const authorFirstName = authorFullName.split(" ")[0];

  // Get the latest documents (e.g., first 6)
  const latestDocuments = documents ? documents.slice(0, 6) : [];

  // User and Client Logos
  const userLogo = userDetails?.logoUrl;
  const clientLogo = profile?.icon || "/acme.png";

  // Handle video upload
  const handleVideoUpload = () => {
    setVideoKey((prevKey) => prevKey + 1);
  };

  // Handle share functionality
  const handleShare = async () => {
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

  // Apply the background color
  const gradientStyle = {
    background: profile.colorPreference
      ? `linear-gradient(to bottom, ${profile.colorPreference}, #ffffff)`
      : "white",
  };

  return (
    <div className="min-h-screen" style={gradientStyle}>
      <div className="flex flex-col items-center pb-20 pt-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="w-full flex justify-center items-center mb-8">
          <div className="flex items-center space-x-4">
            {/* User Logo */}
            <Image
              src={userLogo || "/placeholder.svg?height=50&width=150"}
              alt="User Company Logo"
              width={50}
              height={25}
              className="object-contain"
            />
            <span className="text-2xl font-bold">x</span>
            {/* Client Logo */}
            <Image
              src={clientLogo || "/acme.png"}
              alt="Client Company Logo"
              width={150}
              height={50}
              className="object-contain"
            />
          </div>
        </div>

        <div className="w-full mb-6 mt-8">
          <ProfToolbar initialData={profile} editable={false} />
          <p className="text-xl mt-2 mb-6 text-center">{profile.bio}</p>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <ReadOnlyVideo videoUrl={profile.videoUrl} />
          </div>
          <div className="w-full md:w-1/4 flex flex-col gap-3">
            {/* Reply Dialog */}
            <Dialog
              open={isReplyDialogOpen}
              onOpenChange={setIsReplyDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="h-10 rounded-full text-sm">
                  <MessageSquare className="mr-2 h-4 w-4" /> Reply
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reply to {authorFirstName}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-4 mt-4"
                >
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="name"
                    >
                      Your Name
                    </label>
                    <Input id="name" placeholder="Full Name" required />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="message"
                    >
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Book a Meeting Dialog */}
            <Dialog
              open={isCalDialogOpen}
              onOpenChange={setIsCalDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="h-10 rounded-full text-sm">
                  <Calendar className="mr-2 h-4 w-4" /> Book a meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Book a Meeting with {authorFirstName}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <InlineWidget
                    calLink="citrusreach"
                    style={{
                      height: "650px",
                      width: "100%",
                      overflow: "scroll",
                    }}
                    config={{ theme: "light", layout: "month_view" }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            {/* Share Button */}
            <Button
              className="h-10 rounded-full text-sm"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>

            {/* Get in Touch Button */}
            <Button className="h-10 rounded-full text-sm" asChild>
              <a
                href="https://www.linkedin.com/in/jordan-steinberg/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="mr-2 h-4 w-4" /> Get in Touch
              </a>
            </Button>
          </div>
        </div>

        {/* Share Dialog Content */}
        <Dialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Profile</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Input
                value={window.location.href}
                readOnly
                className="mb-4"
              />
              <Button onClick={copyToClipboard} className="w-full">
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* More from {authorFirstName} Section */}
        {latestDocuments.length > 0 && (
          <div className="mt-12 w-full">
            <h2 className="text-2xl font-bold mb-6">
              More from {authorFirstName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {latestDocuments.map((post) => (
                <MotionLink
                  key={post._id}
                  href={`/preview/${post._id}`}
                  className="flex flex-col"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={
                      post.coverImage ||
                      "/placeholder.svg?height=300&width=400"
                    }
                    alt={post.title}
                    className="rounded-lg object-cover w-full h-[200px] mb-4"
                  />
                  <p className="text-gray-500 text-sm mb-1">
                    {new Date(post._creationTime).toLocaleDateString()}
                  </p>
                  <h3 className="text-xl font-semibold mb-1">
                    {post.title}
                  </h3>
                  <p className="text-gray-600">
                    By {post.authorFullName || "Unknown Author"}
                  </p>
                </MotionLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
