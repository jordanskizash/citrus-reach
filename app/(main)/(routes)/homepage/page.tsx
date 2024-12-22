'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import { Doc } from '@/convex/_generated/dataModel'
import { Mail, Phone, Linkedin, Calendar } from 'lucide-react'

const MotionLink = motion(Link)

export default function BlogHomepage() {
  const { user } = useUser();
  const documents = useQuery(api.documents.getPublishedDocuments)
  const userSettings = useQuery(api.users.getUserSettings, { 
    clerkId: user?.id || "" 
  })

  if (!documents || !userSettings) return <div>Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-8 sm:px-16 py-8">
      {/* Profile Section */}
      <div className="flex flex-col items-center text-center mb-16">
        <Image 
          src={userSettings?.image || "/placeholder.svg"} 
          alt={userSettings?.name || "Profile"}
          width={120}
          height={120}
          className="rounded-full mb-4"
        />
        <h1 className="text-4xl font-bold mb-4">{userSettings?.name}</h1>
        <p className="text-gray-600 max-w-2xl mb-8">{userSettings?.description || "No description available"}</p>
        
        {/* Contact Links */}
        <div className="flex gap-6 justify-center mb-8">
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
            <Link href={userSettings.linkedin} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Linkedin className="w-5 h-5" />
            </Link>
          )}
          {userSettings?.calComUsername && (
            <Link href={`https://cal.com/${userSettings.calComUsername}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Calendar className="w-5 h-5" />
              <span>Schedule a call</span>
            </Link>
          )}
          {userSettings?.meetingLink && (
            <Link href={`${userSettings.meetingLink}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Calendar className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {documents.map((post) => (
          <MotionLink 
            key={post._id}
            href={`/blog/${post._id}`}
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
            <p className="text-gray-600">By {userSettings?.name || 'Unknown Author'}</p>
          </MotionLink>
        ))}
      </div>
    </div>
  )
}