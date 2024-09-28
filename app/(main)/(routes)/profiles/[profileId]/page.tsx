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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Share2, Calendar, MessageSquare, Linkedin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

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

  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

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

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pb-20 pt-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-white">
      <Card className="w-full mb-8 border-white">
        <CardHeader>
          <CardTitle>
            <ProfToolbar initialData={profile} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl mt-2 mb-6 text-center">{profile.bio}</p>
          <VideoRecorder profileId={params.profileId} videoUrl={profile.videoUrl} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 w-full sm:flex sm:flex-wrap sm:justify-center">
        <Button
          className="h-16 rounded-full text-lg w-full sm:w-auto sm:px-8"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          <MessageSquare className="mr-2 h-5 w-5" /> Reply
        </Button>
        <Button
          className="h-16 rounded-full text-lg w-full sm:w-auto sm:px-8"
          asChild
        >
          <a href="https://cal.com/citrusreach" target="_blank" rel="noopener noreferrer">
            <Calendar className="mr-2 h-5 w-5" /> Book a meeting
          </a>
        </Button>
        <Button
          className="h-16 rounded-full text-lg w-full sm:w-auto sm:px-8"
          onClick={handleShare}
        >
          <Share2 className="mr-2 h-5 w-5" /> Share
        </Button>
        <Button
          className="h-16 rounded-full text-lg w-full sm:w-auto sm:px-8"
          asChild
        >
          <a
            href="https://www.linkedin.com/in/jordan-steinberg/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="mr-2 h-5 w-5" /> Get in Touch
          </a>
        </Button>
      </div>

      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 w-full max-w-lg"
          >
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-4">
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
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
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
    </div>
  )
}