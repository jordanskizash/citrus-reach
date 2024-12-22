'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'
import { useState, useEffect } from 'react'
import { Mail, Phone, Linkedin, Calendar } from 'lucide-react'

const MotionLink = motion(Link)

interface HomepageProps {
  params: {
    authorSlug: string;
  };
}

export default function BlogHomepage({ params }: HomepageProps) {
  const { authorSlug } = params;
  
  const profile = useQuery(api.profiles.getByAuthorSlug, { 
    authorSlug
  });
  
  const documents = useQuery(
    api.documents.getPublishedDocumentsByUserId,
    profile ? { userId: profile.userId } : "skip"
  );

  // Get user settings for additional information
  const userSettings = useQuery(
    api.users.getUserSettingsByClerkId,
    profile ? { clerkId: profile.userId } : "skip"
  );
  
  if (!documents || !profile || !userSettings) return <div>Loading...</div>

  const authorFullName = profile.authorFullName || "Unknown Author";

  return (
    <div className="max-w-7xl mx-auto px-8 sm:px-16 py-8">
      {/* Profile Section */}
      <div className="flex flex-col items-center text-center mb-16">
        <Image 
          src={userSettings.image || "/placeholder.svg"} 
          alt={authorFullName}
          width={120}
          height={120}
          className="rounded-full mb-4"
        />
        <h1 className="text-4xl font-bold mb-4">{authorFullName}</h1>
        <p className="text-gray-600 max-w-2xl mb-8">{userSettings.description || "No description available"}</p>
        
        {/* Contact Links */}
        <div className="flex gap-6 justify-center mb-8">
        {profile && (
            <>
              {userSettings?.email && (
                <Link href={`mailto:${userSettings.email}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Mail className="w-5 h-5" />
                  <span>{userSettings.email}</span>
                </Link>
              )}
              {userSettings?.phoneNumber && (
                <Link href={`tel:${userSettings.phoneNumber}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Phone className="w-5 h-5" />
                  <span>{userSettings.phoneNumber}</span>
                </Link>
              )}
              {userSettings?.linkedin && (
                <Link href={userSettings.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </Link>
              )}
              {userSettings?.calComUsername && (
                <Link href={`https://cal.com/${userSettings.calComUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule a call</span>
                </Link>
              )}
              {userSettings?.meetingLink && (
                <Link href={`${userSettings.meetingLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Calendar className="w-5 h-5" />
                  <span>Schedule a call</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {documents.map((post) => (
          <MotionLink 
            key={post._id}
            href={`/preview/${post.slug ?? post._id}`}
            className="group relative"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative h-48 mb-4">
              <Image 
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <p className="text-gray-500 text-sm mb-2">{new Date(post._creationTime).toLocaleDateString()}</p>
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-600">By {authorFullName}</p>
          </MotionLink>
        ))}
      </div>
    </div>
  )
}