"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { ProfToolbar } from "@/components/profile-toolbar";
import { useMemo, useState, useEffect } from "react";
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
import { Share2, Calendar, MessageSquare, Linkedin, Paintbrush } from "lucide-react";
import { toast } from "react-hot-toast";
import InlineWidget from "@calcom/embed-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/clerk-react";
import { Spinner } from "@/components/spinner";

interface ProfileIdPageProps {
  params: {
    profileId: Id<"profiles">;
  };
}

const MotionLink = motion(Link);

const colorOptions = [
  { name: 'Light Red', value: '#FFCCCB' },
  { name: 'Light Orange', value: '#FFE5B4' },
  { name: 'Light Yellow', value: '#FFFACD' },
  { name: 'Light Green', value: '#E0FFE0' },
  { name: 'Light Blue', value: '#E6F3FF' },
  { name: 'Light Purple', value: '#E6E6FA' },
  { name: 'White', value: '#FFFFFF' },
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Open color picker"
      >
        <Paintbrush className="h-4 w-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a background color</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            {colorOptions.map((option) => (
              <button
                key={option.name}
                className={`w-full h-12 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  color === option.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                } ${option.value === '#FFFFFF' ? 'border border-black' : ''}`}
                style={{ backgroundColor: option.value }}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                aria-label={`Select ${option.name}`}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function ProfileIdPage({ params }: ProfileIdPageProps) {
  const { user } = useUser();
  const documents = useQuery(api.documents.getPublishedDocuments);
  const latestDocuments = documents ? documents.slice(0, 3) : [];

  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  );

  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId,
  });

  const userDetails = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateProfile = useMutation(api.profiles.update);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isCalDialogOpen, setIsCalDialogOpen] = useState(false);
  const [colorPreference, setColorPreference] = useState('#FFFFFF');

  useEffect(() => {
    if (profile?.colorPreference) {
      setColorPreference(profile.colorPreference);
    }
  }, [profile]);

  const handleColorChange = (newColor: string) => {
    setColorPreference(newColor);
    updateProfile({
      id: params.profileId,
      colorPreference: newColor,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName}'s Profile`,
          text: `Check out ${profile?.displayName}'s profile!`,
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

  const handleVideoUpload = () => {
    setVideoKey((prevKey) => prevKey + 1);
  };

  if (!profile || userDetails === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const gradientStyle = {
    background: `linear-gradient(to bottom, ${colorPreference}, #ffffff)`,
  };

  return (
    <div className="min-h-screen overflow-x-auto" style={gradientStyle}>
      <div className="flex flex-col items-center pb-20 pt-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full mb-6 mt-8 flex justify-between items-center">
          <ProfToolbar initialData={profile} />
          <ColorPicker color={colorPreference} onChange={handleColorChange} />
        </div>
        <p className="text-xl mt-2 mb-6 text-center">{profile.bio}</p>

        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <VideoRecorder
              key={videoKey}
              profileId={params.profileId}
              videoUrl={profile.videoUrl}
              onVideoUpload={handleVideoUpload}
            />
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
                  <DialogTitle>Reply to {user?.firstName}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Handle form submission here
                    setIsReplyDialogOpen(false);
                  }}
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
            <Dialog open={isCalDialogOpen} onOpenChange={setIsCalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 rounded-full text-sm">
                  <Calendar className="mr-2 h-4 w-4" /> Book a meeting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Book a Meeting with {user?.firstName}
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  <InlineWidget
                    calLink={userDetails?.calComUsername || "citrusreach"}
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

            {/* Share Dialog */}
            <Button
              className="h-10 rounded-full text-sm"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>

            <Button className="h-10 rounded-full text-sm" asChild>
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
          <DialogContent>
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

        {/* More from {user.firstName} Section */}
        {user && latestDocuments.length > 0 && (
          <div className="mt-12 w-full">
            <h2 className="text-2xl font-bold mb-6">
              More from {user.firstName}
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
                      post.coverImage || "/placeholder.svg?height=300&width=400"
                    }
                    alt={post.title}
                    className="rounded-lg object-cover w-full h-[200px] mb-4"
                  />
                  <p className="text-gray-500 text-sm mb-1">
                    {new Date(post._creationTime).toLocaleDateString()}
                  </p>
                  <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                  <p className="text-gray-600">
                    By {user?.fullName || "Unknown Author"}
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