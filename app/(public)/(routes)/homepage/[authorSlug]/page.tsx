'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { Mail, Phone, Linkedin, Calendar } from 'lucide-react'
import { Spinner } from '@/components/spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import InlineWidget from "@calcom/embed-react"
import { useState } from 'react'

const MotionLink = motion(Link)

interface HomepageProps {
  params: {
    authorSlug: string;
  };
}

export default function BlogHomepage({ params }: HomepageProps) {
  const [isCalDialogOpen, setIsCalDialogOpen] = useState(false);
  
  const profile = useQuery(api.profiles.getByAuthorSlug, { 
    authorSlug: params.authorSlug 
  });
  
  const documents = useQuery(
    api.documents.getPublishedDocumentsByUserId,
    profile ? { userId: profile.userId } : "skip"
  );

  const userSettings = useQuery(
    api.users.getUserSettingsByClerkId,
    profile ? { clerkId: profile.userId } : "skip"
  );

  const getPostUrl = (post: Doc<"documents">) => {
    if (post.isExternalLink && post.externalUrl) {
      return post.externalUrl;
    }
    return `/blog/${post.slug ?? post._id}`;
  };
  
  if (!documents || !profile || !userSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const authorFullName = profile.authorFullName || "Unknown Author";
  
  // Sort documents by creation time, newest first
  const sortedDocuments = [...documents].sort((a, b) => 
    b._creationTime - a._creationTime
  );

  const renderCalendarIcon = () => {
    if (!userSettings.calComUsername && !userSettings.meetingLink) return null;

    if (userSettings.calComUsername) {
      return (
        <Dialog open={isCalDialogOpen} onOpenChange={setIsCalDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-gray-600 hover:text-gray-900">
              <Calendar className="w-4 h-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book a Meeting</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <InlineWidget
                calLink={userSettings.calComUsername}
                style={{ height: "650px", width: "100%", overflow: "scroll" }}
                config={{ theme: "light", layout: "month_view" }}
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (userSettings.meetingLink) {
      return (
        <Link 
          href={userSettings.meetingLink}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900"
        >
          <Calendar className="w-4 h-4" />
        </Link>
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile Section */}
      <div className="mb-16">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">{authorFullName}</h1>
            <div className="flex items-center gap-4">
              {userSettings?.email && (
                <Link href={`mailto:${userSettings.email}`} className="text-gray-600 hover:text-gray-900">
                  <Mail className="w-4 h-4" />
                </Link>
              )}
              {userSettings?.phoneNumber && (
                <Link href={`tel:${userSettings.phoneNumber}`} className="text-gray-600 hover:text-gray-900">
                  <Phone className="w-4 h-4" />
                </Link>
              )}
              {userSettings?.linkedin && (
                <Link href={userSettings.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <Linkedin className="w-4 h-4" />
                </Link>
              )}
              {renderCalendarIcon()}
            </div>
          </div>
          {userSettings.description && (
            <p className="text-sm text-gray-600">{userSettings.description}</p>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center border-b border-gray-200 pb-2 px-1 text-sm text-gray-500">
        <div className="w-16">date</div>
        <div className="flex-1">title</div>
        <div className="w-16 text-right">likes</div>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-6 mt-4">
        {sortedDocuments.map((post) => (
          <MotionLink 
            key={post._id}
            href={getPostUrl(post)}
            className="block group"
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
            target={post.isExternalLink ? "_blank" : undefined}
            rel={post.isExternalLink ? "noopener noreferrer" : undefined}
          >
            <div className="flex items-center px-1">
              <div className="w-16 text-gray-500 text-sm">
                {new Date(post._creationTime).getFullYear()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium group-hover:text-gray-600">{post.title}</h3>
              </div>
              <div className="w-16 text-right text-gray-500 text-sm">
                {post.likeCount || 0}
              </div>
            </div>
          </MotionLink>
        ))}
      </div>
    </div>
  )
}