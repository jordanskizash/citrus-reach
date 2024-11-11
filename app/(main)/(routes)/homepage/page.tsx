'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/clerk-react'
import { Doc } from '@/convex/_generated/dataModel'
import { useState, useEffect } from 'react'

const MotionLink = motion(Link)

export default function BlogHomepage() {
  const { user } = useUser();
  const documents = useQuery(api.documents.getPublishedDocuments)
  const [pinnedPost, setPinnedPost] = useState<Doc<'documents'> | null>(null)
  const [otherPosts, setOtherPosts] = useState<Doc<'documents'>[]>([])

  useEffect(() => {
    if (documents) {
      const published = documents.filter(doc => doc.isPublished)
      if (published.length > 0) {
        setPinnedPost(published[0])
        setOtherPosts(published.slice(1))
      }
    }
  }, [documents])

  if (!documents) return <div>Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-8 sm:px-16 py-8">
      <h1 className="text-4xl font-bold mb-8">Latest from {user?.fullName}</h1>
      
      <div className="space-y-12">
      {pinnedPost && (
        <MotionLink 
          href={`/blog/${pinnedPost._id}`}
          className="flex flex-col md:flex-row gap-6 mb-12 p-6 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="md:w-1/2">
            <Image 
              src={pinnedPost.coverImage || "/placeholder.svg?height=400&width=600"}
              alt={pinnedPost.title}
              width={600}
              height={400}
              className="rounded-lg object-cover w-full h-[250px] md:h-[300px]"
            />
          </div>
          <div className="md:w-1/2 flex flex-col justify-center p-6">
            <h2 className="text-2xl font-bold mb-2">{pinnedPost.title}</h2>
            <p className="text-gray-600 mb-2">By {user?.fullName || 'Unknown Author'}</p>
            <p className="text-gray-500">{new Date(pinnedPost._creationTime).toLocaleDateString()}</p>
          </div>
        </MotionLink>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {otherPosts.map((post) => (
          <MotionLink 
            key={post._id}
            href={`/blog/${post._id}`}
            className="flex flex-col"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image 
              src={post.coverImage || "/placeholder.svg?height=300&width=400"}
              alt={post.title}
              width={400}
              height={300}
              className="rounded-lg object-cover w-full h-[200px] mb-4"
            />
            <p className="text-gray-500 text-sm mb-1">{new Date(post._creationTime).toLocaleDateString()}</p>
            <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
            <p className="text-gray-600">By {user?.fullName || 'Unknown Author'}</p>
          </MotionLink>
        ))}
      </div>
    </div>
    </div>
  )
}