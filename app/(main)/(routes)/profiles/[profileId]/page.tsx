"use client"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import dynamic from "next/dynamic"
import { ProfToolbar } from "@/components/profile-toolbar"
import { useEffect, useMemo, useState } from "react"
import VideoRecorder from "@/components/videoRecorder"
import { NavbarProfile } from "@/app/(main)/_components/navbarprof"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Calendar, MessageSquare, Linkedin } from "lucide-react"
import { toast } from "react-hot-toast"
import  InlineWidget from "@calcom/embed-react"

interface ProfileIdPageProps {
  params: {
    profileId: Id<"profiles">
  }
}

export default function ProfileIdPage({ params }: ProfileIdPageProps) {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    []
  )

  const profile = useQuery(api.profiles.getById, {
    profileId: params.profileId,
  })

  const update = useMutation(api.profiles.update)

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [videoKey, setVideoKey] = useState(0)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [isCalDialogOpen, setIsCalDialogOpen] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName}'s Profile`,
          text: `Check out ${profile?.displayName}'s profile!`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      setIsShareDialogOpen(true)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Profile link copied to clipboard!")
    setIsShareDialogOpen(false)
  }

  const handleVideoUpload = () => {
    setVideoKey((prevKey) => prevKey + 1)
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pb-20 pt-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full mb-8">
        <ProfToolbar initialData={profile} />
        <p className="text-xl mt-2 mb-6 text-center">{profile.bio}</p>
      </div>

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
                <DialogTitle>Reply to {profile.displayName}</DialogTitle>
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
          <Dialog open={isCalDialogOpen} onOpenChange={setIsCalDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 rounded-full text-sm">
                <Calendar className="mr-2 h-4 w-4" /> Book a meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Book a Meeting with {profile.displayName}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <InlineWidget
                  calLink="citrusreach"
                  style={{ height: "650px", width: "100%", overflow:"scroll" }}
                  config={{ theme: "light", "layout":"month_view" }}
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
    </div>
  )
}
